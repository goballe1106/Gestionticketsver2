import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'support-ticket-system-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Credenciales incorrectas" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Rate limiting para prevenir ataques de fuerza bruta
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5 // límite de 5 intentos por ventana
};

const attempts = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - rateLimit.windowMs;
  
  if (!attempts.has(ip)) {
    attempts.set(ip, [now]);
    return true;
  }

  const userAttempts = attempts.get(ip).filter(time => time > windowStart);
  attempts.set(ip, [...userAttempts, now]);
  
  return userAttempts.length < rateLimit.max;
}

app.post("/api/register", async (req, res, next) => {
  const clientIP = req.ip;
  
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({ 
      message: "Demasiados intentos. Por favor, intente nuevamente más tarde." 
    });
  }
    try {
      // Validate input with Zod schema
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(userData.password);
      const { confirmPassword, ...userWithoutConfirm } = userData;
      
      const user = await storage.createUser({
        ...userWithoutConfirm,
        password: hashedPassword,
        role: "user", // Forzar rol de usuario
      });

      // Convert to safe user (without password)
      const { password, ...safeUser } = user;
      
      // Log in the user
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(safeUser);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Credenciales incorrectas" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...safeUser } = user;
        res.status(200).json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "No autenticado" });
    // Return user without password
    const { password, ...safeUser } = req.user;
    res.json(safeUser);
  });
}

// Middleware to check roles
export function checkRole(roles: string[]) {
  return (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "No autorizado para acceder a este recurso" });
    }
    
    next();
  };
}

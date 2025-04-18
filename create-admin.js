// Script para crear usuario administrador
import { Pool, neonConfig } from '@neondatabase/serverless';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import ws from 'ws';

// Configurar el WebSocket para Neon Database
neonConfig.webSocketConstructor = ws;

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  // Configuración de la base de datos
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  });

  try {
    // Verificar si ya existe un usuario administrador
    const checkQuery = 'SELECT * FROM users WHERE role = $1';
    const checkResult = await pool.query(checkQuery, ['admin']);
    
    if (checkResult.rows.length > 0) {
      console.log('Ya existe al menos un usuario administrador en el sistema');
      console.table(checkResult.rows.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email
      })));
      return;
    }

    // Datos del administrador
    const adminData = {
      username: 'admin',
      password: await hashPassword('Admin123!'),  // Contraseña por defecto
      full_name: 'Administrador del Sistema',
      email: 'admin@example.com',
      role: 'admin',
      created_at: new Date()
    };

    // Insertar el usuario administrador
    const insertQuery = `
      INSERT INTO users (username, password, full_name, email, role, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, username, full_name, email, role
    `;
    
    const values = [
      adminData.username,
      adminData.password,
      adminData.full_name,
      adminData.email,
      adminData.role,
      adminData.created_at
    ];
    
    const result = await pool.query(insertQuery, values);
    
    console.log('Usuario administrador creado con éxito:');
    console.table(result.rows[0]);
    console.log('\nCredenciales de acceso:');
    console.log('------------------------');
    console.log(`Usuario: ${adminData.username}`);
    console.log(`Contraseña: Admin123!`);
    console.log('\nPor favor cambie la contraseña después del primer inicio de sesión por razones de seguridad.');
    
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  } finally {
    // Cerrar la conexión
    await pool.end();
  }
}

// Ejecutar la función
createAdminUser();
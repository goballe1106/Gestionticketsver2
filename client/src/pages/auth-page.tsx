import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect } from "wouter";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Loader2, Lock, User } from "lucide-react";

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof insertUserSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <svg
                className="h-10 w-10 text-[#0078d4]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 18V6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14h.01"
                />
              </svg>
              <h2 className="text-2xl font-bold text-center text-[#0078d4] ml-2">
                Support Desk
              </h2>
            </div>
            <CardDescription className="text-center">
              Sistema de gestión de tickets de soporte técnico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 bg-[#0078d4] text-white">
        <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16 xl:px-32">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">
              Bienvenido al Sistema de Soporte Técnico
            </h1>
            <p className="text-lg">
              Una plataforma completa para gestionar tickets de soporte con integración de Microsoft Teams.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 flex-shrink-0 mr-2" />
                <span>Gestión integral de tickets de soporte</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 flex-shrink-0 mr-2" />
                <span>Comunicación en tiempo real mediante Teams</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 flex-shrink-0 mr-2" />
                <span>Seguimiento de estado y actividades</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 flex-shrink-0 mr-2" />
                <span>Estadísticas y reportes detallados</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();

  // Form validation schema
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Form submission handler
  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Nombre de usuario"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Tu contraseña"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-[#0078d4] hover:bg-[#0086f0]"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>

        {loginMutation.isError && (
          <div className="text-sm p-3 bg-red-50 text-red-600 rounded-md flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {loginMutation.error.message}
          </div>
        )}
      </form>
    </Form>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();

  // Extend the schema with password confirmation validation
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      role: "user", // Default role is user
      avatarUrl: "",
      msTeamsId: "",
    },
  });

  // Form submission handler
  function onSubmit(values: RegisterFormValues) {
    registerMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="tu.correo@ejemplo.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de usuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <FormControl>
                  <Input placeholder="Tu departamento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Crea una contraseña segura"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Repite tu contraseña"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-[#0078d4] hover:bg-[#0086f0]"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            "Registrarse"
          )}
        </Button>

        {registerMutation.isError && (
          <div className="text-sm p-3 bg-red-50 text-red-600 rounded-md flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {registerMutation.error.message}
          </div>
        )}
      </form>
    </Form>
  );
}

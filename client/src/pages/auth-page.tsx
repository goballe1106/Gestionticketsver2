import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import AuthLayout from "@/components/layout/AuthLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { userRegisterSchema, loginSchema, LoginData } from "@shared/schema";

// Create a registration schema with password confirmation
const registerFormSchema = userRegisterSchema.extend({
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Login form setup
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form setup
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: "user",
    },
  });

  // Handle login submission
  const onLoginSubmit = (values: LoginData) => {
    loginMutation.mutate(values);
  };

  // Handle registration submission
  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Remove confirmPassword before sending to the API
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <AuthLayout>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="register">Registrarse</TabsTrigger>
        </TabsList>
        
        {/* Login Tab */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema de soporte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de usuario</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa tu nombre de usuario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Ingresa tu contraseña" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-neutral-500">
                ¿No tienes una cuenta? Selecciona la pestaña "Registrarse".
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Register Tab */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Crear cuenta</CardTitle>
              <CardDescription>
                Completa el formulario para registrarte en el sistema de soporte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa tu nombre completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de usuario</FormLabel>
                        <FormControl>
                          <Input placeholder="Elige un nombre de usuario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Ingresa tu correo electrónico" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Crea una contraseña" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar contraseña</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirma tu contraseña" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Registrando..." : "Registrarse"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-neutral-500">
                ¿Ya tienes una cuenta? Selecciona la pestaña "Iniciar Sesión".
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
}

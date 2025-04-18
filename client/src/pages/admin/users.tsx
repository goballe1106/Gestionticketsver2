import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MoreVertical, Edit, UserCog, Key } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// Basic user edit schema
const editUserSchema = z.object({
  fullName: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  role: z.enum(["user", "agent", "admin"]),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: "user",
    },
  });

  // Fetch users on component mount
  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== "admin") {
      toast({
        title: "Acceso denegado",
        description: "No tienes permiso para acceder a esta página",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/api/users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate, toast]);

  const handleEditUser = (userData: any) => {
    setSelectedUser(userData);
    form.reset({
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: EditUserFormValues) => {
    try {
      if (!selectedUser) return;
      
      const response = await apiRequest("PATCH", `/api/users/${selectedUser.id}`, values);
      const updatedUser = await response.json();
      
      // Update the users list
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...updatedUser } : u));
      
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados correctamente",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Administrador</span>;
      case "agent":
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Agente</span>;
      case "user":
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Usuario</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{role}</span>;
    }
  };

  // Function to get a users' initials for avatar fallback
  const getUserInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "d MMM yyyy, HH:mm", { locale: es });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>
              Administra los usuarios del sistema de soporte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Fecha de registro</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center">
                            <Skeleton className="h-8 w-8 rounded-full mr-2" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Fecha de registro</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback>{getUserInitials(user.fullName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-sm text-muted-foreground">@{user.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar usuario
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserCog className="h-4 w-4 mr-2" />
                                Cambiar rol
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Key className="h-4 w-4 mr-2" />
                                Resetear contraseña
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>
                Actualiza la información del usuario.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="agent">Agente</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar cambios</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

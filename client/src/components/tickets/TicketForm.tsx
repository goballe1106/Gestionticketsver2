import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTickets } from "@/hooks/use-tickets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTicketSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";

// Extend the ticket schema to make agentId optional
const createTicketSchema = insertTicketSchema
  .omit({ requesterId: true })
  .extend({
    agentId: z.number().nullable().optional(),
  });

type CreateTicketValues = z.infer<typeof createTicketSchema>;

export default function TicketForm() {
  const { user } = useAuth();
  const { createTicket, isCreating } = useTickets();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<CreateTicketValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "technical_issue",
      status: "new",
      agentId: null,
    },
  });

  const onSubmit = async (values: CreateTicketValues) => {
    try {
      await createTicket(values);
      toast({
        title: "Ticket creado",
        description: "El ticket se ha creado correctamente.",
      });
      navigate("/tickets");
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el ticket. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear nuevo ticket</CardTitle>
        <CardDescription>
          Completa el formulario para enviar una solicitud de soporte técnico.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asunto</FormLabel>
                    <FormControl>
                      <Input placeholder="Título breve del problema" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technical_issue">Problema técnico</SelectItem>
                      <SelectItem value="access_request">Solicitud de acceso</SelectItem>
                      <SelectItem value="question">Consulta</SelectItem>
                      <SelectItem value="feature_request">Solicitud de característica</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el problema en detalle..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {user?.role === "admin" && (
              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asignar a (opcional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      defaultValue={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin asignar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin asignar</SelectItem>
                        <SelectItem value="1">Ana Martínez</SelectItem>
                        <SelectItem value="2">Roberto Santos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div>
              <FormLabel htmlFor="files">Adjuntar archivos (opcional)</FormLabel>
              <div className="mt-1 border-2 border-dashed border-neutral-300 rounded-md p-6 text-center">
                <div className="mb-3">
                  <Upload className="mx-auto h-8 w-8 text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-500 mb-2">Arrastra archivos aquí o</p>
                <Button
                  type="button"
                  variant="outline"
                  className="text-primary border-primary hover:bg-primary hover:text-white"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  Seleccionar archivos
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              
              {files.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Archivos seleccionados:</h4>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between rounded-md bg-neutral-50 p-2 text-sm">
                        <span className="truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/tickets")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creando..." : "Crear ticket"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

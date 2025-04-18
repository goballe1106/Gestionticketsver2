import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertTicketSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

// Extend the ticket schema with validation
const formSchema = insertTicketSchema
  .extend({
    title: z.string().min(5, {
      message: "El título debe tener al menos 5 caracteres",
    }),
    description: z.string().min(10, {
      message: "La descripción debe tener al menos 10 caracteres",
    }),
  });

type TicketFormValues = z.infer<typeof formSchema>;

export function TicketForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Define form with default values
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "open",
      department: user?.department || "",
      creatorId: user?.id,
    },
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (values: TicketFormValues) => {
      const res = await apiRequest("POST", "/api/tickets", values);
      return await res.json();
    },
    onSuccess: (ticket) => {
      toast({
        title: "Ticket creado",
        description: `El ticket #${ticket.ticketNumber} ha sido creado con éxito.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      navigate(`/tickets/${ticket.ticketNumber}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear el ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: TicketFormValues) => {
    createTicketMutation.mutate(values);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Crear nuevo ticket</CardTitle>
        <CardDescription>
          Completa la información para crear un nuevo ticket de soporte técnico.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Escriba un título descriptivo" {...field} />
                  </FormControl>
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
                      placeholder="Describa detalladamente el problema o solicitud"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Seleccione prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input
                        placeholder="Su departamento"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/tickets")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createTicketMutation.isPending}
                className="bg-[#0078d4] hover:bg-[#0086f0]"
              >
                {createTicketMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Ticket"
                )}
              </Button>
            </div>

            {createTicketMutation.isSuccess && (
              <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Ticket creado con éxito
              </div>
            )}

            {createTicketMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {createTicketMutation.error.message || "Error al crear el ticket"}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

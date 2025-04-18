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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, InfoIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { 
  getTicketPriorityFromType, 
  getSLAHoursFromType, 
  getTicketTypeText,
  getTicketPriorityCategory
} from "@/lib/ticket-utils";

// Extend the ticket schema with validation
const formSchema = insertTicketSchema
  .extend({
    type: z.string({
      required_error: "Debe seleccionar un tipo de incidencia",
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
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [priorityCategory, setPriorityCategory] = useState<string>('');

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

  // Actualizar prioridad automáticamente cuando se cambia el tipo
  useEffect(() => {
    if (selectedType) {
      const priority = getTicketPriorityFromType(selectedType);
      form.setValue("priority", priority);
      setPriorityCategory(getTicketPriorityCategory(selectedType));
      
      // Generar automáticamente un título basado en el tipo de ticket
      const typeText = getTicketTypeText(selectedType);
      form.setValue("title", typeText);
    }
  }, [selectedType, form]);

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (values: TicketFormValues) => {
      // Agregar SLA basado en el tipo de ticket
      const dataWithSLA = {
        ...values,
        slaHours: getSLAHoursFromType(values.type),
      };
      
      const res = await apiRequest("POST", "/api/tickets", dataWithSLA);
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

  // Manejador para cuando cambia el tipo de ticket
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Crear nuevo ticket</CardTitle>
        <CardDescription>
          Selecciona el tipo de incidencia y completa la información para crear un ticket de soporte.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de incidencia</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleTypeChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione el tipo de incidencia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Alta Prioridad (Urgente)</SelectLabel>
                        <SelectItem value="internet_outage">1. Fallo total en la conexión a internet</SelectItem>
                        <SelectItem value="os_boot_failure">2. Sistema operativo no arranca</SelectItem>
                        <SelectItem value="malware_detected">3. Virus o malware detectado</SelectItem>
                        <SelectItem value="email_access_lost">4. Pérdida de acceso a correo electrónico</SelectItem>
                        <SelectItem value="critical_hardware_failure">5. Fallo de hardware crítico</SelectItem>
                        <SelectItem value="essential_platform_error">6. Error en acceso a plataforma esencial</SelectItem>
                        <SelectItem value="account_lockout">7. Bloqueo total de cuenta de usuario</SelectItem>
                      </SelectGroup>

                      <SelectGroup>
                        <SelectLabel>Media Prioridad</SelectLabel>
                        <SelectItem value="intermittent_internet">1. Conexión a internet intermitente</SelectItem>
                        <SelectItem value="printer_issues">2. Problemas con impresoras</SelectItem>
                        <SelectItem value="software_installation">3. Instalación de software</SelectItem>
                        <SelectItem value="non_critical_app_error">4. Error en aplicación no crítica</SelectItem>
                        <SelectItem value="cloud_sync_issues">5. Problemas con sincronización en la nube</SelectItem>
                        <SelectItem value="password_reset">6. Restablecimiento de contraseñas</SelectItem>
                        <SelectItem value="tool_config_issue">7. Fallo en la configuración de herramientas</SelectItem>
                      </SelectGroup>

                      <SelectGroup>
                        <SelectLabel>Baja Prioridad</SelectLabel>
                        <SelectItem value="mobile_email_setup">1. Configuración de correo en móvil</SelectItem>
                        <SelectItem value="software_usage_help">2. Ayuda con uso de software</SelectItem>
                        <SelectItem value="file_access_issue">3. Problemas con acceso a archivos</SelectItem>
                        <SelectItem value="peripheral_setup">4. Configuración de periféricos</SelectItem>
                        <SelectItem value="remote_access_setup">5. Configuración de acceso remoto</SelectItem>
                        <SelectItem value="non_critical_software">6. Instalación de programas no críticos</SelectItem>
                        <SelectItem value="minor_display_errors">7. Errores menores de visualización</SelectItem>
                      </SelectGroup>

                      <SelectGroup>
                        <SelectLabel>Muy Baja Prioridad</SelectLabel>
                        <SelectItem value="advanced_feature_help">1. Funciones avanzadas de software</SelectItem>
                        <SelectItem value="ui_cosmetic_requests">2. Cambios cosméticos en la interfaz</SelectItem>
                        <SelectItem value="future_updates_info">3. Consultas sobre actualizaciones futuras</SelectItem>
                        <SelectItem value="disk_space_management">4. Liberar espacio en discos</SelectItem>
                        <SelectItem value="cleanup_request">5. Eliminar archivos no utilizados</SelectItem>
                        <SelectItem value="documentation_errors">6. Errores en documentación</SelectItem>
                        <SelectItem value="support_process_help">7. Consultas sobre procedimientos</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType && (
              <div className="p-3 border rounded-md bg-blue-50">
                <p className="flex items-center text-blue-700 font-medium">
                  <InfoIcon size={16} className="mr-2" />
                  {priorityCategory}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  SLA: {getSLAHoursFromType(selectedType)} horas
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción adicional</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Proporcione detalles adicionales sobre el problema"
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
                    <FormLabel>Prioridad (asignada automáticamente)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={true}
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

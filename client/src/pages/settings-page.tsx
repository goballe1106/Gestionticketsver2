import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CheckIcon, Loader2, SaveIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  // Mock settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    browserNotifications: false,
    teamsNotifications: true,
    ticketCreated: true,
    ticketUpdated: true,
    ticketAssigned: true,
    commentAdded: true,
    ticketResolved: false,
  });

  const [teamsIntegrationSettings, setTeamsIntegrationSettings] = useState({
    enabled: true,
    clientId: "your-microsoft-client-id",
    tenantId: "your-tenant-id",
    autoCreateChannels: true,
    defaultChannel: "support-general",
  });

  const [ticketSettings, setTicketSettings] = useState({
    autoAssign: true,
    defaultPriority: "medium",
    allowUserClose: false,
    requireCategory: true,
    followupDays: 3,
    autoCloseResolved: 7,
    closedMessage: "Este ticket ha sido cerrado. Por favor crea un nuevo ticket si necesitas más ayuda.",
  });

  // Save settings handler
  const handleSaveSettings = () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSavedNotification(true);
      
      toast({
        title: "Configuración guardada",
        description: "Tus cambios han sido guardados correctamente.",
      });
      
      // Hide the saved notification after 3 seconds
      setTimeout(() => {
        setSavedNotification(false);
      }, 3000);
    }, 1000);
  };

  return (
    <Layout title="Configuración">
      <div className="pb-5 mb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Configuración del Sistema</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configura las preferencias del sistema de tickets de soporte
          </p>
        </div>
        <div className="mt-3 flex sm:mt-0">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="ml-3 bg-[#0078d4] hover:bg-[#0086f0]"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : savedNotification ? (
              <>
                <CheckIcon className="mr-2 h-4 w-4" />
                Guardado
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="teams">Integración con Teams</TabsTrigger>
          <TabsTrigger value="tickets">Configuración de Tickets</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Configuración básica del sistema de tickets de soporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nombre de la Empresa</Label>
                <Input id="company-name" defaultValue="Mi Empresa" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="support-email">Email de Soporte</Label>
                <Input id="support-email" type="email" defaultValue="soporte@miempresa.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Horaria</Label>
                <select
                  id="timezone"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="Europe/Madrid"
                >
                  <option value="America/Los_Angeles">América/Los Ángeles (GMT-8)</option>
                  <option value="America/New_York">América/Nueva York (GMT-5)</option>
                  <option value="Europe/London">Europa/Londres (GMT)</option>
                  <option value="Europe/Madrid">Europa/Madrid (GMT+1)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-format">Formato de Fecha</Label>
                <select
                  id="date-format"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="dd/MM/yyyy"
                >
                  <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                  <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                  <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="language">Idioma por defecto</Label>
                <select
                  id="language"
                  className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="es"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Canales de notificación</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="browser-notifications">Notificaciones del Navegador</Label>
                    <Switch
                      id="browser-notifications"
                      checked={notificationSettings.browserNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          browserNotifications: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="teams-notifications">Notificaciones en Teams</Label>
                    <Switch
                      id="teams-notifications"
                      checked={notificationSettings.teamsNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          teamsNotifications: checked,
                        })
                      }
                    />
                  </div>
                </div>
                
                <div className="pt-4 space-y-4">
                  <h3 className="text-md font-medium">Eventos a notificar</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ticket-created">Cuando se crea un ticket</Label>
                    <Switch
                      id="ticket-created"
                      checked={notificationSettings.ticketCreated}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          ticketCreated: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ticket-updated">Cuando se actualiza un ticket</Label>
                    <Switch
                      id="ticket-updated"
                      checked={notificationSettings.ticketUpdated}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          ticketUpdated: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ticket-assigned">Cuando te asignan un ticket</Label>
                    <Switch
                      id="ticket-assigned"
                      checked={notificationSettings.ticketAssigned}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          ticketAssigned: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="comment-added">Cuando se añade un comentario</Label>
                    <Switch
                      id="comment-added"
                      checked={notificationSettings.commentAdded}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          commentAdded: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ticket-resolved">Cuando se resuelve un ticket</Label>
                    <Switch
                      id="ticket-resolved"
                      checked={notificationSettings.ticketResolved}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          ticketResolved: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Teams Integration */}
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Integración con Microsoft Teams</CardTitle>
              <CardDescription>
                Configura la integración con Microsoft Teams para la comunicación en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="teams-enabled">Habilitar integración con Teams</Label>
                <Switch
                  id="teams-enabled"
                  checked={teamsIntegrationSettings.enabled}
                  onCheckedChange={(checked) =>
                    setTeamsIntegrationSettings({
                      ...teamsIntegrationSettings,
                      enabled: checked,
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ms-client-id">Microsoft Client ID</Label>
                <Input
                  id="ms-client-id"
                  value={teamsIntegrationSettings.clientId}
                  onChange={(e) =>
                    setTeamsIntegrationSettings({
                      ...teamsIntegrationSettings,
                      clientId: e.target.value,
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ms-tenant-id">Microsoft Tenant ID</Label>
                <Input
                  id="ms-tenant-id"
                  value={teamsIntegrationSettings.tenantId}
                  onChange={(e) =>
                    setTeamsIntegrationSettings({
                      ...teamsIntegrationSettings,
                      tenantId: e.target.value,
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <Label htmlFor="auto-create-channels">Crear canales automáticamente para tickets</Label>
                <Switch
                  id="auto-create-channels"
                  checked={teamsIntegrationSettings.autoCreateChannels}
                  onCheckedChange={(checked) =>
                    setTeamsIntegrationSettings({
                      ...teamsIntegrationSettings,
                      autoCreateChannels: checked,
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-channel">Canal por defecto</Label>
                <Input
                  id="default-channel"
                  value={teamsIntegrationSettings.defaultChannel}
                  onChange={(e) =>
                    setTeamsIntegrationSettings({
                      ...teamsIntegrationSettings,
                      defaultChannel: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Ticket Settings */}
        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Tickets</CardTitle>
              <CardDescription>
                Configura el comportamiento y gestión de tickets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-assign">Asignar tickets automáticamente</Label>
                <Switch
                  id="auto-assign"
                  checked={ticketSettings.autoAssign}
                  onCheckedChange={(checked) =>
                    setTicketSettings({
                      ...ticketSettings,
                      autoAssign: checked,
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-priority">Prioridad por defecto</Label>
                <select
                  id="default-priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={ticketSettings.defaultPriority}
                  onChange={(e) =>
                    setTicketSettings({
                      ...ticketSettings,
                      defaultPriority: e.target.value,
                    })
                  }
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="allow-user-close">Permitir a usuarios cerrar tickets</Label>
                <Switch
                  id="allow-user-close"
                  checked={ticketSettings.allowUserClose}
                  onCheckedChange={(checked) =>
                    setTicketSettings({
                      ...ticketSettings,
                      allowUserClose: checked,
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="require-category">Requerir categoría en tickets</Label>
                <Switch
                  id="require-category"
                  checked={ticketSettings.requireCategory}
                  onCheckedChange={(checked) =>
                    setTicketSettings({
                      ...ticketSettings,
                      requireCategory: checked,
                    })
                  }
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="followup-days">Días para seguimiento</Label>
                  <Input
                    id="followup-days"
                    type="number"
                    min="1"
                    max="30"
                    value={ticketSettings.followupDays}
                    onChange={(e) =>
                      setTicketSettings({
                        ...ticketSettings,
                        followupDays: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="auto-close-resolved">Auto-cerrar tickets resueltos (días)</Label>
                  <Input
                    id="auto-close-resolved"
                    type="number"
                    min="1"
                    max="90"
                    value={ticketSettings.autoCloseResolved}
                    onChange={(e) =>
                      setTicketSettings({
                        ...ticketSettings,
                        autoCloseResolved: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="closed-message">Mensaje de ticket cerrado</Label>
                <Textarea
                  id="closed-message"
                  rows={3}
                  value={ticketSettings.closedMessage}
                  onChange={(e) =>
                    setTicketSettings({
                      ...ticketSettings,
                      closedMessage: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

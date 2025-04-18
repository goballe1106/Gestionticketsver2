import { useState, useEffect } from "react";
import { useTickets } from "@/hooks/use-tickets";
import { useAuth } from "@/hooks/use-auth";
import { useTeams } from "@/hooks/use-teams";
import { Link } from "wouter";
import { 
  Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import { 
  ArrowLeft, Send, MessageCircle, Clock, UserPlus, 
  Tag, Github, Paperclip, CheckCircle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Ticket, TicketComment, TicketActivity } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketDetailProps {
  ticketId: number;
}

export default function TicketDetail({ ticketId }: TicketDetailProps) {
  const { user } = useAuth();
  const { 
    getTicket, updateTicketStatus, assignTicket, 
    addComment, getComments, getActivities,
    isLoading, isUpdating, isCommenting
  } = useTickets();
  const { connectToTeams, isConnecting } = useTeams();
  const { toast } = useToast();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [activities, setActivities] = useState<TicketActivity[]>([]);
  const [newComment, setNewComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  
  const isAdmin = user?.role === "admin";
  const isAgent = user?.role === "agent";
  const isAgentOrAdmin = isAdmin || isAgent;
  
  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const ticketData = await getTicket(ticketId);
        if (ticketData) {
          setTicket(ticketData);
          setSelectedStatus(ticketData.status);
          setSelectedAgent(ticketData.agentId);
        }
        
        const commentsData = await getComments(ticketId);
        if (commentsData) {
          setComments(commentsData);
        }
        
        const activitiesData = await getActivities(ticketId);
        if (activitiesData) {
          setActivities(activitiesData);
        }
      } catch (error) {
        console.error("Error fetching ticket data:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del ticket.",
          variant: "destructive",
        });
      }
    };
    
    fetchTicketData();
  }, [ticketId, getTicket, getComments, getActivities, toast]);
  
  const handleStatusChange = async (status: string) => {
    if (!ticket || status === ticket.status) return;
    
    try {
      const updatedTicket = await updateTicketStatus(ticketId, status);
      if (updatedTicket) {
        setTicket(updatedTicket);
        toast({
          title: "Estado actualizado",
          description: `El ticket ahora está ${getStatusText(status)}.`,
        });
        
        // Refetch activities after status change
        const activitiesData = await getActivities(ticketId);
        if (activitiesData) {
          setActivities(activitiesData);
        }
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del ticket.",
        variant: "destructive",
      });
    }
  };
  
  const handleAgentAssign = async (agentId: number) => {
    if (!ticket || agentId === ticket.agentId) return;
    
    try {
      const updatedTicket = await assignTicket(ticketId, agentId);
      if (updatedTicket) {
        setTicket(updatedTicket);
        setSelectedAgent(agentId);
        toast({
          title: "Agente asignado",
          description: "El ticket ha sido asignado correctamente.",
        });
        
        // Refetch activities after agent assignment
        const activitiesData = await getActivities(ticketId);
        if (activitiesData) {
          setActivities(activitiesData);
        }
      }
    } catch (error) {
      console.error("Error assigning agent:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar el agente al ticket.",
        variant: "destructive",
      });
    }
  };
  
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !ticket) return;
    
    try {
      const comment = await addComment(ticketId, newComment);
      if (comment) {
        setComments([...comments, comment]);
        setNewComment("");
        toast({
          title: "Comentario añadido",
          description: "Tu comentario ha sido añadido correctamente.",
        });
        
        // Refetch activities after adding comment
        const activitiesData = await getActivities(ticketId);
        if (activitiesData) {
          setActivities(activitiesData);
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir el comentario.",
        variant: "destructive",
      });
    }
  };
  
  const handleTeamsConnect = async () => {
    if (!ticket) return;
    
    try {
      await connectToTeams(ticketId);
      toast({
        title: "Conectado a Teams",
        description: "Se ha establecido una conexión con Microsoft Teams.",
      });
    } catch (error) {
      console.error("Error connecting to Teams:", error);
      toast({
        title: "Error",
        description: "No se pudo conectar con Microsoft Teams.",
        variant: "destructive",
      });
    }
  };
  
  const getStatusText = (status: string): string => {
    switch (status) {
      case "new": return "nuevo";
      case "assigned": return "asignado";
      case "in_progress": return "en progreso";
      case "resolved": return "resuelto";
      case "closed": return "cerrado";
      default: return status;
    }
  };
  
  const formatDate = (date: Date): string => {
    return format(new Date(date), "d 'de' MMMM, yyyy HH:mm", { locale: es });
  };
  
  const formatRelativeTime = (date: Date): string => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  };
  
  const getCategoryText = (category: string): string => {
    switch (category) {
      case "technical_issue": return "Problema técnico";
      case "access_request": return "Solicitud de acceso";
      case "question": return "Consulta";
      case "feature_request": return "Solicitud de característica";
      case "other": return "Otro";
      default: return category;
    }
  };
  
  const getUserInitials = (name: string): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-8 w-full" />
              <div className="space-y-4 mt-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-24 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ticket) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="text-xl font-medium mb-2">Ticket no encontrado</h3>
          <p className="text-neutral-500 mb-6">El ticket que estás buscando no existe o no tienes permisos para verlo.</p>
          <Link href="/tickets">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a tickets
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Link href="/tickets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <CardTitle className="flex items-center gap-2">
              Ticket #{ticket.id} 
              <PriorityBadge priority={ticket.priority} />
            </CardTitle>
            <CardDescription>
              Creado {formatRelativeTime(ticket.createdAt)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Ticket details and comments */}
        <div className="md:col-span-2">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{ticket.title}</h3>
              <p className="whitespace-pre-line text-neutral-700">{ticket.description}</p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comentarios
              </h4>
              
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={comment.user?.avatarUrl} />
                        <AvatarFallback>{getUserInitials(comment.user?.fullName || '')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-neutral-50 rounded-lg p-3">
                          <div className="font-medium">{comment.user?.fullName || 'Usuario'}</div>
                          <p className="text-neutral-700 mt-1">{comment.content}</p>
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                          {formatRelativeTime(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-500">No hay comentarios aún</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <Textarea
                  placeholder="Escribe un comentario..."
                  className="min-h-[100px]"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <Button 
                    onClick={handleCommentSubmit} 
                    disabled={isCommenting || !newComment.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isCommenting ? "Enviando..." : "Comentar"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column: Ticket info and actions */}
        <div>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Información del ticket</h4>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-neutral-500">Estado</div>
                  <div className="mt-1">
                    {isAgentOrAdmin ? (
                      <Select
                        value={selectedStatus}
                        onValueChange={handleStatusChange}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Nuevo</SelectItem>
                          <SelectItem value="assigned">Asignado</SelectItem>
                          <SelectItem value="in_progress">En progreso</SelectItem>
                          <SelectItem value="resolved">Resuelto</SelectItem>
                          <SelectItem value="closed">Cerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={ticket.status} />
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-500">Solicitante</div>
                  <div className="flex items-center mt-1">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={ticket.requester?.avatarUrl} />
                      <AvatarFallback>{getUserInitials(ticket.requester?.fullName || '')}</AvatarFallback>
                    </Avatar>
                    <span>{ticket.requester?.fullName || 'Usuario'}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-500">Asignado a</div>
                  <div className="mt-1">
                    {isAdmin ? (
                      <Select
                        value={selectedAgent?.toString() || ""}
                        onValueChange={(value) => handleAgentAssign(parseInt(value))}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sin asignar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin asignar</SelectItem>
                          <SelectItem value="1">Ana Martínez</SelectItem>
                          <SelectItem value="2">Roberto Santos</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center">
                        {ticket.agent ? (
                          <>
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={ticket.agent?.avatarUrl} />
                              <AvatarFallback>{getUserInitials(ticket.agent?.fullName || '')}</AvatarFallback>
                            </Avatar>
                            <span>{ticket.agent?.fullName}</span>
                          </>
                        ) : (
                          <span className="text-neutral-500">Sin asignar</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-500">Categoría</div>
                  <div className="mt-1 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-neutral-500" />
                    <span>{getCategoryText(ticket.category)}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-500">Última actualización</div>
                  <div className="mt-1 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-neutral-500" />
                    <span>{formatDate(ticket.lastUpdated)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-3">Acciones</h4>
              <div className="space-y-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Github className="h-4 w-4 mr-2" />
                      Conectar con Microsoft Teams
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Conectar con Microsoft Teams</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción creará un nuevo chat en Microsoft Teams para este ticket.
                        ¿Deseas continuar?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleTeamsConnect} disabled={isConnecting}>
                        {isConnecting ? "Conectando..." : "Conectar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                {isAgentOrAdmin && ticket.status !== "resolved" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleStatusChange("resolved")}
                    disabled={isUpdating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como resuelto
                  </Button>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Historial de actividades
              </h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-4">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="text-sm">
                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center mr-2 mt-0.5">
                            {activity.action === "create" && <MessageCircle className="h-3 w-3" />}
                            {activity.action === "update" && <Tag className="h-3 w-3" />}
                            {activity.action === "status_change" && <CheckCircle className="h-3 w-3" />}
                            {activity.action === "assign" && <UserPlus className="h-3 w-3" />}
                            {activity.action === "comment" && <MessageCircle className="h-3 w-3" />}
                          </div>
                          <div>
                            <p>
                              <span className="font-medium">{activity.user?.fullName || 'Usuario'}</span>
                              {" "}
                              {activity.action === "create" && "creó el ticket"}
                              {activity.action === "update" && "actualizó el ticket"}
                              {activity.action === "status_change" && activity.details && `cambió el estado a ${activity.details.split("to ")[1]}`}
                              {activity.action === "assign" && "asignó el ticket"}
                              {activity.action === "comment" && "comentó en el ticket"}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {formatRelativeTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-neutral-500">No hay actividades registradas</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

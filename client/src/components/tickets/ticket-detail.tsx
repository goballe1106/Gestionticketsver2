import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTicketCommentSchema } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Edit,
  ExternalLink,
  Hourglass,
  Inbox,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  User,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TeamsChatWidget } from "@/components/dashboard/teams-chat";

interface TicketDetailProps {
  ticketNumber: string;
}

// Status badge configuration
const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  open: {
    color: "bg-blue-100 text-blue-800",
    icon: <Inbox className="h-4 w-4" />,
    label: "Abierto",
  },
  in_progress: {
    color: "bg-amber-100 text-amber-800",
    icon: <Wrench className="h-4 w-4" />,
    label: "En progreso",
  },
  waiting: {
    color: "bg-purple-100 text-purple-800",
    icon: <Hourglass className="h-4 w-4" />,
    label: "En espera",
  },
  resolved: {
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4" />,
    label: "Resuelto",
  },
  closed: {
    color: "bg-gray-100 text-gray-800",
    icon: <CheckCircle className="h-4 w-4" />,
    label: "Cerrado",
  },
};

// Priority badge configuration
const priorityConfig: Record<string, { color: string; label: string }> = {
  low: {
    color: "bg-green-100 text-green-800",
    label: "Baja",
  },
  medium: {
    color: "bg-amber-100 text-amber-800",
    label: "Media",
  },
  high: {
    color: "bg-orange-100 text-orange-800",
    label: "Alta",
  },
  urgent: {
    color: "bg-red-100 text-red-800",
    label: "Urgente",
  },
};

const commentFormSchema = insertTicketCommentSchema
  .extend({
    content: z.string().min(1, {
      message: "El comentario no puede estar vacío",
    }),
  });

type CommentFormValues = z.infer<typeof commentFormSchema>;

export function TicketDetail({ ticketNumber }: TicketDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch ticket details
  const {
    data: ticketData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [`/api/tickets/${ticketNumber}`],
  });

  // Comment form setup
  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
      isInternal: false,
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (values: CommentFormValues) => {
      const res = await apiRequest(
        "POST",
        `/api/tickets/${ticketData.ticket.id}/comments`,
        values
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Comentario añadido",
        description: "Tu comentario ha sido añadido con éxito.",
      });
      commentForm.reset({ content: "", isInternal: false });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al añadir comentario",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest(
        "PATCH",
        `/api/tickets/${ticketData.ticket.id}`,
        { status }
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "El estado del ticket ha sido actualizado.",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar estado",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Assign ticket mutation
  const assignTicketMutation = useMutation({
    mutationFn: async (assigneeId: number) => {
      const res = await apiRequest(
        "PATCH",
        `/api/tickets/${ticketData.ticket.id}`,
        { assigneeId }
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Ticket asignado",
        description: "El ticket ha sido asignado correctamente.",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al asignar ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle comment submission
  const onSubmitComment = (values: CommentFormValues) => {
    addCommentMutation.mutate(values);
  };

  // Handle status update
  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  // Handle assignment
  const handleAssignToMe = () => {
    if (user) {
      assignTicketMutation.mutate(user.id);
    }
  };

  if (isLoading) {
    return <TicketDetailSkeleton />;
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error al cargar el ticket</h2>
            <p className="text-gray-600 mb-4">
              {(error as Error).message || "No se pudo cargar la información del ticket."}
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { ticket, creator, assignee, comments, activities } = ticketData;

  const isAdmin = user?.role === "admin";
  const isAgent = user?.role === "agent";
  const canAssign = isAdmin || isAgent;
  const canUpdateStatus = isAdmin || isAgent || (user?.id === ticket.creatorId);

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-ms-gray-800">
                #{ticket.ticketNumber}: {ticket.title}
              </CardTitle>
              <CardDescription className="mt-1">
                Creado{" "}
                {ticket.createdAt &&
                  formatDistanceToNow(new Date(ticket.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                className={cn(
                  "px-2 py-1 text-xs font-semibold rounded-full",
                  statusConfig[ticket.status]?.color
                )}
              >
                {statusConfig[ticket.status]?.icon}
                <span className="ml-1">{statusConfig[ticket.status]?.label}</span>
              </Badge>
              <Badge
                className={cn(
                  "px-2 py-1 text-xs font-semibold rounded-full",
                  priorityConfig[ticket.priority]?.color
                )}
              >
                {priorityConfig[ticket.priority]?.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Creado por</span>
              <div className="flex items-center mt-1">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="bg-blue-500 text-white">
                    {creator?.name.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{creator?.name || "Usuario desconocido"}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Asignado a</span>
              <div className="flex items-center mt-1">
                {assignee ? (
                  <>
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="bg-green-500 text-white">
                        {assignee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{assignee.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">Sin asignar</span>
                )}
                {canAssign && !assignee && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    onClick={handleAssignToMe}
                    disabled={assignTicketMutation.isPending}
                  >
                    {assignTicketMutation.isPending ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <UserCheck className="h-3 w-3 mr-1" />
                    )}
                    <span className="text-xs">Asignarme</span>
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Departamento</span>
              <div className="flex items-center mt-1">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm">
                  {ticket.department || "No especificado"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Descripción</h3>
            <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
              {ticket.description}
            </div>
          </div>

          {canUpdateStatus && (
            <div className="flex items-center mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700 mr-3">
                Actualizar estado:
              </div>
              <Select
                value={ticket.status}
                onValueChange={handleStatusChange}
                disabled={updateStatusMutation.isPending}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Abierto</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="waiting">En espera</SelectItem>
                  <SelectItem value="resolved">Resuelto</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                </SelectContent>
              </Select>
              {updateStatusMutation.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Comments and Activity */}
      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comentarios
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Clock className="h-4 w-4 mr-2" />
            Actividad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Comentarios</CardTitle>
            </CardHeader>
            <CardContent>
              {comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className={cn(
                      "p-3 rounded-lg max-w-4xl",
                      comment.isInternal ? "bg-amber-50 border border-amber-200" : "bg-gray-50"
                    )}>
                      <div className="flex items-center mb-2">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback className="bg-blue-500 text-white">
                            {comment.user?.name.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              {comment.user?.name || "Usuario desconocido"}
                              {comment.isInternal && (
                                <span className="ml-2 text-xs text-amber-700 font-normal">
                                  (Comentario interno)
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              {comment.createdAt &&
                                format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm", {
                                  locale: es,
                                })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm ml-8">{comment.content}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay comentarios</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Sé el primero en añadir un comentario a este ticket.
                  </p>
                </div>
              )}

              <Separator className="my-6" />

              <div className="mt-4">
                <Form {...commentForm}>
                  <form onSubmit={commentForm.handleSubmit(onSubmitComment)} className="space-y-4">
                    <FormField
                      control={commentForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Escribe tu comentario..."
                              className="min-h-24 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {(isAdmin || isAgent) && (
                      <FormField
                        control={commentForm.control}
                        name="isInternal"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 text-blue-600"
                              />
                            </FormControl>
                            <label className="text-sm font-medium leading-none cursor-pointer">
                              Comentario interno (solo visible para equipo de soporte)
                            </label>
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={addCommentMutation.isPending}
                        className="bg-[#0078d4] hover:bg-[#0086f0]"
                      >
                        {addCommentMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar comentario
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Historial de actividad</CardTitle>
            </CardHeader>
            <CardContent>
              {activities && activities.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-6">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="relative pl-10">
                        <div
                          className={cn(
                            "absolute left-1 top-1 h-6 w-6 rounded-full flex items-center justify-center",
                            activity.activityType === "created"
                              ? "bg-blue-500"
                              : activity.activityType === "status_changed"
                              ? "bg-purple-500"
                              : activity.activityType === "assigned"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          )}
                        >
                          {activity.activityType === "created" ? (
                            <PlusIcon className="h-3 w-3 text-white" />
                          ) : activity.activityType === "status_changed" ? (
                            <RefreshCw className="h-3 w-3 text-white" />
                          ) : activity.activityType === "assigned" ? (
                            <UserCheck className="h-3 w-3 text-white" />
                          ) : activity.activityType === "comment_added" ? (
                            <MessageSquare className="h-3 w-3 text-white" />
                          ) : (
                            <Edit className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm text-gray-600">
                              {activity.description}
                              <span className="ml-1 text-gray-500">
                                por{" "}
                                <span className="font-medium">
                                  {activity.user?.name || "Usuario"}
                                </span>
                              </span>
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {activity.createdAt &&
                              format(new Date(activity.createdAt), "dd MMM yyyy, HH:mm", {
                                locale: es,
                              })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-8 w-8 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Sin actividad</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No hay registro de actividad para este ticket.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Teams Chat Integration */}
      {ticket.teamsChannelId && (isAdmin || isAgent || user?.id === ticket.creatorId) && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Microsoft Teams</CardTitle>
              <Button variant="outline" size="sm" className="text-[#0078d4]">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir en Teams
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TeamsChatWidget channelId={ticket.teamsChannelId} ticketNumber={ticket.ticketNumber} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TicketDetailSkeleton() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-96" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col">
            <Skeleton className="h-4 w-24 mb-2" />
            <div className="flex items-center mt-1">
              <Skeleton className="h-6 w-6 rounded-full mr-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex flex-col">
            <Skeleton className="h-4 w-24 mb-2" />
            <div className="flex items-center mt-1">
              <Skeleton className="h-6 w-6 rounded-full mr-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex flex-col">
            <Skeleton className="h-4 w-24 mb-2" />
            <div className="flex items-center mt-1">
              <Skeleton className="h-4 w-4 mr-2 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-32 w-full rounded-md" />

        <div className="flex items-center mt-6 pt-4 border-t border-gray-200">
          <Skeleton className="h-4 w-32 mr-3" />
          <Skeleton className="h-9 w-36 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

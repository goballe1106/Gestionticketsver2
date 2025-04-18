import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Notification } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, CheckCircle, AlertTriangle, Ticket, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationsProps {
  onClose: () => void;
}

export default function Notifications({ onClose }: NotificationsProps) {
  // Fetch notifications
  const { data: notifications, isLoading, isError } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PATCH', `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('#notifications-panel')) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleMarkAsRead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    markAsReadMutation.mutate(id);
  };

  const getNotificationIcon = (notification: Notification) => {
    // Check if message contains keywords to determine the type
    const message = notification.message.toLowerCase();
    
    if (message.includes('nuevo ticket') || message.includes('creado')) {
      return <Ticket className="h-4 w-4 text-white" />;
    } else if (message.includes('comentario') || message.includes('comentó')) {
      return <MessageCircle className="h-4 w-4 text-white" />;
    } else if (message.includes('resuelto') || message.includes('completado')) {
      return <CheckCircle className="h-4 w-4 text-white" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-white" />;
    }
  };

  const getNotificationIconBackground = (notification: Notification) => {
    const message = notification.message.toLowerCase();
    
    if (message.includes('nuevo ticket') || message.includes('creado')) {
      return "bg-primary-light";
    } else if (message.includes('comentario') || message.includes('comentó')) {
      return "bg-indigo-500";
    } else if (message.includes('resuelto') || message.includes('completado')) {
      return "bg-green-500";
    } else {
      return "bg-amber-500";
    }
  };

  return (
    <div 
      id="notifications-panel"
      className="absolute right-0 top-12 w-80 bg-white border border-neutral-100 rounded-md shadow-lg z-50 animate-in fade-in"
    >
      <div className="p-3 border-b border-neutral-100 flex justify-between items-center">
        <h3 className="font-semibold">Notificaciones</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="max-h-96">
        <div className="divide-y divide-neutral-100">
          {isLoading ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-3 border-b border-neutral-100">
                <div className="flex items-start">
                  <Skeleton className="h-8 w-8 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : isError ? (
            <div className="p-4 text-center text-sm text-neutral-500">
              Error al cargar notificaciones
            </div>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <Link 
                key={notification.id} 
                href={notification.relatedTicketId ? `/tickets/${notification.relatedTicketId}` : "#"}
              >
                <a className="block p-3 hover:bg-neutral-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className={`p-2 rounded-full ${getNotificationIconBackground(notification)}`}>
                        {getNotificationIcon(notification)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${notification.isRead ? 'text-neutral-500' : 'text-neutral-800 font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        className="text-xs text-primary hover:text-primary-dark"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </a>
              </Link>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-neutral-500">
              No tienes notificaciones
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-2 text-center border-t border-neutral-100">
        <Link href="/notifications">
          <Button variant="ghost" className="text-sm text-primary hover:text-primary-dark w-full">
            Ver todas las notificaciones
          </Button>
        </Link>
      </div>
    </div>
  );
}

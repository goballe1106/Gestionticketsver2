import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Hourglass, 
  Inbox, 
  User, 
  Users, 
  Wrench 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface TicketListProps {
  status?: string;
  limit?: number;
  showCreateButton?: boolean;
}

export function TicketList({ status, limit = 10, showCreateButton = true }: TicketListProps) {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>(status || "all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  const queryKey = ["/api/tickets"];
  if (selectedStatus !== "all") {
    queryKey.push(`status=${selectedStatus}`);
  }

  const { data: tickets, isLoading } = useQuery({
    queryKey,
    staleTime: 1000 * 60, // 1 minute
  });

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

  const filteredTickets = tickets
    ? tickets.filter((ticket: any) => {
        if (selectedPriority !== "all" && ticket.priority !== selectedPriority) {
          return false;
        }
        return true;
      })
    : [];

  // Get limited tickets
  const limitedTickets = limit ? filteredTickets.slice(0, limit) : filteredTickets;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-4 border-b border-ms-gray-200 sm:px-6">
        <div className="flex flex-wrap items-center justify-between">
          <h2 className="text-lg font-medium text-ms-gray-900 mr-4">
            {limit ? "Tickets Recientes" : "Mis Tickets"}
          </h2>

          <div className="flex flex-wrap items-center mt-2 sm:mt-0">
            <div className="relative mr-3">
              <Select 
                value={selectedStatus} 
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="open">Abierto</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="waiting">En espera</SelectItem>
                  <SelectItem value="resolved">Resuelto</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative mr-3">
              <Select 
                value={selectedPriority} 
                onValueChange={setSelectedPriority}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showCreateButton && (
              <Link href="/tickets/create">
                <Button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0078d4] hover:bg-[#0086f0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078d4]">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nuevo Ticket
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <TicketListSkeleton />
      ) : limitedTickets.length === 0 ? (
        <div className="py-12">
          <div className="text-center">
            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tickets</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron tickets con los filtros actuales.
            </p>
            {user?.role !== "admin" && (
              <div className="mt-6">
                <Link href="/tickets/create">
                  <Button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0078d4] hover:bg-[#0086f0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078d4]">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Crear un nuevo ticket
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-ms-gray-200">
          {limitedTickets.map((ticket: any) => (
            <li key={ticket.id}>
              <Link href={`/tickets/${ticket.ticketNumber}`}>
                <a className="block hover:bg-ms-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between flex-wrap">
                      <div className="flex items-center flex-wrap">
                        <p className="text-sm font-medium text-[#0078d4] truncate">
                          #{ticket.ticketNumber}: {ticket.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={cn(
                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                            statusConfig[ticket.status]?.color
                          )}>
                            {statusConfig[ticket.status]?.label || ticket.status}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={cn(
                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                            priorityConfig[ticket.priority]?.color
                          )}>
                            {priorityConfig[ticket.priority]?.label || ticket.priority}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="text-sm text-ms-gray-500">
                          {ticket.createdAt
                            ? `Hace ${formatDistanceToNow(new Date(ticket.createdAt), { locale: es })}`
                            : "Fecha desconocida"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-ms-gray-500">
                          <User className="h-4 w-4 mr-1" />
                          {ticket.creator?.name || "Usuario"}
                        </p>
                        {ticket.department && (
                          <p className="mt-2 flex items-center text-sm text-ms-gray-500 sm:mt-0 sm:ml-6">
                            <Users className="h-4 w-4 mr-1" />
                            {ticket.department}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-ms-gray-500 sm:mt-0">
                        <User className="h-4 w-4 mr-1" />
                        <p>
                          {ticket.assignee
                            ? `Asignado a: ${ticket.assignee.name}`
                            : "No asignado"}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!limit && filteredTickets.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-ms-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TicketListSkeleton() {
  return (
    <ul className="divide-y divide-ms-gray-200">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-5 w-16 ml-2 rounded-full" />
              <Skeleton className="h-5 w-16 ml-2 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <Skeleton className="h-4 w-32 mt-2" />
              <Skeleton className="h-4 w-40 mt-2 sm:ml-6" />
            </div>
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </li>
      ))}
    </ul>
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

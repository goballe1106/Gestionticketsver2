import { useState } from "react";
import { Link } from "wouter";
import { useTickets } from "@/hooks/use-tickets";
import { useAuth } from "@/hooks/use-auth";
import { Ticket } from "@shared/schema";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CirclePlus, Filter, MoreVertical, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function TicketList() {
  const { user } = useAuth();
  const { tickets, isLoading } = useTickets();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTickets = tickets?.filter((ticket) => {
    // Apply status filter
    if (statusFilter !== "all" && ticket.status !== statusFilter) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const ticketId = ticket.id.toString();
      const title = ticket.title.toLowerCase();
      
      if (!ticketId.includes(query) && !title.includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  // Function to get the user's initials for avatar fallback
  const getUserInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatUpdatedTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>
            Administra y visualiza todos los tickets de soporte.
          </CardDescription>
        </div>
        <Link href="/tickets/new">
          <Button>
            <CirclePlus className="mr-2 h-4 w-4" />
            Nuevo Ticket
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Buscar por ID o asunto..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="new">Nuevo</SelectItem>
                <SelectItem value="assigned">Asignado</SelectItem>
                <SelectItem value="in_progress">En progreso</SelectItem>
                <SelectItem value="resolved">Resuelto</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Asignado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Actualizado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Skeleton className="h-6 w-6 rounded-full mr-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Skeleton className="h-6 w-6 rounded-full mr-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Asignado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Actualizado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets && filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <Link href={`/tickets/${ticket.id}`}>
                          <a className="text-sm font-medium text-primary">
                            #{ticket.id}
                          </a>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <PriorityBadge priority={ticket.priority} size="sm" />
                          <span className="text-sm ml-2">{ticket.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={ticket.requester?.avatarUrl} />
                            <AvatarFallback>{getUserInitials(ticket.requester?.fullName || '')}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.requester?.fullName || 'Usuario'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ticket.agent ? (
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={ticket.agent?.avatarUrl} />
                              <AvatarFallback>{getUserInitials(ticket.agent?.fullName || '')}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{ticket.agent?.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">Sin asignar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-neutral-500">
                          {formatUpdatedTime(ticket.lastUpdated)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      {searchQuery || statusFilter !== "all" ? (
                        <div>
                          <p className="text-lg font-medium">No se encontraron tickets</p>
                          <p className="text-sm text-neutral-500">Intenta con otros filtros de búsqueda</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-medium">No hay tickets creados aún</p>
                          <Link href="/tickets/new">
                            <Button className="mt-2">
                              <CirclePlus className="mr-2 h-4 w-4" />
                              Crear nuevo ticket
                            </Button>
                          </Link>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {filteredTickets && filteredTickets.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-neutral-500">
              Mostrando {filteredTickets.length} de {tickets?.length} tickets
            </p>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

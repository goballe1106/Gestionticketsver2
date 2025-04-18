import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useTickets } from "@/hooks/use-tickets";
import TicketStats from "@/components/tickets/TicketStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TeamsIntegration from "@/components/dashboard/TeamsIntegration";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "wouter";
import { PlusCircle, ArrowRight } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const { tickets, isLoading, getStats } = useTickets();
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.role === 'admin') {
        try {
          setIsLoadingStats(true);
          const statsData = await getStats();
          setStats(statsData);
        } catch (error) {
          console.error("Error fetching stats:", error);
        } finally {
          setIsLoadingStats(false);
        }
      } else {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [user, getStats]);

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

  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  };

  // Get recent tickets (max 5)
  const recentTickets = tickets
    ? [...tickets].sort((a, b) => 
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      ).slice(0, 5)
    : [];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-semibold text-neutral-700 mb-6">Dashboard</h1>
        
        {/* Display stats for admins */}
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <div className="mb-6">
            <TicketStats stats={stats} isLoading={isLoadingStats} />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tickets */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tickets Recientes</CardTitle>
                  <CardDescription>
                    Visualiza y gestiona los tickets más recientes.
                  </CardDescription>
                </div>
                <Link href="/tickets">
                  <Button variant="outline" size="sm">
                    Ver todos <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Asunto</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Actualizado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : recentTickets.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Asunto</TableHead>
                          <TableHead>Solicitante</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Actualizado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTickets.map((ticket) => (
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
                                <span className="text-sm ml-2 truncate max-w-[200px]">
                                  {ticket.title}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={ticket.requester?.avatarUrl} />
                                  <AvatarFallback>{getUserInitials(ticket.requester?.fullName || '')}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate max-w-[100px]">
                                  {ticket.requester?.fullName || 'Usuario'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={ticket.status} />
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-neutral-500">
                                {formatTime(ticket.lastUpdated)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 border rounded-md">
                    <p className="text-lg font-medium mb-2">No hay tickets creados aún</p>
                    <p className="text-neutral-500 mb-4">Crea tu primer ticket para empezar</p>
                    <Link href="/tickets/new">
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Crear ticket
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
              {recentTickets.length > 0 && (
                <CardFooter className="border-t px-6 py-3">
                  <Link href="/tickets/new">
                    <Button variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Crear nuevo ticket
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          </div>
          
          {/* Right column */}
          <div className="space-y-6">
            {/* Teams Integration Card */}
            <TeamsIntegration />
            
            {/* Recent Activity */}
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useTickets } from "@/hooks/use-tickets";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import TicketStats from "@/components/tickets/TicketStats";

// Mock data for charts - in a real app, this would come from the API
const ticketsByStatusData = [
  { name: "Nuevos", value: 10, color: "#0078d4" },
  { name: "Asignados", value: 15, color: "#605e5c" },
  { name: "En progreso", value: 8, color: "#2b88d8" },
  { name: "Resueltos", value: 12, color: "#107c10" },
  { name: "Cerrados", value: 5, color: "#323130" },
];

const ticketsByPriorityData = [
  { name: "Baja", value: 20, color: "#107c10" },
  { name: "Media", value: 15, color: "#0078d4" },
  { name: "Alta", value: 8, color: "#ffaa44" },
  { name: "Crítica", value: 5, color: "#d13438" },
];

const ticketsOverTimeData = [
  { date: "Ene", nuevos: 12, resueltos: 8 },
  { date: "Feb", nuevos: 15, resueltos: 10 },
  { date: "Mar", nuevos: 18, resueltos: 16 },
  { date: "Abr", nuevos: 14, resueltos: 12 },
  { date: "May", nuevos: 21, resueltos: 18 },
  { date: "Jun", nuevos: 25, resueltos: 22 },
  { date: "Jul", nuevos: 20, resueltos: 24 },
];

const agentPerformanceData = [
  { 
    name: "Ana", 
    asignados: 16, 
    resueltos: 14, 
    tiempoPromedio: 4.5 
  },
  { 
    name: "Roberto", 
    asignados: 24, 
    resueltos: 20, 
    tiempoPromedio: 3.8 
  },
  { 
    name: "María", 
    asignados: 20, 
    resueltos: 17, 
    tiempoPromedio: 5.2 
  },
  { 
    name: "Carlos", 
    asignados: 18, 
    resueltos: 16, 
    tiempoPromedio: 4.1 
  },
];

export default function AdminStatsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { getStats } = useTickets();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stats on component mount
  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== "admin") {
      toast({
        title: "Acceso denegado",
        description: "No tienes permiso para acceder a esta página",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const statsData = await getStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate, toast, getStats]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-semibold text-neutral-700 mb-6">Reportes y Estadísticas</h1>

        {/* Stats Cards */}
        <div className="mb-6">
          <TicketStats stats={stats} isLoading={isLoading} />
        </div>

        {/* Ticket Charts */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="time">Evolución en el tiempo</TabsTrigger>
            <TabsTrigger value="agents">Desempeño de agentes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tickets by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Tickets por Estado</CardTitle>
                  <CardDescription>
                    Distribución actual de tickets según su estado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ticketsByStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {ticketsByStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Tickets by Priority */}
              <Card>
                <CardHeader>
                  <CardTitle>Tickets por Prioridad</CardTitle>
                  <CardDescription>
                    Distribución de tickets según su nivel de prioridad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={ticketsByPriorityData}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Tickets">
                          {ticketsByPriorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="time">
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Tickets en el Tiempo</CardTitle>
                <CardDescription>
                  Comparativa entre tickets nuevos y resueltos por mes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={ticketsOverTimeData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="nuevos"
                        name="Tickets Creados"
                        stroke="#0078d4"
                        fill="#0078d4"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="resueltos"
                        name="Tickets Resueltos"
                        stroke="#107c10"
                        fill="#107c10"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>Desempeño de Agentes</CardTitle>
                <CardDescription>
                  Comparativa de tickets asignados vs. resueltos por agente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={agentPerformanceData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="asignados"
                        name="Tickets Asignados"
                        stroke="#0078d4"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="resueltos"
                        name="Tickets Resueltos"
                        stroke="#107c10"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="tiempoPromedio"
                        name="Tiempo Promedio (horas)"
                        stroke="#d13438"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("month");

  // Fetch ticket statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats/tickets"],
  });

  // Process data for charts
  const getStatusData = () => {
    if (!stats || !stats.byStatus) return [];

    return stats.byStatus.map((item: { status: string; count: number }) => ({
      name: getStatusLabel(item.status),
      value: item.count,
    }));
  };

  // Helper to get readable status labels
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Abiertos";
      case "in_progress":
        return "En progreso";
      case "waiting":
        return "En espera";
      case "resolved":
        return "Resueltos";
      case "closed":
        return "Cerrados";
      default:
        return status;
    }
  };

  // Colors for the status chart
  const STATUS_COLORS = {
    Abiertos: "#3b82f6",
    "En progreso": "#f59e0b",
    "En espera": "#8b5cf6",
    Resueltos: "#10b981",
    Cerrados: "#6b7280",
  };

  // Sample data for department distribution (in a real app, this would come from the API)
  const departmentData = [
    { name: "Ventas", count: 23 },
    { name: "Marketing", count: 15 },
    { name: "IT", count: 32 },
    { name: "RRHH", count: 12 },
    { name: "Finanzas", count: 18 },
  ];

  // Sample data for resolution time (in a real app, this would come from the API)
  const resolutionTimeData = [
    { name: "< 1 hora", count: 14 },
    { name: "1-4 horas", count: 23 },
    { name: "4-24 horas", count: 32 },
    { name: "1-3 días", count: 18 },
    { name: "> 3 días", count: 7 },
  ];

  return (
    <Layout title="Reportes">
      <div className="pb-5 mb-5 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Reportes y Estadísticas</h2>
        <p className="mt-2 text-sm text-gray-600">
          Visualiza las estadísticas de tickets y rendimiento del sistema de soporte.
        </p>
      </div>

      <div className="mb-6">
        <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
          <div className="flex justify-end">
            <TabsList>
              <TabsTrigger value="week">Esta Semana</TabsTrigger>
              <TabsTrigger value="month">Este Mes</TabsTrigger>
              <TabsTrigger value="quarter">Este Trimestre</TabsTrigger>
              <TabsTrigger value="year">Este Año</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#0078d4]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets by Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Distribución de Tickets por Estado</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pt-4">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getStatusData().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || "#8884d8"} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} tickets`, "Cantidad"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tickets by Department */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tickets por Departamento</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} tickets`, "Cantidad"]} />
                    <Legend />
                    <Bar dataKey="count" name="Tickets" fill="#0078d4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Resolution Time */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tiempo de Resolución</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={resolutionTimeData}
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
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip formatter={(value) => [`${value} tickets`, "Cantidad"]} />
                    <Legend />
                    <Bar dataKey="count" name="Tickets" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumen de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 pt-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Tickets Resueltos Hoy</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">{stats?.resolvedToday || 0}</span>
                    <span className="ml-2 text-sm text-green-600">+12% vs ayer</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Tiempo Promedio de Respuesta</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">2.4h</span>
                    <span className="ml-2 text-sm text-green-600">-15% vs semana pasada</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Tiempo Promedio de Resolución</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">8.6h</span>
                    <span className="ml-2 text-sm text-green-600">-5% vs semana pasada</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Satisfacción del Cliente</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">94%</span>
                    <span className="ml-2 text-sm text-green-600">+2% vs mes pasado</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}

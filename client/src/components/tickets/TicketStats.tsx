import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Clock, CheckCircle, AlertTriangle, Ticket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Stat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string;
    trend: "up" | "down";
  };
}

interface TicketStatsProps {
  stats?: {
    activeTickets: number;
    resolvedToday: number;
    urgentTickets: number;
    avgResolutionTime: string;
  };
  isLoading?: boolean;
}

export default function TicketStats({ stats, isLoading = false }: TicketStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
              <Skeleton className="mt-2 h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems: Stat[] = [
    {
      title: "Tickets Activos",
      value: stats.activeTickets,
      icon: <Ticket className="text-lg" />,
      change: {
        value: "12% desde ayer",
        trend: "up",
      },
    },
    {
      title: "Resueltos Hoy",
      value: stats.resolvedToday,
      icon: <CheckCircle className="text-lg" />,
      change: {
        value: "8% desde ayer",
        trend: "up",
      },
    },
    {
      title: "Tiempo Promedio",
      value: stats.avgResolutionTime,
      icon: <Clock className="text-lg" />,
      change: {
        value: "5% desde ayer",
        trend: "down",
      },
    },
    {
      title: "Tickets Urgentes",
      value: stats.urgentTickets,
      icon: <AlertTriangle className="text-lg" />,
      change: {
        value: "15% desde ayer",
        trend: "up",
      },
    },
  ];

  const getIconColor = (index: number) => {
    const colors = [
      "text-primary",
      "text-green-600",
      "text-amber-500",
      "text-red-500",
    ];
    return colors[index % colors.length];
  };

  const getIconBgColor = (index: number) => {
    const colors = [
      "bg-primary/10",
      "bg-green-600/10",
      "bg-amber-500/10",
      "bg-red-500/10",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div 
                className={`rounded-full p-3 ${getIconBgColor(index)} ${getIconColor(index)}`}
              >
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-500">{stat.title}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
            {stat.change && (
              <div 
                className={`mt-2 text-xs ${stat.change.trend === "up" 
                  ? (index === 3 ? "text-red-600" : "text-green-600") 
                  : (index === 2 ? "text-red-600" : "text-green-600")
                } flex items-center`}
              >
                {stat.change.trend === "up" 
                  ? <ArrowUp className="mr-1 h-3 w-3" /> 
                  : <ArrowDown className="mr-1 h-3 w-3" />
                } 
                {stat.change.value}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

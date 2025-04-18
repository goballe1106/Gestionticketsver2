import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CheckCircle, Hourglass, Inbox, Loader2, Wrench } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsGrid() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/stats/tickets"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-white overflow-hidden shadow rounded-lg col-span-full">
          <CardContent className="p-5">
            <div className="flex items-center justify-center py-4">
              <p className="text-sm text-red-600">Error al cargar estadísticas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract stats by status
  const statusCounts = stats?.byStatus.reduce(
    (acc: Record<string, number>, curr: { status: string; count: number }) => {
      acc[curr.status] = curr.count;
      return acc;
    },
    {}
  ) || {};

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard
        title="Tickets Abiertos"
        count={statusCounts.open || 0}
        icon={<Inbox className="text-blue-500" />}
        iconBgColor="bg-blue-50"
        linkHref="/tickets?status=open"
      />

      <StatCard
        title="En Progreso"
        count={statusCounts.in_progress || 0}
        icon={<Wrench className="text-amber-500" />}
        iconBgColor="bg-amber-50"
        linkHref="/tickets?status=in_progress"
      />

      <StatCard
        title="En Espera"
        count={statusCounts.waiting || 0}
        icon={<Hourglass className="text-purple-500" />}
        iconBgColor="bg-purple-50"
        linkHref="/tickets?status=waiting"
      />

      <StatCard
        title="Resueltos (Hoy)"
        count={stats?.resolvedToday || 0}
        icon={<CheckCircle className="text-green-500" />}
        iconBgColor="bg-green-50"
        linkHref="/tickets?status=resolved"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  iconBgColor: string;
  linkHref: string;
}

function StatCard({ title, count, icon, iconBgColor, linkHref }: StatCardProps) {
  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{count}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <Link href={linkHref}>
            <a className="font-medium text-[#0078d4] hover:text-[#0086f0]">Ver todos</a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="p-5">
        <div className="flex items-center">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="ml-5 w-0 flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-5 py-3">
        <Skeleton className="h-5 w-20" />
      </CardFooter>
    </Card>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { 
  MessageSquare, 
  UserCheck, 
  PlusCircle, 
  CheckCircle, 
  RefreshCw,
  Loader2 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ActivityFeed() {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["/api/activities"],
  });

  if (isLoading) {
    return <ActivityFeedSkeleton />;
  }

  if (error) {
    return (
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <CardHeader className="px-4 py-5 border-b border-gray-200">
          <CardTitle className="text-lg leading-6 font-medium text-gray-900">
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="flex justify-center items-center py-8">
            <p className="text-sm text-red-600">Error al cargar las actividades</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6 max-h-96 overflow-y-auto">
        {activities && activities.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity: any, index: number) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index < activities.length - 1 && (
                      <span 
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                        aria-hidden="true" 
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span 
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white",
                            activity.activityType === "created" 
                              ? "bg-blue-500" 
                              : activity.activityType === "status_changed" 
                              ? "bg-purple-500" 
                              : activity.activityType === "assigned" 
                              ? "bg-green-500" 
                              : activity.activityType === "comment_added" 
                              ? "bg-amber-500" 
                              : "bg-gray-500"
                          )}
                        >
                          {activity.activityType === "created" ? (
                            <PlusCircle className="text-white text-sm" />
                          ) : activity.activityType === "status_changed" ? (
                            <RefreshCw className="text-white text-sm" />
                          ) : activity.activityType === "assigned" ? (
                            <UserCheck className="text-white text-sm" />
                          ) : activity.activityType === "comment_added" ? (
                            <MessageSquare className="text-white text-sm" />
                          ) : (
                            <CheckCircle className="text-white text-sm" />
                          )}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {activity.description}{" "}
                            {activity.ticket && (
                              <Link href={`/tickets/${activity.ticket.ticketNumber}`}>
                                <a className="font-medium text-gray-900 hover:text-[#0078d4]">
                                  {activity.ticket.ticketNumber}
                                </a>
                              </Link>
                            )}
                            {activity.user && (
                              <span className="ml-1">
                                por <span className="font-medium text-gray-900">{activity.user.name}</span>
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>
                            {activity.createdAt && formatDistanceToNow(new Date(activity.createdAt), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay actividad reciente</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aquí aparecerá la actividad de los tickets.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
        <Link href="/tickets">
          <a className="text-sm font-medium text-[#0078d4] hover:text-[#0086f0]">
            Ver toda la actividad<span aria-hidden="true"> &rarr;</span>
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}

function ActivityFeedSkeleton() {
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6 max-h-96 overflow-y-auto">
        <div className="flow-root">
          <ul className="-mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={index}>
                <div className="relative pb-8">
                  {index < 3 && (
                    <span 
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                      aria-hidden="true" 
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <Skeleton className="h-5 w-64" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
        <Skeleton className="h-5 w-40" />
      </CardFooter>
    </Card>
  );
}

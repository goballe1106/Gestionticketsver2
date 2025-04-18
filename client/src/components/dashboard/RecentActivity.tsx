import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  MessageCircle, Check, UserPlus, Flag, History 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TicketActivity } from "@shared/schema";
import { useTickets } from "@/hooks/use-tickets";

export default function RecentActivity() {
  const { getRecentActivities } = useTickets();
  const [activities, setActivities] = useState<TicketActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const data = await getRecentActivities();
        setActivities(data || []);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [getRecentActivities]);

  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Flag className="h-4 w-4" />;
      case "update":
      case "status_change":
        return <History className="h-4 w-4" />;
      case "comment":
        return <MessageCircle className="h-4 w-4" />;
      case "assign":
        return <UserPlus className="h-4 w-4" />;
      case "resolve":
        return <Check className="h-4 w-4" />;
      default:
        return <Flag className="h-4 w-4" />;
    }
  };

  const getActivityIconColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-primary/10 text-primary";
      case "update":
      case "status_change":
        return "bg-amber-500/10 text-amber-500";
      case "comment":
        return "bg-primary/10 text-primary";
      case "assign":
        return "bg-blue-500/10 text-blue-500";
      case "resolve":
        return "bg-green-600/10 text-green-600";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getActivityText = (activity: TicketActivity) => {
    switch (activity.action) {
      case "create":
        return `creó el ticket #${activity.ticketId}`;
      case "update":
        return `actualizó el ticket #${activity.ticketId}`;
      case "status_change":
        return `cambió el estado del ticket #${activity.ticketId}`;
      case "comment":
        return `comentó en el ticket #${activity.ticketId}`;
      case "assign":
        return `fue asignado al ticket #${activity.ticketId}`;
      case "resolve":
        return `resolvió el ticket #${activity.ticketId}`;
      default:
        return `actuó en el ticket #${activity.ticketId}`;
    }
  };

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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="px-6 divide-y divide-neutral-100">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="py-4">
                  <div className="flex">
                    <Skeleton className="h-8 w-8 rounded-full mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full max-w-[250px] mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="py-4 hover:bg-neutral-50">
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className={`w-8 h-8 rounded-full ${getActivityIconColor(activity.action)} flex items-center justify-center`}>
                        {getActivityIcon(activity.action)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm">
                        <Link href={`/tickets/${activity.ticketId}`}>
                          <a className="font-medium hover:text-primary">
                            {activity.user?.fullName || 'Usuario'}
                          </a>
                        </Link>
                        {" "}
                        {getActivityText(activity)}
                        {" "}
                        <Link href={`/tickets/${activity.ticketId}`}>
                          <a className="font-medium text-primary hover:underline">
                            #{activity.ticketId}
                          </a>
                        </Link>
                        {activity.details && ` - ${activity.details}`}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-10">
                <p className="text-neutral-500">No hay actividad reciente</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t border-neutral-100 px-6 py-3">
        <Link href="/activities">
          <Button variant="ghost" className="w-full text-primary hover:text-primary-dark">
            Ver toda la actividad
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

import { Badge } from "@/components/ui/badge";
import { CircleDot } from "lucide-react";

type PriorityType = "low" | "medium" | "high" | "critical";

interface PriorityBadgeProps {
  priority: PriorityType | string;
  size?: "sm" | "md";
}

export default function PriorityBadge({ priority, size = "md" }: PriorityBadgeProps) {
  // For small size, we just use a colored dot
  if (size === "sm") {
    return (
      <span className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`} />
    );
  }

  // Full badge for regular size
  const config = getPriorityConfig(priority);
  
  return (
    <Badge 
      variant="outline" 
      className={`font-normal gap-1 items-center ${config.className}`}
    >
      <CircleDot className="h-3 w-3" /> {config.label}
    </Badge>
  );
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "low":
      return "bg-green-500";
    case "medium":
      return "bg-blue-500";  
    case "high":
      return "bg-amber-500";
    case "critical":
      return "bg-red-500";
    default:
      return "bg-neutral-500";
  }
}

function getPriorityConfig(priority: string) {
  switch (priority) {
    case "low":
      return {
        label: "Baja",
        className: "bg-green-100 text-green-800 hover:bg-green-100"
      };
    case "medium":
      return {
        label: "Media",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100"
      };
    case "high":
      return {
        label: "Alta",
        className: "bg-amber-100 text-amber-800 hover:bg-amber-100"
      };
    case "critical":
      return {
        label: "Crítica",
        className: "bg-red-100 text-red-800 hover:bg-red-100"
      };
    default:
      return {
        label: priority,
        className: "bg-neutral-100 text-neutral-800 hover:bg-neutral-100"
      };
  }
}

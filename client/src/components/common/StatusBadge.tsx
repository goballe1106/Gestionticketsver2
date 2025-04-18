import { Badge } from "@/components/ui/badge";

type StatusType = "new" | "assigned" | "in_progress" | "resolved" | "closed";

interface StatusBadgeProps {
  status: StatusType | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "new":
        return {
          label: "Nuevo",
          className: "bg-blue-100 text-blue-800 hover:bg-blue-100"
        };
      case "assigned":
        return {
          label: "Asignado",
          className: "bg-slate-100 text-slate-800 hover:bg-slate-100"
        };
      case "in_progress":
        return {
          label: "En progreso",
          className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
        };
      case "resolved":
        return {
          label: "Resuelto",
          className: "bg-green-100 text-green-800 hover:bg-green-100"
        };
      case "closed":
        return {
          label: "Cerrado",
          className: "bg-neutral-100 text-neutral-800 hover:bg-neutral-100"
        };
      default:
        return {
          label: status,
          className: "bg-neutral-100 text-neutral-800 hover:bg-neutral-100"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant="outline" 
      className={`font-normal ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

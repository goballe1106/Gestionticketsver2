import { useParams } from "wouter";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TicketDetail from "@/components/tickets/TicketDetail";

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id ? parseInt(params.id) : 0;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <TicketDetail ticketId={ticketId} />
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from "@/components/layout/DashboardLayout";
import TicketList from "@/components/tickets/TicketList";

export default function TicketsPage() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <TicketList />
      </div>
    </DashboardLayout>
  );
}

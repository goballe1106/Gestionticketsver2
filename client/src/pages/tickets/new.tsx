import DashboardLayout from "@/components/layout/DashboardLayout";
import TicketForm from "@/components/tickets/TicketForm";

export default function NewTicketPage() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <TicketForm />
      </div>
    </DashboardLayout>
  );
}

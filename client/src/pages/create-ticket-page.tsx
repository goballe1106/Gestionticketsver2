import { Layout } from "@/components/layout/layout";
import { TicketForm } from "@/components/tickets/ticket-form";

export default function CreateTicketPage() {
  return (
    <Layout title="Crear Ticket">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear nuevo ticket de soporte</h1>
        <TicketForm />
      </div>
    </Layout>
  );
}

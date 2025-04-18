import { useParams } from "wouter";
import { Layout } from "@/components/layout/layout";
import { TicketDetail } from "@/components/tickets/ticket-detail";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function TicketDetailPage() {
  // Get ticket number from URL params
  const { ticketNumber } = useParams<{ ticketNumber: string }>();

  if (!ticketNumber) {
    return (
      <Layout title="Detalle de Ticket">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Ticket no encontrado</h2>
          <p className="mt-2 text-gray-600">No se pudo encontrar el ticket especificado.</p>
          <div className="mt-6">
            <Link href="/tickets">
              <Button>Volver a la lista de tickets</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Ticket ${ticketNumber}`}>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link href="/tickets">
            <Button variant="ghost" className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver a tickets
            </Button>
          </Link>
        </div>
        <TicketDetail ticketNumber={ticketNumber} />
      </div>
    </Layout>
  );
}

import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { TicketList } from "@/components/tickets/ticket-list";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function TicketsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  return (
    <Layout title="Mis Tickets">
      <div className="pb-5 mb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h2 className="text-lg font-medium text-gray-900">Tickets de Soporte</h2>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Link href="/tickets/create">
            <Button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0078d4] hover:bg-[#0086f0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078d4]">
              <svg
                className="h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nuevo Ticket
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <StatusFilterButton
          label="Todos"
          status={null}
          selected={selectedStatus === null}
          onClick={() => setSelectedStatus(null)}
        />
        <StatusFilterButton
          label="Abiertos"
          status="open"
          selected={selectedStatus === "open"}
          onClick={() => setSelectedStatus("open")}
        />
        <StatusFilterButton
          label="En progreso"
          status="in_progress"
          selected={selectedStatus === "in_progress"}
          onClick={() => setSelectedStatus("in_progress")}
        />
        <StatusFilterButton
          label="En espera"
          status="waiting"
          selected={selectedStatus === "waiting"}
          onClick={() => setSelectedStatus("waiting")}
        />
        <StatusFilterButton
          label="Resueltos"
          status="resolved"
          selected={selectedStatus === "resolved"}
          onClick={() => setSelectedStatus("resolved")}
        />
        <StatusFilterButton
          label="Cerrados"
          status="closed"
          selected={selectedStatus === "closed"}
          onClick={() => setSelectedStatus("closed")}
        />
      </div>

      <TicketList status={selectedStatus || undefined} showCreateButton={false} />
    </Layout>
  );
}

interface StatusFilterButtonProps {
  label: string;
  status: string | null;
  selected: boolean;
  onClick: () => void;
}

function StatusFilterButton({ label, selected, onClick }: StatusFilterButtonProps) {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      className={selected ? "bg-[#0078d4] hover:bg-[#0086f0]" : ""}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

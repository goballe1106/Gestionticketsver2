import { 
  useQuery, useMutation, useQueryClient
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Ticket, InsertTicket, 
  TicketComment, InsertTicketComment,
  TicketActivity 
} from "@shared/schema";

export function useTickets() {
  const queryClient = useQueryClient();

  // Get all tickets
  const { 
    data: tickets = [],
    isLoading,
    error
  } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets'],
  });

  // Get a single ticket
  const getTicket = async (id: number): Promise<Ticket> => {
    const res = await apiRequest('GET', `/api/tickets/${id}`);
    return await res.json();
  };

  // Create a ticket
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: Partial<InsertTicket>) => {
      const res = await apiRequest('POST', '/api/tickets', ticketData);
      return await res.json() as Ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
    },
  });

  // Update ticket status
  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: number, status: string }) => {
      const res = await apiRequest('PATCH', `/api/tickets/${ticketId}`, { status });
      return await res.json() as Ticket;
    },
    onSuccess: (updatedTicket) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${updatedTicket.id}`] });
    },
  });

  // Assign ticket to agent
  const assignTicketMutation = useMutation({
    mutationFn: async ({ ticketId, agentId }: { ticketId: number, agentId: number }) => {
      const res = await apiRequest('POST', `/api/tickets/${ticketId}/assign`, { agentId });
      return await res.json() as Ticket;
    },
    onSuccess: (updatedTicket) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${updatedTicket.id}`] });
    },
  });

  // Add comment to ticket
  const addCommentMutation = useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: number, content: string }) => {
      const res = await apiRequest('POST', `/api/tickets/${ticketId}/comments`, { content });
      return await res.json() as TicketComment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${variables.ticketId}/comments`] });
    },
  });

  // Get comments for a ticket
  const getComments = async (ticketId: number): Promise<TicketComment[]> => {
    const res = await apiRequest('GET', `/api/tickets/${ticketId}/comments`);
    return await res.json();
  };

  // Get activities for a ticket
  const getActivities = async (ticketId: number): Promise<TicketActivity[]> => {
    const res = await apiRequest('GET', `/api/tickets/${ticketId}/activities`);
    return await res.json();
  };

  // Get recent activities
  const getRecentActivities = async (): Promise<TicketActivity[]> => {
    const res = await apiRequest('GET', `/api/activities`);
    return await res.json();
  };

  // Get stats
  const getStats = async () => {
    const res = await apiRequest('GET', `/api/stats`);
    return await res.json();
  };

  return {
    tickets,
    isLoading,
    error,
    getTicket,
    createTicket: createTicketMutation.mutate,
    isCreating: createTicketMutation.isPending,
    updateTicketStatus: (ticketId: number, status: string) => 
      updateTicketStatusMutation.mutateAsync({ ticketId, status }),
    isUpdating: updateTicketStatusMutation.isPending,
    assignTicket: (ticketId: number, agentId: number) => 
      assignTicketMutation.mutateAsync({ ticketId, agentId }),
    isAssigning: assignTicketMutation.isPending,
    addComment: (ticketId: number, content: string) => 
      addCommentMutation.mutateAsync({ ticketId, content }),
    isCommenting: addCommentMutation.isPending,
    getComments,
    getActivities,
    getRecentActivities,
    getStats
  };
}

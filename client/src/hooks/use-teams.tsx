import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function useTeams() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(!!user?.msTeamsId);

  // Connect user to Teams
  const connectUserToTeamsMutation = useMutation({
    mutationFn: async () => {
      // For this example, we'll use a mock Teams ID
      const msTeamsId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const res = await apiRequest('POST', '/api/teams/connect', { msTeamsId });
      return await res.json();
    },
    onSuccess: () => {
      setIsConnected(true);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Conexión exitosa",
        description: "Te has conectado correctamente a Microsoft Teams",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error de conexión",
        description: error.message || "No se pudo conectar a Microsoft Teams",
        variant: "destructive",
      });
    },
  });

  // Create Teams chat for a ticket
  const createTeamsChatMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      // For this example, we'll use a mock channel ID
      const teamsChannelId = `ticket_${ticketId}_${Date.now()}`;
      const res = await apiRequest('POST', `/api/tickets/${ticketId}/teams-chat`, { teamsChannelId });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Chat creado",
        description: "Se ha creado un chat de Teams para este ticket",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear chat",
        description: error.message || "No se pudo crear el chat de Teams",
        variant: "destructive",
      });
    },
  });

  // Get Teams chat for a ticket
  const getTeamsChat = async (ticketId: number) => {
    try {
      const res = await apiRequest('GET', `/api/tickets/${ticketId}/teams-chat`);
      return await res.json();
    } catch (error) {
      return null;
    }
  };

  return {
    isConnected: isConnected || !!user?.msTeamsId,
    connectUserToTeams: connectUserToTeamsMutation.mutateAsync,
    isConnecting: connectUserToTeamsMutation.isPending,
    connectToTeams: createTeamsChatMutation.mutateAsync,
    isConnectingToTeams: createTeamsChatMutation.isPending,
    getTeamsChat
  };
}

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Send, Paperclip, Smile, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock user data for the chat interface
const mockTeamMembers = [
  { id: 1, name: "Ana García", message: "Gracias por tu ayuda con el reporte..." },
  { id: 2, name: "Equipo de Desarrollo", message: "Miguel: La actualización estará lista..." }
];

// Mock messages data
const mockMessages = [
  {
    id: 1,
    sender: { id: 2, name: "Ana García" },
    message: "Acabo de asignarme el ticket TK-1234. Contactaré al usuario para más detalles sobre el problema de conexión.",
    timestamp: "10:23 AM",
    isCurrentUser: false
  },
  {
    id: 2,
    sender: { id: 3, name: "Miguel López" },
    message: "Parece similar al problema que resolvimos la semana pasada. Revisa la documentación que preparé sobre las configuraciones de proxy.",
    timestamp: "10:25 AM",
    isCurrentUser: false
  },
  {
    id: 3,
    sender: { id: 1, name: "Current User" },
    message: "Gracias Miguel, revisaré esa documentación y te aviso si funciona.",
    timestamp: "10:27 AM",
    isCurrentUser: true
  },
  {
    id: 4,
    sender: { id: 4, name: "Carlos Rodríguez" },
    message: "Acabo de terminar con TK-1233. Ya está en progreso. El usuario necesitaba permisos adicionales para acceder a SharePoint.",
    timestamp: "10:30 AM",
    isCurrentUser: false
  }
];

interface TeamsChatWidgetProps {
  channelId: string;
  ticketNumber: string;
}

export function TeamsChatWidget({ channelId, ticketNumber }: TeamsChatWidgetProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  // Function to handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // In a real implementation, this would send the message to the Teams API
    const newMessage = {
      id: messages.length + 1,
      sender: { id: user?.id || 0, name: user?.name || "Usuario" },
      message: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col h-[500px]">
      {/* Chat header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className="flex h-8 w-8 bg-[#0078d4] rounded-full items-center justify-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </span>
          <div className="ml-3">
            <h4 className="text-sm font-medium">Soporte Técnico - {ticketNumber}</h4>
            <span className="text-xs text-gray-500">15 miembros</span>
          </div>
        </div>
        <div className="flex">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500 ml-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex items-start",
              msg.isCurrentUser && "justify-end"
            )}
          >
            {!msg.isCurrentUser && (
              <Avatar className="h-8 w-8 rounded-full mr-2">
                <AvatarFallback className="bg-blue-500 text-white">
                  {msg.sender.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div 
              className={cn(
                "px-3 py-2 max-w-md rounded-lg",
                msg.isCurrentUser
                  ? "bg-[#0078d4] text-white"
                  : "bg-gray-200"
              )}
            >
              {!msg.isCurrentUser && (
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-medium text-gray-900">{msg.sender.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{msg.timestamp}</span>
                </div>
              )}
              <p className={cn(
                "text-sm mt-1",
                msg.isCurrentUser ? "text-white" : "text-gray-700"
              )}>
                {msg.message}
              </p>
              {msg.isCurrentUser && (
                <span className={cn(
                  "text-xs block text-right mt-1",
                  msg.isCurrentUser ? "text-blue-100" : "text-gray-500"
                )}>
                  {msg.timestamp}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="flex items-center border-t border-gray-200 pt-3">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
          <Smile className="h-5 w-5" />
        </Button>
        <form onSubmit={handleSubmit} className="flex-1 flex">
          <Input
            type="text"
            placeholder="Escribe un mensaje..."
            className="flex-1 border-0 focus:ring-0 text-sm text-gray-900 placeholder-gray-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button 
            type="submit"
            variant="ghost" 
            size="icon"
            className="text-[#0078d4] hover:text-[#0086f0]"
            disabled={!message.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>

      {/* Recent chats */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Chats Recientes</h4>
        <div className="space-y-2">
          {mockTeamMembers.map((member) => (
            <div 
              key={member.id}
              className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-full mr-3">
                <AvatarFallback className="bg-blue-500 text-white">
                  {member.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                <p className="text-xs text-gray-500 truncate">{member.message}</p>
              </div>
              <span className="text-xs text-gray-500">12m</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

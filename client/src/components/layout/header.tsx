import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Bell, HelpCircle, Menu, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
  toggleMobileSidebar: () => void;
}

export function Header({ title, toggleMobileSidebar }: HeaderProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  // Determine page title based on current location
  const getPageTitle = () => {
    if (location === "/") return "Dashboard";
    if (location === "/tickets") return "Mis Tickets";
    if (location === "/tickets/create") return "Crear Ticket";
    if (location.startsWith("/tickets/")) return "Detalle de Ticket";
    if (location === "/users") return "Gestión de Usuarios";
    if (location === "/settings") return "Configuración";
    if (location === "/reports") return "Reportes";
    return title;
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-ms-gray-200">
      <div className="flex items-center">
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-ms-gray-600 hover:text-[#0078d4] hover:bg-ms-gray-100 focus:outline-none"
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="ml-2 md:ml-0 text-lg md:text-xl font-semibold text-ms-gray-900">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center">
        <div className="relative mx-2 hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-ms-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar tickets..."
            className="block w-full pl-10 pr-3 py-2 border border-ms-gray-300 rounded-md leading-5 bg-white placeholder-ms-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0078d4] focus:border-[#0078d4] sm:text-sm"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="p-1 ml-2 text-ms-gray-600 rounded-full hover:text-[#0078d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078d4]"
        >
          <span className="sr-only">Ver notificaciones</span>
          <Bell className="h-5 w-5" />
        </Button>

        <div className="relative ml-3 md:hidden">
          <button
            type="button"
            className="flex text-sm bg-ms-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078d4]"
          >
            <span className="sr-only">Abrir menú de usuario</span>
            <div className="h-8 w-8 rounded-full bg-[#0078d4] text-white flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
          </button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="p-1 ml-4 text-ms-gray-600 rounded-full hover:text-[#0078d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078d4]"
        >
          <span className="sr-only">Ayuda</span>
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

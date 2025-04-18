import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  AlertCircle,
  BarChart4,
  CheckCircle,
  Clock,
  Cog,
  HelpCircle,
  Home,
  LogOut,
  MessageSquarePlus,
  PlusCircle,
  Settings,
  Tag,
  User,
  Users,
  Wrench,
} from "lucide-react";

interface SidebarProps {
  isMobileSidebarOpen: boolean;
  closeMobileSidebar: () => void;
}

export function Sidebar({ isMobileSidebarOpen, closeMobileSidebar }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const sidebarContent = (
    <div className="flex flex-col w-64 border-r border-ms-gray-200 bg-white h-full">
      <div className="flex items-center justify-between h-16 px-4 border-b border-ms-gray-200 bg-[#0078d4] text-white">
        <div className="flex items-center">
          <Tag className="h-7 w-7 mr-2" />
          <span className="text-xl font-semibold">Support Desk</span>
        </div>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="flex items-center px-4 py-3 border-b border-ms-gray-200">
          <div className="h-9 w-9 rounded-full bg-[#0078d4] text-white flex items-center justify-center mr-3">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user.name}</span>
            <span className="text-xs text-ms-gray-500 capitalize">{user.role}</span>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <Link href="/" onClick={closeMobileSidebar} className={cn(
              "flex items-center px-2 py-2 text-sm font-medium rounded-md",
              isActive("/")
                ? "text-white bg-[#0078d4]"
                : "text-ms-gray-700 hover:bg-ms-gray-100 hover:text-[#0078d4]"
            )}>
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </Link>

        <Link href="/tickets" onClick={closeMobileSidebar} className={cn(
              "flex items-center px-2 py-2 text-sm font-medium rounded-md",
              isActive("/tickets")
                ? "text-white bg-[#0078d4]"
                : "text-ms-gray-700 hover:bg-ms-gray-100 hover:text-[#0078d4]"
            )}>
          <Tag className="mr-3 h-5 w-5" />
          Mis Tickets
        </Link>

        <Link href="/tickets/create" onClick={closeMobileSidebar} className={cn(
              "flex items-center px-2 py-2 text-sm font-medium rounded-md",
              isActive("/tickets/create")
                ? "text-white bg-[#0078d4]"
                : "text-ms-gray-700 hover:bg-ms-gray-100 hover:text-[#0078d4]"
            )}>
          <PlusCircle className="mr-3 h-5 w-5" />
          Crear Ticket
        </Link>

        {(user?.role === "admin" || user?.role === "agent") && (
          <div className="pt-2 mt-2 border-t border-ms-gray-200">
            <h3 className="px-3 text-xs font-semibold text-ms-gray-500 uppercase tracking-wider">
              Administración
            </h3>

            {user.role === "admin" && (
              <Link href="/users" onClick={closeMobileSidebar} className={cn(
                    "flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md",
                    isActive("/users")
                      ? "text-white bg-[#0078d4]"
                      : "text-ms-gray-700 hover:bg-ms-gray-100 hover:text-[#0078d4]"
                  )}>
                <Users className="mr-3 h-5 w-5" />
                Gestión de Usuarios
              </Link>
            )}

            {user.role === "admin" && (
              <Link href="/settings" onClick={closeMobileSidebar} className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive("/settings")
                      ? "text-white bg-[#0078d4]"
                      : "text-ms-gray-700 hover:bg-ms-gray-100 hover:text-[#0078d4]"
                  )}>
                <Settings className="mr-3 h-5 w-5" />
                Configuración
              </Link>
            )}

            <Link href="/reports" onClick={closeMobileSidebar} className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isActive("/reports")
                    ? "text-white bg-[#0078d4]"
                    : "text-ms-gray-700 hover:bg-ms-gray-100 hover:text-[#0078d4]"
                )}>
              <BarChart4 className="mr-3 h-5 w-5" />
              Reportes
            </Link>
          </div>
        )}

        <div className="pt-2 mt-2 border-t border-ms-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-ms-gray-700 hover:bg-ms-gray-100 hover:text-red-600"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">{sidebarContent}</div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-opacity duration-300",
          isMobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-ms-gray-600 opacity-75" onClick={closeMobileSidebar}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={closeMobileSidebar}
            >
              <span className="sr-only">Close sidebar</span>
              <AlertCircle className="h-6 w-6 text-white" />
            </button>
          </div>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
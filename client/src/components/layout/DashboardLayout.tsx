import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Headset, LayoutDashboard, Ticket, Users, BarChart2, 
  Settings, Lock, Github, Search, Bell, Cog, Menu, 
  X, LogOut, User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Notifications from "@/components/common/Notifications";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Ensure user exists before using
  if (!user) return null;

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user.fullName) return "U";
    return user.fullName
      .split(" ")
      .map(name => name[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const isAdmin = user.role === "admin";
  const isAgentOrAdmin = user.role === "agent" || user.role === "admin";

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar for desktop */}
      <aside className={`hidden md:flex flex-col w-64 bg-white border-r border-neutral-100 overflow-y-auto`}>
        <div className="p-4 border-b border-neutral-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-white">
              <Headset />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-neutral-700">SoporteTech</h1>
              <p className="text-xs text-neutral-500">{user.role === "admin" ? "Administrador" : user.role === "agent" ? "Agente" : "Usuario"}</p>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <nav className="p-2">
            <div className="mb-4">
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 py-2">Principal</h2>
              <ul>
                <li>
                  <Link href="/">
                    <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === '/' ? 'bg-primary-light text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                      <LayoutDashboard className="w-5 h-5 mr-2" />
                      Dashboard
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/tickets">
                    <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === '/tickets' || location.startsWith('/tickets/') ? 'bg-primary-light text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                      <Ticket className="w-5 h-5 mr-2" />
                      Tickets
                    </a>
                  </Link>
                </li>
                {isAgentOrAdmin && (
                  <li>
                    <Link href="/teams">
                      <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === '/teams' ? 'bg-primary-light text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                        <Github className="w-5 h-5 mr-2" />
                        Microsoft Teams
                      </a>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            
            {isAdmin && (
              <div className="mb-4">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 py-2">Administración</h2>
                <ul>
                  <li>
                    <Link href="/admin/users">
                      <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === '/admin/users' ? 'bg-primary-light text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                        <Users className="w-5 h-5 mr-2" />
                        Usuarios
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/stats">
                      <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === '/admin/stats' ? 'bg-primary-light text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                        <BarChart2 className="w-5 h-5 mr-2" />
                        Reportes
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/settings">
                      <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === '/admin/settings' ? 'bg-primary-light text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                        <Settings className="w-5 h-5 mr-2" />
                        Configuración
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </nav>
        </ScrollArea>
        
        <div className="mt-auto p-4 border-t border-neutral-100">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm text-neutral-700">{user.fullName}</p>
              <button 
                className="text-xs text-primary hover:text-primary-dark"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-neutral-700/50"
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-64 max-w-xs bg-white pb-4">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
                  <Headset size={18} />
                </div>
                <h1 className="font-semibold text-neutral-700">SoporteTech</h1>
              </div>
              <button 
                className="p-2 rounded-md text-neutral-500 hover:bg-neutral-50"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <ScrollArea className="flex-1">
              <nav className="p-2">
                <div className="mb-4">
                  <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 py-2">Principal</h2>
                  <ul>
                    <li>
                      <Link href="/">
                        <a 
                          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === '/' ? 'bg-primary-light text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <LayoutDashboard className="w-5 h-5 mr-2" />
                          Dashboard
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/tickets">
                        <a 
                          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === '/tickets' || location.startsWith('/tickets/') ? 'bg-primary-light text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Ticket className="w-5 h-5 mr-2" />
                          Tickets
                        </a>
                      </Link>
                    </li>
                    {isAgentOrAdmin && (
                      <li>
                        <Link href="/teams">
                          <a 
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === '/teams' ? 'bg-primary-light text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Github className="w-5 h-5 mr-2" />
                            Microsoft Teams
                          </a>
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
                
                {isAdmin && (
                  <div className="mb-4">
                    <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 py-2">Administración</h2>
                    <ul>
                      <li>
                        <Link href="/admin/users">
                          <a 
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === '/admin/users' ? 'bg-primary-light text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Users className="w-5 h-5 mr-2" />
                            Usuarios
                          </a>
                        </Link>
                      </li>
                      <li>
                        <Link href="/admin/stats">
                          <a 
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === '/admin/stats' ? 'bg-primary-light text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <BarChart2 className="w-5 h-5 mr-2" />
                            Reportes
                          </a>
                        </Link>
                      </li>
                      <li>
                        <Link href="/admin/settings">
                          <a 
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === '/admin/settings' ? 'bg-primary-light text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Settings className="w-5 h-5 mr-2" />
                            Configuración
                          </a>
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </nav>
            </ScrollArea>
            
            <div className="mt-auto p-4 border-t border-neutral-100">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-neutral-700">{user.fullName}</p>
                  <button 
                    className="text-xs text-primary hover:text-primary-dark"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-neutral-100 h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center">
            <button 
              className="md:hidden p-2 rounded-md text-neutral-500 hover:bg-neutral-50"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </button>
            <div className="relative ml-4 w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-neutral-400" />
              </span>
              <Input
                className="pl-10 pr-4 py-2 w-full rounded-md bg-neutral-50 border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Buscar tickets, usuarios..."
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white">
                  3
                </span>
              </Button>
              
              {notificationsOpen && (
                <Notifications 
                  onClose={() => setNotificationsOpen(false)} 
                />
              )}
            </div>
            
            <Button variant="ghost" size="icon">
              <Cog className="h-5 w-5" />
            </Button>
            
            {/* Mobile user menu */}
            <div className="md:hidden relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
              
              {mobileMenuOpen && (
                <div className="absolute right-0 w-48 bg-white border border-neutral-100 rounded-md shadow-lg z-50">
                  <div className="p-3 border-b border-neutral-100">
                    <p className="font-medium text-sm">{user.fullName}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link href="/profile">
                      <a 
                        className="block px-3 py-2 text-sm rounded-md hover:bg-neutral-50 flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 mr-2" />
                        Mi perfil
                      </a>
                    </Link>
                    <Link href="/settings">
                      <a 
                        className="block px-3 py-2 text-sm rounded-md hover:bg-neutral-50 flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configuración
                      </a>
                    </Link>
                    <Separator className="my-1" />
                    <button 
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-50 text-destructive flex items-center"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50">
          {children}
        </main>
      </div>
    </div>
  );
}

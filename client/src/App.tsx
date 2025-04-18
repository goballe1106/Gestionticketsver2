import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import TicketsPage from "@/pages/tickets-page";
import CreateTicketPage from "@/pages/create-ticket-page";
import TicketDetailPage from "@/pages/ticket-detail-page";
import UserManagementPage from "@/pages/user-management-page";
import ReportsPage from "@/pages/reports-page";
import SettingsPage from "@/pages/settings-page";
import UnauthorizedPage from "@/pages/unauthorized-page";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/unauthorized" component={UnauthorizedPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/tickets" component={TicketsPage} />
      <ProtectedRoute path="/tickets/create" component={CreateTicketPage} />
      <ProtectedRoute path="/tickets/:ticketNumber" component={TicketDetailPage} />
      
      {/* Admin only routes */}
      <ProtectedRoute
        path="/users"
        component={UserManagementPage}
        allowedRoles={["admin"]}
      />
      <ProtectedRoute
        path="/settings"
        component={SettingsPage}
        allowedRoles={["admin"]}
      />
      
      {/* Admin and agent routes */}
      <ProtectedRoute
        path="/reports"
        component={ReportsPage}
        allowedRoles={["admin", "agent"]}
      />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

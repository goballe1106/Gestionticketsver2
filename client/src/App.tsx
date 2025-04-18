import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import TicketsPage from "@/pages/tickets/index";
import NewTicketPage from "@/pages/tickets/new";
import TicketDetailPage from "@/pages/tickets/[id]";
import AdminUsersPage from "@/pages/admin/users";
import AdminStatsPage from "@/pages/admin/stats";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/tickets" component={TicketsPage} />
      <ProtectedRoute path="/tickets/new" component={NewTicketPage} />
      <ProtectedRoute path="/tickets/:id" component={TicketDetailPage} />
      <ProtectedRoute path="/admin/users" component={AdminUsersPage} />
      <ProtectedRoute path="/admin/stats" component={AdminStatsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Layout } from "@/components/layout/layout";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { TicketList } from "@/components/tickets/ticket-list";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TeamsChatWidget } from "@/components/dashboard/teams-chat";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <Layout title="Dashboard">
      {/* Dashboard Stats */}
      <StatsGrid />
      
      {/* Ticket List Section */}
      <TicketList limit={4} showCreateButton={true} />
      
      {/* Recent Activity & Microsoft Teams Integration Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-6">
        {/* Recent Activity */}
        <ActivityFeed />
        
        {/* Microsoft Teams Integration */}
        {user && (user.role === "admin" || user.role === "agent") && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Microsoft Teams</h3>
                <button className="text-[#0078d4] hover:text-[#0086f0] text-sm font-medium flex items-center">
                  <span className="material-icons mr-1 text-base">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="h-4 w-4 mr-1"
                    >
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </span>
                  Abrir en Teams
                </button>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {/* Teams Chat Widget */}
              <TeamsChatWidget channelId="support-general" ticketNumber="General" />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

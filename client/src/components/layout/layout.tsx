import { useState, ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title = "Dashboard" }: LayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5]">
      <Sidebar 
        isMobileSidebarOpen={isMobileSidebarOpen} 
        closeMobileSidebar={closeMobileSidebar} 
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          title={title} 
          toggleMobileSidebar={toggleMobileSidebar} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 bg-[#f0f2f5]">
          {children}
        </main>
      </div>
    </div>
  );
}

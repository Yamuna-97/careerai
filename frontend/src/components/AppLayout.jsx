import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import ContextualSidebar from './ContextualSidebar';

export default function AppLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* Top Header Bar */}
      <Header onToggleMobileSidebar={() => setMobileSidebarOpen(v => !v)} />

      {/* Main Page Layout Container */}
      <div className="flex-1 flex flex-row relative min-h-[calc(100vh-4rem)] w-full overflow-x-hidden">
        {/* Persistent Left Contextual Sidebar for Resume / Interview / Jobs */}
        <ContextualSidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 flex flex-col">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}


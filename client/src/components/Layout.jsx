import React from 'react';
import Sidebar, { SidebarProvider } from './Sidebar';
import ResponsiveHeader from './ResponsiveHeader';

const Layout = ({ children, title, showSearch = true, showNotifications = true, showProfile = true }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
          <ResponsiveHeader 
            title={title}
            showSearch={showSearch}
            showNotifications={showNotifications}
            showProfile={showProfile}
          />
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8 bg-gray-50/50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;

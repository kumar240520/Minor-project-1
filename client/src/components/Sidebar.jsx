import React from 'react';
import DashboardSidebar from './navigation/DashboardSidebar';
import { SidebarProvider, useSidebar } from './navigation/SidebarContext';

export { SidebarProvider, useSidebar };

const Sidebar = ({ role = 'student', ...props }) => {
  return <DashboardSidebar role={role} {...props} />;
};

export default Sidebar;
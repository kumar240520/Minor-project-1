import React from 'react';
import Sidebar from './Sidebar';
import { useSidebar } from './navigation/SidebarContext';
import ResponsiveHeader from './ResponsiveHeader';
import { motion } from 'framer-motion';

const Layout = ({
  children,
  title,
  subtitle,
  role = 'student',
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  ...props
}) => {
  const { desktopWidth, isDesktop, springTransition } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex overflow-x-hidden">
      <Sidebar role={role} />
      <motion.div 
        className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden"
        animate={{ 
          marginLeft: isDesktop ? desktopWidth : 0 
        }}
        transition={springTransition}
      >
        <ResponsiveHeader 
          title={title}
          subtitle={subtitle}
          role={role}
          showSearch={showSearch}
          showNotifications={showNotifications}
          showProfile={showProfile}
          {...props}
        />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-8 bg-gray-50/50 dark:bg-slate-900/50">
          {children}
        </main>
      </motion.div>
    </div>
  );
};

export default Layout;


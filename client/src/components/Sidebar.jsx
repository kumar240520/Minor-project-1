import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Settings, LogOut, Menu, X,
  Home as HomeIcon, Folder, Calendar, Award, FileText, MessageSquare,
  User, Download
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Context
const SidebarContext = React.createContext();

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
        closeSidebar: () => setIsSidebarOpen(false)
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard', color: '#3B82F6' },
    { name: 'PYQs', icon: FileText, path: '/pyqs', color: '#8B5CF6' },
    { name: 'Materials', icon: BookOpen, path: '/placement-materials', color: '#10B981' },
    { name: 'Community', icon: MessageSquare, path: '/community', color: '#EC4899' },
    { name: 'My Uploads', icon: Folder, path: '/my-materials', color: '#F59E0B' },
    { name: 'Calendar', icon: Calendar, path: '/calendar', color: '#6366F1' },
    { name: 'Rewards', icon: Award, path: '/rewards', color: '#EF4444' },
    { name: 'Settings', icon: Settings, path: '/settings', color: '#6B7280' },
  ];

  const SidebarItem = ({ item }) => {
    const isActive = location.pathname === item.path;

    return (
      <Link to={item.path} className="block w-full relative group">

        {/* ✅ SINGLE BORDER SYSTEM (NO FLICKER) */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-[4px] origin-top"
          style={{
            background: item.color,
            boxShadow: `0 0 10px ${item.color}`
          }}
          initial={false}
          animate={{
            scaleY: isActive ? 1 : 0,
            opacity: isActive ? 1 : 0
          }}
          whileHover={!isActive ? { scaleY: 1, opacity: 1 } : {}}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />

        {/* Glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 rounded-lg"
          style={{
            background: `linear-gradient(to right, ${item.color}10, transparent)`
          }}
        />

        {/* Item */}
        <motion.div
          whileHover={{ x: isActive ? 0 : 6 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`flex items-center w-full pl-5 pr-4 py-3 rounded-lg relative z-10 transition-all duration-300 ${
            isActive
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {/* Icon */}
          <motion.div whileHover={{ scale: isActive ? 1 : 1.1 }}>
            <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
          </motion.div>

          {/* Text */}
          <span className={`ml-3 font-semibold ${isActive ? 'text-white' : ''}`}>
            {item.name}
          </span>

          {/* Hover dot */}
          {!isActive && (
            <motion.div
              className="ml-auto w-1.5 h-1.5 rounded-full"
              style={{ background: item.color }}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
          )}
        </motion.div>
      </Link>
    );
  };

  // Mobile Sidebar
  const MobileSidebar = () => (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-50 w-60 h-screen bg-white shadow-2xl lg:hidden"
          >
            {/* Header */}
            <div className="px-5 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-2.5 rounded-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <div className="font-bold text-lg">EduSure</div>
                    <div className="text-xs text-gray-500">Student Portal</div>
                  </div>
                </div>
                
                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeSidebar}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </motion.button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-2 px-3">
              {menuItems.map((item) => (
                <SidebarItem key={item.name} item={item} />
              ))}
            </nav>

            {/* Bottom Section */}
            <div className="py-3 px-3 border-t border-gray-100">

              {/* Profile */}
              <Link to="/profile" className="block w-full" onClick={closeSidebar}>
                <motion.div
                  whileHover={{ x: 6 }}
                  className="flex items-center justify-between w-full pl-5 pr-4 py-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="ml-3 font-semibold">Profile</span>
                  </div>
                  <Download className="h-4 w-4 text-gray-400" />
                </motion.div>
              </Link>

              {/* Logout */}
              <button onClick={handleLogout} className="w-full">
                <motion.div
                  whileHover={{ x: 6 }}
                  className="flex items-center justify-between w-full pl-5 pr-4 py-3 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <span className="font-semibold">Log Out</span>
                  <LogOut className="h-4 w-4" />
                </motion.div>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        className="hidden lg:flex flex-col w-60 h-screen fixed top-0 left-0 bg-white border-r border-gray-200 shadow-lg z-30"
      >
        {/* Header */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-2.5 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <div className="font-bold text-lg">EduSure</div>
              <div className="text-xs text-gray-500">Student Portal</div>
            </div>
          </div>
        </div>

        {/* Navigation (small professional padding) */}
        <nav className="flex-1 py-2 px-3">
          {menuItems.map((item) => (
            <SidebarItem key={item.name} item={item} />
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="py-3 px-3 border-t border-gray-100">

          {/* Profile */}
          <Link to="/profile" className="block w-full">
            <motion.div
              whileHover={{ x: 6 }}
              className="flex items-center justify-between w-full pl-5 pr-4 py-3 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500" />
                <span className="ml-3 font-semibold">Profile</span>
              </div>
              <Download className="h-4 w-4 text-gray-400" />
            </motion.div>
          </Link>

          {/* Logout */}
          <button onClick={handleLogout} className="w-full">
            <motion.div
              whileHover={{ x: 6 }}
              className="flex items-center justify-between w-full pl-5 pr-4 py-3 rounded-lg hover:bg-red-50 text-red-600"
            >
              <span className="font-semibold">Log Out</span>
              <LogOut className="h-4 w-4" />
            </motion.div>
          </button>

        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <MobileSidebar />
    </>
  );
};

export default Sidebar;
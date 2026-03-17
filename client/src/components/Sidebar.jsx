import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Settings, LogOut, Menu, X,
    Home as HomeIcon, Folder, Calendar, Award, FileText, MessageSquare
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Create a global context for sidebar state
const SidebarContext = React.createContext();

export const useSidebar = () => {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

export const SidebarProvider = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };
    
    return (
        <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
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
        { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
        { name: 'PYQs', icon: FileText, path: '/pyqs' },
        { name: 'Placement Materials', icon: BookOpen, path: '/placement-materials' },
        { name: 'Community Post', icon: MessageSquare, path: '/community' },
        { name: 'My Materials', icon: Folder, path: '/my-materials' },
        { name: 'Calendar', icon: Calendar, path: '/calendar' },
        { name: 'Rewards', icon: Award, path: '/rewards' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    // Mobile sidebar overlay
    const MobileSidebar = () => (
        <AnimatePresence>
            {isSidebarOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSidebar}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                    
                    {/* Mobile Sidebar */}
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 z-50 w-72 h-screen bg-white border-r border-gray-200 lg:hidden"
                    >
                        <div className="h-full flex flex-col pt-6 pb-4">
                            {/* Mobile Header */}
                            <div className="px-6 flex items-center justify-between mb-8">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-r from-fuchsia-600 to-violet-600 p-2 rounded-lg shrink-0">
                                        <BookOpen className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-violet-600">
                                        EduSure
                                    </span>
                                </div>
                                <button
                                    onClick={closeSidebar}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Mobile Navigation */}
                            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={closeSidebar}
                                        className={`flex items-center px-3 py-3 rounded-xl transition-colors ${
                                            location.pathname === item.path
                                                ? 'bg-violet-50 text-violet-700 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <item.icon className={`h-5 w-5 ${
                                            location.pathname === item.path ? 'text-violet-600' : 'text-gray-400'
                                        }`} />
                                        <span className="ml-3 whitespace-nowrap">{item.name}</span>
                                    </Link>
                                ))}
                            </nav>

                            {/* Mobile Logout */}
                            <div className="px-4 mt-auto pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <LogOut className="h-5 w-5 shrink-0" />
                                    <span className="ml-3 font-medium whitespace-nowrap">Log Out</span>
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );

    // Desktop sidebar (always visible)
    const DesktopSidebar = () => (
        <motion.aside
            className="hidden lg:flex bg-white border-r border-gray-200 fixed lg:relative z-40 h-screen transition-all duration-300 w-64"
            initial={false}
        >
            <div className="h-full flex flex-col pt-6 pb-4">
                <div className="px-6 flex items-center mb-8">
                    <div className="bg-gradient-to-r from-fuchsia-600 to-violet-600 p-2 rounded-lg shrink-0">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-violet-600">
                        EduSure
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center px-3 py-3 rounded-xl transition-colors ${
                                location.pathname === item.path
                                    ? 'bg-violet-50 text-violet-700 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <item.icon className={`h-5 w-5 ${
                                location.pathname === item.path ? 'text-violet-600' : 'text-gray-400'
                            }`} />
                            <span className="ml-3 whitespace-nowrap">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="px-4 mt-auto pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="ml-3 font-medium whitespace-nowrap">Log Out</span>
                    </button>
                </div>
            </div>
        </motion.aside>
    );

    return (
        <>
            <MobileSidebar />
            <DesktopSidebar />
        </>
    );
};

export default Sidebar;

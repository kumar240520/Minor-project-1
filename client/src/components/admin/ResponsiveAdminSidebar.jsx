import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    Clock3,
    FileCheck, 
    BookOpenCheck,
    Award, 
    Users, 
    ReceiptText, 
    AlertOctagon, 
    CalendarDays, 
    BarChart3,
    LogOut,
    HelpCircle,
    Menu,
    X
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

const ResponsiveAdminSidebar = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const adminBasePath = '/admin';
    const navItems = [
        { path: `${adminBasePath}/dashboard`, label: 'Overview', icon: LayoutDashboard },
        { path: `${adminBasePath}/approvals`, label: 'Pending Approvals', icon: Clock3 },
        { path: `${adminBasePath}/materials`, label: 'Materials Approval', icon: FileCheck },
        { path: `${adminBasePath}/pyqs`, label: 'PYQ Approval', icon: BookOpenCheck },
        { path: `${adminBasePath}/rewards`, label: 'Rewards', icon: Award },
        { path: `${adminBasePath}/users`, label: 'Users', icon: Users },
        { path: `${adminBasePath}/transactions`, label: 'Transactions', icon: ReceiptText },
        { path: `${adminBasePath}/reports`, label: 'Reports', icon: AlertOctagon },
        { path: `${adminBasePath}/events`, label: 'Events', icon: CalendarDays },
        { path: `${adminBasePath}/tickets`, label: 'Support Tickets', icon: HelpCircle },
        { path: `${adminBasePath}/analytics`, label: 'Analytics', icon: BarChart3 },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobileMenu}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-violet-600 text-white rounded-lg shadow-lg hover:bg-violet-700 transition-colors"
            >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleMobileMenu}
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                bg-slate-900 border-r border-slate-800 fixed z-40 h-screen transition-all duration-300 w-72 lg:w-64 xl:w-72
                flex flex-col shrink-0 text-slate-300
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo area */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800 shrink-0 bg-slate-950">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                        <div>
                            <span className="text-white font-bold text-xl tracking-tight">Edu<span className="text-violet-500">Admin</span></span>
                            <p className="text-xs text-slate-400">Control Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    <div className="px-3 mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Main Menu
                    </div>
                    
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== adminBasePath);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive 
                                        ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-400 border border-violet-600/30' 
                                        : 'hover:bg-slate-800 hover:text-white hover:translate-x-1'
                                    }
                                `}
                            >
                                <item.icon className={`
                                    h-5 w-5 flex-shrink-0
                                    ${isActive ? 'text-violet-500' : 'text-slate-400 group-hover:text-violet-400'}
                                `} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="w-1 h-6 bg-violet-500 rounded-full ml-auto"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom actions */}
                <div className="p-4 border-t border-slate-800 shrink-0 space-y-2">
                    <div className="px-3 py-2 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-slate-400">Admin Access</p>
                        <p className="text-sm font-medium text-slate-300">Level 1</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 text-slate-400 hover:text-red-400 w-full px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-600/10 hover:border hover:border-red-600/30"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default ResponsiveAdminSidebar;

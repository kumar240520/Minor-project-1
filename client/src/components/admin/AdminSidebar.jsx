import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    Bell,
    Mail
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AdminSidebar = () => {
    const location = useLocation();

    const adminBasePath = '/admin';
    const navItems = [
        { path: `${adminBasePath}/committee-posts`, label: 'Committee Posts', icon: Users },
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
        { path: `${adminBasePath}/bulk-email`, label: 'Bulk Email', icon: Mail },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 text-slate-300">
            {/* Logo area */}
            <div className="h-20 flex items-center px-6 border-b border-slate-800 shrink-0 bg-slate-950">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">E</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">Edu<span className="text-violet-500">Admin</span></span>
                </div>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Main Menu
                </div>
                
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== adminBasePath);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group ${
                                isActive 
                                    ? 'bg-violet-600/10 text-violet-400' 
                                    : 'hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive ? 'text-violet-500' : 'text-slate-400 group-hover:text-slate-300'}`} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom actions */}
            <div className="p-4 border-t border-slate-800 shrink-0">
                <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-slate-400 hover:text-red-400 w-full px-3 py-2 rounded-lg transition-colors hover:bg-slate-800/50"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;

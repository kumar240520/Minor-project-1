import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Search, User, Settings, LogOut, Menu, X, Clock, FileText, Users, CreditCard, CheckCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    try {
        return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
    } catch {
        return '';
    }
};

const POLL_INTERVAL_MS = 30_000; // refresh every 30 s

// ── Notification item shape ────────────────────────────────────────────────────
// { id, type, title, body, time, link, read, dot }

const buildNotifications = ({ pendingMaterials, recentTxns, recentUsers }) => {
    const items = [];

    // Pending approval notifications (1 per material, show up to 5)
    (pendingMaterials || []).slice(0, 5).forEach((m) => {
        items.push({
            id: `pending-${m.id}`,
            type: 'approval',
            title: 'Pending Approval',
            body: `"${m.title || m.subject || 'Untitled'}" needs your review`,
            time: m.created_at,
            link: '/admin/approvals',
            dot: 'bg-amber-500',
            bg: 'bg-amber-50 hover:bg-amber-100',
            border: 'border-l-2 border-amber-400',
            icon: Clock,
            iconColor: 'text-amber-600',
            iconBg: 'bg-amber-100',
            read: false,
        });
    });

    // Recent transactions (last 3)
    (recentTxns || []).slice(0, 3).forEach((tx) => {
        const earn = tx.transaction_type === 'EARN';
        items.push({
            id: `tx-${tx.id}`,
            type: 'transaction',
            title: earn ? 'Coins Earned' : 'Coins Spent',
            body: tx.description || `${earn ? '+' : '-'}${tx.amount} coins — ${tx.reference_type}`,
            time: tx.created_at,
            link: '/admin/transactions',
            dot: earn ? 'bg-emerald-500' : 'bg-rose-500',
            bg: earn ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-rose-50 hover:bg-rose-100',
            border: earn ? 'border-l-2 border-emerald-400' : 'border-l-2 border-rose-400',
            icon: CreditCard,
            iconColor: earn ? 'text-emerald-600' : 'text-rose-600',
            iconBg: earn ? 'bg-emerald-100' : 'bg-rose-100',
            read: false,
        });
    });

    // New users (last 3)
    (recentUsers || []).slice(0, 3).forEach((u) => {
        items.push({
            id: `user-${u.id}`,
            type: 'user',
            title: 'New User Registered',
            body: `${u.name || u.email || 'A student'} just joined EduSure`,
            time: u.created_at,
            link: '/admin/users',
            dot: 'bg-blue-500',
            bg: 'bg-blue-50 hover:bg-blue-100',
            border: 'border-l-2 border-blue-400',
            icon: Users,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-100',
            read: false,
        });
    });

    // Sort newest first
    items.sort((a, b) => new Date(b.time) - new Date(a.time));
    return items;
};

// ── Component ─────────────────────────────────────────────────────────────────
const ResponsiveAdminHeader = ({ title, subtitle, onMobileMenuToggle }) => {
    const navigate = useNavigate();

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const [notifications, setNotifications] = useState([]);
    const [readIds, setReadIds] = useState(() => {
        try { return new Set(JSON.parse(localStorage.getItem('adminReadNotifs') || '[]')); }
        catch { return new Set(); }
    });
    const [adminInfo, setAdminInfo] = useState({ name: 'Admin', email: '' });
    const [loading, setLoading] = useState(true);

    const panelRef = useRef(null);
    const bellRef = useRef(null);

    // ── Fetch notifications from Supabase ────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        try {
            const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // last 7 days

            const [
                { data: pendingMaterials },
                { data: recentTxns },
                { data: recentUsers },
            ] = await Promise.all([
                supabase
                    .from('materials')
                    .select('id, title, subject, created_at, uploader_name')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(5),
                supabase
                    .from('transactions')
                    .select('id, transaction_type, amount, description, reference_type, created_at')
                    .gte('created_at', cutoff)
                    .order('created_at', { ascending: false })
                    .limit(3),
                supabase
                    .from('users')
                    .select('id, name, email, created_at')
                    .gte('created_at', cutoff)
                    .order('created_at', { ascending: false })
                    .limit(3),
            ]);

            setNotifications(buildNotifications({ pendingMaterials, recentTxns, recentUsers }));
        } catch (err) {
            console.error('Failed to fetch admin notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load + polling
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Fetch admin info
    useEffect(() => {
        const getAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('users').select('name, email').eq('id', user.id).single();
            if (profile) setAdminInfo({ name: profile.name || 'Admin', email: profile.email || user.email });
        };
        getAdmin();
    }, []);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target) &&
                bellRef.current && !bellRef.current.contains(e.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

    const markAllRead = () => {
        const allIds = new Set(notifications.map(n => n.id));
        setReadIds(allIds);
        localStorage.setItem('adminReadNotifs', JSON.stringify([...allIds]));
    };

    const markRead = (id) => {
        const next = new Set(readIds);
        next.add(id);
        setReadIds(next);
        localStorage.setItem('adminReadNotifs', JSON.stringify([...next]));
    };

    const handleNotificationClick = (notif) => {
        markRead(notif.id);
        setNotificationsOpen(false);
        navigate(notif.link);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">

                    {/* Left: mobile menu + title */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onMobileMenuToggle}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <Menu className="h-5 w-5 text-slate-600" />
                        </button>
                        <div className="hidden sm:block">
                            <h1 className="text-xl lg:text-2xl font-bold text-slate-800">{title}</h1>
                            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                        </div>
                    </div>

                    {/* Mobile title */}
                    <div className="sm:hidden">
                        <h1 className="text-lg font-bold text-slate-800 truncate max-w-[200px]">{title}</h1>
                    </div>

                    {/* Right: search + notifications + profile */}
                    <div className="flex items-center space-x-1 lg:space-x-2">

                        {/* ── Search ── */}
                        <div className="relative">
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <Search className="h-5 w-5 text-slate-600" />
                            </button>
                            <AnimatePresence>
                                {searchOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                        className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                                    >
                                        <div className="p-3">
                                            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                                                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                                                <input
                                                    type="text"
                                                    placeholder="Search users, materials..."
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Escape') setSearchOpen(false); }}
                                                    className="flex-1 bg-transparent text-sm focus:outline-none text-slate-700 placeholder-slate-400"
                                                    autoFocus
                                                />
                                                {searchQuery && (
                                                    <button onClick={() => setSearchQuery('')}>
                                                        <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="px-3 pb-3 text-xs text-slate-400 space-y-1">
                                            <p>• Search users, materials, approvals</p>
                                            <p>• Press Esc to close</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Notifications ── */}
                        <div className="relative">
                            <button
                                ref={bellRef}
                                onClick={() => { setNotificationsOpen(o => !o); setProfileOpen(false); }}
                                className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
                            >
                                <Bell className="h-5 w-5 text-slate-600" />
                                {unreadCount > 0 && (
                                    <motion.span
                                        key={unreadCount}
                                        initial={{ scale: 0.5 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </motion.span>
                                )}
                            </button>

                            <AnimatePresence>
                                {notificationsOpen && (
                                    <motion.div
                                        ref={panelRef}
                                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-600 to-indigo-600">
                                            <div className="flex items-center gap-2">
                                                <Bell className="h-4 w-4 text-white" />
                                                <h3 className="font-semibold text-white">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {unreadCount} new
                                                    </span>
                                                )}
                                            </div>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllRead}
                                                    className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
                                                >
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <div className="max-h-96 overflow-y-auto">
                                            {loading ? (
                                                <div className="p-6 space-y-3">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="flex gap-3 animate-pulse">
                                                            <div className="w-9 h-9 bg-slate-200 rounded-full shrink-0" />
                                                            <div className="flex-1 space-y-2">
                                                                <div className="h-3 bg-slate-200 rounded w-3/4" />
                                                                <div className="h-2 bg-slate-200 rounded w-1/2" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                                    <Bell className="h-10 w-10 mb-3 opacity-30" />
                                                    <p className="text-sm font-medium">All caught up!</p>
                                                    <p className="text-xs">No new notifications</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-50">
                                                    {notifications.map((notif) => {
                                                        const isRead = readIds.has(notif.id);
                                                        const Icon = notif.icon;
                                                        return (
                                                            <button
                                                                key={notif.id}
                                                                onClick={() => handleNotificationClick(notif)}
                                                                className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors ${notif.bg} ${isRead ? 'opacity-60' : ''}`}
                                                            >
                                                                {/* Icon */}
                                                                <div className={`w-9 h-9 rounded-full ${notif.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                                                                    <Icon className={`h-4 w-4 ${notif.iconColor}`} />
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-sm font-semibold text-slate-800 truncate">{notif.title}</p>
                                                                        {!isRead && (
                                                                            <span className={`w-2 h-2 rounded-full shrink-0 ${notif.dot}`} />
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.body}</p>
                                                                    <p className="text-xs text-slate-400 mt-1">{timeAgo(notif.time)}</p>
                                                                </div>

                                                                <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 mt-1" />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        {notifications.length > 0 && (
                                            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                                                <p className="text-xs text-slate-400">Last 7 days • refreshes every 30s</p>
                                                <Link
                                                    to="/admin/approvals"
                                                    onClick={() => setNotificationsOpen(false)}
                                                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1"
                                                >
                                                    Review approvals <ChevronRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Profile ── */}
                        <div className="relative">
                            <button
                                onClick={() => { setProfileOpen(o => !o); setNotificationsOpen(false); }}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                                    {adminInfo.name}
                                </span>
                            </button>

                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                                    >
                                        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50">
                                            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center mb-2">
                                                <User className="h-5 w-5 text-white" />
                                            </div>
                                            <p className="font-semibold text-slate-800 text-sm truncate">{adminInfo.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{adminInfo.email}</p>
                                        </div>
                                        <div className="p-2">
                                            <Link
                                                to="/admin"
                                                onClick={() => setProfileOpen(false)}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left"
                                            >
                                                <Settings className="h-4 w-4 text-slate-500" />
                                                <span className="text-sm text-slate-700">Dashboard</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span className="text-sm">Sign Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </div>
            </div>
        </header>
    );
};

export default ResponsiveAdminHeader;

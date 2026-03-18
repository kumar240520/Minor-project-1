import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, ShieldAlert, Award, FileText, Info } from 'lucide-react';
import Sidebar, { SidebarProvider } from '../components/Sidebar';
import ResponsiveHeader from '../components/ResponsiveHeader';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
            
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;
            
            setNotifications(prev => 
                prev.map(n => ({ ...n, is_read: true }))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <Check className="h-5 w-5 text-emerald-500" />;
            case 'reward': return <Award className="h-5 w-5 text-amber-500" />;
            case 'material': return <FileText className="h-5 w-5 text-blue-500" />;
            case 'alert': return <ShieldAlert className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-violet-500" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />

                <div className="flex-1 flex flex-col lg:ml-60 overflow-hidden">
                    <ResponsiveHeader 
                        title="Notifications"
                        showSearch={true}
                        showNotifications={true}
                        showProfile={true}
                    />

                    <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
                        <div className="max-w-4xl mx-auto space-y-6">
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-violet-100 p-3 rounded-full text-violet-600">
                                        <Bell className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-800">Your Notifications</h1>
                                        <p className="text-sm text-gray-500 mt-1">
                                            You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}.
                                        </p>
                                    </div>
                                </div>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllAsRead}
                                        className="text-sm font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-xl transition-colors"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {loading ? (
                                    <div className="p-12 text-center text-gray-500">Loading notifications...</div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-12 text-center flex flex-col items-center">
                                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                                            <Bell className="h-8 w-8 text-gray-300" />
                                        </div>
                                        <h3 className="font-bold text-gray-700">All caught up!</h3>
                                        <p className="text-sm text-gray-500 mt-1">You don't have any notifications at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map((notif, i) => (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                key={notif.id} 
                                                className={`p-5 hover:bg-gray-50 transition-colors flex gap-4 ${!notif.is_read ? 'bg-violet-50/30' : ''}`}
                                            >
                                                <div className="mt-1 shrink-0">
                                                    <div className={`p-2 rounded-full ${!notif.is_read ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                                                        {getIcon(notif.type)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`text-base flex-1 pr-4 ${!notif.is_read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                                            {notif.title}
                                                        </h4>
                                                        <span className="text-xs text-gray-400 whitespace-nowrap pt-1">
                                                            {new Date(notif.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm ${!notif.is_read ? 'text-gray-700' : 'text-gray-500'} mb-3`}>
                                                        {notif.message}
                                                    </p>
                                                    
                                                    {notif.link && (
                                                        <Link to={notif.link} className="inline-block text-sm font-semibold text-violet-600 hover:text-violet-700 hover:underline mb-2">
                                                            View Details &rarr;
                                                        </Link>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-3">
                                                        {!notif.is_read && (
                                                            <button 
                                                                onClick={() => markAsRead(notif.id)}
                                                                className="text-xs font-medium text-violet-600 hover:text-violet-800"
                                                            >
                                                                Mark as read
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => deleteNotification(notif.id)}
                                                            className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center"
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-1" /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                                {!notif.is_read && (
                                                    <div className="shrink-0 flex items-center">
                                                        <div className="h-2 w-2 bg-violet-500 rounded-full"></div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Notifications;

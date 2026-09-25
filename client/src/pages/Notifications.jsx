import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  Award,
  FileText,
  ExternalLink,
  CheckCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';
import { formatLocalRelativeTime } from '../utils/auth';
import {
  DashboardCard,
  DashboardButton,
  DashboardBadge,
  FeedbackState
} from '../components/dashboard';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'material_approved':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'material_rejected':
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case 'reward':
        return <Award className="h-4 w-4 text-amber-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-[#2563EB]" />;
      case 'upload':
        return <FileText className="h-4 w-4 text-[#5B20E8]" />;
      default:
        return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Layout
      title="Notifications"
      subtitle="Stay updated with note approvals, announcements, and peer interactions"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Action Bar */}
        <DashboardCard className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Recent Alerts & Notifications
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <DashboardButton
              variant="secondary"
              size="sm"
              onClick={markAllAsRead}
              icon={CheckCheck}
            >
              Mark all as read
            </DashboardButton>
          )}
        </DashboardCard>

        {/* Notifications List */}
        <DashboardCard className="overflow-hidden">
          {loading ? (
            <FeedbackState
              type="loading"
              title="Loading Notifications"
              description="Retrieving your latest platform alerts..."
            />
          ) : notifications.length === 0 ? (
            <FeedbackState
              type="empty"
              title="All Caught Up!"
              description="You have no notifications at the moment. Check back soon."
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.25) }}
                  className={`p-4 sm:p-5 flex items-start gap-3.5 transition-colors ${
                    !notif.is_read
                      ? 'bg-blue-50/30 dark:bg-blue-950/15'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-900/40'
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shrink-0">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-xs sm:text-sm font-semibold truncate ${
                        !notif.is_read
                          ? 'text-slate-900 dark:text-slate-100 font-bold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatLocalRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2.5">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3">
                      {notif.link && (
                        <Link
                          to={notif.link}
                          className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          View Details <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}

                      {!notif.is_read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                          Mark as read
                        </button>
                      )}

                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors ml-auto"
                        title="Remove notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0 mt-2" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </DashboardCard>

      </div>
    </Layout>
  );
};

export default Notifications;

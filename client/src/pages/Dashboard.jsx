import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Award,
  TrendingUp,
  FileText,
  Clock,
  Folder,
  Upload,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getDisplayName, getFirstName, initializeStudentProfileForUser, isAdminEmail } from '../utils/auth';
import {
  DashboardPage,
  DashboardCard,
  MetricCard,
  DashboardButton,
  DashboardBadge,
  FeedbackState
} from '../components/dashboard';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState([
    { label: 'Total Notes', value: '0', icon: Folder, variant: 'blue', path: '/my-materials', trend: { value: 'Available', isPositive: true, text: 'in library' } },
    { label: 'Downloads', value: '0', icon: TrendingUp, variant: 'emerald', path: '/placement-materials', trend: { value: '+12%', isPositive: true, text: 'this term' } },
    { label: 'Saved Study Time', value: '0h', icon: Clock, variant: 'purple', path: '/dashboard', trend: { value: 'Fast Prep', isPositive: true, text: 'efficiency' } },
    { label: 'EduCoins Balance', value: '0', icon: Award, variant: 'amber', path: '/rewards', trend: { value: 'Tier 1', isPositive: true, text: 'earning' } },
  ]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Get current user Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw authError || new Error("Not logged in");

        // 2. Fetch User Profile Data
        let profileData = null;
        try {
          const result = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          profileData = result.data;
        } catch (err) {
          console.warn('Profile fetch warning by id:', err);
        }

        if (!profileData && user.email) {
          try {
            const result = await supabase
              .from('users')
              .select('*')
              .ilike('email', user.email)
              .maybeSingle();
            profileData = result.data;
          } catch (err) {
            console.warn('Profile fetch warning by email:', err);
          }
        }

        const userEmail = (profileData?.email || user.email)?.toLowerCase()?.trim();
        // If user is an admin, route directly to the admin dashboard
        const isAdmin = profileData?.role === 'admin' ||
                        user.app_metadata?.role === 'admin' ||
                        user.user_metadata?.role === 'admin' ||
                        isAdminEmail(userEmail) ||
                        isAdminEmail(profileData?.email);

        if (isAdmin) {
          navigate('/admin/dashboard', { replace: true });
          return;
        }

        if (!profileData) {
          try {
            profileData = await initializeStudentProfileForUser(user);
          } catch {
            profileData = {
              id: user.id,
              email: user.email,
              name: getDisplayName(user, 'Student'),
              role: 'student',
              coins: 0
            };
          }
        }

        setUserData(profileData);

        // Immediate redirect if student onboarding is not completed
        if (profileData && profileData.onboarding_completed !== true) {
          navigate('/onboarding', { replace: true });
          return;
        }

        // 3. Fetch user's uploaded materials count
        let notesCount = 0;
        try {
          const { count } = await supabase
            .from('materials')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          notesCount = count || 0;
        } catch (err) {
          console.log("Materials count error:", err);
        }

        // 4. Fetch platform total materials count for downloads approximation
        let totalCount = 0;
        try {
          const { count } = await supabase
            .from('materials')
            .select('*', { count: 'exact', head: true });
          totalCount = count || 0;
        } catch (err) {
          console.log("Total materials error:", err);
        }

        // 5. Update stats state
        setStats([
          {
            label: 'Total Notes',
            value: notesCount.toString(),
            icon: Folder,
            variant: 'blue',
            path: '/my-materials',
            trend: { value: `${notesCount} uploaded`, isPositive: true, text: 'personal files' }
          },
          {
            label: 'Library Resources',
            value: totalCount.toString(),
            icon: TrendingUp,
            variant: 'emerald',
            path: '/placement-materials',
            trend: { value: 'Verified', isPositive: true, text: 'curated guides' }
          },
          {
            label: 'Saved Study Time',
            value: `${Math.round(notesCount * 2.5 + 4)}h`,
            icon: Clock,
            variant: 'purple',
            path: '/dashboard',
            trend: { value: 'High Prep', isPositive: true, text: 'estimated savings' }
          },
          {
            label: 'EduCoins Balance',
            value: (profileData.coins || 0).toString(),
            icon: Award,
            variant: 'amber',
            path: '/rewards',
            trend: { value: 'Active', isPositive: true, text: 'reward points' }
          },
        ]);

        // 6. Fetch user recent uploads
        try {
          const { data: userMaterials } = await supabase
            .from('materials')
            .select('id, title, created_at, subject, status')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (userMaterials && userMaterials.length > 0) {
            setRecentActivity(userMaterials.map(m => ({
              id: m.id,
              title: m.title,
              date: new Date(m.created_at).toLocaleDateString(),
              subject: m.subject || 'Academic Resource',
              status: m.status || 'approved',
              icon: FileText
            })));
          } else {
            setRecentActivity([]);
          }
        } catch (err) {
          console.log("User materials error:", err);
        }

        // 7. Fetch upcoming global/calendar events
        try {
          const { data: events } = await supabase
            .from('calendar_events')
            .select('id, title, date, type')
            .order('date', { ascending: true })
            .limit(4);

          if (events && events.length > 0) {
            setUpcomingEvents(events);
          } else {
            setUpcomingEvents([
              { id: '1', title: 'Mid-Term Exam Preparations', date: 'Next Week', type: 'Exam' },
              { id: '2', title: 'Campus Notes Exchange Week', date: 'Ongoing', type: 'Event' }
            ]);
          }
        } catch (err) {
          console.log("Events error:", err);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setUserData({ name: 'Student', role: 'student', coins: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const studentName = getFirstName(userData, 'Student');

  return (
    <Layout
      title={`Welcome back, ${studentName} 👋`}
      subtitle="Your academic command center and study progress"
      showSearch={true}
      showNotifications={true}
      showProfile={true}
    >
      <div className="max-w-[1720px] mx-auto space-y-6 lg:space-y-8 pb-10">

        {/* ── Persistent Profile Completion Banner ── */}
        <ProfileCompletionBanner profile={userData} />

        {/* ── 1. Summary Layer (Responsive Metric Cards) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <MetricCard
              key={stat.label}
              label={stat.label}
              value={loading ? '...' : stat.value}
              icon={stat.icon}
              variant={stat.variant}
              trend={stat.trend}
              onClick={() => navigate(stat.path)}
            />
          ))}
        </div>

        {/* ── 2. Primary Workspace (Feature CTA Banner) ── */}
        <div className="relative rounded-2xl lg:rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-slate-800 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Contribute & Earn</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Have verified lecture notes or PYQs?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Share your academic resources with peers. Get verified by moderators and earn EduCoins to unlock exclusive study rewards.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <DashboardButton
                variant="primary"
                size="lg"
                icon={Upload}
                onClick={() => navigate('/upload')}
              >
                Upload Resource
              </DashboardButton>
              <DashboardButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/placement-materials')}
              >
                Browse All
              </DashboardButton>
            </div>
          </div>
        </div>

        {/* ── 3. Supporting Content Layer (Two Column Split) ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Recent Activity Card */}
          <div className="xl:col-span-2">
            <DashboardCard
              title="Recent Activity"
              subtitle="Your latest uploads and material status updates"
              action={
                <Link
                  to="/my-materials"
                  className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>View All Files</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            >
              {loading ? (
                <FeedbackState type="loading" />
              ) : recentActivity.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentActivity.map((act) => (
                    <div
                      key={act.id}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/60 flex items-center justify-center shrink-0">
                          <act.icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            {act.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {act.subject} &bull; Uploaded on {act.date}
                          </p>
                        </div>
                      </div>

                      <DashboardBadge
                        variant={act.status === 'approved' ? 'emerald' : 'amber'}
                      >
                        {act.status}
                      </DashboardBadge>
                    </div>
                  ))}
                </div>
              ) : (
                <FeedbackState
                  type="empty"
                  title="No Materials Uploaded Yet"
                  description="Upload your semester notes, exam papers, or subject guides to see them tracked here."
                  actionText="Upload Material"
                  onAction={() => navigate('/upload')}
                />
              )}
            </DashboardCard>
          </div>

          {/* Academic Timeline Card */}
          <div className="xl:col-span-1">
            <DashboardCard
              title="Academic Timeline"
              subtitle="Upcoming milestones and schedule"
              action={
                <Link
                  to="/calendar"
                  className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Calendar →
                </Link>
              }
            >
              {loading ? (
                <FeedbackState type="loading" />
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          {evt.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {evt.date} &bull; {evt.type || 'Academic'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <FeedbackState
                  type="empty"
                  title="No Upcoming Events"
                  description="Check back soon or add items to your academic calendar."
                  actionText="Open Calendar"
                  onAction={() => navigate('/calendar')}
                />
              )}
            </DashboardCard>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;

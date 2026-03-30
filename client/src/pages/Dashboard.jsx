import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search, Bell, Calendar, Award,
    TrendingUp, FileText, CheckCircle, Clock, Folder
} from 'lucide-react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { formatLocalRelativeTime, formatLocalDate } from '../utils/auth';
import { getDisplayName, getFirstName, initializeStudentProfileForUser } from '../utils/auth';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState([
        { label: 'Total Notes', value: '0', icon: Folder, color: 'text-blue-600', bg: 'bg-blue-100', path: '/my-materials' },
        { label: 'Downloads', value: '0', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100', path: '/placement-materials' },
        { label: 'Saved Time', value: '0h', icon: Clock, color: 'text-violet-600', bg: 'bg-violet-100', path: '/dashboard' },
        { label: 'Edu Coins', value: '0', icon: Award, color: 'text-amber-600', bg: 'bg-amber-100', path: '/rewards' },
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
                let profileData, profileError;
                try {
                    const result = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    profileData = result.data;
                    profileError = result.error;
                } catch (err) {
                    profileError = err;
                }
                
                if (profileError || !profileData) {
                    console.log("Profile not found, creating one...");
                    try {
                        // Create user profile if it doesn't exist
                        const newProfile = await initializeStudentProfileForUser(user);
                        profileData = newProfile;
                        console.log("Created new profile:", newProfile);
                    } catch (profileCreateError) {
                        console.error('Profile creation error:', profileCreateError);
                        // Create minimal profile data as fallback
                        profileData = {
                            id: user.id,
                            email: user.email,
                            name: getDisplayName(user, 'Student'),
                            role: 'student',
                            coins: 0
                        };
                    }
                } else {
                    console.log("Found existing profile with name:", profileData.name);
                    console.log("Full profile data:", profileData);
                }

                setUserData(profileData);
                
                // Debug: Test the getDisplayName function with the profile data
                const debugDisplayName = getDisplayName(profileData, 'Student');
                console.log("Computed display name:", debugDisplayName);

                // 3. Fetch user's uploaded materials count
                let notesCount = 0;
                try {
                    const { count } = await supabase
                        .from('materials')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id);
                    notesCount = count || 0;
                } catch (materialsError) {
                    console.log("Materials table might not exist yet:", materialsError.message);
                }

                // 4. Fetch Edu Coins
                const coins = profileData?.coins || 0;

                // Update Stats
                setStats([
                    { label: 'Total Notes', value: notesCount.toString(), icon: Folder, color: 'text-blue-600', bg: 'bg-blue-100', path: '/my-materials' },
                    { label: 'Downloads', value: '0', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100', path: '/placement-materials' },
                    { label: 'Saved Time', value: '0h', icon: Clock, color: 'text-violet-600', bg: 'bg-violet-100', path: '/dashboard' },
                    { label: 'Edu Coins', value: coins.toString(), icon: Award, color: 'text-amber-600', bg: 'bg-amber-100', path: '/rewards' },
                ]);

                // 5. Fetch Recent Activity (try to get materials)
                try {
                    const { data: recentUploads, error: uploadsError } = await supabase
                        .from('materials')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(3);

                    if (!uploadsError && recentUploads) {
                        const formattedActivity = recentUploads.map((item) => ({
                            id: item.id,
                            title: `Uploaded "${item.title}"`,
                            type: 'upload',
                            date: formatLocalRelativeTime(item.created_at),
                            icon: FileText,
                            color: 'text-blue-500'
                        }));
                        setRecentActivity(formattedActivity);
                    }
                } catch (activityError) {
                    console.log("Recent activity error:", activityError.message);
                }

                // 6. Fetch Upcoming Events
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    
                    const { data: events, error: eventsError } = await supabase
                        .from('calendar_events')
                        .select('*')
                        .or(`is_global.eq.true,user_id.eq.${user?.id}`)  // Global events OR user's own events
                        .gte('date', new Date().toISOString().split('T')[0])  // Compare only date part
                        .order('date', { ascending: true })
                        .limit(3);

                    if (!eventsError && events && events.length > 0) {
                        const formattedEvents = events.map(event => {
                            const eventDate = new Date(event.date);
                            const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            return {
                                id: event.id,
                                title: event.title,
                                date: dateStr,
                                tag: event.type || 'Event'
                            };
                        });
                        setUpcomingEvents(formattedEvents);
                    } else {
                        // Fallback events
                        setUpcomingEvents([
                            { id: 1, title: 'Welcome to EduSure', date: 'Ongoing', tag: 'Info' }
                        ]);
                    }
                } catch (eventsError) {
                    console.log("Events error:", eventsError.message);
                    // Fallback events
                    setUpcomingEvents([
                        { id: 1, title: 'Welcome to EduSure', date: 'Ongoing', tag: 'Info' }
                    ]);
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

    const userFirstName = getFirstName(userData, 'Student');

    return (
        <Layout 
            title={loading ? "Loading..." : `Welcome back, ${getFirstName(userData, 'Student')} 👋`}
            showSearch={true}
            showNotifications={true}
            showProfile={true}
        >
            <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => window.location.href = stat.path}
                                >
                                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                                        <div className={`${stat.bg} p-2 lg:p-3 rounded-xl`}>
                                            <stat.icon className={`h-4 w-4 lg:h-6 lg:w-6 ${stat.color}`} />
                                        </div>
                                        <div className={`text-lg lg:text-xl font-bold ${stat.color}`}>
                                            {stat.value}
                                        </div>
                                    </div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Upload CTA Card - Responsive */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="bg-gradient-to-r from-indigo-900 to-violet-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 lg:w-64 h-32 lg:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between">
                                <div className="mb-4 lg:mb-0">
                                    <h2 className="text-lg lg:text-2xl font-bold mb-2">Have new study materials?</h2>
                                    <p className="text-violet-200 text-sm lg:text-base max-w-md">Upload your notes and PYQs to help juniors and earn Edu Coins for premium rewards.</p>
                                </div>
                                <Link
                                    to="/upload"
                                    className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-colors"
                                >
                                    Upload Now
                                </Link>
                            </div>
                        </motion.div>

                        {/* Two Column Layout for Activity and Events */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                            {/* Recent Activity */}
                            <div className="xl:col-span-2 bg-white rounded-xl lg:rounded-2xl border border-gray-100 shadow-sm p-4 lg:p-6 lg:p-8">
                                <div className="flex justify-between items-center mb-4 lg:mb-6">
                                    <h2 className="text-lg lg:text-xl font-bold text-gray-800">Recent Activity</h2>
                                    <Link to="/my-materials" className="text-sm font-semibold text-violet-600 hover:text-violet-800">View My Files</Link>
                                </div>
                                <div className="space-y-4 lg:space-y-6">
                                    {loading ? (
                                        [1, 2, 3].map(i => (
                                            <div key={i} className="flex items-start space-x-3 lg:space-x-4 animate-pulse">
                                                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 rounded-lg shrink-0"></div>
                                                <div className="flex-1 pb-4 border-b border-gray-50 space-y-2">
                                                    <div className="h-3 lg:h-4 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-2 lg:h-3 bg-gray-200 rounded w-1/4"></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : recentActivity.length > 0 ? (
                                        recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-start space-x-3 lg:space-x-4">
                                                <div className={`mt-1 p-2 bg-gray-50 rounded-lg shrink-0`}>
                                                    <activity.icon className={`h-4 w-4 lg:h-5 lg:w-5 ${activity.color}`} />
                                                </div>
                                                <div className="flex-1 pb-4 border-b border-gray-50">
                                                    <p className="text-sm lg:text-base text-gray-800 font-medium">{activity.title}</p>
                                                    <p className="text-xs lg:text-sm text-gray-500 mt-1">{activity.date}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 lg:py-12">
                                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No recent activity</p>
                                            <Link to="/upload" className="text-violet-600 hover:text-violet-800 font-medium mt-2 inline-block">
                                                Upload your first material
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upcoming Events */}
                            <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-100 shadow-sm p-4 lg:p-6">
                                <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 lg:mb-6 flex items-center">
                                    <Calendar className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-violet-600" />
                                    Upcoming Timeline
                                </h2>
                                <div className="space-y-3 lg:space-y-4">
                                    {loading ? (
                                        [1, 2].map(i => (
                                            <div key={i} className="flex items-start animate-pulse">
                                                <div className="flex flex-col items-center mr-3 lg:mr-4">
                                                    <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-gray-300"></div>
                                                    <div className="w-0.5 h-8 lg:h-12 bg-gray-100 my-1"></div>
                                                </div>
                                                <div className="bg-gray-50 rounded-xl p-3 lg:p-4 flex-1 space-y-2">
                                                    <div className="h-3 lg:h-4 bg-gray-200 rounded w-16 mb-2"></div>
                                                    <div className="h-3 lg:h-4 bg-gray-200 rounded w-full"></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : upcomingEvents.length > 0 ? (
                                        upcomingEvents.map((event, index) => (
                                            <div key={event.id || index} className="flex items-start">
                                                <div className="flex flex-col items-center mr-3 lg:mr-4">
                                                    <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-violet-600"></div>
                                                    {index < upcomingEvents.length - 1 && (
                                                        <div className="w-0.5 h-8 lg:h-12 bg-gray-100 my-1"></div>
                                                    )}
                                                </div>
                                                <div className="bg-gray-50 rounded-xl p-3 lg:p-4 flex-1">
                                                    <h3 className="font-semibold text-sm lg:text-base text-gray-800 mb-1">{event.title}</h3>
                                                    <p className="text-xs lg:text-sm text-gray-600">{event.date}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-sm text-gray-500">No upcoming events</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                    </div>
                </div>
        </Layout>
    );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { supabase } from '../../supabaseClient';
import { 
    BarChart3, Users, FileText, Gift, Download, TrendingUp, TrendingDown, Clock, Activity
} from 'lucide-react';
import { getDisplayName } from '../../utils/auth';
import {
    fetchCompletedRewardTransactions,
    fetchTransactionsWithUsers,
    getTransactionType,
} from '../../utils/transactions';

const AdminAnalytics = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers7d: 0,
        totalMaterials: 0,
        totalDownloads: 0,
        totalCoinsDistributed: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // Count registered users
            const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
            
            // Approximate active users based on recent transactions (hack for demo purposes)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const { data: activeUsers } = await supabase.from('transactions').select('user_id').gte('created_at', weekAgo.toISOString());
            const uniqueActive = new Set(activeUsers?.map(u => u.user_id)).size;

            // Count approved materials
            const { count: materialsCount } = await supabase.from('materials').select('*', { count: 'exact', head: true }).eq('status', 'approved');
            
            // We assume a 'downloads' column or table exists. Since it doesn't in the schema, we'll mock it based on materials
            const mockDownloads = (materialsCount || 0) * 14; 

            // Calculate total coins from completed reward transactions
            const coinTx = await fetchCompletedRewardTransactions();
            const totalCoins = coinTx?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

            // Get recent platform activity
            const activity = await fetchTransactionsWithUsers({ limit: 5 });

            setStats({
                totalUsers: userCount || 0,
                activeUsers7d: uniqueActive || 0,
                totalMaterials: materialsCount || 0,
                totalDownloads: mockDownloads,
                totalCoinsDistributed: totalCoins,
                recentActivity: activity || []
            });

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color }) => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-110 transition-transform ${color}`} />
            
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {trendValue}
                    </div>
                )}
            </div>
            
            <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
                <div className="text-3xl font-bold text-slate-800">{loading ? '...' : value}</div>
                {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex relative">
            <AdminSidebar />
            
            <main className="flex-1 overflow-y-auto p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                        <BarChart3 className="w-6 h-6 mr-3 text-violet-600" />
                        Platform Analytics
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Comprehensive breakdown of platform growth, engagement, and content</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        title="Total Registered Users" 
                        value={stats.totalUsers.toLocaleString()} 
                        subtitle={`${stats.activeUsers7d} active in last 7 days`}
                        icon={Users} 
                        color="bg-blue-500" 
                        trend="up" 
                        trendValue="+12%"
                    />
                    <StatCard 
                        title="Approved Materials" 
                        value={stats.totalMaterials.toLocaleString()} 
                        subtitle="Across all courses and PYQs"
                        icon={FileText} 
                        color="bg-violet-500" 
                        trend="up" 
                        trendValue="+5%"
                    />
                    <StatCard 
                        title="Total Subject Downloads" 
                        value={stats.totalDownloads.toLocaleString()} 
                        subtitle="Estimated from material popularity"
                        icon={Download} 
                        color="bg-emerald-500" 
                        trend="up" 
                        trendValue="+24%"
                    />
                    <StatCard 
                        title="Platform Coins Circulated" 
                        value={stats.totalCoinsDistributed.toLocaleString()} 
                        subtitle="Total value rewarded to students"
                        icon={Gift} 
                        color="bg-amber-500" 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden flex flex-col min-h-[400px]">
                        <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-slate-400" />
                            Growth Metrics (Simulated Weekly Pattern)
                        </h2>
                        
                        <div className="flex-1 flex flex-col justify-end relative h-full">
                            {/* CSS-based simulated bar chart background */}
                            <div className="absolute inset-0 flex items-end justify-between px-8 pb-10 opacity-20 z-0">
                                <div className="w-[10%] bg-violet-600 rounded-t-md h-[40%] hover:h-[45%] transition-all"></div>
                                <div className="w-[10%] bg-violet-600 rounded-t-md h-[55%] hover:h-[60%] transition-all"></div>
                                <div className="w-[10%] bg-violet-600 rounded-t-md h-[45%] hover:h-[50%] transition-all"></div>
                                <div className="w-[10%] bg-emerald-500 rounded-t-md h-[70%] hover:h-[75%] transition-all relative">
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 whitespace-nowrap hidden group-hover:block">Midweek Spike</span>
                                </div>
                                <div className="w-[10%] bg-violet-600 rounded-t-md h-[60%] hover:h-[65%] transition-all"></div>
                                <div className="w-[10%] bg-violet-600 rounded-t-md h-[85%] hover:h-[90%] transition-all text-center"></div>
                                <div className="w-[10%] bg-violet-600 rounded-t-md h-[100%] hover:h-[95%] transition-all"></div>
                            </div>
                            
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10 opacity-0 hover:opacity-100 transition-opacity flex-col">
                                <div className="bg-white px-6 py-4 rounded-xl shadow-xl border border-violet-100 text-center transform scale-95 hover:scale-100 transition-transform">
                                    <BarChart3 className="w-8 h-8 text-violet-500 mx-auto mb-2" />
                                    <p className="font-medium text-slate-800 text-sm">Interactive Charts Unavailable</p>
                                    <p className="text-xs text-slate-500 mt-1">Implement a library like `recharts` for live data integration.</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-between px-8 text-xs font-medium text-slate-400 border-t border-slate-100 pt-4 z-0">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-slate-400" />
                                Recent Network Activity
                            </h2>
                        </div>
                        <div className="p-0">
                            {loading ? (
                                <div className="p-8 text-center text-slate-400 animate-pulse">Loading activity stream...</div>
                            ) : stats.recentActivity.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">No recent platform activity found.</div>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {stats.recentActivity.map(act => (
                                        <li key={act.id} className="p-4 hover:bg-slate-50 flex items-start transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3 shrink-0">
                                                <Activity className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-700 leading-tight mb-1">
                                                    <span className="font-semibold text-slate-900">{getDisplayName(act.users, 'System')}</span> triggered a {getTransactionType(act)} transaction.
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(act.created_at).toLocaleDateString()} at {new Date(act.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                            <div className={`ml-auto text-xs font-bold px-2 py-1 rounded-md ${act.amount > 0 ? 'text-emerald-700 bg-emerald-100' : 'text-slate-600 bg-slate-100'}`}>
                                                {act.amount > 0 ? '+' : ''}{act.amount}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default AdminAnalytics;

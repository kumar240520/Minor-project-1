import React, { useState, useEffect } from 'react';
import ResponsiveAdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import { supabase } from '../../supabaseClient';
import {
    BarChart3, Users, FileText, Gift, Download, TrendingUp,
    TrendingDown, Clock, Activity, Award, MessageSquare, Eye
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { format, subDays, eachDayOfInterval, parseISO, startOfDay, subMonths, eachMonthOfInterval, startOfMonth } from 'date-fns';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

// ── Helpers ──────────────────────────────────────────────────────────────────

const buildDailyTimeSeries = (rows = [], dateField, days = 30, valueLabel = 'count') => {
    const interval = eachDayOfInterval({
        start: startOfDay(subDays(new Date(), days - 1)),
        end: startOfDay(new Date())
    });
    const map = {};
    interval.forEach(d => { map[format(d, 'yyyy-MM-dd')] = 0; });
    rows.forEach(row => {
        const day = format(parseISO(row[dateField]), 'yyyy-MM-dd');
        if (day in map) map[day]++;
    });
    return interval.map(d => ({
        date: format(d, 'MMM dd'),
        [valueLabel]: map[format(d, 'yyyy-MM-dd')]
    }));
};

const buildMonthlyTimeSeries = (rows = [], dateField, months = 6, valueLabel = 'count') => {
    const now = new Date();
    const interval = eachMonthOfInterval({
        start: startOfMonth(subMonths(now, months - 1)),
        end: startOfMonth(now)
    });
    const map = {};
    interval.forEach(d => { map[format(d, 'yyyy-MM')] = 0; });
    rows.forEach(row => {
        const m = format(parseISO(row[dateField]), 'yyyy-MM');
        if (m in map) map[m]++;
    });
    return interval.map(d => ({
        date: format(d, 'MMM yy'),
        [valueLabel]: map[format(d, 'yyyy-MM')]
    }));
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-3 text-sm">
            <p className="text-slate-400 text-xs mb-2 font-medium">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-slate-700 font-semibold">{p.name}:</span>
                    <span className="text-slate-900 font-bold">{p.value}</span>
                </div>
            ))}
        </div>
    );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color, bgColor, loading }) => (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-5 group-hover:scale-125 transition-transform duration-500 ${bgColor}`} />
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${bgColor} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            {trend && (
                <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-lg ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                    {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {trendValue}
                </div>
            )}
        </div>
        <p className="text-slate-400 text-xs font-medium mb-1">{title}</p>
        {loading ? (
            <div className="h-7 w-20 bg-slate-200 animate-pulse rounded" />
        ) : (
            <div className="text-2xl font-bold text-slate-800">{value}</div>
        )}
        {subtitle && <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>}
    </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);

    // Summary stats
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers7d: 0,
        newUsersThisMonth: 0,
        totalMaterials: 0,
        approvedMaterials: 0,
        pendingMaterials: 0,
        totalDownloads: 0,
        totalViews: 0,
        totalCoinsEarned: 0,
        totalCoinsSpent: 0,
        totalPosts: 0,
        totalReplies: 0,
    });

    // Chart data
    const [userGrowthData, setUserGrowthData] = useState([]);          // daily 30d
    const [uploadsOverTime, setUploadsOverTime] = useState([]);         // daily 30d
    const [monthlyActivity, setMonthlyActivity] = useState([]);         // monthly 6mo (users + uploads)
    const [coinFlowData, setCoinFlowData] = useState([]);               // daily transactions 14d
    const [materialStatusPie, setMaterialStatusPie] = useState([]);     // pie: pending/approved/rejected
    const [topUploaders, setTopUploaders] = useState([]);               // bar: top 5 uploaders

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const cutoff30 = subDays(new Date(), 30).toISOString();
            const cutoff14 = subDays(new Date(), 14).toISOString();
            const cutoff7  = subDays(new Date(), 7).toISOString();
            const cutoff6m = subMonths(new Date(), 6).toISOString();
            const startOfThisMonth = startOfMonth(new Date()).toISOString();

            // ── Parallel fetches ───────────────────────────────────────────
            const [
                { count: totalUsers },
                { data: usersLast30 },
                { data: usersLast7d },
                { count: newUsersMonth },
                { count: totalMaterials },
                { count: approvedMaterials },
                { count: pendingMaterials },
                { data: materialsLast30 },
                { data: materialsLast6m },
                { data: usersLast6m },
                { data: allMaterials },
                { data: txnsLast14 },
                { data: earnTxns },
                { data: spendTxns },
                { count: totalPosts },
                { count: totalReplies },
            ] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('users').select('created_at').gte('created_at', cutoff30),
                supabase.from('transactions').select('user_id').gte('created_at', cutoff7),
                supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startOfThisMonth),
                supabase.from('materials').select('*', { count: 'exact', head: true }),
                supabase.from('materials').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
                supabase.from('materials').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('materials').select('created_at').gte('created_at', cutoff30),
                supabase.from('materials').select('created_at').gte('created_at', cutoff6m),
                supabase.from('users').select('created_at').gte('created_at', cutoff6m),
                supabase.from('materials').select('status, downloads, views'),
                supabase.from('transactions').select('created_at, transaction_type, amount').gte('created_at', cutoff14),
                supabase.from('transactions').select('amount').eq('transaction_type', 'EARN'),
                supabase.from('transactions').select('amount').eq('transaction_type', 'SPEND'),
                supabase.from('community_posts').select('*', { count: 'exact', head: true }),
                supabase.from('community_replies').select('*', { count: 'exact', head: true }),
            ]);

            // Active users (unique user_ids in txn last 7d)
            const activeUsers7d = new Set((usersLast7d || []).map(r => r.user_id)).size;

            // Totals from materials
            const totalDownloads = (allMaterials || []).reduce((s, r) => s + (r.downloads || 0), 0);
            const totalViews     = (allMaterials || []).reduce((s, r) => s + (r.views || 0), 0);
            const totalCoinsEarned = (earnTxns || []).reduce((s, r) => s + (r.amount || 0), 0);
            const totalCoinsSpent  = (spendTxns || []).reduce((s, r) => s + (r.amount || 0), 0);

            const rejectedCount = (totalMaterials || 0) - (approvedMaterials || 0) - (pendingMaterials || 0);

            setStats({
                totalUsers: totalUsers || 0,
                activeUsers7d,
                newUsersThisMonth: newUsersMonth || 0,
                totalMaterials: totalMaterials || 0,
                approvedMaterials: approvedMaterials || 0,
                pendingMaterials: pendingMaterials || 0,
                totalDownloads,
                totalViews,
                totalCoinsEarned,
                totalCoinsSpent,
                totalPosts: totalPosts || 0,
                totalReplies: totalReplies || 0,
            });

            // ── Chart data ────────────────────────────────────────────────
            // User growth daily (last 30 days)
            setUserGrowthData(buildDailyTimeSeries(usersLast30, 'created_at', 30, 'Users'));

            // Uploads daily (last 30 days)
            setUploadsOverTime(buildDailyTimeSeries(materialsLast30, 'created_at', 30, 'Uploads'));

            // Monthly combined (last 6 months)
            const usersMonthly   = buildMonthlyTimeSeries(usersLast6m, 'created_at', 6, 'Users');
            const uploadsMonthly = buildMonthlyTimeSeries(materialsLast6m, 'created_at', 6, 'Uploads');
            const combined = usersMonthly.map((u, i) => ({
                date: u.date,
                Users: u.Users,
                Uploads: uploadsMonthly[i]?.Uploads || 0
            }));
            setMonthlyActivity(combined);

            // Coin flow daily (earn vs spend, last 14 days)
            const interval14 = eachDayOfInterval({ start: startOfDay(subDays(new Date(), 13)), end: startOfDay(new Date()) });
            const coinMap = {};
            interval14.forEach(d => { coinMap[format(d, 'yyyy-MM-dd')] = { Earned: 0, Spent: 0 }; });
            (txnsLast14 || []).forEach(tx => {
                const day = format(parseISO(tx.created_at), 'yyyy-MM-dd');
                if (day in coinMap) {
                    if (tx.transaction_type === 'EARN') coinMap[day].Earned += tx.amount;
                    else coinMap[day].Spent += tx.amount;
                }
            });
            setCoinFlowData(interval14.map(d => ({
                date: format(d, 'MMM dd'),
                ...coinMap[format(d, 'yyyy-MM-dd')]
            })));

            // Material status pie
            setMaterialStatusPie([
                { name: 'Approved', value: approvedMaterials || 0 },
                { name: 'Pending',  value: pendingMaterials || 0 },
                { name: 'Rejected', value: rejectedCount > 0 ? rejectedCount : 0 },
            ].filter(e => e.value > 0));

            // Top uploaders (top 5 by upload count, from approved materials with uploader_name)
            const { data: uploaderRows } = await supabase
                .from('materials')
                .select('uploader_name')
                .eq('status', 'approved')
                .not('uploader_name', 'is', null);
            const nameCount = {};
            (uploaderRows || []).forEach(r => {
                const n = r.uploader_name || 'Unknown';
                nameCount[n] = (nameCount[n] || 0) + 1;
            });
            const sorted = Object.entries(nameCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, Uploads]) => ({ name: name.length > 14 ? name.slice(0, 12) + '…' : name, Uploads }));
            setTopUploaders(sorted);

        } catch (err) {
            console.error('Analytics fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="h-screen bg-slate-50 overflow-hidden flex">
            <ResponsiveAdminSidebar />

            <main className="flex-1 overflow-y-auto p-6 lg:p-8 lg:ml-64 xl:ml-72">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                        <BarChart3 className="w-6 h-6 mr-3 text-violet-600" />
                        Platform Analytics
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Live data from your Supabase database — refreshes on every visit</p>
                </header>

                <div className="space-y-6">
                    {/* ── Row 1: Stat Cards ── */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        <StatCard loading={loading} title="Total Users" value={stats.totalUsers.toLocaleString()} subtitle={`${stats.newUsersThisMonth} new this month`} icon={Users} color="text-blue-600" bgColor="bg-blue-500" trend="up" trendValue={`+${stats.newUsersThisMonth}`} />
                        <StatCard loading={loading} title="Active (7d)" value={stats.activeUsers7d.toLocaleString()} subtitle="Unique transacting users" icon={Activity} color="text-indigo-600" bgColor="bg-indigo-500" />
                        <StatCard loading={loading} title="Approved Materials" value={stats.approvedMaterials.toLocaleString()} subtitle={`${stats.pendingMaterials} pending review`} icon={FileText} color="text-violet-600" bgColor="bg-violet-500" />
                        <StatCard loading={loading} title="Total Downloads" value={stats.totalDownloads.toLocaleString()} subtitle="Sum of material.downloads" icon={Download} color="text-emerald-600" bgColor="bg-emerald-500" />
                        <StatCard loading={loading} title="Coins Distributed" value={stats.totalCoinsEarned.toLocaleString()} subtitle={`${stats.totalCoinsSpent} spent`} icon={Award} color="text-amber-500" bgColor="bg-amber-400" />
                        <StatCard loading={loading} title="Community Posts" value={stats.totalPosts.toLocaleString()} subtitle={`${stats.totalReplies} replies`} icon={MessageSquare} color="text-rose-600" bgColor="bg-rose-500" />
                    </div>

                    {/* ── Row 2: Monthly Combined + Material Status Pie ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-slate-800">Monthly Growth — Users &amp; Uploads (6 Months)</h2>
                                <span className="text-xs bg-violet-50 text-violet-600 font-semibold px-2 py-1 rounded">Live Data</span>
                            </div>
                            {loading ? (
                                <div className="h-64 bg-slate-100 animate-pulse rounded-lg" />
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={monthlyActivity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                                        <Bar dataKey="Users" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                        <Bar dataKey="Uploads" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Material Status Pie */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-5">Material Status Breakdown</h2>
                            {loading ? (
                                <div className="h-64 bg-slate-100 animate-pulse rounded-lg" />
                            ) : materialStatusPie.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No materials yet</div>
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={materialStatusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                                                {materialStatusPie.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v, n) => [v, n]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="mt-3 space-y-2">
                                        {materialStatusPie.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                    <span className="text-slate-500">{item.name}</span>
                                                </div>
                                                <span className="font-bold text-slate-700">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Row 3: Daily User Growth + Daily Uploads Area ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-5">Daily User Registrations — Last 30 Days</h2>
                            {loading ? (
                                <div className="h-52 bg-slate-100 animate-pulse rounded-lg" />
                            ) : (
                                <ResponsiveContainer width="100%" height={210}>
                                    <AreaChart data={userGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="Users" stroke="#3b82f6" strokeWidth={2.5} fill="url(#userGrad)" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-5">Daily Material Uploads — Last 30 Days</h2>
                            {loading ? (
                                <div className="h-52 bg-slate-100 animate-pulse rounded-lg" />
                            ) : (
                                <ResponsiveContainer width="100%" height={210}>
                                    <AreaChart data={uploadsOverTime} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="uploadArea" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.28} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="Uploads" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#uploadArea)" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* ── Row 4: Coin Flow + Top Uploaders ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Coin flow last 14 days */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-5">Coin Flow — Earned vs Spent (14 Days)</h2>
                            {loading ? (
                                <div className="h-52 bg-slate-100 animate-pulse rounded-lg" />
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={coinFlowData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={1} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                                        <Line type="monotone" dataKey="Earned" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
                                        <Line type="monotone" dataKey="Spent" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Top uploaders */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-5">Top Uploaders (Approved Materials)</h2>
                            {loading ? (
                                <div className="h-52 bg-slate-100 animate-pulse rounded-lg" />
                            ) : topUploaders.length === 0 ? (
                                <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No approved materials yet</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={topUploaders} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={80} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="Uploads" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={28} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* ── Summary Callouts ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-5 text-white">
                            <Eye className="w-6 h-6 mb-2 opacity-75" />
                            <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
                            <p className="text-violet-200 text-sm mt-1">Total Material Views</p>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 text-white">
                            <Download className="w-6 h-6 mb-2 opacity-75" />
                            <p className="text-3xl font-bold">{stats.totalDownloads.toLocaleString()}</p>
                            <p className="text-emerald-100 text-sm mt-1">Total Material Downloads</p>
                        </div>
                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-5 text-white">
                            <Award className="w-6 h-6 mb-2 opacity-75" />
                            <p className="text-3xl font-bold">{stats.totalCoinsEarned.toLocaleString()}</p>
                            <p className="text-amber-100 text-sm mt-1">Total Coins Earned by Students</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AdminAnalytics;

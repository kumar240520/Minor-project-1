import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import ResponsiveAdminHeader from '../../components/admin/ResponsiveAdminHeader';
import MaterialPreviewModal from '../../components/materials/MaterialPreviewModal';
import useMaterialPreview from '../../hooks/useMaterialPreview';
import { supabase } from '../../supabaseClient';
import {
    Users, FileText, Download, Award, Clock, Eye,
    MessageSquare, Calendar as CalendarIcon, CheckCircle, TrendingUp, Zap
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { format, subDays, eachDayOfInterval, parseISO, startOfDay } from 'date-fns';
import {
    downloadMaterialFile,
    fetchPendingMaterials,
} from '../../utils/materials';
import { getDisplayName, formatLocalRelativeTime } from '../../utils/auth';

const getMaterialType = (item) => {
    const t = (item.type || item.material_type || item.category || '').toLowerCase();
    return t === 'pyq' ? 'pyq' : 'material';
};

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalMaterials: 0,
        pendingApprovals: 0,
        totalDownloads: 0,
        totalCoins: 0,
        totalPosts: 0,
        activeEvents: 0
    });

    // Real chart data
    const [uploadsChartData, setUploadsChartData] = useState([]);
    const [usersChartData, setUsersChartData] = useState([]);
    const [materialsBreakdown, setMaterialsBreakdown] = useState([]);

    const [recentActivity, setRecentActivity] = useState([]);
    const [pendingSnapshot, setPendingSnapshot] = useState([]);
    const [activeDownloadId, setActiveDownloadId] = useState(null);
    const {
        activePreviewId, closePreview, isOpen: isPreviewOpen,
        material: previewMaterial, openPreview, previewKind, previewUrl,
    } = useMaterialPreview({ viewerRole: 'admin' });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const buildDailyTimeSeries = (rows, dateField, days = 14) => {
        const interval = eachDayOfInterval({
            start: startOfDay(subDays(new Date(), days - 1)),
            end: startOfDay(new Date())
        });

        const countByDay = {};
        interval.forEach(d => { countByDay[format(d, 'yyyy-MM-dd')] = 0; });

        (rows || []).forEach(row => {
            const day = format(parseISO(row[dateField]), 'yyyy-MM-dd');
            if (day in countByDay) countByDay[day]++;
        });

        return interval.map(d => ({
            date: format(d, 'MMM dd'),
            count: countByDay[format(d, 'yyyy-MM-dd')]
        }));
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // ── Aggregate counts ──────────────────────────────────────────────
            const [
                { count: usersCount },
                { count: materialsCount },
                { count: pendingCount },
                { count: postsCount },
                { count: eventsCount }
            ] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('materials').select('*', { count: 'exact', head: true }),
                supabase.from('materials').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('community_posts').select('*', { count: 'exact', head: true }),
                supabase.from('calendar_events').select('*', { count: 'exact', head: true }).gte('date', new Date().toISOString())
            ]);

            // Total downloads (sum of downloads column)
            const { data: dlData } = await supabase
                .from('materials')
                .select('downloads')
                .eq('status', 'approved');
            const totalDownloads = (dlData || []).reduce((s, r) => s + (r.downloads || 0), 0);

            // Total coins distributed via EARN transactions
            const { data: earnTxns } = await supabase
                .from('transactions')
                .select('amount')
                .eq('transaction_type', 'EARN');
            const totalCoins = (earnTxns || []).reduce((s, r) => s + (r.amount || 0), 0);

            setStats({
                totalUsers: usersCount || 0,
                totalMaterials: materialsCount || 0,
                pendingApprovals: pendingCount || 0,
                totalDownloads,
                totalCoins,
                totalPosts: postsCount || 0,
                activeEvents: eventsCount || 0
            });

            // ── Upload trend (last 14 days) ───────────────────────────────────
            const cutoff14 = subDays(new Date(), 14).toISOString();
            const { data: recentMaterials } = await supabase
                .from('materials')
                .select('created_at')
                .gte('created_at', cutoff14);
            const uploadsData = buildDailyTimeSeries(recentMaterials, 'created_at', 14);
            setUploadsChartData(uploadsData);

            // ── User registrations trend (last 14 days) ───────────────────────
            const { data: recentUsers } = await supabase
                .from('users')
                .select('created_at')
                .gte('created_at', cutoff14);
            const usersData = buildDailyTimeSeries(recentUsers, 'created_at', 14);
            setUsersChartData(usersData);

            // ── Materials breakdown by type + status (Pie) ────────────────────
            const { data: allMaterials } = await supabase
                .from('materials')
                .select('type, status');
            const breakdown = {};
            (allMaterials || []).forEach(m => {
                const label = `${(m.type || 'material').toUpperCase()} — ${m.status}`;
                breakdown[label] = (breakdown[label] || 0) + 1;
            });
            setMaterialsBreakdown(Object.entries(breakdown).map(([name, value]) => ({ name, value })));

            // ── Pending snapshot ──────────────────────────────────────────────
            const pending = await fetchPendingMaterials();
            setPendingSnapshot((pending || []).slice(0, 4));

            // ── Recent activity from transactions ─────────────────────────────
            const { data: recentTxns } = await supabase
                .from('transactions')
                .select('*, users(name, email)')
                .order('created_at', { ascending: false })
                .limit(6);
            setRecentActivity(recentTxns || []);

        } catch (error) {
            console.error('Error fetching admin stats', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { title: 'Total Materials', value: stats.totalMaterials, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        { title: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', link: '/admin/approvals' },
        { title: 'Total Downloads', value: stats.totalDownloads.toLocaleString(), icon: Download, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { title: 'Coins Distributed', value: stats.totalCoins.toLocaleString(), icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
        { title: 'Community Posts', value: stats.totalPosts, icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    ];

    const handlePreview = async (item) => {
        try { await openPreview(item); }
        catch (error) { alert(error.message || 'Unable to preview this upload right now.'); }
    };

    const handleDownload = async (item) => {
        try {
            setActiveDownloadId(item.id);
            await downloadMaterialFile(item, { viewerRole: 'admin' });
        } catch (error) {
            alert(error.message || 'Unable to open this upload right now.');
        } finally {
            setActiveDownloadId(null);
        }
    };

    const txIcon = (tx) => {
        if (tx.transaction_type === 'EARN') return { icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-100' };
        return { icon: Download, color: 'text-blue-600', bg: 'bg-blue-100' };
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-2">
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
            <ResponsiveAdminSidebar />

            <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                <ResponsiveAdminHeader
                    title="Overview"
                    subtitle="Platform metrics and real-time activity"
                    onMobileMenuToggle={() => {}}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">

                        {/* ── Stat Cards ── */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                            {statCards.map((stat, idx) => (
                                <div key={idx} className={`bg-white rounded-xl border ${stat.border} shadow-sm p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow`}>
                                    <div className={`${stat.bg} w-11 h-11 rounded-full flex items-center justify-center mb-3`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <h3 className="text-slate-400 text-xs font-medium mb-1 leading-tight">{stat.title}</h3>
                                    {loading ? (
                                        <div className="h-6 w-12 bg-slate-200 animate-pulse rounded" />
                                    ) : (
                                        <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                                    )}
                                    {stat.link && !loading && stat.value > 0 && (
                                        <Link to={stat.link} className="mt-1 text-xs font-semibold text-violet-600 hover:underline">Review →</Link>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* ── Charts Row ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Upload Trend */}
                            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-bold text-slate-800">Upload Activity — Last 14 Days</h3>
                                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Live Data</span>
                                </div>
                                {loading ? (
                                    <div className="h-60 bg-slate-100 animate-pulse rounded-lg" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <AreaChart data={uploadsChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={1} />
                                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="count" name="Uploads" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#uploadGrad)" dot={{ r: 3, fill: '#8b5cf6' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Materials Breakdown Pie */}
                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-base font-bold text-slate-800 mb-4">Materials Breakdown</h3>
                                {loading ? (
                                    <div className="h-60 bg-slate-100 animate-pulse rounded-lg" />
                                ) : materialsBreakdown.length === 0 ? (
                                    <div className="h-60 flex items-center justify-center text-slate-400 text-sm">No materials yet</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={materialsBreakdown}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={90}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {materialsBreakdown.map((_, index) => (
                                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value, name) => [value, name]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                                {!loading && materialsBreakdown.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {materialsBreakdown.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                                                    <span className="text-slate-500 truncate max-w-[110px]">{item.name}</span>
                                                </div>
                                                <span className="font-semibold text-slate-700">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── User Registrations Bar Chart ── */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-slate-800">New User Registrations — Last 14 Days</h3>
                                <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Live Data</span>
                            </div>
                            {loading ? (
                                <div className="h-48 bg-slate-100 animate-pulse rounded-lg" />
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={usersChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={1} />
                                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="New Users" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={36} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* ── Pending Approval Queue ── */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">Pending Approval Queue</h2>
                                    <p className="text-sm text-slate-400 mt-0.5">Latest student uploads waiting for review</p>
                                </div>
                                <Link
                                    to="/admin/approvals"
                                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
                                >
                                    Open Approval Panel
                                </Link>
                            </div>
                            <div className="p-6">
                                {loading ? (
                                    <div className="text-slate-400 animate-pulse">Loading pending approvals...</div>
                                ) : pendingSnapshot.length === 0 ? (
                                    <div className="flex flex-col items-center py-8 text-slate-400">
                                        <CheckCircle className="w-10 h-10 mb-2 text-emerald-300" />
                                        <p className="text-sm">No pending uploads right now. All clear!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {pendingSnapshot.map((item) => {
                                            const itemType = getMaterialType(item);
                                            const isPreviewing = activePreviewId === item.id;
                                            return (
                                                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between gap-2 mb-3">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            itemType === 'pyq'
                                                                ? 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200'
                                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        }`}>
                                                            {itemType === 'pyq' ? 'PYQ' : 'Material'}
                                                        </span>
                                                        <span className="text-xs text-slate-400">{formatLocalRelativeTime(item.created_at)}</span>
                                                    </div>
                                                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-1">
                                                        {item.title || item.subject || 'Untitled submission'}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                                        {item.subject || item.description || 'Awaiting moderator review.'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mb-3">By {item.uploader_name || 'Anonymous'}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handlePreview(item)}
                                                            disabled={!item.file_url || isPreviewing}
                                                            className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                                        >
                                                            <Eye className="mr-1.5 h-3 w-3" />
                                                            {isPreviewing ? 'Opening...' : 'Preview'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownload(item)}
                                                            disabled={activeDownloadId === item.id}
                                                            className="flex-1 inline-flex items-center justify-center rounded-lg bg-slate-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                                                        >
                                                            <Download className="mr-1.5 h-3 w-3" />
                                                            {activeDownloadId === item.id ? 'Opening...' : 'Open'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Bottom Row: Activity + Events ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Transaction Activity */}
                            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <h2 className="text-base font-bold text-slate-800">Recent Transaction Activity</h2>
                                    <Link to="/admin/transactions" className="text-xs font-semibold text-violet-600 hover:underline">View All →</Link>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {loading ? (
                                        [1, 2, 3, 4].map(i => (
                                            <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                                                <div className="w-9 h-9 bg-slate-200 rounded-full shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                                                    <div className="h-2 bg-slate-200 rounded w-1/3" />
                                                </div>
                                                <div className="h-6 w-12 bg-slate-200 rounded" />
                                            </div>
                                        ))
                                    ) : recentActivity.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-sm">No transactions recorded yet.</div>
                                    ) : (
                                        recentActivity.map((tx) => {
                                            const { icon: Icon, color, bg } = txIcon(tx);
                                            return (
                                                <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                                                    <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                                                        <Icon className={`w-4 h-4 ${color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-800 truncate">
                                                            {tx.users?.name || tx.users?.email || 'Unknown User'}
                                                        </p>
                                                        <p className="text-xs text-slate-400 truncate">{tx.description || tx.reference_type}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className={`text-sm font-bold ${tx.transaction_type === 'EARN' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                            {tx.transaction_type === 'EARN' ? '+' : '-'}{tx.amount}
                                                        </span>
                                                        <span className="text-xs text-slate-400">{formatLocalRelativeTime(tx.created_at)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Active Events */}
                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
                                <div className="p-6 border-b border-slate-100">
                                    <h2 className="text-base font-bold text-slate-800 flex items-center">
                                        <CalendarIcon className="w-4 h-4 mr-2 text-violet-500" />
                                        Active Platform Events
                                    </h2>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
                                    <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                                        {loading ? (
                                            <div className="w-8 h-8 bg-violet-200 animate-pulse rounded-full" />
                                        ) : (
                                            <span className="text-3xl font-bold text-violet-600">{stats.activeEvents}</span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-slate-800 mb-1">Upcoming Events</h3>
                                    <p className="text-sm text-slate-400 mb-5">Active events engaging the student community.</p>
                                    <Link
                                        to="/admin/events"
                                        className="w-full py-2.5 bg-violet-600 text-white rounded-lg font-medium text-sm hover:bg-violet-700 transition-colors inline-block text-center"
                                    >
                                        Manage Events
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            <MaterialPreviewModal
                isOpen={isPreviewOpen}
                material={previewMaterial}
                previewKind={previewKind}
                previewUrl={previewUrl}
                onClose={closePreview}
                onDownload={handleDownload}
                isDownloading={activeDownloadId === previewMaterial?.id}
            />
        </div>
    );
};

export default AdminDashboard;

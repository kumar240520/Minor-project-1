import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import MaterialPreviewModal from '../../components/materials/MaterialPreviewModal';
import useMaterialPreview from '../../hooks/useMaterialPreview';
import { supabase } from '../../supabaseClient';
import { 
    Users, FileText, Download, Award, Clock, Eye,
    AlertCircle, MessageSquare, Calendar as CalendarIcon, Activity
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import { getDisplayName } from '../../utils/auth';
import {
    downloadMaterialFile,
    fetchPendingMaterials,
    getMaterialType,
} from '../../utils/materials';

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
    
    // Chart Data
    const [uploadsData, setUploadsData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    
    const [recentActivity, setRecentActivity] = useState([]);
    const [pendingSnapshot, setPendingSnapshot] = useState([]);
    const [activeDownloadId, setActiveDownloadId] = useState(null);
    const {
        activePreviewId,
        closePreview,
        isOpen: isPreviewOpen,
        material: previewMaterial,
        openPreview,
        previewKind,
        previewUrl,
    } = useMaterialPreview({ viewerRole: 'admin' });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // 1. Fetch aggregate stats
                const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
                const { count: materialsCount } = await supabase.from('materials').select('*', { count: 'exact', head: true });
                const { count: pendingCount } = await supabase.from('materials').select('*', { count: 'exact', head: true }).eq('status', 'pending');
                const { count: postsCount } = await supabase.from('community_posts').select('*', { count: 'exact', head: true });
                const { count: eventsCount } = await supabase.from('calendar_events').select('*', { count: 'exact', head: true }).gte('date', new Date().toISOString());
                
                // Aggregate coins from all users
                const { data: usersInfo } = await supabase.from('users').select('coins');
                const totalCoinsSum = usersInfo?.reduce((sum, user) => sum + (user.coins || 0), 0) || 0;

                setStats({
                    totalUsers: usersCount || 0,
                    totalMaterials: materialsCount || 0,
                    pendingApprovals: pendingCount || 0,
                    totalDownloads: 12450, // Placeholder as we don't have download tracking yet
                    totalCoins: totalCoinsSum,
                    totalPosts: postsCount || 0,
                    activeEvents: eventsCount || 0
                });

                // 2. Fetch Recent Activity (Mixed from Materials and Users)
                const { data: recentUploads } = await supabase
                    .from('materials')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);

                const { data: recentUsers } = await supabase
                    .from('users')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(3);

                // Format and sort activity
                let activityList = [];
                if (recentUploads) {
                    recentUploads.forEach(item => {
                        activityList.push({
                            id: `up-${item.id}`,
                            title: `New Material Uploaded`,
                            desc: `"${item.title}" by ${item.uploader_name || 'Student'}`,
                            time: item.created_at,
                            type: item.status === 'pending' ? 'pending' : 'upload',
                            icon: item.status === 'pending' ? AlertCircle : FileText,
                            color: item.status === 'pending' ? 'text-amber-500' : 'text-blue-500',
                            bg: item.status === 'pending' ? 'bg-amber-100' : 'bg-blue-100'
                        });
                    });
                }
                if (recentUsers) {
                     recentUsers.forEach(user => {
                        activityList.push({
                            id: `usr-${user.id}`,
                            title: `New User Registration`,
                            desc: `${getDisplayName(user, 'A new student')} joined the platform.`,
                            time: user.created_at,
                            type: 'user',
                            icon: Users,
                            color: 'text-emerald-500',
                            bg: 'bg-emerald-100'
                        });
                    });
                }
                
                // Sort combined list by date descending and take top 8
                activityList.sort((a, b) => new Date(b.time) - new Date(a.time));
                setRecentActivity(activityList.slice(0, 8));

                const pendingApprovals = await fetchPendingMaterials();
                setPendingSnapshot(pendingApprovals.slice(0, 4));


                // 3. Generate Mock Data for Charts (Since we don't have enough historical data yet)
                // In production, you would group by Date strings from Supabase.
                const mockUploads = [];
                const mockUsers = [];
                for(let i=6; i>=0; i--) {
                    const d = subDays(new Date(), i);
                    const formattedDate = format(d, 'MMM dd');
                    mockUploads.push({
                        date: formattedDate,
                        Notes: Math.floor(Math.random() * 20) + 5,
                        PYQs: Math.floor(Math.random() * 15) + 2
                    });
                    mockUsers.push({
                        date: formattedDate,
                        Users: Math.floor(Math.random() * 50) + 10
                    });
                }
                setUploadsData(mockUploads);
                setUsersData(mockUsers);

            } catch (error) {
                console.error("Error fetching admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Total Materials', value: stats.totalMaterials, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { title: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
        { title: 'Total Downloads', value: stats.totalDownloads.toLocaleString(), icon: Download, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { title: 'Total Coins Issued', value: stats.totalCoins.toLocaleString(), icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { title: 'Community Posts', value: stats.totalPosts, icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-100' },
    ];

    const handlePreview = async (item) => {
        try {
            await openPreview(item);
        } catch (error) {
            console.error('Error previewing pending upload:', error);
            alert(error.message || 'Unable to preview this upload right now.');
        }
    };

    const handleDownload = async (item) => {
        try {
            setActiveDownloadId(item.id);
            await downloadMaterialFile(item, { viewerRole: 'admin' });
        } catch (error) {
            console.error('Error downloading pending upload:', error);
            alert(error.message || 'Unable to open this upload right now.');
        } finally {
            setActiveDownloadId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />
            
            <main className="flex-1 overflow-y-auto">
                {/* Admin Header */}
                <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
                        <p className="text-sm text-slate-500">Platform metrics and recent activity</p>
                    </div>
                </header>

                <div className="p-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                        {statCards.map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center justify-center">
                                <div className={`${stat.bg} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h3>
                                {loading ? (
                                    <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                                        {stat.title === 'Pending Approvals' ? (
                                            <Link
                                                to="/admin-dashboard/approvals"
                                                className="mt-3 inline-flex text-xs font-semibold text-violet-600 hover:text-violet-700"
                                            >
                                                Review queue
                                            </Link>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Pending Approval Queue</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Review the latest student uploads waiting to be approved.
                                </p>
                            </div>
                            <Link
                                to="/admin-dashboard/approvals"
                                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
                            >
                                Open Approval Panel
                            </Link>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="text-slate-500">Loading pending approvals...</div>
                            ) : pendingSnapshot.length === 0 ? (
                                <div className="text-slate-500">No pending uploads right now.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                    {pendingSnapshot.map((item) => {
                                        const itemType = getMaterialType(item);
                                        const isPreviewing = activePreviewId === item.id;

                                        return (
                                            <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        itemType === 'pyq'
                                                            ? 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200'
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}>
                                                        {itemType === 'pyq' ? 'PYQ' : 'Material'}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : ''}
                                                    </span>
                                                </div>
                                                <h3 className="mt-3 font-semibold text-slate-900 line-clamp-2">
                                                    {item.title || item.subject || 'Untitled submission'}
                                                </h3>
                                                <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                                                    {item.subject || item.description || 'Awaiting moderator review.'}
                                                </p>
                                                <p className="mt-4 text-xs text-slate-500">
                                                    By {item.uploader_name || 'Anonymous Student'}
                                                </p>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePreview(item)}
                                                        disabled={!item.file_url || isPreviewing}
                                                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        {isPreviewing ? 'Opening...' : 'Preview'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownload(item)}
                                                        disabled={activeDownloadId === item.id}
                                                        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        {activeDownloadId === item.id ? 'Opening...' : 'Download'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        
                        {/* Uploads Area Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                                Uploads per Day (Last 7 Days)
                            </h2>
                            <div className="h-[300px] w-full">
                                {loading ? (
                                    <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Chart...</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={uploadsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorPYQs" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend verticalAlign="top" height={36} iconType="circle"/>
                                            <Area type="monotone" dataKey="Notes" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorNotes)" />
                                            <Area type="monotone" dataKey="PYQs" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPYQs)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Users Bar Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                             <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-blue-500" />
                                New Users
                            </h2>
                            <div className="h-[300px] w-full">
                                {loading ? (
                                    <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg"></div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={usersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                            <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                                            <Bar dataKey="Users" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Activity Feed */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800">Recent Activity Feed</h2>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="space-y-6">
                                    {loading ? (
                                        [1,2,3,4].map(i => (
                                            <div key={i} className="flex items-start space-x-4 animate-pulse">
                                                <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-slate-200 w-1/3 rounded"></div>
                                                    <div className="h-3 bg-slate-200 w-1/2 rounded"></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : recentActivity.length > 0 ? (
                                        recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-start">
                                                <div className="relative flex-shrink-0 flex items-center justify-center">
                                                    <span className="absolute top-10 left-1/2 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true"></span>
                                                    <div className={`relative h-10 w-10 flex items-center justify-center rounded-full ${activity.bg} ring-4 ring-white`}>
                                                        <activity.icon className={`w-5 h-5 ${activity.color}`} aria-hidden="true" />
                                                    </div>
                                                </div>
                                                <div className="ml-4 min-w-0 flex-1 flex justify-between space-x-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                                                        <p className="text-sm text-slate-500">{activity.desc}</p>
                                                    </div>
                                                    <div className="text-right text-xs whitespace-nowrap text-slate-500 bg-slate-50 px-2 py-1 rounded-md h-fit">
                                                        {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-500">No recent activity.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions / Active Events snippet */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
                             <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-violet-500" />
                                    Active Platform Events
                                </h2>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
                                <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-3xl font-bold text-violet-600">{stats.activeEvents}</span>
                                </div>
                                <h3 className="font-semibold text-slate-800 mb-2">Events Running Right Now</h3>
                                <p className="text-sm text-slate-500 mb-6">Create new events to engage the student community and boost uploads.</p>
                                
                                <button className="w-full py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
                                    Manage Events
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

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

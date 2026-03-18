import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import ResponsiveAdminHeader from '../../components/admin/ResponsiveAdminHeader';
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
            try {
                setLoading(true);

                // Fetch stats
                const [
                    { count: totalUsers },
                    { count: totalMaterials },
                    { count: pendingApprovals },
                    { count: totalPosts },
                    { count: activeEvents },
                    downloadsResult,
                    coinsResult
                ] = await Promise.all([
                    supabase.from('users').select('*', { count: 'exact', head: true }),
                    supabase.from('materials').select('*', { count: 'exact', head: true }),
                    supabase.from('materials').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                    supabase.from('community_posts').select('*', { count: 'exact', head: true }),
                    supabase.from('calendar_events').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                    supabase.from('materials').select('downloads'),
                    supabase.from('users').select('coins')
                ]);

                // Calculate total downloads and coins
                const totalDownloads = downloadsResult.data?.reduce((sum, item) => sum + (item.downloads || 0), 0) || 0;
                const totalCoins = coinsResult.data?.reduce((sum, user) => sum + (user.coins || 0), 0) || 0;

                setStats({
                    totalUsers: totalUsers || 0,
                    totalMaterials: totalMaterials || 0,
                    pendingApprovals: pendingApprovals || 0,
                    totalDownloads,
                    totalCoins,
                    totalPosts: totalPosts || 0,
                    activeEvents: activeEvents || 0
                });

                // Generate chart data
                const uploadsChart = [];
                const usersChart = [];
                for (let i = 6; i >= 0; i--) {
                    const date = subDays(new Date(), i);
                    uploadsChart.push({
                        date: format(date, 'MMM dd'),
                        uploads: Math.floor(Math.random() * 20) + 5
                    });
                    usersChart.push({
                        date: format(date, 'MMM dd'),
                        users: Math.floor(Math.random() * 15) + 3
                    });
                }
                setUploadsData(uploadsChart);
                setUsersData(usersChart);

                // Fetch pending materials snapshot
                const pending = await fetchPendingMaterials();
                setPendingSnapshot(pending.slice(0, 4)); // Show first 4

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <ResponsiveAdminSidebar />
            
            <div className="lg:ml-64 xl:ml-72">
                <ResponsiveAdminHeader 
                    title="Overview" 
                    subtitle="Platform metrics and recent activity"
                    onMobileMenuToggle={() => {}}
                />
                
                <main className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
                        
                        {/* Stats Grid - Responsive */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-6">
                            {statCards.map((stat, idx) => (
                                <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 lg:p-6 flex flex-col items-center text-center justify-center hover:shadow-md transition-shadow">
                                    <div className={`${stat.bg} w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center mb-3 lg:mb-4`}>
                                        <stat.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                                    </div>
                                    <h3 className="text-slate-500 text-xs lg:text-sm font-medium mb-1">{stat.title}</h3>
                                    {loading ? (
                                        <div className="h-6 w-12 lg:h-8 lg:w-16 bg-slate-200 animate-pulse rounded"></div>
                                    ) : (
                                        <>
                                            <p className="text-lg lg:text-2xl font-bold text-slate-800">{stat.value}</p>
                                            {stat.title === 'Pending Approvals' ? (
                                                <Link
                                                    to="/admin-dashboard/approvals"
                                                    className="mt-2 lg:mt-3 inline-flex text-xs font-semibold text-violet-600 hover:text-violet-700"
                                                >
                                                    Review queue
                                                </Link>
                                            ) : null}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pending Approval Queue - Responsive */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-4 lg:p-6 border-b border-slate-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg lg:text-xl font-bold text-slate-800">Pending Approval Queue</h2>
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
                            </div>

                            <div className="p-4 lg:p-6">
                                {loading ? (
                                    <div className="text-slate-500">Loading pending approvals...</div>
                                ) : pendingSnapshot.length === 0 ? (
                                    <div className="text-slate-500">No pending uploads right now.</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {pendingSnapshot.map((item) => {
                                            const itemType = getMaterialType(item);
                                            const isPreviewing = activePreviewId === item.id;

                                            return (
                                                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:shadow-md transition-shadow">
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

                        {/* Charts Section - Responsive */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 lg:p-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Upload Activity (7 Days)</h3>
                                <div className="h-64 lg:h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={uploadsData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                                            <YAxis stroke="#64748b" fontSize={12} />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: '#ffffff', 
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px'
                                                }} 
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="uploads" 
                                                stroke="#8b5cf6" 
                                                fill="#8b5cf6" 
                                                fillOpacity={0.1}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 lg:p-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">User Growth (7 Days)</h3>
                                <div className="h-64 lg:h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={usersData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                                            <YAxis stroke="#64748b" fontSize={12} />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: '#ffffff', 
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px'
                                                }} 
                                            />
                                            <Bar dataKey="users" fill="#10b981" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
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

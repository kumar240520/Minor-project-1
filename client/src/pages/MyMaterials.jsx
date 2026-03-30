import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Folder, Trash2, FileText, Upload, MoreVertical, Eye } from 'lucide-react';
import Sidebar, { SidebarProvider } from '../components/Sidebar';
import ResponsiveHeader from '../components/ResponsiveHeader';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { formatLocalDate } from '../utils/auth';
import {
    deleteMaterialUpload,
    fetchStudentMaterials,
    getMaterialStatus,
    getMaterialStatusLabel,
    isMaterialApproved,
    previewMaterialFile,
} from '../utils/materials';

const MyMaterials = () => {
    const [uploadedMaterials, setUploadedMaterials] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [deletingId, setDeletingId] = React.useState(null);
    const [previewingId, setPreviewingId] = React.useState(null);

    React.useEffect(() => {
        fetchMyMaterials();
    }, []);

    const fetchMyMaterials = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const data = await fetchStudentMaterials(user.id);
            setUploadedMaterials(data);
        } catch (error) {
            console.error('Error fetching your materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (material) => {
        if (!window.confirm("Are you sure you want to delete this material?")) return;
        
        try {
            setDeletingId(material.id);
            await deleteMaterialUpload(material);
            
            // Remove from local state
            setUploadedMaterials(prev => prev.filter((item) => item.id !== material.id));
        } catch (error) {
            console.error('Error deleting material:', error);
            alert("Failed to delete. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    const handlePreview = async (material) => {
        if (!isMaterialApproved(material)) {
            alert('Only approved files can be previewed from the student view.');
            return;
        }

        try {
            setPreviewingId(material.id);
            await previewMaterialFile(material);
        } catch (error) {
            console.error('Error previewing material:', error);
            alert('Unable to open this file right now.');
        } finally {
            setPreviewingId(null);
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />

                <div className="flex-1 flex flex-col lg:ml-60 overflow-hidden">
                    <ResponsiveHeader 
                        title="My Materials"
                        showSearch={true}
                        showNotifications={true}
                        showProfile={true}
                    />

                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto space-y-8">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Your Uploads</h2>
                                <p className="text-gray-500 text-sm mt-1">Manage all the study materials and resources you've shared.</p>
                            </div>
                            <Link to="/upload" className="flex items-center px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto justify-center">
                                <Upload className="h-5 w-5 mr-2" /> New Upload
                            </Link>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Document</th>
                                            <th className="px-6 py-4 font-bold">Status</th>
                                            <th className="px-6 py-4 font-bold">Date Uploaded</th>
                                            <th className="px-6 py-4 font-bold">Stats</th>
                                            <th className="px-6 py-4 font-bold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading your materials...</td>
                                            </tr>
                                        )}
                                        {!loading && uploadedMaterials.map((item, index) => (
                                            <motion.tr 
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800">{item.title}</p>
                                                            <p className="text-xs text-gray-500">{item.file_type} • {item.category}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                                        getMaterialStatus(item) === 'approved'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : getMaterialStatus(item) === 'rejected'
                                                                ? 'bg-rose-100 text-rose-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {getMaterialStatusLabel(item)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                                                    {formatLocalDate(item.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <div className="flex space-x-4">
                                                        <span title="Views">{item.views || 0} views</span>
                                                        <span title="Downloads">{item.downloads || 0} dl</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePreview(item)}
                                                            disabled={previewingId === item.id || !isMaterialApproved(item)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                                            title={isMaterialApproved(item) ? 'Preview file' : 'Preview available after approval'}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(item)}
                                                            disabled={deletingId === item.id}
                                                            className={`p-2 rounded-lg transition-colors ${deletingId === item.id ? 'text-gray-300' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Empty state alternative if none */}
                            {!loading && uploadedMaterials.length === 0 && (
                                <div className="p-12 text-center">
                                    <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-800">No materials uploaded yet</h3>
                                    <p className="text-gray-500 mt-2">Share your notes and resources to help the community.</p>
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

export default MyMaterials;

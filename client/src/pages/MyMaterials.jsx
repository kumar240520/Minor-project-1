import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Folder, Trash2, FileText, Upload, Eye, CheckCircle2, Clock, XCircle, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
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
import {
  DashboardCard,
  MetricCard,
  DashboardButton,
  DashboardBadge,
  FeedbackState
} from '../components/dashboard';

const MyMaterials = () => {
  const navigate = useNavigate();
  const [uploadedMaterials, setUploadedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [previewingId, setPreviewingId] = useState(null);

  useEffect(() => {
    fetchMyMaterials();
  }, []);

  const fetchMyMaterials = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const data = await fetchStudentMaterials(user.id);
      setUploadedMaterials(data || []);
    } catch (error) {
      console.error('Error fetching your materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (material) => {
    if (!window.confirm(`Are you sure you want to delete "${material.title}"?`)) return;

    try {
      setDeletingId(material.id);
      await deleteMaterialUpload(material);
      setUploadedMaterials(prev => prev.filter(item => item.id !== material.id));
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Failed to delete material. Please try again.');
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

  // Metrics calculation
  const totalCount = uploadedMaterials.length;
  const approvedCount = uploadedMaterials.filter(m => getMaterialStatus(m) === 'approved').length;
  const pendingCount = uploadedMaterials.filter(m => getMaterialStatus(m) === 'pending').length;
  const totalViews = uploadedMaterials.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0);

  return (
    <Layout
      title="My Uploads"
      subtitle="Manage your shared study materials, approval status, and downloads"
    >
      <div className="max-w-[1720px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <MetricCard
            label="Total Uploads"
            value={totalCount}
            icon={Folder}
            variant="blue"
            trend={{ value: 'All time', isPositive: true, text: 'contributed' }}
          />
          <MetricCard
            label="Approved & Live"
            value={approvedCount}
            icon={CheckCircle2}
            variant="emerald"
            trend={{ value: `${totalCount ? Math.round((approvedCount / totalCount) * 100) : 0}%`, isPositive: true, text: 'acceptance' }}
          />
          <MetricCard
            label="Under Review"
            value={pendingCount}
            icon={Clock}
            variant="amber"
            trend={{ value: 'In Queue', isPositive: true, text: 'admin review' }}
          />
          <MetricCard
            label="Community Views"
            value={totalViews}
            icon={ArrowUpRight}
            variant="purple"
            trend={{ value: 'Peer Impact', isPositive: true, text: 'campus reach' }}
          />
        </div>

        {/* Action Header Card */}
        <DashboardCard className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Uploaded Resources
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Track verification progress, update documents, and inspect student engagement.
              </p>
            </div>
            <DashboardButton
              variant="primary"
              onClick={() => navigate('/upload')}
              icon={Upload}
              className="w-full sm:w-auto"
            >
              Upload Material
            </DashboardButton>
          </div>
        </DashboardCard>

        {/* Materials Table Card */}
        <DashboardCard className="overflow-hidden">
          {loading ? (
            <FeedbackState
              type="loading"
              title="Loading Uploaded Materials"
              description="Retrieving your documents and approval statuses..."
            />
          ) : uploadedMaterials.length === 0 ? (
            <FeedbackState
              type="empty"
              title="No Materials Uploaded Yet"
              description="Upload handwritten notes, PYQ solutions, or syllabus guides to earn EduCoins."
              actionText="Upload First Document"
              onAction={() => navigate('/upload')}
            />
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs sm:text-sm text-left border-collapse">
                <thead className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Document Details</th>
                    <th className="px-5 py-3.5">Verification</th>
                    <th className="px-5 py-3.5 hidden md:table-cell">Uploaded Date</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Reach</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {uploadedMaterials.map((item, index) => {
                    const status = getMaterialStatus(item);
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.04, 0.3) }}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors group"
                      >
                        {/* Title & Category */}
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 shrink-0">
                              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                {item.file_type || 'PDF'} &bull; {item.category || 'Lecture Notes'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {status === 'approved' && (
                            <DashboardBadge variant="success">Approved</DashboardBadge>
                          )}
                          {status === 'pending' && (
                            <DashboardBadge variant="warning">In Review</DashboardBadge>
                          )}
                          {status === 'rejected' && (
                            <DashboardBadge variant="critical">Rejected</DashboardBadge>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap hidden md:table-cell text-xs">
                          {formatLocalDate(item.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>

                        {/* Reach */}
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300 hidden sm:table-cell text-xs whitespace-nowrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.views || 0}</span> views
                          <span className="mx-1.5 text-slate-300">&bull;</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.downloads || 0}</span> dls
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => handlePreview(item)}
                              disabled={previewingId === item.id || !isMaterialApproved(item)}
                              className="p-2 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              title={isMaterialApproved(item) ? 'Preview Document' : 'Pending verification'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              disabled={deletingId === item.id}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-40"
                              title="Delete Material"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DashboardCard>

      </div>
    </Layout>
  );
};

export default MyMaterials;

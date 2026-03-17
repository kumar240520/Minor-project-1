import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { AlertCircle, BookOpen, CheckCircle, Eye, Search, XCircle } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import MaterialPreviewModal from '../../components/materials/MaterialPreviewModal';
import useMaterialPreview from '../../hooks/useMaterialPreview';
import { supabase } from '../../supabaseClient';
import {
  approveMaterialUpload,
  downloadMaterialFile,
  fetchPendingMaterials as fetchPendingMaterialSubmissions,
  rejectMaterialUpload,
} from '../../utils/materials';

const AdminPYQs = () => {
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
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
    fetchPendingPYQs();
  }, []);

  const fetchPendingPYQs = async () => {
    setLoading(true);
    try {
      const data = await fetchPendingMaterialSubmissions({ type: 'pyq' });
      setPyqs(data);
    } catch (error) {
      console.error('Error fetching PYQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (pyq) => {
    if (!window.confirm(`Are you sure you want to approve PYQ for "${pyq.subject}"?`)) return;

    setActionLoading(pyq.id);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await approveMaterialUpload({
        material: pyq,
        adminUserId: user?.id || null,
      });

      setPyqs((prev) => prev.filter((item) => item.id !== pyq.id));
      if (previewMaterial?.id === pyq.id) {
        closePreview();
      }
    } catch (error) {
      console.error('Error approving PYQ:', error);
      alert('Failed to approve PYQ.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this PYQ submission?')) return;

    setActionLoading(id);
    try {
      await rejectMaterialUpload(id);
      setPyqs((prev) => prev.filter((item) => item.id !== id));
      if (previewMaterial?.id === id) {
        closePreview();
      }
    } catch (error) {
      console.error('Error rejecting PYQ:', error);
      alert('Failed to reject PYQ.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePreview = async (pyq) => {
    try {
      await openPreview(pyq);
    } catch (error) {
      console.error('Error previewing PYQ:', error);
      alert(error.message || 'Failed to open the PYQ preview.');
    }
  };

  const handleDownload = async (pyq) => {
    try {
      setActiveDownloadId(pyq.id);
      await downloadMaterialFile(pyq, { viewerRole: 'admin' });
    } catch (error) {
      console.error('Error downloading PYQ:', error);
      alert('Failed to open the PYQ file.');
    } finally {
      setActiveDownloadId(null);
    }
  };

  const filteredPYQs = pyqs.filter(
    (pyq) =>
      (pyq.subject || pyq.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pyq.uploader_name || '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">PYQ Approval</h1>
            <p className="text-sm text-slate-500">
              Moderate Previous Year Question papers submitted by students
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject or author..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-violet-500 w-64"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-violet-500" />
                Pending PYQs ({filteredPYQs.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Subject & Title</th>
                    <th className="px-6 py-3 font-semibold">Exam Details</th>
                    <th className="px-6 py-3 font-semibold">Uploader</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
                          <div className="h-4 bg-slate-200 rounded w-full"></div>
                          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPYQs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <CheckCircle className="w-12 h-12 mb-3 text-emerald-200" />
                          <p className="text-lg font-medium text-slate-600">No Pending PYQs</p>
                          <p className="text-sm">
                            All previous year question papers have been reviewed.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPYQs.map((pyq) => (
                      <tr key={pyq.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mr-3 mt-1 shrink-0">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {pyq.subject || pyq.title}
                              </h3>
                              {pyq.title !== pyq.subject ? (
                                <p className="text-xs text-slate-500 mt-1 max-w-xs">{pyq.title}</p>
                              ) : null}
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                  {pyq.file_type || 'PDF'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">
                              Year: {pyq.exam_year || 'N/A'}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100">
                              {pyq.exam_type || 'Final'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-700">
                            {pyq.uploader_name || 'Anonymous'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                          {format(new Date(pyq.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => handlePreview(pyq)}
                              disabled={activePreviewId === pyq.id}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
                              title="Preview File"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <div className="w-px h-5 bg-slate-200 mx-1"></div>
                            <button
                              onClick={() => handleReject(pyq.id)}
                              disabled={actionLoading === pyq.id}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleApprove(pyq)}
                              disabled={actionLoading === pyq.id}
                              className="flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md font-medium text-sm transition-colors disabled:opacity-50 border border-emerald-200"
                              title="Approve & Grant 100 Coins"
                            >
                              {actionLoading === pyq.id ? (
                                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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

export default AdminPYQs;

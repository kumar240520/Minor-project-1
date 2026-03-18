import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Eye, FileCheck, Search, XCircle } from 'lucide-react';
import ResponsiveAdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import ResponsiveAdminHeader from '../../components/admin/ResponsiveAdminHeader';
import MaterialPreviewModal from '../../components/materials/MaterialPreviewModal';
import useMaterialPreview from '../../hooks/useMaterialPreview';
import { supabase } from '../../supabaseClient';
import {
  approveMaterialUpload,
  downloadMaterialFile,
  fetchPendingMaterials as fetchPendingMaterialSubmissions,
  rejectMaterialUpload,
} from '../../utils/materials';

// Better time formatting function
const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return format(date, 'MMM dd, yyyy');
    }
};

const APPROVAL_REWARD = 40;

const AdminMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeDownloadId, setActiveDownloadId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [prices, setPrices] = useState({}); // Track individual prices for each material row
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
    fetchPendingMaterials();
  }, []);

  const fetchPendingMaterials = async () => {
    setLoading(true);

    try {
      const data = await fetchPendingMaterialSubmissions({ type: 'material' });
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (material) => {
    if (!window.confirm(`Approve "${material.title || 'this material'}"?`)) return;

    setActionLoading(material.id);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const finalPrice = prices[material.id] || material.price || 5;

      await approveMaterialUpload({
        material: { ...material, price: finalPrice },
        adminUserId: user?.id || null,
      });

      setMaterials((prev) => prev.filter((item) => item.id !== material.id));
      if (previewMaterial?.id === material.id) {
        closePreview();
      }
    } catch (error) {
      console.error('Error approving material:', error);
      alert('Failed to approve the material.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (materialId) => {
    if (!window.confirm('Reject this material submission?')) return;

    setActionLoading(materialId);

    try {
      await rejectMaterialUpload(materialId);

      setMaterials((prev) => prev.filter((item) => item.id !== materialId));
      if (previewMaterial?.id === materialId) {
        closePreview();
      }
    } catch (error) {
      console.error('Error rejecting material:', error);
      alert('Failed to reject the material.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePreview = async (material) => {
    try {
      await openPreview(material);
    } catch (error) {
      console.error('Error previewing material:', error);
      alert(error.message || 'Failed to open the uploaded file preview.');
    }
  };

  const handleDownload = async (material) => {
    try {
      setActiveDownloadId(material.id);
      await downloadMaterialFile(material, { viewerRole: 'admin' });
    } catch (error) {
      console.error('Error downloading material:', error);
      alert('Failed to open the uploaded file.');
    } finally {
      setActiveDownloadId(null);
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const query = searchTerm.toLowerCase();
    return (
      (material.title || '').toLowerCase().includes(query) ||
      (material.subject || '').toLowerCase().includes(query) ||
      (material.uploader_name || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <ResponsiveAdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 xl:ml-72 overflow-hidden">
        <ResponsiveAdminHeader 
          title="Materials Approval" 
          subtitle="Review and approve study material submissions from students"
          onMobileMenuToggle={() => {}}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            {/* Search and Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-800 flex items-center mb-2">
                    <FileCheck className="w-5 h-5 mr-2 text-violet-500" />
                    Pending Materials ({filteredMaterials.length})
                  </h2>
                  <span className="text-xs text-slate-500">
                    Approval reward: {APPROVAL_REWARD} Edu Coins
                  </span>
                </div>
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search title, subject, or uploader..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-violet-500 w-full lg:w-72"
                  />
                </div>
              </div>
            </div>

            {/* Materials Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Material</th>
                      <th className="px-6 py-3 font-semibold">Category</th>
                      <th className="px-6 py-3 font-semibold">Uploader</th>
                      <th className="px-6 py-3 font-semibold">Submitted</th>
                      <th className="px-6 py-3 font-semibold">Set Price</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        Loading pending materials...
                      </td>
                    </tr>
                  ) : filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        No non-PYQ material submissions are waiting for review.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((material) => (
                      <tr key={material.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {material.title || 'Untitled material'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {material.subject || material.description || 'No additional details'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">
                            {material.category || material.material_type || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4">{material.uploader_name || 'Anonymous'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          {formatTimeAgo(material.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Set Coins</span>
                            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 w-28 group-focus-within:ring-2 group-focus-within:ring-violet-500 transition-all">
                              <span className="text-amber-500 font-bold text-xs shrink-0">🪙</span>
                              <input 
                                type="number"
                                min="0"
                                max="1000"
                                value={prices[material.id] ?? material.price ?? 5}
                                onChange={(e) => setPrices(prev => ({ ...prev, [material.id]: parseInt(e.target.value) || 0 }))}
                                className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0 w-full"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            {material.file_url ? (
                              <button
                                type="button"
                                onClick={() => handlePreview(material)}
                                disabled={activePreviewId === material.id}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
                                title="Preview file"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleReject(material.id)}
                              disabled={actionLoading === material.id}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleApprove(material)}
                              disabled={actionLoading === material.id}
                              className="flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md font-medium text-sm transition-colors disabled:opacity-50 border border-emerald-200"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
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
    </div>
  );
};

export default AdminMaterials;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatLocalRelativeTime } from '../../utils/auth';
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle,
  Eye,
  FileCheck,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import ResponsiveAdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import ResponsiveAdminHeader from '../../components/admin/ResponsiveAdminHeader';
import MaterialPreviewModal from '../../components/materials/MaterialPreviewModal';
import useMaterialPreview from '../../hooks/useMaterialPreview';
import { supabase } from '../../supabaseClient';
import {
  approveMaterialUpload,
  downloadMaterialFile,
  fetchPendingMaterials,
  getMaterialApprovalReward,
  getMaterialType,
  rejectMaterialUpload,
} from '../../utils/materials';

const FILTERS = [
  { value: 'all', label: 'All Pending' },
  { value: 'material', label: 'Materials' },
  { value: 'pyq', label: 'PYQs' },
];

const getTypeBadgeClasses = (type) =>
  type === 'pyq'
    ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

const AdminApprovals = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [activeDownloadId, setActiveDownloadId] = useState(null);
  const [feedback, setFeedback] = useState(null);
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
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async ({ quiet = false } = {}) => {
    if (quiet) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await fetchPendingMaterials();
      setPendingItems(data);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
      setFeedback({
        type: 'error',
        message: error.message || 'Failed to load the pending approval queue.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const pendingMaterialsCount = pendingItems.filter(
    (item) => getMaterialType(item) === 'material',
  ).length;
  const pendingPyqsCount = pendingItems.filter((item) => getMaterialType(item) === 'pyq').length;

  const filteredItems = pendingItems.filter((item) => {
    const itemType = getMaterialType(item);
    const query = searchTerm.trim().toLowerCase();

    if (activeFilter !== 'all' && itemType !== activeFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      item.title,
      item.subject,
      item.description,
      item.category,
      item.material_type,
      item.uploader_name,
      item.exam_year,
      item.exam_type,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const handleApprove = async (item) => {
    const itemType = getMaterialType(item);
    const itemLabel = item.title || item.subject || 'this submission';

    if (!window.confirm(`Approve "${itemLabel}"?`)) {
      return;
    }

    setActionLoading(item.id);
    setFeedback(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { rewardAmount } = await approveMaterialUpload({
        material: item,
        adminUserId: user?.id || null,
      });

      setPendingItems((currentItems) => currentItems.filter((entry) => entry.id !== item.id));
      if (previewMaterial?.id === item.id) {
        closePreview();
      }
      setFeedback({
        type: 'success',
        message: `${itemType === 'pyq' ? 'PYQ' : 'Material'} approved. ${
          rewardAmount ? `${rewardAmount} Edu Coins were added for the uploader.` : ''
        }`.trim(),
      });
    } catch (error) {
      console.error('Error approving pending item:', error);
      setFeedback({
        type: 'error',
        message: error.message || 'Failed to approve this submission.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (item) => {
    const itemLabel = item.title || item.subject || 'this submission';

    if (!window.confirm(`Reject "${itemLabel}"?`)) {
      return;
    }

    setActionLoading(item.id);
    setFeedback(null);

    try {
      await rejectMaterialUpload(item.id);
      setPendingItems((currentItems) => currentItems.filter((entry) => entry.id !== item.id));
      if (previewMaterial?.id === item.id) {
        closePreview();
      }
      setFeedback({
        type: 'success',
        message: 'The submission was rejected and removed from the pending queue.',
      });
    } catch (error) {
      console.error('Error rejecting pending item:', error);
      setFeedback({
        type: 'error',
        message: error.message || 'Failed to reject this submission.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePreview = async (item) => {
    try {
      setFeedback(null);
      await openPreview(item);
    } catch (error) {
      console.error('Error previewing pending item:', error);
      setFeedback({
        type: 'error',
        message: error.message || 'Unable to preview this file right now.',
      });
    }
  };

  const handleDownload = async (item) => {
    try {
      setActiveDownloadId(item.id);
      await downloadMaterialFile(item, { viewerRole: 'admin' });
    } catch (error) {
      console.error('Error downloading pending item:', error);
      setFeedback({
        type: 'error',
        message: error.message || 'Unable to open this file right now.',
      });
    } finally {
      setActiveDownloadId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <ResponsiveAdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 xl:ml-72 overflow-hidden">
        <ResponsiveAdminHeader 
          title="Pending Approvals" 
          subtitle="Review new materials and PYQs before they become visible to students"
          onMobileMenuToggle={() => {}}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-sm font-medium text-slate-500">Total Pending</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{pendingItems.length}</p>
              <p className="text-sm text-slate-500 mt-3">
                Everything currently waiting for moderation.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-sm font-medium text-slate-500">Pending Materials</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{pendingMaterialsCount}</p>
              <p className="text-sm text-slate-500 mt-3">
                Notes, assignments, and placement resources waiting for approval.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-sm font-medium text-slate-500">Pending PYQs</p>
              <p className="text-3xl font-bold text-fuchsia-600 mt-2">{pendingPyqsCount}</p>
              <p className="text-sm text-slate-500 mt-3">
                Previous-year question papers waiting to be published.
              </p>
            </div>
          </section>

          {feedback ? (
            <div
              className={`rounded-2xl border px-5 py-4 text-sm ${
                feedback.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Moderation Queue</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Open a file, approve it, or reject it without leaving the queue.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search title, subject, uploader..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full sm:w-72 pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setActiveFilter(filter.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeFilter === filter.value
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="py-16 text-center text-slate-500">Loading pending approvals...</div>
              ) : filteredItems.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">Queue is clear</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    There are no pending items for the current filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {filteredItems.map((item) => {
                    const itemType = getMaterialType(item);
                    const reward = getMaterialApprovalReward(item);
                    const isActionBusy = actionLoading === item.id;
                    const isPreviewing = activePreviewId === item.id;
                    const title = item.title || item.subject || 'Untitled submission';
                    const uploader = item.uploader_name || 'Anonymous Student';
                    const submittedAt = item.created_at
                      ? formatLocalRelativeTime(item.created_at)
                      : 'Unknown date';

                    return (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                itemType === 'pyq'
                                  ? 'bg-fuchsia-100 text-fuchsia-600'
                                  : 'bg-emerald-100 text-emerald-600'
                              }`}
                            >
                              {itemType === 'pyq' ? (
                                <BookOpenCheck className="w-5 h-5" />
                              ) : (
                                <FileCheck className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getTypeBadgeClasses(
                                    itemType,
                                  )}`}
                                >
                                  {itemType === 'pyq' ? 'PYQ' : 'Material'}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-xs font-semibold text-amber-700">
                                  Reward: {reward} coins
                                </span>
                              </div>
                              <h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
                              <p className="mt-1 text-sm text-slate-500">
                                Uploaded by {uploader} • {submittedAt}
                              </p>
                            </div>
                          </div>

                          <Link
                            to={
                              itemType === 'pyq'
                                ? '/admin-dashboard/pyqs'
                                : '/admin-dashboard/materials'
                            }
                            className="text-sm font-medium text-violet-600 hover:text-violet-700"
                          >
                            Open dedicated page
                          </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Subject</p>
                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {item.subject || 'Not provided'}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Category</p>
                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {item.category ||
                                item.material_type ||
                                (itemType === 'pyq' ? 'PYQ' : 'General')}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">File</p>
                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {item.file_type || item.file_name || 'Uploaded document'}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">
                              Year of Study
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {item.year || 'Not specified'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Description
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {item.description || 'No extra notes were added by the uploader.'}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handlePreview(item)}
                            disabled={!item.file_url || isPreviewing}
                            className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {isPreviewing ? 'Opening...' : 'Preview'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(item)}
                            disabled={isActionBusy}
                            className="inline-flex items-center px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(item)}
                            disabled={isActionBusy}
                            className="inline-flex items-center px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {isActionBusy ? 'Saving...' : 'Approve'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p>
                Pending items stay hidden from student-facing pages until an admin approves them.
                Approval also triggers the uploader reward transaction.
              </p>
            </div>
          </section>
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

export default AdminApprovals;

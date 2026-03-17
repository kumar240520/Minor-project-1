import { useEffect, useState } from 'react';
import { AlertOctagon, Clock3, FileWarning, ShieldAlert } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { supabase } from '../../supabaseClient';
import { fetchPendingMaterials } from '../../utils/materials';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [reportStats, setReportStats] = useState({
    pendingMaterials: 0,
    rejectedMaterials: 0,
    pendingPyqs: 0,
    flaggedSummary: [],
  });

  useEffect(() => {
    fetchReportSnapshot();
  }, []);

  const fetchReportSnapshot = async () => {
    setLoading(true);

    try {
      const [pendingMaterialsList, { count: rejectedMaterials }, pendingPyqsList] =
        await Promise.all([
          fetchPendingMaterials({ type: 'material' }),
          supabase.from('materials').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
          fetchPendingMaterials({ type: 'pyq' }),
        ]);
      const pendingMaterials = pendingMaterialsList.length;
      const pendingPyqs = pendingPyqsList.length;

      setReportStats({
        pendingMaterials: pendingMaterials || 0,
        rejectedMaterials: rejectedMaterials || 0,
        pendingPyqs: pendingPyqs || 0,
        flaggedSummary: [
          {
            id: 'pending-materials',
            title: 'Pending content queue',
            detail: `${pendingMaterials || 0} uploads still need moderator review.`,
          },
          {
            id: 'pending-pyqs',
            title: 'PYQ moderation queue',
            detail: `${pendingPyqs || 0} previous-year papers are waiting for approval.`,
          },
          {
            id: 'rejected-materials',
            title: 'Rejected submissions',
            detail: `${rejectedMaterials || 0} items are currently marked as rejected.`,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching report snapshot:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Reports and Moderation</h1>
          <p className="text-sm text-slate-500 mt-1">
            A moderation snapshot based on the current platform content state
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <Clock3 className="w-6 h-6 text-amber-500 mb-4" />
            <p className="text-sm text-slate-500">Pending materials</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {loading ? '...' : reportStats.pendingMaterials}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <AlertOctagon className="w-6 h-6 text-violet-500 mb-4" />
            <p className="text-sm text-slate-500">Pending PYQs</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {loading ? '...' : reportStats.pendingPyqs}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <FileWarning className="w-6 h-6 text-rose-500 mb-4" />
            <p className="text-sm text-slate-500">Rejected submissions</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {loading ? '...' : reportStats.rejectedMaterials}
            </p>
          </div>
        </div>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-slate-500" />
              Moderation Snapshot
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {loading ? (
              <p className="text-slate-500">Loading moderation snapshot...</p>
            ) : (
              reportStats.flaggedSummary.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.detail}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminReports;

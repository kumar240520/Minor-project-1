import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar, { SidebarProvider } from '../components/Sidebar';
import ResponsiveHeader from '../components/ResponsiveHeader';
import MaterialCard from '../components/materials/MaterialCard';
import MaterialPreviewModal from '../components/materials/MaterialPreviewModal';
import useMaterialPreview from '../hooks/useMaterialPreview';
import { downloadMaterialFile, fetchApprovedMaterials } from '../utils/materials';

const PlacementMaterials = () => {
  const [materials, setMaterials] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeDownloadId, setActiveDownloadId] = React.useState(null);
  const {
    activePreviewId,
    closePreview,
    error: previewError,
    isOpen: isPreviewOpen,
    material: previewMaterial,
    openPreview,
    previewKind,
    previewUrl,
  } = useMaterialPreview();

  React.useEffect(() => {
    const loadMaterials = async () => {
      try {
        const approvedMaterials = await fetchApprovedMaterials('material');
        setMaterials(approvedMaterials);
      } catch (error) {
        console.error('Error fetching approved materials:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, []);

  const handlePreview = async (material) => {
    try {
      await openPreview(material);
    } catch (error) {
      console.error('Error previewing material:', error);
    }
  };

  const handleDownload = async (material) => {
    try {
      setActiveDownloadId(material.id);
      console.log('[PlacementMaterials] Starting download for material:', material.id, material.title);
      console.log('[PlacementMaterials] Current download count:', material.downloads);
      
      await downloadMaterialFile(material, { viewerRole: 'student' });
      
      console.log('[PlacementMaterials] Download API call successful');
      
      // Update download count locally after successful download
      setMaterials(prevMaterials => {
        console.log('[PlacementMaterials] Updating materials state...');
        const updated = prevMaterials.map(m => {
          if (m.id === material.id) {
            const newCount = (m.downloads || 0) + 1;
            console.log('[PlacementMaterials] Updating material', material.id, 'downloads from', m.downloads, 'to', newCount);
            return { ...m, downloads: newCount };
          }
          return m;
        });
        return updated;
      });
    } catch (error) {
      console.error('[PlacementMaterials] Error downloading material:', error);
      alert(error.message || 'Unable to download this file.');
    } finally {
      setActiveDownloadId(null);
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      material.title,
      material.subject,
      material.category,
      material.description,
      material.uploader_name,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />

        <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
          <ResponsiveHeader 
            title="Placement Materials"
            showSearch={true}
            showNotifications={true}
            showProfile={true}
            onSearch={setSearchTerm}
          />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between"
            >
              <div className="relative z-10 mb-6 sm:mb-0">
                <h2 className="text-2xl font-bold mb-2">Community Approved Study Files</h2>
                <p className="text-teal-100 max-w-lg">
                  Browse admin-approved notes, assignments, and career resources shared by students
                  across the platform.
                </p>
              </div>
              <Link
                to="/upload"
                className="bg-white text-teal-900 font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all whitespace-nowrap flex items-center z-10"
              >
                <Upload className="h-5 w-5 mr-2" /> Upload Material
              </Link>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            </motion.div>

            {previewError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {previewError}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  Loading study materials...
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  {materials.length === 0
                    ? 'No approved materials found yet. Be the first to upload!'
                    : 'No approved materials matched your search.'}
                </div>
              ) : (
                filteredMaterials.map((material, index) => (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.08 }}
                  >
                    <MaterialCard
                      material={material}
                      onPreview={handlePreview}
                      onDownload={handleDownload}
                      previewing={activePreviewId === material.id}
                      downloading={activeDownloadId === material.id}
                    />
                  </motion.div>
                ))
              )}
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
    </SidebarProvider>
  );
};

export default PlacementMaterials;

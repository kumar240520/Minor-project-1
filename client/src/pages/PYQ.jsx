import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Filter, Search, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ResponsiveHeader from '../components/ResponsiveHeader';
import MaterialCard from '../components/materials/MaterialCard';
import MaterialPreviewModal from '../components/materials/MaterialPreviewModal';
import useMaterialPreview from '../hooks/useMaterialPreview';
import { downloadMaterialFile, fetchApprovedPyqs } from '../utils/materials';

const PYQ = () => {
  const [pyqs, setPyqs] = React.useState([]);
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
    const loadPyqs = async () => {
      try {
        const approvedPyqs = await fetchApprovedPyqs();
        setPyqs(approvedPyqs);
      } catch (error) {
        console.error('Error fetching PYQs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPyqs();
  }, []);

  const handlePreview = async (material) => {
    try {
      await openPreview(material);
    } catch (error) {
      console.error('Error previewing PYQ:', error);
    }
  };

  const handleDownload = async (material) => {
    try {
      setActiveDownloadId(material.id);
      await downloadMaterialFile(material, { viewerRole: 'student' });
    } catch (error) {
      console.error('Error downloading PYQ:', error);
      alert('Unable to open this PYQ right now.');
    } finally {
      setActiveDownloadId(null);
    }
  };

  const filteredPyqs = pyqs.filter((material) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      material.title,
      material.subject,
      material.category,
      material.uploader_name,
      material.exam_type,
      material.exam_year,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-60 overflow-hidden">
          <ResponsiveHeader 
            title="PYQs Collection"
            showSearch={true}
            showNotifications={true}
            showProfile={true}
            onSearch={setSearchTerm}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                <button className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium shadow-sm whitespace-nowrap">
                  All Subjects
                </button>
                <button className="px-4 py-2 bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium whitespace-nowrap">
                  CS Core
                </button>
                <button className="px-4 py-2 bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium whitespace-nowrap">
                  Mathematics
                </button>
                <button className="px-4 py-2 bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium whitespace-nowrap">
                  <Filter className="h-4 w-4 inline mr-2" />
                  More Filters
                </button>
              </div>
              <Link
                to="/upload"
                className="flex items-center px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto justify-center"
              >
                <Upload className="h-4 w-4 mr-2" /> Upload PYQ
              </Link>
            </div>

            {previewError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {previewError}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  Loading PYQs...
                </div>
              ) : filteredPyqs.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  {pyqs.length === 0
                    ? 'No PYQs found. Be the first to upload!'
                    : 'No approved PYQs matched your search.'}
                </div>
              ) : (
                filteredPyqs.map((pyq, index) => (
                  <motion.div
                    key={pyq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.08 }}
                  >
                    <MaterialCard
                      material={pyq}
                      onPreview={handlePreview}
                      onDownload={handleDownload}
                      previewing={activePreviewId === pyq.id}
                      downloading={activeDownloadId === pyq.id}
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
  );
};

export default PYQ;

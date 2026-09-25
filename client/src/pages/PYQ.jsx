import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Upload, SlidersHorizontal } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import MaterialCard from '../components/materials/MaterialCard';
import MaterialPreviewModal from '../components/materials/MaterialPreviewModal';
import FilterPopup from '../components/materials/FilterPopup';
import useMaterialPreview from '../hooks/useMaterialPreview';
import { downloadMaterialFile, fetchApprovedPyqs } from '../utils/materials';

// ─── Quick filter pills shown above the grid ───────────────────────────────
const QUICK_SUBJECTS = ['All Subjects', 'CS Core', 'Mathematics', 'Electronics', 'Physics', 'English'];

// ─── Default filter state ──────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  subject: '',
  examTypes: [],
  years: [],
  sortBy: 'newest',
};

const PYQ = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || searchParams.get('q') || '';

  const [pyqs, setPyqs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState(initialQuery);
  const [activeDownloadId, setActiveDownloadId] = React.useState(null);

  // ─── Filter state ────────────────────────────────────────────────────────
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [quickSubject, setQuickSubject] = React.useState('All Subjects');
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);
  // Pending state inside popup (committed on Apply)
  const [pendingFilters, setPendingFilters] = React.useState(DEFAULT_FILTERS);

  React.useEffect(() => {
    const q = searchParams.get('search') || searchParams.get('q') || '';
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const {
    activePreviewId, closePreview,
    error: previewError, isOpen: isPreviewOpen,
    material: previewMaterial, openPreview,
    previewKind, previewUrl,
  } = useMaterialPreview();

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApprovedPyqs();
        setPyqs(data);
      } catch (err) {
        console.error('Error fetching PYQs:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ─── Derived unique values for filter options ────────────────────────────
  const uniqueSubjects = React.useMemo(() => {
    const s = new Set(pyqs.map((p) => p.subject).filter(Boolean));
    return [...s].sort();
  }, [pyqs]);

  const uniqueExamTypes = React.useMemo(() => {
    const s = new Set(pyqs.map((p) => p.exam_type).filter(Boolean));
    return [...s].sort();
  }, [pyqs]);

  const uniqueYears = React.useMemo(() => {
    const s = new Set(pyqs.map((p) => String(p.exam_year)).filter((y) => y && y !== 'undefined'));
    return [...s].sort((a, b) => b - a);
  }, [pyqs]);

  // ─── Count active (non-default) popup filters ────────────────────────────
  const activeFilterCount = React.useMemo(() => {
    let n = 0;
    if (filters.subject) n++;
    if (filters.examTypes.length) n++;
    if (filters.years.length) n++;
    if (filters.sortBy !== 'newest') n++;
    return n;
  }, [filters]);

  // ─── Apply all filters + sorting ─────────────────────────────────────────
  const filteredPyqs = React.useMemo(() => {
    const idParam = searchParams.get('id');
    let list = pyqs;

    // ID direct filter
    if (idParam) return list.filter((m) => String(m.id) === String(idParam));

    // Search term
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((m) =>
        [m.title, m.subject, m.category, m.uploader_name, m.exam_type, m.exam_year]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    // Quick pill subject
    if (quickSubject !== 'All Subjects') {
      list = list.filter((m) =>
        (m.subject || '').toLowerCase().includes(quickSubject.toLowerCase())
      );
    }

    // Popup: subject
    if (filters.subject) {
      list = list.filter((m) =>
        (m.subject || '').toLowerCase().includes(filters.subject.toLowerCase())
      );
    }

    // Popup: exam types (multi)
    if (filters.examTypes.length > 0) {
      list = list.filter((m) => filters.examTypes.includes(m.exam_type));
    }

    // Popup: years (multi)
    if (filters.years.length > 0) {
      list = list.filter((m) => filters.years.includes(String(m.exam_year)));
    }

    // Sorting
    list = [...list].sort((a, b) => {
      if (filters.sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (filters.sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
      return new Date(b.created_at) - new Date(a.created_at); // newest (default)
    });

    return list;
  }, [pyqs, searchTerm, searchParams, quickSubject, filters]);

  // ─── Popup config ─────────────────────────────────────────────────────────
  const filterSections = React.useMemo(() => {
    const sections = [];
    if (uniqueSubjects.length > 0) {
      sections.push({
        key: 'subject',
        label: 'Subject',
        type: 'single',
        options: uniqueSubjects.map((s) => ({ value: s, label: s })),
      });
    }
    if (uniqueExamTypes.length > 0) {
      sections.push({
        key: 'examTypes',
        label: 'Exam Type',
        type: 'multi',
        options: uniqueExamTypes.map((t) => ({ value: t, label: t })),
      });
    }
    if (uniqueYears.length > 0) {
      sections.push({
        key: 'years',
        label: 'Year',
        type: 'multi',
        options: uniqueYears.map((y) => ({ value: y, label: y })),
      });
    }
    sections.push({
      key: 'sortBy',
      label: 'Sort By',
      type: 'sort',
      options: [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'downloads', label: 'Most Downloaded' },
      ],
    });
    return sections;
  }, [uniqueSubjects, uniqueExamTypes, uniqueYears]);

  const handleOpenFilter = () => {
    setPendingFilters(filters); // sync pending from committed
    setFilterOpen(true);
  };

  const handleApplyFilters = () => {
    setFilters(pendingFilters);
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setPendingFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setQuickSubject('All Subjects');
  };

  const handlePreview = async (material) => {
    try { await openPreview(material); }
    catch (err) { console.error('Error previewing PYQ:', err); }
  };

  const handleDownload = async (material) => {
    try {
      setActiveDownloadId(material.id);
      await downloadMaterialFile(material, { viewerRole: 'student' });
    } catch (err) {
      console.error('Error downloading PYQ:', err);
      alert('Unable to open this PYQ right now.');
    } finally {
      setActiveDownloadId(null);
    }
  };

  return (
    <Layout
      title="PYQs Collection"
      showSearch={true}
      showNotifications={true}
      showProfile={true}
      onSearch={setSearchTerm}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Filtered Resource Banner */}
        {searchParams.get('id') && filteredPyqs.length > 0 && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-sm shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">PYQ</div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Showing filtered PYQ: {filteredPyqs[0]?.title}</p>
                <p className="text-xs text-slate-500">Subject: {filteredPyqs[0]?.subject || 'N/A'} • Click Download on the card below.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setSearchParams({}); setSearchTerm(''); }}
              className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Show All PYQs
            </button>
          </div>
        )}

        {/* ── Filter Bar ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Quick subject pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {QUICK_SUBJECTS.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setQuickSubject(sub)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  quickSubject === sub
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900/40'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30'
                }`}
              >
                {sub}
              </button>
            ))}

            {/* More Filters button */}
            <button
              type="button"
              onClick={handleOpenFilter}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer whitespace-nowrap ${
                activeFilterCount > 0
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              More Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/25 text-[11px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Active filter count badge */}
            {(activeFilterCount > 0 || quickSubject !== 'All Subjects') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Upload button */}
          <Link
            to="/upload"
            className="flex items-center px-5 py-2.5 bg-slate-900 dark:bg-violet-600 dark:hover:bg-violet-500 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Upload className="h-4 w-4 mr-2" /> Upload PYQ
          </Link>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-700 dark:text-slate-200">{filteredPyqs.length}</span>{' '}
            of {pyqs.length} papers
          </p>
        )}

        {previewError && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-5 py-4 text-sm text-red-700 dark:text-red-300">
            {previewError}
          </div>
        )}

        {/* ── Grid ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-500">
              Loading PYQs...
            </div>
          ) : filteredPyqs.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center mx-auto mb-4">
                <Filter className="w-7 h-7 text-violet-400" />
              </div>
              <p className="text-slate-700 dark:text-slate-200 font-semibold text-lg">No PYQs found</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {pyqs.length === 0 ? 'Be the first to upload!' : 'Try adjusting your filters or search term.'}
              </p>
              {(activeFilterCount > 0 || quickSubject !== 'All Subjects') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 px-5 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredPyqs.map((pyq, index) => (
              <motion.div
                key={pyq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + index * 0.06 }}
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

      {/* ── Filter Popup ────────────────────────────────────────────────── */}
      <FilterPopup
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filterSections}
        values={pendingFilters}
        onChange={(key, val) => setPendingFilters((prev) => ({ ...prev, [key]: val }))}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        activeCount={activeFilterCount}
      />

      <MaterialPreviewModal
        isOpen={isPreviewOpen}
        material={previewMaterial}
        previewKind={previewKind}
        previewUrl={previewUrl}
        onClose={closePreview}
        onDownload={handleDownload}
        isDownloading={activeDownloadId === previewMaterial?.id}
      />
    </Layout>
  );
};

export default PYQ;

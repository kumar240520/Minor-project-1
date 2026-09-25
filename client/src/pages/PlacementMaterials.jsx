import React from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Upload } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import MaterialCard from "../components/materials/MaterialCard";
import MaterialPreviewModal from "../components/materials/MaterialPreviewModal";
import FilterPopup from "../components/materials/FilterPopup";
import useMaterialPreview from "../hooks/useMaterialPreview";
import { downloadMaterialFile, fetchApprovedMaterials } from "../utils/materials";

const QUICK_CATEGORIES = ["All Types", "Notes", "Assignment", "Question Bank", "Roadmap", "Video"];

const DEFAULT_FILTERS = {
  subject: "",
  categories: [],
  sortBy: "newest",
};

const PlacementMaterials = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("search") || searchParams.get("q") || "";

  const [materials, setMaterials] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState(initialQuery);
  const [activeDownloadId, setActiveDownloadId] = React.useState(null);

  const [filterOpen, setFilterOpen] = React.useState(false);
  const [quickCategory, setQuickCategory] = React.useState("All Types");
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = React.useState(DEFAULT_FILTERS);

  React.useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q") || "";
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
        const data = await fetchApprovedMaterials("material");
        setMaterials(data);
      } catch (err) {
        console.error("Error fetching approved materials:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const uniqueSubjects = React.useMemo(() => {
    const s = new Set(materials.map((m) => m.subject).filter(Boolean));
    return [...s].sort();
  }, [materials]);

  const uniqueCategories = React.useMemo(() => {
    const s = new Set(materials.map((m) => m.category || m.material_type).filter(Boolean));
    return [...s].sort();
  }, [materials]);

  const activeFilterCount = React.useMemo(() => {
    let n = 0;
    if (filters.subject) n++;
    if (filters.categories.length) n++;
    if (filters.sortBy !== "newest") n++;
    return n;
  }, [filters]);

  const filteredMaterials = React.useMemo(() => {
    const idParam = searchParams.get("id");
    let list = materials;

    if (idParam) return list.filter((m) => String(m.id) === String(idParam));

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((m) =>
        [m.title, m.subject, m.category, m.description, m.uploader_name]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    if (quickCategory !== "All Types") {
      list = list.filter((m) => {
        const cat = (m.category || m.material_type || "").toLowerCase();
        return cat.includes(quickCategory.toLowerCase());
      });
    }

    if (filters.subject) {
      list = list.filter((m) =>
        (m.subject || "").toLowerCase().includes(filters.subject.toLowerCase())
      );
    }

    if (filters.categories.length > 0) {
      list = list.filter((m) =>
        filters.categories.includes(m.category || m.material_type)
      );
    }

    list = [...list].sort((a, b) => {
      if (filters.sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (filters.sortBy === "downloads") return (b.downloads || 0) - (a.downloads || 0);
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return list;
  }, [materials, searchTerm, searchParams, quickCategory, filters]);

  const filterSections = React.useMemo(() => {
    const sections = [];
    if (uniqueSubjects.length > 0) {
      sections.push({
        key: "subject",
        label: "Subject",
        type: "single",
        options: uniqueSubjects.map((s) => ({ value: s, label: s })),
      });
    }
    if (uniqueCategories.length > 0) {
      sections.push({
        key: "categories",
        label: "Category / Type",
        type: "multi",
        options: uniqueCategories.map((c) => ({ value: c, label: c })),
      });
    }
    sections.push({
      key: "sortBy",
      label: "Sort By",
      type: "sort",
      options: [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
        { value: "downloads", label: "Most Downloaded" },
      ],
    });
    return sections;
  }, [uniqueSubjects, uniqueCategories]);

  const handleOpenFilter = () => {
    setPendingFilters(filters);
    setFilterOpen(true);
  };

  const handleApplyFilters = () => {
    setFilters(pendingFilters);
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setPendingFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setQuickCategory("All Types");
  };

  const handlePreview = async (material) => {
    try { await openPreview(material); }
    catch (err) { console.error("Error previewing material:", err); }
  };

  const handleDownload = async (material) => {
    try {
      setActiveDownloadId(material.id);
      await downloadMaterialFile(material, { viewerRole: "student" });
      setMaterials((prev) =>
        prev.map((m) => m.id === material.id ? { ...m, downloads: (m.downloads || 0) + 1 } : m)
      );
    } catch (err) {
      console.error("Error downloading material:", err);
      alert(err.message || "Unable to download this file.");
    } finally {
      setActiveDownloadId(null);
    }
  };

  return (
    <Layout
      title="Placement Materials"
      showSearch={true}
      showNotifications={true}
      showProfile={true}
      onSearch={setSearchTerm}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Filtered Resource Banner */}
        {searchParams.get("id") && filteredMaterials.length > 0 && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">NOTES</div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Showing filtered resource: {filteredMaterials[0]?.title}</p>
                <p className="text-xs text-slate-500">Subject: {filteredMaterials[0]?.subject || "N/A"} • Click Download on the card below.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setSearchParams({}); setSearchTerm(""); }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Show All Materials
            </button>
          </div>
        )}

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between"
        >
          <div className="relative z-10 mb-6 sm:mb-0">
            <h2 className="text-2xl font-bold mb-2">Community Approved Study Files</h2>
            <p className="text-teal-100 max-w-lg">
              Browse admin-approved notes, assignments, and career resources shared by students across the platform.
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

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setQuickCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  quickCategory === cat
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              type="button"
              onClick={handleOpenFilter}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer whitespace-nowrap ${
                activeFilterCount > 0
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
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

            {(activeFilterCount > 0 || quickCategory !== "All Types") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-700 dark:text-slate-200">{filteredMaterials.length}</span>{" "}
            of {materials.length} resources
          </p>
        )}

        {previewError && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-5 py-4 text-sm text-red-700 dark:text-red-300">
            {previewError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-500">
              Loading study materials...
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-slate-700 dark:text-slate-200 font-semibold text-lg">No materials found</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {materials.length === 0 ? "Be the first to upload!" : "Try adjusting your filters or search term."}
              </p>
              {(activeFilterCount > 0 || quickCategory !== "All Types") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + index * 0.06 }}
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

      {/* Filter Popup (emerald themed via CSS override inside popup) */}
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

export default PlacementMaterials;

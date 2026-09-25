import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  FileUp,
  Sparkles,
  Info,
  Check,
  Coins,
  FileArchive,
  RefreshCw,
  BookOpen,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';
import { createMaterialUpload } from '../utils/materials';
import {
  DashboardCard,
  DashboardButton,
  DashboardBadge,
} from '../components/dashboard';

// Quick subject suggestions
const POPULAR_SUBJECTS = [
  'DBMS',
  'Operating Systems',
  'Data Structures',
  'Computer Networks',
  'Software Eng.',
  'Mathematics III'
];

// Visual category tabs
const CATEGORY_TABS = [
  {
    id: 'PYQ',
    label: 'Previous Year Question',
    shortLabel: 'PYQ',
    icon: FileText,
    desc: 'Exams & mid-terms',
    badge: 'Popular',
  },
  {
    id: 'Notes',
    label: 'Class Notes',
    shortLabel: 'Notes',
    icon: BookOpen,
    desc: 'Lecture summaries',
    badge: 'High Demand',
  },
  {
    id: 'Assignment',
    label: 'Assignment Solution',
    shortLabel: 'Assignment',
    icon: Layers,
    desc: 'Verified lab/home works',
    badge: null,
  },
  {
    id: 'Placement',
    label: 'Placement Prep',
    shortLabel: 'Placement',
    icon: Briefcase,
    desc: 'Interviews & coding',
    badge: '+25 Coins',
  },
];

const PLACEMENT_SUBCATEGORIES = [
  { id: 'Placement_Coding', label: 'Coding Practice' },
  { id: 'Placement_Interview', label: 'Interview Questions' },
  { id: 'Placement_Core', label: 'Core CS Concepts' },
  { id: 'Placement_Aptitude', label: 'Aptitude & Reasoning' },
];

const YEAR_OPTIONS = [
  { value: '1st Year', label: '1st Year', sem: 'Sem 1-2' },
  { value: '2nd Year', label: '2nd Year', sem: 'Sem 3-4' },
  { value: '3rd Year', label: '3rd Year', sem: 'Sem 5-6' },
  { value: '4th Year', label: '4th Year', sem: 'Sem 7-8' },
  { value: 'Not Applicable', label: 'All Semesters', sem: 'General' },
];

const Upload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMainCat, setSelectedMainCat] = useState('PYQ');
  const [placementSubcat, setPlacementSubcat] = useState('Placement_Coding');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadMessage, setUploadMessage] = useState('');

  const fileInputRef = useRef(null);

  // Compute final category string for database
  const finalCategory = selectedMainCat === 'Placement' ? placementSubcat : selectedMainCat;

  // Completion calculation
  const hasFile = !!file;
  const hasTitle = title.trim().length > 0;
  const hasSubject = subject.trim().length > 0;

  const completedCount = (hasFile ? 1 : 0) + (hasTitle ? 1 : 0) + (hasSubject ? 1 : 0);
  const completionPercentage = Math.round((completedCount / 3) * 100);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileExtensionInfo = (fileName = '') => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return { label: 'PDF', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50' };
    }
    if (['doc', 'docx'].includes(ext)) {
      return { label: 'DOCX', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' };
    }
    if (['ppt', 'pptx'].includes(ext)) {
      return { label: 'PPTX', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' };
    }
    if (['zip', 'rar', '7z'].includes(ext)) {
      return { label: 'ZIP', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50' };
    }
    return { label: ext?.toUpperCase() || 'FILE', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim() || !subject.trim()) {
      setUploadStatus('error');
      setUploadMessage('Please attach a document and fill in Title and Subject.');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUploadStatus('error');
        setUploadMessage('You must be logged in to upload files.');
        return;
      }

      await createMaterialUpload({
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim(),
        category: finalCategory,
        year,
        file,
        user,
      });

      setUploadStatus('success');
      setUploadMessage('Your resource has been submitted and queued for peer verification. +25 Coins will be awarded upon approval!');

      setTimeout(() => {
        setTitle('');
        setDescription('');
        setSelectedMainCat('PYQ');
        setPlacementSubcat('Placement_Coding');
        setSubject('');
        setYear('');
        setFile(null);
        setUploadStatus('idle');
        setUploadMessage('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 4000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage(error.message || 'The file upload failed. Please verify format and try again.');
    }
  };

  return (
    <Layout
      title="Upload Resource"
      subtitle="Share verified semester notes, PYQs, and placement preparation resources"
      showSearch={false}
    >
      <div className="max-w-[1600px] mx-auto space-y-5">

        {/* Compact Single-Page Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#2563EB] text-white p-4 sm:p-5 shadow-sm">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-blue-200 border border-white/15">
                  <Sparkles className="w-3 h-3 text-amber-400" /> +25 EduCoins per Approved Resource
                </span>
                <span className="hidden md:inline-block text-xs text-slate-300">
                  Peer-reviewed library
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                Upload Academic Material
              </h1>
            </div>

            {/* Live Completion Badge */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 shrink-0">
              <div className="text-right">
                <div className="text-xs font-bold text-white">
                  {completedCount === 3 ? 'Ready to Submit' : `${completedCount} of 3 Required`}
                </div>
                <div className="text-[10px] text-blue-200">
                  {completedCount === 3 ? 'All fields verified' : 'File, Title & Subject'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center font-bold text-xs text-blue-300 relative">
                <svg className="w-10 h-10 -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    className="text-white/20 stroke-current"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    className="text-blue-400 stroke-current transition-all duration-500 ease-out"
                    strokeWidth="3"
                    strokeDasharray={100}
                    strokeDashoffset={100 - completionPercentage}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-white">
                  {completionPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        <AnimatePresence>
          {uploadStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Upload Queued Successfully!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300/90">{uploadMessage}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                +25 Coins Pending
              </span>
            </motion.div>
          )}

          {uploadStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3 shadow-xs"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Action Required</h4>
                <p className="text-xs text-rose-700 dark:text-rose-300">{uploadMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Single Page 2-Column Split: LEFT = Upload File | RIGHT = All Input Boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* ========================================================= */}
          {/* LEFT SIDE: Upload Material Drag-and-Drop & File Inspector */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4">
            <DashboardCard className="p-6 sm:p-8 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Step 1
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    Upload Material
                  </h2>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Max 50MB
                </span>
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                id="file-upload-input"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
              />

              {/* Interactive Drag & Drop Area / Selected File Inspector */}
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative rounded-2xl border-2 border-dashed p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/30 scale-[1.01] shadow-md shadow-blue-500/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-500/70 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <motion.div 
                    animate={isDragging ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4 group-hover:scale-105 transition-transform"
                  >
                    <FileUp className="w-8 h-8" />
                  </motion.div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {isDragging ? 'Release to attach file' : 'Click to browse or drag file here'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1.5 max-w-[320px] leading-relaxed">
                    Drop question papers, handwritten notes, lab manuals or interview notes
                  </p>

                  {/* Format Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                    {['PDF', 'DOCX', 'PPTX', 'ZIP', 'TXT'].map((ext) => (
                      <span
                        key={ext}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
                      >
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                /* Dynamic Interactive File Preview Card */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/10 p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700 text-blue-600 shrink-0">
                        <FileText className="w-7 h-7" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded border ${getFileExtensionInfo(file.name).bg}`}>
                            {getFileExtensionInfo(file.name).label}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-4 h-4" /> Attached
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-1.5 truncate" title={file.name}>
                          {file.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          {formatFileSize(file.size)} &bull; Ready for upload
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Actions for Selected File */}
                  <div className="mt-5 pt-4 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs sm:text-sm">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <RefreshCw className="w-4 h-4" /> Replace file
                    </button>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Scanned for security
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Guidelines & Reward Card */}
              <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 text-xs sm:text-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" /> Quality Checklist
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> +25 Coins Reward
                  </span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pt-1">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Clear scans without cut-off margins or blurry text</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Include accurate course and subject code</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Must be authentic study material or official PYQ</span>
                  </li>
                </ul>
              </div>
            </DashboardCard>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: All Input Boxes, Category Picker & Submission */}
          {/* ========================================================= */}
          <div className="lg:col-span-7">
            <DashboardCard className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
                
                {/* Header with Top-Right Submit Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Step 2
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        &bull; <span className="text-rose-500 font-bold">*</span> Required fields
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      Resource Details
                    </h2>
                  </div>

                  {/* Top-Right Submit Button */}
                  <div className="flex items-center gap-3">
                    <DashboardButton
                      type="submit"
                      variant="primary"
                      disabled={uploadStatus === 'uploading' || !hasFile || !hasTitle || !hasSubject}
                      icon={UploadIcon}
                      className="h-10 sm:h-11 px-5 text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 shrink-0 w-full sm:w-auto"
                    >
                      {uploadStatus === 'uploading' ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Uploading...
                        </span>
                      ) : (
                        'Submit Material'
                      )}
                    </DashboardButton>
                  </div>
                </div>

                {/* 1. Category Selection Pills */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2.5">
                    Select Material Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
                    {CATEGORY_TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isSelected = selectedMainCat === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSelectedMainCat(tab.id)}
                          className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm ring-2 ring-blue-600/30'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold leading-snug">
                              {tab.shortLabel}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-400 leading-normal mt-1">
                              {tab.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Placement Subcategory Dropdown (if Placement is chosen) */}
                  <AnimatePresence>
                    {selectedMainCat === 'Placement' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50"
                      >
                        <span className="block text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
                          Placement Track Focus:
                        </span>
                        <div className="grid grid-cols-2 gap-2.5">
                          {PLACEMENT_SUBCATEGORIES.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => setPlacementSubcat(sub.id)}
                              className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                                placementSubcat === sub.id
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Resource Title Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Resource Title <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400 font-medium">
                      {title.length}/100
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. DBMS Mid-Term PYQ 2024 with Solutions"
                    className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400 leading-normal"
                  />
                </div>

                {/* 3. Subject Input with Quick-Suggest Chips */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Subject / Course Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400 font-medium">
                      Click chip to autofill
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Database Management Systems"
                    className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400 leading-normal"
                  />

                  {/* Interactive Quick Subject Suggestions */}
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {POPULAR_SUBJECTS.map((subj) => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => setSubject(subj)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                          subject.toLowerCase() === subj.toLowerCase()
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        + {subj}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Target Year / Semester Pills */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Target Year or Semester <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {YEAR_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setYear(year === opt.value ? '' : opt.value)}
                        className={`px-3 py-2.5 rounded-xl border text-center transition-all ${
                          year === opt.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-bold truncate">{opt.label}</div>
                        <div className={`text-[11px] truncate mt-0.5 ${year === opt.value ? 'text-blue-100' : 'text-slate-400'}`}>
                          {opt.sem}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Description / Key Topics Covered */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Description or Key Topics <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mention professors, exam units covered, formula sheets, or special instructions..."
                    className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 dark:text-slate-100 resize-none transition-all placeholder:text-slate-400 leading-relaxed"
                  />
                </div>

                {/* Bottom Status Summary Bar */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    {!hasFile && !hasTitle && !hasSubject ? (
                      <span>Attach file on the left & fill required details to submit</span>
                    ) : completedCount < 3 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        Still missing: {!hasFile ? 'File ' : ''}{!hasTitle ? 'Title ' : ''}{!hasSubject ? 'Subject' : ''}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Ready for submission — Click "Submit Material" at top right
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                    Earn up to +25 Coins upon admin verification
                  </span>
                </div>

              </form>
            </DashboardCard>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Upload;

import { useEffect } from 'react';
import { Download, ExternalLink, FileImage, FileText, X } from 'lucide-react';

const MaterialPreviewModal = ({
  isOpen,
  material,
  previewKind,
  previewUrl,
  onClose,
  onDownload,
  isDownloading = false,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !material) {
    return null;
  }

  const title = material.title || material.subject || 'File preview';
  const subject = material.subject || material.category || 'General';
  const fileLabel = material.file_type || material.file_name || 'FILE';
  const isPdfPreview = previewKind === 'pdf';
  const isImagePreview = previewKind === 'image';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${title}`}
    >
      <div
        className="w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-violet-200 dark:border-violet-800/80 bg-violet-50 dark:bg-violet-950/40 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                {subject}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {fileLabel}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Previewing uploaded file from Supabase Storage
            </p>
          </div>

          <div className="flex items-center gap-2">
            {previewUrl ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </a>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-950 p-4 sm:p-6">
          <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {isPdfPreview ? (
              <iframe
                src={previewUrl}
                title={title}
                className="h-[70vh] w-full"
              />
            ) : null}

            {isImagePreview ? (
              <img
                src={previewUrl}
                alt={title}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            ) : null}

            {!isPdfPreview && !isImagePreview ? (
              <div className="flex max-w-md flex-col items-center px-6 py-12 text-center">
                {previewKind === 'image' ? (
                  <FileImage className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                ) : (
                  <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                )}
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Preview unavailable</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  This file type can be opened in a new tab or downloaded, but inline preview is
                  currently limited to PDFs and image files.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Students can preview approved files only. Admins can preview pending uploads before
            approval.
          </p>

          <button
            type="button"
            onClick={() => onDownload?.(material)}
            disabled={!onDownload || isDownloading}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 dark:bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Opening...' : 'Download file'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialPreviewModal;

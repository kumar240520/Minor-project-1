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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${title}`}
    >
      <div
        className="w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                {subject}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                {fileLabel}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Previewing uploaded file from Supabase Storage
            </p>
          </div>

          <div className="flex items-center gap-2">
            {previewUrl ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </a>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-slate-100 p-4 sm:p-6">
          <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
                  <FileImage className="h-12 w-12 text-slate-300" />
                ) : (
                  <FileText className="h-12 w-12 text-slate-300" />
                )}
                <h3 className="mt-4 text-lg font-semibold text-slate-900">Preview unavailable</h3>
                <p className="mt-2 text-sm text-slate-500">
                  This file type can be opened in a new tab or downloaded, but inline preview is
                  currently limited to PDFs and image files.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-500">
            Students can preview approved files only. Admins can preview pending uploads before
            approval.
          </p>

          <button
            type="button"
            onClick={() => onDownload?.(material)}
            disabled={!onDownload || isDownloading}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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

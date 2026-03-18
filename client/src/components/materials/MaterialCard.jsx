import {
  BookOpen,
  Briefcase,
  Download,
  Eye,
  FileText,
  PlayCircle,
} from 'lucide-react';
import { getMaterialType } from '../../utils/materials';

const iconMap = {
  BookOpen,
  Briefcase,
  FileText,
  PlayCircle,
};

const getCardTheme = (materialType, material) =>
  materialType === 'pyq'
    ? {
        badgeClasses: 'border-violet-200 bg-violet-50 text-violet-700',
        buttonClasses: 'bg-violet-600 text-white hover:bg-violet-700',
        mutedButtonClasses: 'border-violet-200 text-violet-700 hover:bg-violet-50',
        iconClasses: 'bg-violet-100 text-violet-600',
      }
    : {
        badgeClasses: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        buttonClasses: 'bg-emerald-600 text-white hover:bg-emerald-700',
        mutedButtonClasses: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
        iconClasses: material?.bg_color && material?.text_color
          ? `${material.bg_color} ${material.text_color}`
          : 'bg-blue-100 text-blue-600',
      };

const MaterialCard = ({
  material,
  onPreview,
  onDownload,
  previewing = false,
  downloading = false,
}) => {
  const materialType = getMaterialType(material);
  const theme = getCardTheme(materialType, material);
  const IconComponent =
    iconMap[material?.icon_type] || (materialType === 'pyq' ? FileText : BookOpen);

  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className={`rounded-2xl p-3 ${theme.iconClasses}`}>
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${theme.badgeClasses}`}
          >
            {material.subject || material.category || (materialType === 'pyq' ? 'PYQ' : 'Material')}
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 border border-amber-100 uppercase tracking-wider">
            <span className="mr-1">🪙</span> {material.price || 5} Coins
          </span>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <h3 className="text-lg font-semibold text-slate-900">{material.title}</h3>
        <p className="mt-2 text-sm text-slate-500">
          {material.subject || material.description || 'Shared study resource'}
        </p>
        <p className="mt-4 text-sm text-slate-400">
          Uploaded by {material.uploader_name || 'Anonymous Student'}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
        <span>{material.file_type || material.file_name || 'FILE'}</span>
        <span>{material.downloads || 0} downloads</span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onPreview?.(material)}
          disabled={!onPreview || previewing}
          className={`inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${theme.mutedButtonClasses}`}
        >
          <Eye className="mr-2 h-4 w-4" />
          {previewing ? 'Opening...' : 'Preview'}
        </button>

        <button
          type="button"
          onClick={() => onDownload?.(material)}
          disabled={!onDownload || downloading}
          className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${theme.buttonClasses}`}
        >
          <Download className="mr-2 h-4 w-4" />
          {downloading ? 'Opening...' : 'Download'}
        </button>
      </div>
    </article>
  );
};

export default MaterialCard;

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

const getCategoryIconTheme = (material, defaultType) => {
  if (defaultType === 'pyq') {
    return 'bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400';
  }
  const bg = material?.bg_color;
  const text = material?.text_color;
  if (bg && text) {
    if (bg.includes('rose')) return `${bg} ${text} dark:bg-rose-950/60 dark:text-rose-400`;
    if (bg.includes('amber')) return `${bg} ${text} dark:bg-amber-950/60 dark:text-amber-400`;
    if (bg.includes('emerald') || bg.includes('green')) return `${bg} ${text} dark:bg-emerald-950/60 dark:text-emerald-400`;
    if (bg.includes('purple') || bg.includes('violet')) return `${bg} ${text} dark:bg-violet-950/60 dark:text-violet-400`;
    return `${bg} ${text} dark:bg-blue-950/60 dark:text-blue-400`;
  }
  return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400';
};

const getCardTheme = (materialType, material) =>
  materialType === 'pyq'
    ? {
        badgeClasses: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/80 dark:bg-violet-950/50 dark:text-violet-300',
        buttonClasses: 'bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500',
        mutedButtonClasses: 'border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-950/50',
        iconClasses: getCategoryIconTheme(material, 'pyq'),
      }
    : {
        badgeClasses: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-950/50 dark:text-emerald-300',
        buttonClasses: 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500',
        mutedButtonClasses: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/50',
        iconClasses: getCategoryIconTheme(material, 'material'),
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
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-slate-950/50 transition-all hover:-translate-y-1 hover:shadow-md dark:hover:border-slate-700">
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
          <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800/60 uppercase tracking-wider">
            <span className="mr-1">🪙</span> {material.price || 5} Coins
          </span>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{material.title}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {material.subject || material.description || 'Shared study resource'}
        </p>
        <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">
          Uploaded by {material.uploader_name || 'Anonymous Student'}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
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

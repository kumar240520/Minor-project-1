import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Check, SlidersHorizontal } from "lucide-react";

export default function FilterPopup({
  isOpen,
  onClose,
  filters = [],
  values = {},
  onChange,
  onReset,
  onApply,
  activeCount = 0,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handle), 0);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen, onClose]);

  const handleToggleMulti = (key, optionValue) => {
    const current = Array.isArray(values[key]) ? values[key] : [];
    const next = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    onChange(key, next);
  };

  const handleSingle = (key, optionValue) => {
    onChange(key, values[key] === optionValue ? "" : optionValue);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
          />
          <motion.div
            key="panel"
            ref={panelRef}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Filters</h2>
                  {activeCount > 0 && (
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                      {activeCount} active filter{activeCount > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {filters.map((section) => (
                <div key={section.key}>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    {section.label}
                  </p>

                  {section.type === "sort" && (
                    <div className="grid grid-cols-1 gap-2">
                      {section.options.map((opt) => {
                        const active = values[section.key] === opt.value;
                        return (
                          <button key={opt.value} type="button" onClick={() => onChange(section.key, opt.value)}
                            className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${active ? "bg-violet-600 border-violet-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-400 dark:hover:border-violet-600"}`}>
                            <span>{opt.label}</span>
                            {active && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {section.type === "single" && (
                    <div className="flex flex-wrap gap-2">
                      {section.options.map((opt) => {
                        const active = values[section.key] === opt.value;
                        return (
                          <button key={opt.value} type="button" onClick={() => handleSingle(section.key, opt.value)}
                            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${active ? "bg-violet-600 border-violet-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-400 dark:hover:border-violet-600"}`}>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {section.type === "multi" && (
                    <div className="flex flex-wrap gap-2">
                      {section.options.map((opt) => {
                        const selected = Array.isArray(values[section.key]) ? values[section.key].includes(opt.value) : false;
                        return (
                          <button key={opt.value} type="button" onClick={() => handleToggleMulti(section.key, opt.value)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${selected ? "bg-violet-600 border-violet-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-400 dark:hover:border-violet-600"}`}>
                            {selected && <Check className="w-3 h-3 shrink-0" />}
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
              <button type="button" onClick={onReset}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button type="button" onClick={onApply}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors shadow-sm cursor-pointer">
                Apply Filters{activeCount > 0 ? ` (${activeCount})` : ""}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

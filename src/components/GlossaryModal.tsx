import React from 'react';
import { X, BookOpen, Atom } from 'lucide-react';
import { GLOSSARY_TERMS } from '../data/scientificData';

interface GlossaryModalProps {
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Oceanographic & Geophysical Glossary</h3>
              <p className="text-xs text-slate-400">Fundamental physical principles behind Kelvin wave dynamics</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {GLOSSARY_TERMS.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2">
                <Atom className="w-4 h-4 text-cyan-400 shrink-0" />
                <h4 className="text-sm font-bold text-white">{item.term}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">{item.definition}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

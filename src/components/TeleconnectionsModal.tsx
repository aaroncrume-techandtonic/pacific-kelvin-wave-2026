import React from 'react';
import { X, Globe2, AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { TELECONNECTIONS } from '../data/scientificData';
import { TeleconnectionImpact } from '../types/kelvin';

interface TeleconnectionsModalProps {
  initialRegionId?: string;
  onClose: () => void;
}

export const TeleconnectionsModal: React.FC<TeleconnectionsModalProps> = ({
  initialRegionId,
  onClose,
}) => {
  const [selectedId, setSelectedId] = React.useState<string>(initialRegionId || TELECONNECTIONS[0].id);

  const currentImpact = TELECONNECTIONS.find((t) => t.id === selectedId) || TELECONNECTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Illustrative Teleconnection Scenarios</h3>
              <p className="text-xs text-slate-400">
                Hypothetical climate mechanisms; these are not NOAA forecasts or event-specific impact assessments.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout: Sidebar + Details */}
        <div className="flex flex-col md:flex-row overflow-hidden flex-grow">
          {/* Sidebar */}
          <div className="w-full md:w-72 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800 p-3 space-y-2 overflow-y-auto shrink-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Vulnerable Regions
            </div>
            {TELECONNECTIONS.map((impact: TeleconnectionImpact) => (
              <button
                key={impact.id}
                onClick={() => setSelectedId(impact.id)}
                className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between text-xs group ${
                  selectedId === impact.id
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 shadow-md font-semibold'
                    : 'bg-slate-800/40 border border-transparent text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div>
                  <div className="text-white font-bold group-hover:text-cyan-300">{impact.region}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[190px]">{impact.title}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
            ))}
          </div>

          {/* Details Pane */}
          <div className="flex-grow p-6 overflow-y-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  {currentImpact.region}
                </span>
                <h4 className="text-2xl font-extrabold text-white mt-1">{currentImpact.title}</h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-red-950/80 border border-red-500/50 text-red-300">
                  {currentImpact.anomaly}
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">{currentImpact.summary}</p>

            {/* Oceanographic Mechanisms */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
              <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Underlying Physical Mechanisms
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentImpact.mechanisms.map((mech, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5 font-bold">•</span>
                    <span>{mech}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Civil & Ecological Risks */}
            <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 space-y-2">
              <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Critical Ecological & Civil Risks
              </h5>
              <ul className="space-y-1.5 text-xs text-red-200">
                {currentImpact.keyRisks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

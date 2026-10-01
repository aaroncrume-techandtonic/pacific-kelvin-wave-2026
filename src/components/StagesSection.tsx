import React, { useState } from 'react';
import { STAGES_DATA } from '../data/scientificData';
import { StageInfo } from '../types/kelvin';
import { PlayCircle, ChevronDown, ChevronUp, Zap, Sparkles } from 'lucide-react';

interface StagesSectionProps {
  progress: number;
  onJumpToStage: (progressVal: number) => void;
}

export const StagesSection: React.FC<StagesSectionProps> = ({ progress, onJumpToStage }) => {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  // Determine current active stage
  const getActiveStage = () => {
    for (const stage of STAGES_DATA) {
      if (progress >= stage.progressRange[0] && progress < stage.progressRange[1]) {
        return stage.number;
      }
    }
    return 1;
  };

  const activeStageNumber = getActiveStage();

  return (
    <section aria-label="Step by step propagation of a Kelvin Wave" className="space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          Planetary Physical Cycle
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">The 4 Stages of Propagation</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm">
          Click any stage to fast-forward the interactive cross-section simulation directly to that phase of the Kelvin
          wave lifecycle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {/* Desktop connecting guide line */}
        <div className="hidden lg:block absolute top-10 left-12 right-12 h-1 bg-gradient-to-r from-cyan-600 via-blue-500 via-amber-500 to-red-600 z-0 rounded-full opacity-30"></div>

        {STAGES_DATA.map((stage: StageInfo) => {
          const isActive = activeStageNumber === stage.number;
          const isExpanded = expandedStage === stage.number;

          return (
            <div
              key={stage.number}
              onClick={() => onJumpToStage(stage.jumpProgress)}
              className={`relative z-10 flex flex-col p-6 rounded-2xl border transition-all duration-300 cursor-pointer text-left backdrop-blur-sm group ${
                isActive
                  ? 'bg-slate-800/90 border-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.25)] ring-1 ring-cyan-400/50 -translate-y-1'
                  : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/60'
              }`}
            >
              {/* Active Indicator Pulse */}
              {isActive && (
                <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 fill-current" />
                  Active In Simulation
                </div>
              )}

              {/* Number Circle Badge */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-2xl mb-5 transition-transform duration-300 group-hover:scale-105 shadow-lg ${
                  stage.number === 4
                    ? isActive
                      ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-slate-800 text-red-400 border border-red-500/40'
                    : isActive
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                      : 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {stage.number}
              </div>

              {/* Title & Subtitle */}
              <div className="mb-2">
                <span className="text-[11px] font-mono text-cyan-400/90 uppercase tracking-wider block">
                  {stage.subtitle}
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {stage.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-300/90 leading-relaxed mb-4 flex-grow">{stage.description}</p>

              {/* Indicator Pills */}
              <div className="space-y-1.5 mb-4">
                {stage.indicators.map((ind, idx) => (
                  <div
                    key={idx}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 text-slate-300 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                    <span>{ind}</span>
                  </div>
                ))}
              </div>

              {/* Expandable Science Notes */}
              {isExpanded && (
                <div
                  className="mt-3 pt-3 border-t border-slate-700/60 text-xs text-slate-300 space-y-2 bg-slate-950/60 p-3 rounded-xl mb-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider">
                    Hydrodynamic Physics:
                  </div>
                  <p className="leading-relaxed text-slate-400">{stage.scientificDetail}</p>
                </div>
              )}

              {/* Bottom Action Row */}
              <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between mt-auto">
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 group-hover:underline">
                  <PlayCircle className="w-3.5 h-3.5" />
                  Jump Simulation
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedStage(isExpanded ? null : stage.number);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                  title="Toggle physics details"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

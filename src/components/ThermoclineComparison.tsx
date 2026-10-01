import React, { useState } from 'react';
import { Sliders, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ThermoclineComparison: React.FC = () => {
  const [splitPos, setSplitPos] = useState(50); // percentage 0..100

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Basin Thermocline Structure: Normal vs. 2026 Super El Niño
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Drag the interactive divider to compare the normal tilted Pacific thermocline against the flattened,
            heat-saturated 2026 state.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            Normal Climatology
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="flex items-center gap-1.5 text-red-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            2026 Super El Niño
          </span>
        </div>
      </div>

      {/* Interactive Split Comparison Graphic */}
      <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-slate-800 select-none bg-slate-950">
        {/* Left Side: Normal Pacific state (rendered full, clipped) */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="bg-slate-900/90 border border-blue-500/40 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-blue-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Normal / Neutral Pacific
              </span>
              <div className="text-[11px] text-slate-400 mt-0.5">Strong Easterly Trade Winds</div>
            </div>
            <div className="text-right text-[11px] font-mono text-blue-300/80">
              Thermocline Slope: Steep (200m West → 50m East)
            </div>
          </div>

          {/* SVG Diagram for Normal state */}
          <div className="absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none">
            <svg viewBox="0 0 800 320" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              {/* Mixed warm layer */}
              <polygon points="0,50 800,50 800,100 0,220" fill="url(#normalWaterGrad)" />
              {/* Cold deep water */}
              <polygon points="0,220 800,100 800,320 0,320" fill="#091426" />
              {/* Thermocline line */}
              <line x1="0" y1="220" x2="800" y2="100" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 4" />

              {/* Trade wind arrow */}
              <path d="M 700 35 L 200 35" stroke="#94a3b8" strokeWidth="2.5" markerEnd="url(#arrowLeft)" />
              <text x="450" y="28" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">
                Normal Easterly Trade Winds (← Blowing West)
              </text>

              {/* Upwelling arrow in East */}
              <path d="M 750 180 Q 760 110 750 80" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
              <text x="750" y="200" fill="#38bdf8" fontSize="10" textAnchor="middle">
                Cold Nutrient Upwelling
              </text>

              <defs>
                <linearGradient id="normalWaterGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-500 z-10">
            <span>Western Warm Pool (~30°C)</span>
            <span>Eastern Cold Tongue (~21°C)</span>
          </div>
        </div>

        {/* Right Side: 2026 Super El Niño (Clipped via clipPath) */}
        <div
          className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none bg-slate-950/70"
          style={{ clipPath: `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)` }}
        >
          <div className="flex justify-between items-start">
            <div className="text-[11px] font-mono text-red-400">
              Thermocline: Flattened & Deepened (+80m in East)
            </div>
            <div className="bg-red-950/90 border border-red-500/50 px-3 py-1.5 rounded-lg text-xs text-right">
              <span className="text-red-300 font-bold flex items-center justify-end gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> 2026 Super El Niño
              </span>
              <div className="text-[11px] text-red-200/80 mt-0.5">Westerly Wind Bursts & Basin Collapse</div>
            </div>
          </div>

          {/* SVG Diagram for 2026 El Nino */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 800 320" className="w-full h-full" preserveAspectRatio="none">
              {/* Mixed layer flattened and much deeper in the East */}
              <polygon points="0,50 800,50 800,185 0,195" fill="url(#elNinoWaterGrad)" />
              {/* Cold water */}
              <polygon points="0,195 800,185 800,320 0,320" fill="#040b17" />
              {/* Thermocline line flattened */}
              <line x1="0" y1="195" x2="800" y2="185" stroke="#ef4444" strokeWidth="3.5" strokeDasharray="8 4" />

              {/* Massive deep heat pulse */}
              <ellipse cx="580" cy="185" rx="140" ry="40" fill="url(#corePulseGrad)" />

              {/* Westerly wind arrow */}
              <path d="M 150 35 L 600 35" stroke="#f59e0b" strokeWidth="3" />
              <text x="375" y="26" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">
                Anomalous Westerly Wind Bursts (→ Eastward)
              </text>

              {/* Upwelling shut off label */}
              <text x="740" y="240" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">
                Upwelling Suppressed
              </text>

              <defs>
                <linearGradient id="elNinoWaterGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity="0.85" />
                </linearGradient>
                <radialGradient id="corePulseGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#f97316" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-red-300 z-10">
            <span>Western Pacific Sinking (-30m)</span>
            <span className="font-bold text-red-400">Eastern Pacific Flooded with Heat (+10°C Anomaly)</span>
          </div>
        </div>

        {/* Draggable Divider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.8)] cursor-ew-resize z-20"
          style={{ left: `${splitPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 text-xs shadow-lg">
            ⇄
          </div>
        </div>

        {/* Range slider input overlaid */}
        <input
          type="range"
          min="5"
          max="95"
          value={splitPos}
          onChange={(e) => setSplitPos(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30"
          aria-label="Thermocline comparison slider"
        />
      </div>

      {/* Comparison Key Metrics Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
          <div className="text-xs text-slate-400 mb-1">Thermocline Tilt (Zonal Slope)</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-blue-400">150m gradient</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-lg font-bold text-red-400">Near-Flat (10m)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Eliminates the natural east-west pressure head.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
          <div className="text-xs text-slate-400 mb-1">Eastern Pacific Thermocline Depth</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-blue-400">40–60 meters</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-lg font-bold text-red-400">145+ meters</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Pushes cold water too deep for coastal winds to dredge up.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
          <div className="text-xs text-slate-400 mb-1">Atmospheric Walker Circulation</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-blue-400">Normal Active</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-lg font-bold text-red-400">Reversed / Broken</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Transfers global convective rainstorms 6,000 miles east.</p>
        </div>
      </div>
    </div>
  );
};

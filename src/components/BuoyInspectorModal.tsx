import React from 'react';
import { X, Navigation, Wind, Thermometer, Waves, Activity, AlertTriangle } from 'lucide-react';
import { BuoyStation } from '../types/kelvin';

interface BuoyInspectorModalProps {
  buoy: BuoyStation | null;
  onClose: () => void;
}

export const BuoyInspectorModal: React.FC<BuoyInspectorModalProps> = ({ buoy, onClose }) => {
  if (!buoy) return null;

  // Generate vertical temperature profile points (Depth 0m to 400m)
  // For normal vs 2026 observed
  const depths = [0, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400];
  const profilePoints = depths.map((d) => {
    // Normal temp calculation
    let normTemp = 28 - (d / 400) * 20;
    if (d > buoy.normalThermoclineDepth) {
      normTemp -= 4;
    }

    // Observed 2026 temp with Kelvin wave downwelling
    let obsTemp = buoy.sst - (d / 400) * 16;
    if (d > buoy.thermoclineDepth) {
      obsTemp -= 5;
    }
    // Boost at thermocline depth if wave is present
    const thermDist = Math.abs(d - buoy.thermoclineDepth);
    if (thermDist < 60) {
      obsTemp += buoy.heatContentAnomaly * 0.9;
    }

    return {
      depth: d,
      normal: Math.max(6, Math.round(normTemp * 10) / 10),
      observed: Math.max(7, Math.round(obsTemp * 10) / 10),
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                buoy.status === 'critical'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : buoy.status === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{buoy.name}</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-700/80 text-cyan-300 font-semibold">
                  {buoy.longitude}
                </span>
              </div>
              <p className="text-xs text-slate-400">NOAA TAO/TRITON Moored Buoy Telemetry (0° Equator)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Status banner */}
          {buoy.status === 'critical' && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-200">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <span className="font-bold text-red-300">Extreme Subsurface Heat Pulse Active: </span>
                Thermocline downwelled by +{buoy.thermoclineDepth - buoy.normalThermoclineDepth}m below climatological
                baseline.
              </div>
            </div>
          )}

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                <span>Sea Surface Temp</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">{buoy.sst}°C</div>
              <div className="text-[11px] text-rose-400 font-semibold">
                +{buoy.sstAnomaly > 0 ? `${buoy.sstAnomaly}°C` : `${buoy.sstAnomaly}°C`} anomaly
              </div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span>Thermocline Depth</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">{buoy.thermoclineDepth}m</div>
              <div className="text-[11px] text-cyan-400">Normal: {buoy.normalThermoclineDepth}m</div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Heat Anomaly (0-300m)</span>
              </div>
              <div className="text-lg font-bold text-amber-300 font-mono">+{buoy.heatContentAnomaly}°C</div>
              <div className="text-[11px] text-amber-400/80">Massive thermal pool</div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Wind className="w-3.5 h-3.5 text-blue-400" />
                <span>Zonal Wind Stress</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {buoy.zonalWind > 0 ? `+${buoy.zonalWind}` : buoy.zonalWind} m/s
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {buoy.zonalWind > 0 ? 'Westerly Burst' : 'Easterly Trade'}
              </div>
            </div>
          </div>

          {/* Depth vs Temperature Vertical Profile Chart */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-white">Vertical CTD Temperature Profile (0 – 400m)</span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-0.5 bg-slate-400"></span> Normal Mean
                </span>
                <span className="flex items-center gap-1 text-red-400 font-semibold">
                  <span className="w-2.5 h-0.5 bg-red-500"></span> 2026 Observed
                </span>
              </div>
            </div>

            {/* SVG Profile Chart */}
            <div className="h-44 w-full">
              <svg viewBox="0 0 500 160" className="w-full h-full">
                {/* Horizontal Depth grid lines */}
                {[0, 100, 200, 300, 400].map((d, i) => {
                  const y = 15 + (d / 400) * 130;
                  return (
                    <g key={d}>
                      <line x1="45" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                      <text x="38" y={y + 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                        {d}m
                      </text>
                    </g>
                  );
                })}

                {/* Normal temperature curve */}
                <path
                  d={profilePoints
                    .map((pt, i) => {
                      // Map temp (5°C to 32°C) to X (45 to 480)
                      const x = 45 + ((pt.normal - 5) / 27) * 435;
                      const y = 15 + (pt.depth / 400) * 130;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* 2026 Observed temperature curve */}
                <path
                  d={profilePoints
                    .map((pt, i) => {
                      const x = 45 + ((pt.observed - 5) / 27) * 435;
                      const y = 15 + (pt.depth / 400) * 130;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />

                {/* Highlight thermocline depths */}
                <circle
                  cx={45 + ((20 - 5) / 27) * 435}
                  cy={15 + (buoy.thermoclineDepth / 400) * 130}
                  r="4"
                  fill="#ef4444"
                />
              </svg>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
              <span>← Cold (5°C)</span>
              <span>20°C Thermocline Boundary</span>
              <span>Warm (32°C) →</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};

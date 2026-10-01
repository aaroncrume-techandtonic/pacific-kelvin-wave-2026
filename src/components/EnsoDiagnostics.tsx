import React from 'react';
import { BUOY_STATIONS } from '../data/scientificData';
import { BuoyStation } from '../types/kelvin';
import { ForwardProjection } from './ForwardProjection';
import { HistoricalComparisonToggle } from './HistoricalComparisonToggle';
import { Activity, Radio, Thermometer, Wind } from 'lucide-react';

interface EnsoDiagnosticsProps {
  onSelectBuoy: (buoy: BuoyStation) => void;
  onSyncSimulation?: (progressVal: number) => void;
}

export const EnsoDiagnostics: React.FC<EnsoDiagnosticsProps> = ({ onSelectBuoy, onSyncSimulation }) => {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 backdrop-blur-md p-6 shadow-xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            NOAA / PMEL Equatorial Pacific Diagnostic Stream
          </div>
          <h3 className="text-xl font-bold text-white mt-1">Live Ocean & Atmospheric Diagnostics</h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <span className="text-slate-400 font-medium">ENSO Alert System:</span>
            <span className="font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40">
              EL NIÑO ADVISORY
            </span>
          </div>
        </div>
      </div>

      {/* Gauges & Indices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Niño 3.4 SST Anomaly */}
        <div className="bg-slate-800/40 border border-slate-700/70 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start text-xs text-slate-400 mb-2">
              <span>Niño 3.4 SST Index</span>
              <Thermometer className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">+2.5°C</div>
            <div className="text-[11px] text-red-400 font-semibold mt-1">Super El Niño Threshold (&ge; +2.0°C)</div>
          </div>
          {/* Progress gauge */}
          <div className="w-full bg-slate-700/50 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-red-500 h-full rounded-full w-[85%]"></div>
          </div>
        </div>

        {/* Equatorial Heat Content Anomaly */}
        <div className="bg-slate-800/40 border border-slate-700/70 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start text-xs text-slate-400 mb-2">
              <span>Heat Content (0–300m)</span>
              <Activity className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">+5.8°C</div>
            <div className="text-[11px] text-amber-400 mt-1">Basin-wide subsurface volume</div>
          </div>
          <div className="w-full bg-slate-700/50 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full w-[92%]"></div>
          </div>
        </div>

        {/* Southern Oscillation Index (SOI) */}
        <div className="bg-slate-800/40 border border-slate-700/70 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start text-xs text-slate-400 mb-2">
              <span>Southern Oscillation (SOI)</span>
              <Wind className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">-18.4</div>
            <div className="text-[11px] text-cyan-400 mt-1">Strong atmospheric coupling</div>
          </div>
          <div className="w-full bg-slate-700/50 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-600 h-full rounded-full w-[78%]"></div>
          </div>
        </div>

        {/* Outgoing Longwave Radiation (OLR) */}
        <div className="bg-slate-800/40 border border-slate-700/70 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start text-xs text-slate-400 mb-2">
              <span>Equatorial Convection (OLR)</span>
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">-2.2 σ</div>
            <div className="text-[11px] text-emerald-400 mt-1">Enhanced cloudiness at Date Line</div>
          </div>
          <div className="w-full bg-slate-700/50 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full rounded-full w-[70%]"></div>
          </div>
        </div>
      </div>

      {/* Historical Super El Niño Comparison Toggle (1997 vs 2015 vs 2026) */}
      <HistoricalComparisonToggle />

      {/* Forward-Projection Slider Engine */}
      <ForwardProjection onSyncSimulation={onSyncSimulation} />

      {/* TAO Mooring Array Station Selector */}
      <div className="pt-2">
        <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center justify-between">
          <span>Active TAO/TRITON Moored Array Station Telemetry</span>
          <span className="text-[11px] text-cyan-400 font-normal">Click any station to view full CTD cast</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {BUOY_STATIONS.map((buoy) => (
            <button
              key={buoy.id}
              onClick={() => onSelectBuoy(buoy)}
              className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-cyan-400/60 hover:bg-slate-800 transition-all text-left group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400">{buoy.longitude}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      buoy.status === 'critical'
                        ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                        : buoy.status === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-cyan-400'
                    }`}
                  ></span>
                </div>
                <div className="text-xs font-bold text-white truncate">{buoy.name.replace(' Mooring', '')}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">SST: {buoy.sst}°C</span>
                <span className="text-red-400 font-mono font-semibold">+{buoy.sstAnomaly}°C</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


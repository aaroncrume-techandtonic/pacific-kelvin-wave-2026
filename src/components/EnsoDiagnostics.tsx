import React from 'react';
import { NOAA_CPC_ENSO_UPDATE } from '../data/scientificData';
import { ForwardProjection } from './ForwardProjection';
import { HistoricalComparisonToggle } from './HistoricalComparisonToggle';
import { Activity, ExternalLink, Thermometer, Wind } from 'lucide-react';

interface EnsoDiagnosticsProps {
  onSyncSimulation?: (progressVal: number) => void;
}

export const EnsoDiagnostics: React.FC<EnsoDiagnosticsProps> = ({ onSyncSimulation }) => {
  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/60 backdrop-blur-md p-6 shadow-xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-4 h-4 text-cyan-400" />
            NOAA Climate Prediction Center
          </div>
          <h3 className="text-xl font-bold text-white mt-1">ENSO Diagnostic Discussion</h3>
          <p className="text-xs text-slate-400 mt-1">
            {NOAA_CPC_ENSO_UPDATE.bulletin} update · reported monthly observations are for September 2026
          </p>
        </div>
        <a
          href={NOAA_CPC_ENSO_UPDATE.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
        >
          Read NOAA bulletin <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div>
        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Thermometer className="w-4 h-4 text-red-400" />
          Observed sea-surface temperature anomalies
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {NOAA_CPC_ENSO_UPDATE.observations.map(({ region, anomalyC }) => (
            <div key={region} className="bg-slate-800/50 border border-slate-700/70 p-4 rounded-xl">
              <div className="text-xs text-slate-400">{region} index</div>
              <div className="text-2xl font-black text-white font-mono mt-1">+{anomalyC.toFixed(1)}°C</div>
              <div className="text-[11px] text-slate-400 mt-1">SST anomaly</div>
            </div>
          ))}
          <div className="bg-slate-800/50 border border-slate-700/70 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Eastern equatorial Pacific</div>
            <div className="text-2xl font-black text-white font-mono mt-1">&gt;+{NOAA_CPC_ENSO_UPDATE.easternPacificSstAnomalyC.toFixed(1)}°C</div>
            <div className="text-[11px] text-slate-400 mt-1">in portions of the region</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/70 p-5 rounded-xl">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-4 h-4 text-amber-400" />
            Subsurface conditions
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mt-3">
            NOAA reports an above-average equatorial subsurface temperature index, a deeper-than-average thermocline,
            and eastern Pacific subsurface temperatures exceeding {NOAA_CPC_ENSO_UPDATE.easternPacificSubsurfaceTemperatureC.toFixed(1)}°C
            at depth. These conditions are relevant to Kelvin-wave dynamics; the bulletin does not publish a specific
            wave track or speed.
          </p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/70 p-5 rounded-xl">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <Wind className="w-4 h-4 text-blue-400" />
            NOAA probabilistic outlook
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mt-3">
            NOAA says a strong-to-very-strong El Niño is likely through January–March 2027, with the chance remaining
            above 83%. The bulletin gives these chances for a historic three-month RONI value of at least +2.5°C:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs">
            {NOAA_CPC_ENSO_UPDATE.historicEventProbabilities.map(({ period, probability }) => (
              <li key={period} className="rounded-lg bg-slate-900/70 border border-slate-700/60 p-2">
                <span className="block text-slate-400">{period}</span>
                <span className="block text-white font-mono font-bold mt-1">{probability}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-xs text-amber-100/90 leading-relaxed">
        The data above are NOAA observations and outlooks. The interactive wave, timeline, station profiles, and
        projection tools elsewhere on this page are illustrative simulations—not live NOAA data or official forecasts.
      </div>

      <div className="space-y-4">
        <HistoricalComparisonToggle />
        <ForwardProjection onSyncSimulation={onSyncSimulation} />
      </div>
    </section>
  );
};

import React from 'react';
import { Activity, ExternalLink, ShieldCheck, Waves } from 'lucide-react';
import { NOAA_CPC_ENSO_UPDATE } from '../data/scientificData';

export const MetricsSection: React.FC = () => {
  return (
    <section aria-label="Scientific context for the NOAA ENSO update" className="space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Reading the NOAA Update
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">Observed Conditions, Not a Wave Track</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm">
          NOAA reports basin-scale ocean and atmosphere indicators. They provide context for Kelvin-wave activity,
          but are not a direct measurement of one wave’s path or speed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <article className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/80 shadow-xl">
          <div className="w-11 h-11 bg-red-950/60 rounded-xl flex items-center justify-center border border-red-500/30 mb-4">
            <Activity className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Surface warming</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            NOAA’s {NOAA_CPC_ENSO_UPDATE.bulletin} discussion reports rising Niño-region SST indices and anomalies
            above +4°C in portions of the eastern equatorial Pacific. These are regional observations, not the
            temperature anomaly of a tracked Kelvin-wave crest.
          </p>
        </article>

        <article className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/80 shadow-xl">
          <div className="w-11 h-11 bg-blue-950/60 rounded-xl flex items-center justify-center border border-blue-500/30 mb-4">
            <Waves className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Subsurface context</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            The discussion describes an above-average equatorial subsurface temperature index, a deeper-than-average
            thermocline, and subsurface temperatures exceeding 10°C at depth in the eastern Pacific. NOAA does not provide a
            station-by-station Kelvin-wave transect in this bulletin.
          </p>
        </article>

        <article className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/80 shadow-xl">
          <div className="w-11 h-11 bg-emerald-950/60 rounded-xl flex items-center justify-center border border-emerald-500/30 mb-4">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Forecasts are probabilistic</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            NOAA’s seasonal outlook describes probabilities for ENSO strength. It does not forecast a specific
            Kelvin-wave arrival date, coastal water-level rise, or local storm impact. Use local official forecasts
            for hazard decisions.
          </p>
          <a
            href={NOAA_CPC_ENSO_UPDATE.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 mt-4"
          >
            View the NOAA source <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </article>
      </div>
    </section>
  );
};

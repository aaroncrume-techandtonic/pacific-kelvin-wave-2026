import React, { useState } from 'react';
import { Flame, Globe2, Waves, ArrowUpRight, ShieldCheck, Gauge, ExternalLink } from 'lucide-react';

interface MetricsSectionProps {
  onOpenTeleconnections: (regionId?: string) => void;
}

export const MetricsSection: React.FC<MetricsSectionProps> = ({ onOpenTeleconnections }) => {
  const [showHistoricCompare, setShowHistoricCompare] = useState(false);

  return (
    <section aria-label="Current 2026 Impacts" className="space-y-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-semibold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-red-400" />
          Climatological Records Shattered
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">The 2026 Reality: By The Numbers</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm">
          Physical measurements collected by NOAA TAO moorings, Argo profiling floats, and NASA/Copernicus satellite
          altimetry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Record Subsurface Heat */}
        <div className="bg-slate-800/40 backdrop-blur-md p-8 rounded-2xl border border-slate-700/80 hover:border-red-500/50 transition-all duration-300 shadow-xl group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-red-950/60 rounded-2xl flex items-center justify-center border border-red-500/30 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Flame className="h-8 w-8 text-red-400 animate-pulse" />
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-red-950/80 text-red-300 border border-red-500/30 font-bold">
                Anomaly: &gt;+10°C
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-300 transition-colors">
              Record Subsurface Heat
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed">
              The current downwelling wave features extreme subsurface anomalies exceeding{' '}
              <strong className="text-red-400 font-semibold">+10°C (18°F)</strong> above normal in the top 200m,
              fueling the rapid development of the historic Super El Niño.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Depth: 120–180m</span>
            <button
              onClick={() => onOpenTeleconnections('peru')}
              className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 group-hover:underline"
            >
              Fisheries Impact <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Planetary Scale */}
        <div className="bg-slate-800/40 backdrop-blur-md p-8 rounded-2xl border border-slate-700/80 hover:border-blue-500/50 transition-all duration-300 shadow-xl group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-blue-950/60 rounded-2xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Globe2 className="h-8 w-8 text-blue-400" />
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/30 font-bold">
                Speed: ~2.5 m/s
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
              Planetary Scale
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed">
              Stretching thousands of kilometers wide, this thermal engine crawls eastward at{' '}
              <strong className="text-blue-300 font-semibold">2 to 3 meters per second</strong> (~200 km/day). It takes
              roughly 2 to 3 months to fully cross the immense 10,000-mile Pacific basin.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Span: 16,000 km</span>
            <button
              onClick={() => onOpenTeleconnections('indonesia-australia')}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 group-hover:underline"
            >
              Walker Cell Shift <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: West Coast Sea Level Rise */}
        <div className="bg-slate-800/40 backdrop-blur-md p-8 rounded-2xl border border-slate-700/80 hover:border-cyan-500/50 transition-all duration-300 shadow-xl group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-cyan-950/60 rounded-2xl flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Waves className="h-8 w-8 text-cyan-400" />
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-bold">
                SSHA: +15 to +30 cm
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
              West Coast Sea Level Rise
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed">
              As the planetary wave impacts the Americas in fall 2026, thermal expansion forces sea levels to rise by{' '}
              <strong className="text-cyan-300 font-semibold">6 to 12 inches (15–30 cm)</strong> along California,
              drastically increasing flooding risks during winter King Tides.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Location: CA & Americas</span>
            <button
              onClick={() => onOpenTeleconnections('california')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group-hover:underline"
            >
              King Tides Alert <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Historic Super El Niño Comparison Toggle */}
      <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-amber-400" />
              Historical Super El Niño Benchmark Comparison
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              How the 2026 Kelvin Wave pulse measures against the legendary 1997–98 and 2015–16 "Monster" events.
            </p>
          </div>

          <button
            onClick={() => setShowHistoricCompare(!showHistoricCompare)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition-colors shrink-0 self-start sm:self-auto"
          >
            {showHistoricCompare ? 'Hide Comparison Table' : 'View Benchmark Data'}
          </button>
        </div>

        {showHistoricCompare && (
          <div className="overflow-x-auto mt-4 pt-4 border-t border-slate-800">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3 font-semibold">Event</th>
                  <th className="pb-3 font-semibold">Peak Niño 3.4 SST Anomaly</th>
                  <th className="pb-3 font-semibold">Peak Subsurface Anomaly</th>
                  <th className="pb-3 font-semibold">Thermocline Depression</th>
                  <th className="pb-3 font-semibold">Global Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-3 font-bold text-white">1997 – 1998</td>
                  <td className="py-3 font-mono text-amber-400">+2.4°C</td>
                  <td className="py-3 font-mono text-amber-400">+9.5°C</td>
                  <td className="py-3 font-mono">+90 meters</td>
                  <td className="py-3 text-slate-400">Historic "El Niño of the Century"</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-3 font-bold text-white">2015 – 2016</td>
                  <td className="py-3 font-mono text-amber-400">+2.6°C</td>
                  <td className="py-3 font-mono text-amber-400">+10.1°C</td>
                  <td className="py-3 font-mono">+85 meters</td>
                  <td className="py-3 text-slate-400">Godzilla El Niño, record global temps</td>
                </tr>
                <tr className="bg-red-950/20 font-semibold border-l-2 border-red-500">
                  <td className="py-3 pl-2 font-bold text-red-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                    2026 – 2027 (Current)
                  </td>
                  <td className="py-3 font-mono text-red-400 font-bold">+2.5°C (projected)</td>
                  <td className="py-3 font-mono text-red-400 font-bold">&gt;+10.4°C</td>
                  <td className="py-3 font-mono text-red-300">+95 meters</td>
                  <td className="py-3 text-red-300 font-semibold">Super El Niño in progress</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

import React, { useState, useMemo } from 'react';
import {
  WIND_SCENARIOS,
  PACIFIC_MILESTONES,
  calculateProjection,
  WindScenario,
} from '../utils/projectionModel';
import {
  FastForward,
  Wind,
  Calendar,
  Compass,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Radio,
} from 'lucide-react';

interface ForwardProjectionProps {
  onSyncSimulation?: (progressVal: number) => void;
}

export const ForwardProjection: React.FC<ForwardProjectionProps> = ({ onSyncSimulation }) => {
  // Days ahead: 0 to 120 days
  const [daysAhead, setDaysAhead] = useState<number>(35);

  // Selected wind intensity scenario
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('2026-super');

  // Custom adjustable wind intensity slider
  const [customWindSpeed, setCustomWindSpeed] = useState<number>(11.8);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Active scenario
  const activeScenario: WindScenario = useMemo(() => {
    if (isCustomMode) {
      // Linear scaling of phase speed based on wind stress & baroclinic excitation
      // Base phase speed 2.0 m/s + ~0.08 per m/s of wind
      const phaseSpeedMs = +(1.8 + customWindSpeed * 0.085).toFixed(2);
      const windStressTau = +(0.002 * customWindSpeed * customWindSpeed).toFixed(2);
      const peakSubsurfaceAnomalyC = +(customWindSpeed * 0.9).toFixed(1);

      return {
        id: 'custom',
        name: `Custom Wind Burst (${customWindSpeed.toFixed(1)} m/s)`,
        historicalPeriod: 'Interactive Hypothesis',
        windIntensityMs: customWindSpeed,
        windStressTau,
        phaseSpeedMs,
        peakSubsurfaceAnomalyC,
        description: `Custom wind forcing generating an internal gravity wave with phase speed of ${phaseSpeedMs} m/s (~${Math.round(phaseSpeedMs * 86.4)} km/day).`,
      };
    }
    return WIND_SCENARIOS.find((s) => s.id === selectedScenarioId) || WIND_SCENARIOS[0];
  }, [isCustomMode, customWindSpeed, selectedScenarioId]);

  // Compute projection
  const projection = useMemo(() => {
    return calculateProjection(daysAhead, activeScenario);
  }, [daysAhead, activeScenario]);

  // Format date helper
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSelectScenario = (sc: WindScenario) => {
    setIsCustomMode(false);
    setSelectedScenarioId(sc.id);
    setCustomWindSpeed(sc.windIntensityMs);
  };

  const handleCustomWindChange = (val: number) => {
    setIsCustomMode(true);
    setCustomWindSpeed(val);
  };

  return (
    <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 md:p-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-8 relative overflow-hidden">
      {/* Background ambient decorative highlight */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
            Illustrative Scenario Model
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            Kelvin Wave Scenario Explorer
          </h3>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Explore how changing idealized wind forcing affects a simplified wave simulation. These outputs are not
            NOAA forecasts, observed wave arrivals, or coastal hazard predictions.
          </p>
        </div>

        {/* Sync Simulation Button */}
        {onSyncSimulation && (
          <button
            onClick={() => {
              onSyncSimulation(projection.simulationProgress);
              window.scrollTo({ top: 380, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 shrink-0 self-start lg:self-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Sync Main Canvas to Date ({formatDate(projection.projectedDate)})</span>
          </button>
        )}
      </div>

      {/* Section 1: Historical Wind Intensity Selector */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span>1. Historical Wind Burst Intensity (Wind Stress τ_x Forcing)</span>
          </div>

          <div className="text-xs font-mono text-cyan-300">
            Phase Speed: <span className="font-bold text-white">{activeScenario.phaseSpeedMs} m/s</span> (~
            {projection.kmPerDay} km/day)
          </div>
        </div>

        {/* Scenario Presets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {WIND_SCENARIOS.map((sc) => {
            const isSelected = !isCustomMode && selectedScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50'
                    : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                      {sc.historicalPeriod}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">+{sc.windIntensityMs} m/s</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{sc.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sc.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] font-mono text-slate-300">
                  <span>Wave Speed: {sc.phaseSpeedMs} m/s</span>
                  <span className="text-red-400 font-bold">+{sc.peakSubsurfaceAnomalyC}°C Anomaly</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Fine-Tuning Wind Speed Slider */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Fine-Tune Wind Stress Intensity:
            </span>
            <span className="font-mono text-cyan-300 font-bold text-sm">
              +{customWindSpeed.toFixed(1)} m/s (anomalous westerlies)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">Mild (4 m/s)</span>
            <input
              type="range"
              min={4.0}
              max={15.0}
              step={0.2}
              value={customWindSpeed}
              onChange={(e) => handleCustomWindChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-ew-resize focus:outline-none"
            />
            <span className="text-[11px] font-mono text-red-400 font-bold whitespace-nowrap">
              Super-Burst (15 m/s)
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Forward Projection Timeline Slider */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-6 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>2. Forward-Projection Timeline: {formatDate(projection.projectedDate)}</span>
            </div>
            <div className="text-lg font-black text-white font-mono flex items-center gap-2">
              <span>Day +{daysAhead}</span>
              <span className="text-slate-500 font-normal text-sm">from WWB Initiation (Oct 1, 2026)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Wave Front:</span>
              <span className="font-bold text-cyan-300">{projection.currentLongitude}</span>
            </div>
          </div>
        </div>

        {/* Master Forward Projection Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={120}
            step={1}
            value={daysAhead}
            onChange={(e) => setDaysAhead(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 h-3 bg-slate-800 rounded-lg cursor-ew-resize focus:outline-none shadow-sm"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Day 0 (Oct 1, 2026)</span>
            <span>Day +30 (Nov 1)</span>
            <span>Day +60 (Dec 1)</span>
            <span>Day +90 (Dec 31)</span>
            <span>Day +120 (Jan 29, 2027)</span>
          </div>
        </div>

        {/* Milestone Quick Jump Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Quick Jump:</span>
          {[
            { label: 'Day 0 (Genesis)', day: 0 },
            { label: 'Date Line (+18d)', day: 18 },
            { label: 'Niño 3.4 Impact (+36d)', day: 36 },
            { label: 'Niño 3 Basin (+50d)', day: 50 },
            { label: 'South America Hit (+64d)', day: 64 },
            { label: 'California Surge (+78d)', day: 78 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setDaysAhead(item.day)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                daysAhead === item.day
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Projected Impact Gauges at Selected Day */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Distance Traveled */}
        <div className="bg-slate-800/50 border border-slate-700/80 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Basin Distance Traveled</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {projection.distanceTraveledKm.toLocaleString()} km
          </div>
          <div className="text-[11px] text-cyan-300 mt-1">
            {Math.round((projection.distanceTraveledKm / 15570) * 100)}% of Equatorial Pacific transect
          </div>
        </div>

        {/* Metric 2: Projected Niño 3.4 SST Anomaly */}
        <div className="bg-slate-800/50 border border-slate-700/80 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Projected Niño 3.4 SST</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">+{projection.projectedNino34Anomaly}°C</div>
          <div className="text-[11px] text-red-300 font-medium mt-1">
            Simulated Niño 3.4 index
          </div>
        </div>

        {/* Metric 3: Thermocline Depression */}
        <div className="bg-slate-800/50 border border-slate-700/80 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Thermocline Depression</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">+{projection.thermoclineDepressionM} meters</div>
          <div className="text-[11px] text-amber-400 mt-1">Insulating deep-ocean thermal pulse</div>
        </div>
      </div>

      {/* Section 4: Pacific Milestone Arrival Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Estimated Milestone Arrival Schedule across the Pacific
          </h4>
          <span className="text-[11px] text-slate-400">Click any milestone to jump slider to that date</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {projection.milestoneStatuses.map((m) => {
            return (
              <div
                key={m.id}
                onClick={() => setDaysAhead(m.requiredDays)}
                className={`p-4 rounded-xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                  m.isArrivingNow
                    ? 'bg-red-950/70 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] ring-1 ring-red-400'
                    : m.hasPassed
                      ? 'bg-slate-800/30 border-slate-700/50 text-slate-400 opacity-80 hover:opacity-100'
                      : 'bg-slate-800/60 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{m.coordinate}</span>
                    {m.isArrivingNow ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white uppercase animate-pulse">
                        Arriving Now
                      </span>
                    ) : m.hasPassed ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Passed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-700">
                        In {m.daysUntil} days
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs font-bold text-white mb-1">{m.name}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{m.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">ETA:</span>
                  <span className={`font-bold ${m.isArrivingNow ? 'text-red-400 text-xs' : 'text-slate-200'}`}>
                    {formatDate(m.arrivalDate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

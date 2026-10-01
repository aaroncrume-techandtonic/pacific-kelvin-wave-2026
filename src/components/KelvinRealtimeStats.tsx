import React, { useState, useMemo } from 'react';
import { computeKelvinTelemetry } from '../utils/kelvinPhysics';
import {
  Activity,
  Flame,
  Gauge,
  Waves,
  Navigation,
  Compass,
  Zap,
  Clock,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface KelvinRealtimeStatsProps {
  progress: number;
  isPlaying: boolean;
}

export const KelvinRealtimeStats: React.FC<KelvinRealtimeStatsProps> = ({ progress, isPlaying }) => {
  const [useImperial, setUseImperial] = useState<boolean>(false);

  // Compute live physics telemetry based on current wave progress
  const telemetry = useMemo(() => {
    return computeKelvinTelemetry(progress);
  }, [progress]);

  return (
    <div className="rounded-2xl border border-cyan-500/50 bg-slate-900/80 backdrop-blur-md shadow-2xl p-5 md:p-6 space-y-6 relative overflow-hidden">
      {/* Decorative pulse glow */}
      <div className="absolute top-0 right-1/4 w-80 h-32 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Top Telemetry Header & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-3 h-3 rounded-full ${
                isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              } absolute`}
            ></span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-amber-400'} relative`}
            ></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Real-Time Kelvin Wave Hydrodynamic Telemetry
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                {isPlaying ? 'ACTIVE STREAM' : 'SYNCHRONIZED'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Instantaneous physical values tracking the wave crest across the equatorial waveguide
            </div>
          </div>
        </div>

        {/* Controls: Unit Toggle & Basin Zone Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 font-mono flex items-center gap-1.5 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-white font-bold">{telemetry.longitudeStr}</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300">{telemetry.zoneTag}</span>
          </div>

          <button
            onClick={() => setUseImperial(!useImperial)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Toggle between Metric and Imperial units"
          >
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            <span>{useImperial ? 'Imperial (°F, ft)' : 'Metric (°C, m)'}</span>
          </button>
        </div>
      </div>

      {/* Basin Transect Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-cyan-400" />
            Equatorial Pacific Transit Progress:
          </span>
          <span className="text-cyan-300 font-bold">
            {telemetry.percentTransited}% Completed ({telemetry.distanceKm.toLocaleString()}{' '}
            {useImperial ? 'mi' : 'km'} / 15,570 {useImperial ? 'mi' : 'km'})
          </span>
        </div>

        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 relative">
          <div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 via-amber-400 to-red-500 h-full rounded-full transition-all duration-150"
            style={{ width: `${Math.max(2, telemetry.percentTransited)}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
          <span>140°E (Indonesia)</span>
          <span>165°E (Warm Pool)</span>
          <span>180° (Date Line)</span>
          <span>140°W (Niño 3.4)</span>
          <span>110°W (Niño 3)</span>
          <span>80°W (Americas)</span>
        </div>
      </div>

      {/* Real-Time Primary Gauges Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Metric 1: Phase Propagation Speed */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/70 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Phase Speed (c)</span>
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl md:text-2xl font-black text-white font-mono">
              {useImperial ? `${telemetry.phaseSpeedMph}` : `${telemetry.phaseSpeedMs}`}
              <span className="text-xs font-normal text-slate-400 ml-1">
                {useImperial ? 'mph' : 'm/s'}
              </span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-cyan-400 mt-2 pt-1 border-t border-slate-700/50">
            ~{telemetry.phaseSpeedKmDay} km/day
          </div>
        </div>

        {/* Metric 2: Peak Subsurface Core Anomaly */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/70 flex flex-col justify-between hover:border-red-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Core Anomaly</span>
              <Flame className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-xl md:text-2xl font-black text-red-400 font-mono">
              +{useImperial ? `${telemetry.tempAnomalyF}°F` : `${telemetry.tempAnomalyC}°C`}
            </div>
          </div>
          <div className="text-[10px] font-mono text-red-300 mt-2 pt-1 border-t border-slate-700/50 flex items-center justify-between">
            <span>Core: {useImperial ? `${telemetry.coreTempF}°F` : `${telemetry.coreTempC}°C`}</span>
            <span className="text-[9px] px-1 rounded bg-red-950 text-red-400 font-bold">99.9%</span>
          </div>
        </div>

        {/* Metric 3: Thermocline Downwelling Depth */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/70 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Thermocline Depth</span>
              <Waves className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl md:text-2xl font-black text-amber-300 font-mono">
              {useImperial ? `${telemetry.thermoclineDepthFt} ft` : `${telemetry.thermoclineDepthM} m`}
            </div>
          </div>
          <div className="text-[10px] font-mono text-amber-400 mt-2 pt-1 border-t border-slate-700/50">
            Downwelling: +{telemetry.thermoclineDepressionM}m
          </div>
        </div>

        {/* Metric 4: Sea Surface Height Anomaly (SSHA) */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/70 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Sea Height (SSHA)</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl md:text-2xl font-black text-cyan-300 font-mono">
              +{useImperial ? `${telemetry.sshaInches} in` : `${telemetry.sshaCm} cm`}
            </div>
          </div>
          <div className="text-[10px] font-mono text-cyan-400 mt-2 pt-1 border-t border-slate-700/50">
            Thermal Expansion Bulge
          </div>
        </div>

        {/* Metric 5: Planetary Heat Transport (Joules) */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/70 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Thermal Energy</span>
              <Zap className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl md:text-2xl font-black text-purple-300 font-mono">
              {telemetry.heatEnergyZJ}
              <span className="text-xs font-normal text-slate-400 ml-1">ZJ</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-purple-300 mt-2 pt-1 border-t border-slate-700/50">
            {telemetry.heatEnergyZJ} × 10²¹ Joules
          </div>
        </div>

        {/* Metric 6: Zonal Volume Transport (Sverdrups) */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/70 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Volume Transport</span>
              <Radio className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl md:text-2xl font-black text-blue-300 font-mono">
              {telemetry.volumeTransportSv}
              <span className="text-xs font-normal text-slate-400 ml-1">Sv</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-blue-300 mt-2 pt-1 border-t border-slate-700/50">
            1 Sv = 1,000,000 m³/s
          </div>
        </div>
      </div>

      {/* Live Proximity & Geostrophic Waveguide Alert Ticker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Waveguide Trapping Width */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Rossby Trapping Radius (Re)</span>
              <span className="font-bold text-white font-mono">±{telemetry.rossbyRadiusKm} km (±2.2° Lat)</span>
            </div>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">Coriolis Beta Trap</span>
        </div>

        {/* Nearest TAO Mooring Sensor Array */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Nearest TAO Buoy Station</span>
              <span className="font-bold text-white font-mono">
                {telemetry.closestBuoy.name} ({telemetry.closestBuoy.distanceToWaveKm} km)
              </span>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
              telemetry.closestBuoy.status === 'in-range'
                ? 'bg-red-950 text-red-400 border border-red-500/40 animate-pulse'
                : 'bg-slate-900 text-slate-400 border border-slate-700'
            }`}
          >
            {telemetry.closestBuoy.status === 'in-range' ? 'OVERHEAD' : 'APPROACHING'}
          </span>
        </div>

        {/* Estimated Time to South America Surfacing */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">ETA to South America (80°W)</span>
              <span className="font-bold text-white font-mono">
                {telemetry.daysToCoast > 0 ? `${telemetry.daysToCoast} days (${telemetry.hoursToCoast}h)` : 'Impact Active'}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-red-400 font-mono">Surfacing Onset</span>
        </div>
      </div>
    </div>
  );
};

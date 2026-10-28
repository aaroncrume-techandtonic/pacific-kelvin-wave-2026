import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HISTORICAL_TIMELINE_MONTHS, MonthlyEventPoint } from '../data/timelineEventData';
import {
  Calendar,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Thermometer,
  Waves,
  ArrowUpRight,
  Compass,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Clock,
  Zap,
} from 'lucide-react';

interface HistoricalTimelineOverlayProps {
  currentProgress: number;
  onProgressChange: (newProgress: number) => void;
  onCoastalDayChange?: (coastalDay: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onPauseSimulation?: () => void;
}

export const HistoricalTimelineOverlay: React.FC<HistoricalTimelineOverlayProps> = ({
  currentProgress,
  onProgressChange,
  onCoastalDayChange,
  isPlaying,
  onTogglePlay,
  onPauseSimulation,
}) => {
  // Scrub value: non-null ONLY while actively dragging the range slider
  const [scrubVal, setScrubVal] = useState<number | null>(null);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);
  const [timelineSpeed, setTimelineSpeed] = useState<number>(1.0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Pure helper: Convert progress (-0.3 to 1.3) into continuous slider index [0 .. 7]
  const progressToSliderValue = (progress: number): number => {
    const minProg = HISTORICAL_TIMELINE_MONTHS[0].progress;
    const maxProg = HISTORICAL_TIMELINE_MONTHS[HISTORICAL_TIMELINE_MONTHS.length - 1].progress;

    if (progress <= minProg) return 0;
    if (progress >= maxProg) return HISTORICAL_TIMELINE_MONTHS.length - 1;

    for (let i = 0; i < HISTORICAL_TIMELINE_MONTHS.length - 1; i++) {
      const p1 = HISTORICAL_TIMELINE_MONTHS[i].progress;
      const p2 = HISTORICAL_TIMELINE_MONTHS[i + 1].progress;
      if (progress >= p1 && progress <= p2) {
        const frac = (progress - p1) / (p2 - p1);
        return i + frac;
      }
    }
    return 0;
  };

  // Pure helper: Convert slider position [0 .. 7] to progress value
  const sliderValueToProgress = (val: number): number => {
    const clamped = Math.max(0, Math.min(HISTORICAL_TIMELINE_MONTHS.length - 1, val));
    const lIdx = Math.floor(clamped);
    const uIdx = Math.min(HISTORICAL_TIMELINE_MONTHS.length - 1, Math.ceil(clamped));
    const frac = clamped - lIdx;

    const p1 = HISTORICAL_TIMELINE_MONTHS[lIdx].progress;
    const p2 = HISTORICAL_TIMELINE_MONTHS[uIdx].progress;
    return p1 + frac * (p2 - p1);
  };

  // Pure helper: Convert slider position [0 .. 7] to coastal day
  const sliderValueToCoastalDay = (val: number): number => {
    const clamped = Math.max(0, Math.min(HISTORICAL_TIMELINE_MONTHS.length - 1, val));
    const lIdx = Math.floor(clamped);
    const uIdx = Math.min(HISTORICAL_TIMELINE_MONTHS.length - 1, Math.ceil(clamped));
    const frac = clamped - lIdx;

    const c1 = HISTORICAL_TIMELINE_MONTHS[lIdx].coastalDay;
    const c2 = HISTORICAL_TIMELINE_MONTHS[uIdx].coastalDay;
    return Math.round(c1 + frac * (c2 - c1));
  };

  // Purely derived slider value during render (no setState loop, instant synchronization)
  const derivedSliderVal = progressToSliderValue(currentProgress);
  const sliderVal = scrubVal !== null ? scrubVal : derivedSliderVal;

  // Interpolated metrics calculation
  const lowerIdx = Math.max(0, Math.min(HISTORICAL_TIMELINE_MONTHS.length - 1, Math.floor(sliderVal)));
  const upperIdx = Math.max(0, Math.min(HISTORICAL_TIMELINE_MONTHS.length - 1, Math.ceil(sliderVal)));
  const fraction = sliderVal - lowerIdx;

  const lowerPoint = HISTORICAL_TIMELINE_MONTHS[lowerIdx];
  const upperPoint = HISTORICAL_TIMELINE_MONTHS[upperIdx];

  // Nearest month for categorical data
  const nearestIdx = Math.round(sliderVal);
  const activeMonth = HISTORICAL_TIMELINE_MONTHS[nearestIdx];

  // Interpolated numerical metrics
  const displaySubsurfaceTemp = (
    lowerPoint.subsurfaceCoreAnomaly +
    fraction * (upperPoint.subsurfaceCoreAnomaly - lowerPoint.subsurfaceCoreAnomaly)
  ).toFixed(1);

  const displayNino34Sst = (
    lowerPoint.nino34Sst +
    fraction * (upperPoint.nino34Sst - lowerPoint.nino34Sst)
  ).toFixed(1);

  const displayThermoclineDepth = Math.round(
    lowerPoint.thermoclineDepthM +
      fraction * (upperPoint.thermoclineDepthM - lowerPoint.thermoclineDepthM)
  );

  const displayThermoclineDepression = Math.round(
    lowerPoint.thermoclineDepressionM +
      fraction * (upperPoint.thermoclineDepressionM - lowerPoint.thermoclineDepressionM)
  );

  const displaySshaCm = (
    lowerPoint.sshaSurgeCm +
    fraction * (upperPoint.sshaSurgeCm - lowerPoint.sshaSurgeCm)
  ).toFixed(1);

  const displaySshaInches = (
    lowerPoint.sshaSurgeInches +
    fraction * (upperPoint.sshaSurgeInches - lowerPoint.sshaSurgeInches)
  ).toFixed(1);

  const displayOni = (
    lowerPoint.oni +
    fraction * (upperPoint.oni - lowerPoint.oni)
  ).toFixed(1);

  const displayWindAnomaly = (
    lowerPoint.zonalWindAnomalyMs +
    fraction * (upperPoint.zonalWindAnomalyMs - lowerPoint.zonalWindAnomalyMs)
  ).toFixed(1);

  // Keep latest props in refs for safe interval playback
  const currentProgressRef = useRef(currentProgress);
  useEffect(() => {
    currentProgressRef.current = currentProgress;
  }, [currentProgress]);

  const onProgressChangeRef = useRef(onProgressChange);
  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
  }, [onProgressChange]);

  const onCoastalDayChangeRef = useRef(onCoastalDayChange);
  useEffect(() => {
    onCoastalDayChangeRef.current = onCoastalDayChange;
  }, [onCoastalDayChange]);

  // Timeline auto-stepping playback loop (only depends on playback state and speed)
  useEffect(() => {
    if (!isTimelinePlaying) return;

    const intervalMs = Math.round(2200 / timelineSpeed);
    const timer = setInterval(() => {
      const currentVal = progressToSliderValue(currentProgressRef.current);
      const nextInt = (Math.floor(currentVal) + 1) % HISTORICAL_TIMELINE_MONTHS.length;
      const targetProg = HISTORICAL_TIMELINE_MONTHS[nextInt].progress;
      onProgressChangeRef.current(targetProg);
      if (onCoastalDayChangeRef.current) {
        onCoastalDayChangeRef.current(HISTORICAL_TIMELINE_MONTHS[nextInt].coastalDay);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isTimelinePlaying, timelineSpeed]);

  const handleMonthNodeClick = (idx: number) => {
    setIsTimelinePlaying(false);
    setScrubVal(null);
    if (onPauseSimulation) onPauseSimulation();
    const targetProg = HISTORICAL_TIMELINE_MONTHS[idx].progress;
    onProgressChange(targetProg);
    if (onCoastalDayChange) {
      onCoastalDayChange(HISTORICAL_TIMELINE_MONTHS[idx].coastalDay);
    }
  };

  const handleStep = (delta: number) => {
    setIsTimelinePlaying(false);
    setScrubVal(null);
    if (onPauseSimulation) onPauseSimulation();
    const nextIdx = Math.max(0, Math.min(HISTORICAL_TIMELINE_MONTHS.length - 1, Math.round(sliderVal) + delta));
    const targetProg = HISTORICAL_TIMELINE_MONTHS[nextIdx].progress;
    onProgressChange(targetProg);
    if (onCoastalDayChange) {
      onCoastalDayChange(HISTORICAL_TIMELINE_MONTHS[nextIdx].coastalDay);
    }
  };

  const handleResetToCurrent = () => {
    setIsTimelinePlaying(false);
    setScrubVal(null);
    if (onPauseSimulation) onPauseSimulation();
    const targetProg = HISTORICAL_TIMELINE_MONTHS[2].progress; // October 2026
    onProgressChange(targetProg);
    if (onCoastalDayChange) {
      onCoastalDayChange(HISTORICAL_TIMELINE_MONTHS[2].coastalDay);
    }
  };

  const handleRangeChange = (val: number) => {
    setScrubVal(val);
    const targetProg = sliderValueToProgress(val);
    onProgressChange(targetProg);
    if (onCoastalDayChange) {
      onCoastalDayChange(sliderValueToCoastalDay(val));
    }
  };

  return (
    <div className="w-full bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300">
      {/* Top Header & Playback Control Deck */}
      <div className="p-3.5 md:p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/35 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-cyan-400" />
                Illustrative 2026/2027 Scenario Timeline
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeMonth.riskCategory === 'Historic'
                    ? 'bg-red-950/80 text-red-300 border border-red-500/50'
                    : activeMonth.riskCategory === 'Extreme'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                    : 'bg-blue-950/80 text-blue-300 border border-blue-500/50'
                }`}
              >
                {activeMonth.badgeLabel}
              </span>
            </div>
            <div className="text-base md:text-lg font-black text-white flex flex-wrap items-center gap-2 mt-0.5">
              <span>{activeMonth.fullDate}:</span>
              <span className="text-slate-300 font-medium text-xs md:text-sm">
                {activeMonth.eventPhase}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-amber-950/40 border-b border-amber-500/20 text-xs text-amber-100/90">
          Scenario only: dates and plotted quantities are illustrative, not historical observations or an NOAA forecast.
        </div>

        {/* Stepper, Playback & Mode Controls */}
        <div className="flex items-center gap-2">
          {/* Step Back / Forward */}
          <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800 shadow-sm">
            <button
              onClick={() => handleStep(-1)}
              disabled={sliderVal <= 0.05}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Previous Historical Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Play Cycle Button */}
            <button
              onClick={() => {
                if (onPauseSimulation && !isTimelinePlaying) {
                  onPauseSimulation();
                }
                setIsTimelinePlaying(!isTimelinePlaying);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isTimelinePlaying
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              }`}
              title={isTimelinePlaying ? 'Pause timeline cycle' : 'Autoplay through historical months'}
            >
              {isTimelinePlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Cycle</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Cycle</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleStep(1)}
              disabled={sliderVal >= HISTORICAL_TIMELINE_MONTHS.length - 1 - 0.05}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Next Historical Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Reset to October 2026 */}
          <button
            onClick={handleResetToCurrent}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 text-xs transition-colors cursor-pointer"
            title="Reset to current live observation (Oct 2026)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Toggle */}
          {isTimelinePlaying && (
            <div className="hidden sm:flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800 text-[11px] font-mono">
              {[0.5, 1.0, 2.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setTimelineSpeed(spd)}
                  className={`px-1.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    timelineSpeed === spd
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          )}

          {/* Expand / Collapse Telemetry Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-mono transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse data shift cards' : 'Expand full telemetry shifts'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">{isExpanded ? 'Compact' : 'Data Shifts'}</span>
          </button>
        </div>
      </div>

      {/* Scrub Track with Month Nodes */}
      <div className="px-4 md:px-6 pt-3 pb-4 bg-slate-950/70 space-y-3">
        {/* Continuous Range Track */}
        <div className="relative pt-1">
          <input
            type="range"
            min={0}
            max={HISTORICAL_TIMELINE_MONTHS.length - 1}
            step={0.02}
            value={sliderVal}
            onMouseDown={() => {
              setScrubVal(sliderVal);
              setIsTimelinePlaying(false);
              if (onPauseSimulation) onPauseSimulation();
            }}
            onTouchStart={() => {
              setScrubVal(sliderVal);
              setIsTimelinePlaying(false);
              if (onPauseSimulation) onPauseSimulation();
            }}
            onMouseUp={() => setScrubVal(null)}
            onTouchEnd={() => setScrubVal(null)}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              handleRangeChange(val);
            }}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer focus:outline-none shadow-inner"
            title="Scrub timeline slider smoothly"
          />
        </div>

        {/* Month Buttons Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {HISTORICAL_TIMELINE_MONTHS.map((m, idx) => {
            const isClosest = nearestIdx === idx;
            return (
              <button
                key={m.id}
                onClick={() => handleMonthNodeClick(idx)}
                className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer text-xs font-mono border relative group ${
                  isClosest
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)] scale-102 z-10'
                    : 'bg-slate-900/70 hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 border-slate-800'
                }`}
              >
                <div className="text-[11px] font-bold truncate">{m.monthLabel.split(' ')[0]}</div>
                <div
                  className={`text-[9px] ${
                    isClosest ? 'text-slate-950 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  '{m.monthLabel.split(' ')[1].slice(2)}
                </div>

                {/* Subsurface Anomaly Preview Pip */}
                <div
                  className={`mt-0.5 text-[8.5px] font-mono leading-none ${
                    isClosest
                      ? 'text-slate-900 font-black'
                      : m.subsurfaceCoreAnomaly >= 9
                      ? 'text-red-400'
                      : 'text-cyan-400'
                  }`}
                >
                  +{m.subsurfaceCoreAnomaly}°C
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Scenario Metrics */}
      {isExpanded && (
        <div className="p-4 md:p-5 bg-slate-950/95 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
          {/* Scientific Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Peak Subsurface Core Temp Anomaly */}
            <div className="bg-slate-900/85 p-3 rounded-xl border border-slate-800 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-red-400" />
                  Subsurface Temp Anomaly
                </span>
                <span className="text-[10px] font-mono text-red-400 font-bold">Model value</span>
              </div>
              <div className="text-2xl font-black text-red-400 font-mono tracking-tight">
                +{displaySubsurfaceTemp}°C
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Niño 3.4 SST:</span>
                <span className="text-slate-200 font-bold font-mono">{displayNino34Sst}°C</span>
              </div>
            </div>

            {/* Thermocline Depression Depth */}
            <div className="bg-slate-900/85 p-3 rounded-xl border border-slate-800 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  Thermocline Downwelling
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">20°C Isotherm</span>
              </div>
              <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight">
                {displayThermoclineDepth}m
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Depression Below Normal:</span>
                <span className="text-cyan-400 font-bold font-mono">+{displayThermoclineDepression}m</span>
              </div>
            </div>

            {/* Satellite Altimetry Surge (SSHA) */}
            <div className="bg-slate-900/85 p-3 rounded-xl border border-slate-800 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                  Altimetry Surge (SSHA)
                </span>
                <span className="text-[10px] font-mono text-blue-400 font-bold">Scenario</span>
              </div>
              <div className="text-2xl font-black text-blue-300 font-mono tracking-tight">
                +{displaySshaCm} cm
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Equivalent Height:</span>
                <span className="text-slate-200 font-bold font-mono">+{displaySshaInches} inches</span>
              </div>
            </div>

            {/* Oceanic Niño Index & Wind Stress */}
            <div className="bg-slate-900/85 p-3 rounded-xl border border-slate-800 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  ONI &amp; Zonal Winds
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-bold">Coupled</span>
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                +{displayOni}°C
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Westerly Wind Anomaly:</span>
                <span className="text-amber-300 font-bold font-mono">+{displayWindAnomaly} m/s</span>
              </div>
            </div>
          </div>

          {/* Historical Narrative & Basin Location */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-white text-[11px] uppercase tracking-wider font-mono">
                  Basin Focal Position:
                </span>
                <span className="text-cyan-300 font-bold font-mono">
                  {activeMonth.basinLocation}
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {activeMonth.summary}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
              <span className="text-[11px] font-mono text-slate-400">Scenario index:</span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  parseFloat(displayOni) >= 2.0
                    ? 'bg-red-950/80 text-red-300 border border-red-500/50'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                }`}
              >
                {parseFloat(displayOni) >= 2.0 ? 'At least +2.0°C' : 'Below +2.0°C'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { COASTAL_STATIONS } from '../data/coastalTrajectoryData';
import { CoastalStation } from '../types/kelvin';
import {
  MapPin,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Waves,
  Thermometer,
  CloudRain,
  Eye,
  Info,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Gauge,
  Sliders,
  Compass,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface NorthAmericanTrajectoryMapProps {
  onSyncSimulationProgress?: (progress: number) => void;
}

export const NorthAmericanTrajectoryMap: React.FC<NorthAmericanTrajectoryMapProps> = ({
  onSyncSimulationProgress,
}) => {
  // Days from WWB initiation: Day 65 (Equatorial landfall) to Day 120 (Alaska)
  // Default to Day 90 (San Diego Arrival / January King Tides Peak)
  const [coastalDay, setCoastalDay] = useState<number>(90);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  // Speed multiplier: 0.2 (Ultra slow), 0.5 (Slow - default), 1.0 (Normal)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.5);
  const [selectedStation, setSelectedStation] = useState<CoastalStation>(COASTAL_STATIONS[3]); // San Diego
  const [hoveredStation, setHoveredStation] = useState<CoastalStation | null>(null);

  // Layer toggles
  const [showAtmosphericRivers, setShowAtmosphericRivers] = useState<boolean>(true);
  const [showKingTidesRisk, setShowKingTidesRisk] = useState<boolean>(true);
  const [showThermalAnomaly, setShowThermalAnomaly] = useState<boolean>(true);
  const [showBathymetry, setShowBathymetry] = useState<boolean>(true);

  // Continuous animation frame loop for butter-smooth, slow propagation
  const lastTimeRef = useRef<number>(performance.now());
  useEffect(() => {
    let animId: number;

    const animate = (time: number) => {
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying) {
        // At 0.5x speed: 1 coastal day advances every 1.5 seconds (~80 seconds for full transit)
        // At 0.2x speed: 1 coastal day advances every 3.75 seconds (~200 seconds for ultra-slow study)
        const dayIncrement = (delta * 0.7) * playbackSpeed;

        setCoastalDay((prev) => {
          const next = prev + dayIncrement;
          if (next > 120) {
            return 65; // Loop back to Central America
          }
          return next;
        });
      }
      animId = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed]);

  // Convert coastalDay to date
  const baseDate = new Date('2026-10-01T00:00:00');
  const currentDate = new Date(baseDate.getTime() + coastalDay * 86400 * 1000);
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate current wave pulse latitude along coast
  // Day 68 ~ 8°N, Day 116 ~ 54°N => ~1° latitude every 1.05 days
  const currentLatitude = Math.min(56, Math.max(7, 8 + (coastalDay - 68) * 0.95));

  // Find nearest station currently feeling the wave peak
  const activeStation = COASTAL_STATIONS.reduce((prev, curr) => {
    return Math.abs(curr.latitude - currentLatitude) < Math.abs(prev.latitude - currentLatitude)
      ? curr
      : prev;
  }, COASTAL_STATIONS[0]);

  // Jump to specific station
  const handleJumpToStation = (station: CoastalStation) => {
    setCoastalDay(station.estArrivalDay);
    setSelectedStation(station);
  };

  // Step controls
  const handleStepDay = (delta: number) => {
    setCoastalDay((prev) => Math.min(120, Math.max(65, prev + delta)));
  };

  const handleNextStation = () => {
    const currentIndex = COASTAL_STATIONS.findIndex((s) => s.id === selectedStation.id);
    const nextIndex = (currentIndex + 1) % COASTAL_STATIONS.length;
    handleJumpToStation(COASTAL_STATIONS[nextIndex]);
  };

  const handlePrevStation = () => {
    const currentIndex = COASTAL_STATIONS.findIndex((s) => s.id === selectedStation.id);
    const prevIndex = (currentIndex - 1 + COASTAL_STATIONS.length) % COASTAL_STATIONS.length;
    handleJumpToStation(COASTAL_STATIONS[prevIndex]);
  };

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl p-5 md:p-8 space-y-6">
      {/* Header & Scientific Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Waves className="w-4 h-4 text-cyan-400" />
            Poleward Coastal Kelvin Wave (CKW) Trajectory & High-Tide Surge
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            North American West Coast Trajectory Map
          </h3>
          <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Upon striking the Americas at 80°W, the equatorial Kelvin wave bifurcates into a boundary-trapped coastal
            Kelvin wave. Trapped against the continental slope by Coriolis acceleration, it sweeps north along California,
            Oregon, and Washington, elevating total sea heights by 6–12 inches during winter King Tides.
          </p>
        </div>

        {/* Master Control Deck: Play/Pause, Slower Speeds & Stepping */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto bg-slate-950/80 p-2 rounded-2xl border border-slate-800 shadow-lg">
          {/* Play / Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play Slow'}</span>
          </button>

          {/* Slower Speed Selector Buttons */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs">
            {[
              { val: 0.2, label: '0.2x', desc: 'Ultra Slow' },
              { val: 0.5, label: '0.5x', desc: 'Slow' },
              { val: 1.0, label: '1.0x', desc: 'Normal' },
            ].map((sp) => (
              <button
                key={sp.val}
                onClick={() => setPlaybackSpeed(sp.val)}
                title={`${sp.desc} speed (${sp.label})`}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                  playbackSpeed === sp.val
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Day Stepper (-1d / +1d) */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => handleStepDay(-1)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-colors cursor-pointer"
              title="Step backward 1 day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleStepDay(1)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-colors cursor-pointer"
              title="Step forward 1 day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCoastalDay(68)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-colors cursor-pointer"
              title="Reset to Central America reflection point (Day 68)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Scrub Deck with Key Milestone Cards */}
      <div className="p-4 md:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-white font-mono uppercase tracking-wider text-[11px] text-cyan-400">
              Simulation Calendar:
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-extrabold font-mono text-sm shadow-sm">
              {formattedDate}
            </span>
            <span className="text-slate-400 font-mono text-xs">
              (Day +{Math.round(coastalDay)} from WWB genesis)
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Current Wave Front:</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-950/80 text-white border border-blue-500/40 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              ~{currentLatitude.toFixed(1)}°N ({activeStation.name.split(' (')[0]})
            </span>
          </div>
        </div>

        {/* Custom Scrub Slider */}
        <div className="relative pt-1 pb-1">
          <input
            type="range"
            min={65}
            max={120}
            step={0.1}
            value={coastalDay}
            onChange={(e) => setCoastalDay(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-2.5 bg-slate-800 rounded-lg cursor-ew-resize focus:outline-none"
          />
        </div>

        {/* Milestone Quick-Jump Hotspots */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick-Jump to Key Propagation Hotspots:
            </span>
            <span className="text-slate-500 text-[10px]">Click any stop to jump timeline</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { id: 'panama', day: 68, name: 'Panama (8°N)', tag: 'Dec 08' },
              { id: 'baja', day: 82, name: 'Baja (23°N)', tag: 'Dec 22' },
              { id: 'san-diego', day: 90, name: 'San Diego (33°N)', tag: 'Dec 30' },
              { id: 'san-francisco', day: 98, name: 'SF Bay (38°N)', tag: 'Jan 07' },
              { id: 'crescent-city', day: 104, name: 'Crescent City (42°N)', tag: 'Jan 13' },
              { id: 'columbia-river', day: 107, name: 'Columbia R. (46°N)', tag: 'Jan 16' },
              { id: 'puget-sound', day: 110, name: 'Seattle (48°N)', tag: 'Jan 19' },
            ].map((ms) => {
              const station = COASTAL_STATIONS.find((s) => s.id === ms.id)!;
              const isCurrent = Math.abs(coastalDay - ms.day) < 2;
              return (
                <button
                  key={ms.id}
                  onClick={() => handleJumpToStation(station)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-bold truncate">{ms.name}</div>
                  <div className="text-[10px] font-mono text-cyan-400 flex items-center justify-between mt-0.5">
                    <span>{ms.tag}</span>
                    <span className="text-slate-500">Day +{ms.day}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Graphic Layer Toggles Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowKingTidesRisk(!showKingTidesRisk)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              showKingTidesRisk
                ? 'bg-red-950/80 border-red-500 text-red-200 shadow-sm shadow-red-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>King Tides High Hazard Zones</span>
          </button>

          <button
            onClick={() => setShowAtmosphericRivers(!showAtmosphericRivers)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              showAtmosphericRivers
                ? 'bg-blue-950/80 border-blue-500 text-blue-200 shadow-sm shadow-blue-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Atmospheric River Stream ("Pineapple Express")</span>
          </button>

          <button
            onClick={() => setShowThermalAnomaly(!showThermalAnomaly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              showThermalAnomaly
                ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>Coastal SST Warm Anomaly</span>
          </button>

          <button
            onClick={() => setShowBathymetry(!showBathymetry)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              showBathymetry
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ocean Bathymetry & 200m Shelf</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
          <span>Boundary Phase Speed:</span>
          <span className="text-white font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
            ~1.7 m/s (150 km/day)
          </span>
        </div>
      </div>

      {/* Main Map & Station Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Coastal Vector Map (7 cols on large screens) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden min-h-[520px] md:min-h-[640px] flex items-center justify-center shadow-inner">
          {/* Subtle Nautical Coordinate Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

          {/* SVG Map Canvas */}
          <svg
            viewBox="0 0 700 780"
            className="w-full h-full max-h-[720px] select-none pointer-events-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Landmass Shading Gradient with Terrain Depth */}
              <linearGradient id="landGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="35%" stopColor="#17223b" />
                <stop offset="70%" stopColor="#111c30" />
                <stop offset="100%" stopColor="#0b1220" />
              </linearGradient>

              {/* Ocean Depth Gradient */}
              <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#020817" />
                <stop offset="45%" stopColor="#03122c" />
                <stop offset="85%" stopColor="#06224a" />
                <stop offset="100%" stopColor="#082b5c" />
              </linearGradient>

              {/* Coastal Wave Energy Core Glow */}
              <filter id="waveGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
              </filter>

              {/* Continental Shelf Halo Glow */}
              <filter id="shelfGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
              </filter>

              {/* Atmospheric River Gradient */}
              <linearGradient id="arGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
                <stop offset="25%" stopColor="rgba(56, 189, 248, 0.25)" />
                <stop offset="70%" stopColor="rgba(59, 130, 246, 0.75)" />
                <stop offset="95%" stopColor="rgba(147, 197, 253, 0.9)" />
                <stop offset="100%" stopColor="rgba(37, 99, 235, 0.1)" />
              </linearGradient>

              {/* SSHA Surge Gradient along Coast */}
              <linearGradient id="surgeGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* 1. Deep Ocean Background (Pacific Ocean) */}
            <rect width="700" height="780" fill="url(#oceanGrad)" />

            {/* Bathymetric Depth Contours (if enabled) */}
            {showBathymetry && (
              <g opacity="0.85">
                {/* 4000m Abyssal Plain Contour */}
                <path
                  d="M 40 760 C 110 650, 180 570, 230 460 C 260 380, 200 240, 120 90"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.12)"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                />
                <text x="50" y="720" fill="rgba(56, 189, 248, 0.25)" fontSize="9" fontFamily="monospace">
                  -4,000m Abyssal Plain
                </text>

                {/* 2000m Continental Slope Contour */}
                <path
                  d="M 110 760 C 200 660, 270 580, 305 470 C 325 390, 250 260, 175 80"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.18)"
                  strokeWidth="2"
                />
                <text x="120" y="660" fill="rgba(56, 189, 248, 0.3)" fontSize="9" fontFamily="monospace">
                  -2,000m Continental Slope
                </text>

                {/* Mendocino Fracture Zone / Gorda Ridge Submarine Trench (40°N) */}
                <path
                  d="M 50 435 C 130 432, 220 430, 290 428"
                  fill="none"
                  stroke="rgba(244, 63, 94, 0.3)"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                />
                <text x="60" y="425" fill="rgba(244, 63, 94, 0.5)" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  Mendocino Fracture Zone / Gorda Escarpment
                </text>

                {/* Cascadia Subduction Zone Margin (43°N–50°N) */}
                <path
                  d="M 180 120 C 215 220, 245 320, 275 380"
                  fill="none"
                  stroke="rgba(14, 165, 233, 0.35)"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                />
                <text x="140" y="220" fill="rgba(14, 165, 233, 0.45)" fontSize="8.5" fontFamily="monospace">
                  Cascadia Continental Margin
                </text>
              </g>
            )}

            {/* Ocean Geographic Water Labels */}
            <text x="60" y="270" fill="rgba(56, 189, 248, 0.2)" fontSize="18" fontFamily="sans-serif" fontWeight="900" letterSpacing="4">
              PACIFIC OCEAN
            </text>
            <text x="60" y="295" fill="rgba(148, 163, 184, 0.25)" fontSize="10.5" fontFamily="monospace">
              EASTERN BOUNDARY CURRENT SYSTEM (WATER SIDE)
            </text>

            {/* Atmospheric River Moisture Stream ("Pineapple Express") */}
            {showAtmosphericRivers && (
              <g opacity="0.9">
                <path
                  d="M 20 540 C 130 490, 220 435, 310 390 C 335 375, 365 370, 415 385"
                  fill="none"
                  stroke="url(#arGrad)"
                  strokeWidth="38"
                  strokeLinecap="round"
                />
                <path
                  d="M 15 580 C 115 530, 205 475, 315 435 C 340 425, 370 420, 420 430"
                  fill="none"
                  stroke="url(#arGrad)"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                <text x="35" y="490" fill="#38bdf8" fontSize="10.5" fontFamily="sans-serif" fontWeight="bold">
                  Atmospheric River Moisture Stream (Pineapple Express)
                </text>
                <text x="35" y="508" fill="rgba(148, 163, 184, 0.7)" fontSize="9" fontFamily="monospace">
                  Integrated Vapor Transport (IVT &gt; 800 kg/m/s)
                </text>
              </g>
            )}

            {/* 2. Continental Shelf Shading (0-200m Shallow Ocean Boundary) */}
            {/* Lies strictly offshore in the water, hugging the continent */}
            <path
              d="M 585 710
                 C 525 675, 480 640, 445 620
                 C 410 600, 380 565, 355 530
                 C 335 500, 315 465, 290 425
                 C 270 380, 255 335, 250 280
                 C 245 235, 235 180, 180 90
                 L 210 80
                 C 265 170, 275 225, 280 270
                 C 285 325, 300 370, 320 415
                 C 345 455, 365 490, 385 520
                 C 410 555, 440 590, 475 610
                 C 510 630, 555 665, 615 700
                 Z"
              fill="rgba(6, 182, 212, 0.12)"
              filter="url(#shelfGlow)"
            />

            {/* 3. North America Continental Landmass (RIGHT / EAST SIDE) */}
            <path
              d="M 210 80
                 C 230 110, 250 145, 265 180
                 C 275 210, 280 240, 282 270
                 C 284 300, 286 335, 290 365
                 C 298 395, 312 418, 325 435
                 C 338 452, 355 475, 370 495
                 C 382 510, 390 530, 395 555
                 C 402 580, 420 605, 430 620
                 C 426 625, 418 625, 412 615
                 C 402 595, 390 570, 385 550
                 C 380 530, 375 515, 365 495
                 C 350 470, 335 450, 320 430
                 C 305 410, 292 385, 288 355
                 C 285 325, 282 290, 280 260
                 C 278 230, 270 200, 260 170
                 C 245 135, 225 105, 205 75
                 L 700 75
                 L 700 770
                 L 625 725
                 C 565 680, 520 645, 485 625
                 C 460 610, 440 595, 435 570
                 C 438 555, 445 550, 452 560
                 C 465 580, 485 600, 510 618
                 C 545 645, 580 675, 625 705
                 Z"
              fill="url(#landGrad)"
              stroke="#334155"
              strokeWidth="2"
            />

            {/* Simplified solid continental body to ensure land is filled completely */}
            <path
              d="M 205 75
                 C 235 110, 255 150, 265 180
                 C 275 210, 280 240, 282 270
                 C 285 300, 288 335, 290 365
                 C 298 395, 312 418, 325 435
                 C 340 455, 355 475, 370 495
                 C 382 510, 390 530, 395 555
                 C 402 580, 420 605, 430 620
                 L 435 615
                 C 440 580, 450 560, 460 550
                 C 475 575, 495 605, 520 625
                 C 555 650, 590 680, 630 710
                 L 700 710
                 L 700 75
                 Z"
              fill="url(#landGrad)"
              stroke="#475569"
              strokeWidth="1.8"
            />

            {/* Baja California Peninsula (extends south into water) */}
            <path
              d="M 390 530
                 C 395 550, 400 575, 408 600
                 C 414 620, 422 630, 426 628
                 C 430 620, 425 605, 418 585
                 C 410 565, 405 545, 400 530
                 Z"
              fill="url(#landGrad)"
              stroke="#475569"
              strokeWidth="1.5"
            />

            {/* Puget Sound & San Francisco Bay Indentations */}
            <path d="M 270 215 C 290 220, 295 235, 275 245 Z" fill="#05142b" />
            <ellipse cx="320" cy="418" rx="8" ry="4" fill="#05142b" />

            {/* Sierra Nevada / Cascade Mountain Relief Shading on Land */}
            <path
              d="M 350 210 Q 370 270 380 340 Q 395 420 425 490"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 355 210 Q 375 270 385 340 Q 400 420 430 490"
              fill="none"
              stroke="rgba(0, 0, 0, 0.35)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* US State & Regional Labels on Land */}
            <text x="355" y="320" fill="#94a3b8" fontSize="12" fontFamily="sans-serif" fontWeight="800" letterSpacing="2">
              OREGON
            </text>
            <text x="355" y="240" fill="#94a3b8" fontSize="12" fontFamily="sans-serif" fontWeight="800" letterSpacing="2">
              WASHINGTON
            </text>
            <text x="380" y="440" fill="#cbd5e1" fontSize="14" fontFamily="sans-serif" fontWeight="900" letterSpacing="3">
              CALIFORNIA
            </text>
            <text x="465" y="480" fill="#64748b" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
              NEVADA
            </text>
            <text x="485" y="540" fill="#64748b" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
              ARIZONA
            </text>
            <text x="505" y="650" fill="#94a3b8" fontSize="14" fontFamily="sans-serif" fontWeight="900" letterSpacing="2">
              MEXICO
            </text>
            <text x="430" y="585" fill="#475569" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
              BAJA
            </text>
            <text x="335" y="140" fill="#94a3b8" fontSize="13" fontFamily="sans-serif" fontWeight="800" letterSpacing="2">
              CANADA (BC)
            </text>

            {/* State borders (dashed lines) */}
            <line x1="280" y1="260" x2="480" y2="260" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="285" y1="365" x2="480" y2="365" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="390" y1="520" x2="520" y2="520" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />

            {/* Latitude Grid Reference Lines */}
            {[
              { y: 700, lat: '8°N (Panama Landfall Node)' },
              { y: 620, lat: '20°N (Southern Mexico)' },
              { y: 520, lat: '32.7°N (San Diego / US Border)' },
              { y: 418, lat: '37.8°N (San Francisco Bay)' },
              { y: 260, lat: '46.2°N (Columbia River / Oregon)' },
              { y: 140, lat: '54.0°N (Gulf of Alaska)' },
            ].map((g, idx) => (
              <g key={idx}>
                <line x1="30" y1={g.y} x2="670" y2={g.y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
                <text x="35" y={g.y - 4} fill="#64748b" fontSize="9" fontFamily="monospace">
                  {g.lat}
                </text>
              </g>
            ))}

            {/* 4. Coastal Kelvin Wave Trajectory Guide Path (STRICTLY ON THE OCEAN WATER SIDE) */}
            <path
              id="coastalTrajectoryPath"
              d="M 585 700
                 C 530 670, 485 635, 450 615
                 C 415 595, 385 565, 360 530
                 C 340 500, 320 465, 295 425
                 C 275 385, 260 340, 255 285
                 C 250 240, 240 185, 185 95"
              fill="none"
              stroke="rgba(6, 182, 212, 0.45)"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Inner trajectory stream guide */}
            <path
              d="M 585 700
                 C 530 670, 485 635, 450 615
                 C 415 595, 385 565, 360 530
                 C 340 500, 320 465, 295 425
                 C 275 385, 260 340, 255 285
                 C 250 240, 240 185, 185 95"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              strokeLinecap="round"
            />

            {/* Northward Trajectory Direction Arrows (In the ocean water) */}
            <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round">
              <path d="M 525 660 L 515 650 M 438 603 L 428 593 M 345 505 L 335 490 M 280 395 L 270 380 M 248 245 L 240 230" />
            </g>

            {/* 5. Dynamic Active Coastal Kelvin Wave Pulse (STRICTLY ON WATER SIDE) */}
            {(() => {
              // Interpolate wave position strictly on the ocean water path based on currentLatitude (8°N to 54°N)
              const t = Math.max(0, Math.min(1, (currentLatitude - 8) / (54 - 8)));
              const py = 700 - t * (700 - 95);

              // Accurately map x along the ocean curve, staying strictly 35px WEST of the coastline
              let coastX = 210;
              if (py > 620) {
                coastX = 430 + ((py - 620) / 80) * 195;
              } else if (py > 520) {
                coastX = 370 + ((py - 520) / 100) * 60;
              } else if (py > 418) {
                coastX = 315 + ((py - 418) / 102) * 55;
              } else if (py > 260) {
                coastX = 275 + ((py - 260) / 158) * 40;
              } else {
                coastX = 200 + ((py - 95) / 165) * 75;
              }

              // Wave position is strictly in the ocean water (30px to 45px to the left of the coastline!)
              const px = coastX - 35;

              return (
                <g>
                  {/* Energy dispersion rings spreading toward the shore */}
                  <ellipse
                    cx={px}
                    cy={py}
                    rx="36"
                    ry="24"
                    fill="rgba(239, 68, 68, 0.4)"
                    filter="url(#waveGlow)"
                  />
                  <ellipse
                    cx={px}
                    cy={py}
                    rx="24"
                    ry="14"
                    fill="rgba(249, 115, 22, 0.75)"
                    transform={`rotate(-45, ${px}, ${py})`}
                  />

                  {/* Core wave crest in the ocean water */}
                  <circle cx={px} cy={py} r="9" fill="#ffffff" />
                  <circle cx={px} cy={py} r="16" fill="none" stroke="#ef4444" strokeWidth="2.5" />

                  {/* Dynamic probe line from wave crest in the water to the nearest onshore station */}
                  <line
                    x1={px}
                    y1={py}
                    x2={coastX}
                    y2={py}
                    stroke="rgba(255, 255, 255, 0.75)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Floating Telemetry Tag (pointing to the water pulse) */}
                  <g transform={`translate(${px - 148}, ${py - 16})`}>
                    <rect
                      width="140"
                      height="26"
                      rx="7"
                      fill="rgba(15, 23, 42, 0.95)"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      className="shadow-xl"
                    />
                    <text
                      x="70"
                      y="17"
                      fill="#fecaca"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      🌊 CKW SURGE FRONT
                    </text>
                  </g>
                </g>
              );
            })()}

            {/* 6. Onshore Station Markers (Along the Coastline) */}
            {COASTAL_STATIONS.map((station) => {
              const isSelected = selectedStation.id === station.id;
              const isHovered = hoveredStation?.id === station.id;
              const sx = (station.xPercent / 100) * 700;
              const sy = (station.yPercent / 100) * 780;

              // Check if wave has reached or is near this station
              const hasReached = currentLatitude >= station.latitude - 1.5;
              const isPeak = Math.abs(currentLatitude - station.latitude) <= 2;

              return (
                <g
                  key={station.id}
                  onClick={() => handleJumpToStation(station)}
                  onMouseEnter={() => setHoveredStation(station)}
                  onMouseLeave={() => setHoveredStation(null)}
                  className="cursor-pointer group"
                >
                  {/* Subtle static peak indicator without flashing */}
                  {isPeak && (
                    <circle cx={sx} cy={sy} r="14" fill="none" stroke="rgba(239,68,68,0.7)" strokeWidth="1.8" />
                  )}

                  {/* Outer selection ring (calm static dashed ring without spinning) */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={sx}
                      cy={sy}
                      r="12"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.8"
                      strokeDasharray="3 2"
                    />
                  )}

                  {/* Station dot on coast */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isSelected ? 8 : 6}
                    fill={isPeak ? '#ef4444' : hasReached ? '#f59e0b' : '#38bdf8'}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    className="transition-transform duration-150 group-hover:scale-125"
                  />

                  {/* Station Label */}
                  <text
                    x={sx + 12}
                    y={sy + 3}
                    fill={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : '#e2e8f0'}
                    fontSize={isSelected ? '11' : '9.5'}
                    fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                    textAnchor="start"
                    fontFamily="sans-serif"
                    className="drop-shadow-md select-none"
                  >
                    {station.name.split(' (')[0]}
                  </text>

                  {/* Sea level anomaly surge indicator */}
                  {showKingTidesRisk && (
                    <text
                      x={sx + 12}
                      y={sy + 16}
                      fill="#f87171"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      +{station.seaLevelSurgeInches}" surge
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5 backdrop-blur-md max-w-[230px] pointer-events-auto">
            <div className="font-bold text-white uppercase text-[10px] tracking-wider mb-1 flex items-center justify-between">
              <span>Coastal Trajectory Legend</span>
              <span className="text-cyan-400 font-mono text-[9px]">2026/27</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Active Kelvin Wave Peak Front</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Elevated Post-Surge Sea State</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>Pending Arrival Wavefront</span>
            </div>
            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 space-y-0.5">
              <div>Boundary Trap: ~120 km Rossby Radius</div>
              <div className="text-cyan-300 font-mono">Phase Speed: ~150 km/day</div>
            </div>
          </div>
        </div>

        {/* Selected Coastal Station Telemetry Inspector (5 cols on large screens) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-slate-950/80 rounded-2xl border border-slate-800 p-5 md:p-6 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  {selectedStation.stateOrRegion}
                </span>
                <h4 className="text-xl font-black text-white mt-0.5">{selectedStation.name}</h4>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                  selectedStation.kingTideRisk === 'Extreme'
                    ? 'bg-red-950 text-red-300 border border-red-500/50 shadow-sm'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                }`}
              >
                {selectedStation.kingTideRisk} Risk
              </span>
            </div>

            {/* Total Water Level (TWL) Visual Gauge Simulator */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  Total Water Level (TWL) vs. Seawall
                </span>
                <span className="font-mono text-red-400 font-bold text-[11px]">
                  +{(selectedStation.seaLevelSurgeInches / 12).toFixed(2)} ft Kelvin Surge
                </span>
              </div>

              {/* Graphical Stacked Water Bar */}
              <div className="h-6 w-full bg-slate-950 rounded-lg p-0.5 border border-slate-800 flex items-center relative overflow-hidden">
                {/* Astronomical King Tide Baseline */}
                <div
                  style={{ width: '70%' }}
                  className="h-full bg-blue-600 rounded-l flex items-center justify-center text-[9.5px] font-mono text-white font-bold"
                >
                  Astronomical Tide (7.0 ft)
                </div>
                {/* Kelvin Wave Surge Overlay */}
                <div
                  style={{ width: '22%' }}
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 flex items-center justify-center text-[9px] font-mono text-slate-950 font-black"
                >
                  +{selectedStation.seaLevelSurgeInches}" Surge
                </div>
                {/* Seawall Threshold Marker */}
                <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-red-400 z-10"></div>
                <div className="absolute right-1 text-[8px] font-mono text-red-400 font-bold">
                  Overtopping!
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 ft MLLW</span>
                <span className="text-red-400">Seawall Breach Threshold (7.5 ft)</span>
                <span className="text-cyan-300">Peak TWL: ~8.0 ft</span>
              </div>
            </div>

            {/* Key Coastal Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sea Level Surge</span>
                </div>
                <div className="text-xl font-black text-cyan-300 font-mono">
                  +{selectedStation.seaLevelSurgeInches}" ({selectedStation.seaLevelSurgeCm} cm)
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Water column expansion</div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-red-400" />
                  <span>Coastal SST Anomaly</span>
                </div>
                <div className="text-xl font-black text-red-400 font-mono">
                  +{selectedStation.sstAnomalyC}°C (+{(selectedStation.sstAnomalyC * 1.8).toFixed(1)}°F)
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Upwelling suppressed</div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Coordinates</span>
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  {selectedStation.latitude}°N, {selectedStation.longitude}°W
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {selectedStation.distanceFromEquatorKm.toLocaleString()} km from Equator
                </div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Projected Arrival</span>
                </div>
                <div className="text-sm font-bold text-amber-300 font-mono">{selectedStation.estArrivalDate}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Day +{selectedStation.estArrivalDay} post-WWB</div>
              </div>
            </div>

            {/* Regional Vulnerabilities & Risks */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                King Tides Inundation & Coastal Threats
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                {selectedStation.vulnerabilities.map((v, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Geophysical Mechanism Explanation */}
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200 space-y-1">
              <span className="font-bold text-cyan-300 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Coriolis Boundary Trapping Physics:
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                In the Northern Hemisphere, Coriolis acceleration deflects fluid motion to the right. As water flows
                poleward along North America, this traps the entire Kelvin wave against the continental landmass,
                concentrating energy within the narrow Rossby deformation radius (~120 km) without dispersing offshore.
              </p>
            </div>
          </div>

          {/* Station Quick Selector Buttons Bar */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Navigate West Coast Stations:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevStation}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Previous station"
                >
                  ◀ Prev
                </button>
                <button
                  onClick={handleNextStation}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Next station"
                >
                  Next ▶
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {COASTAL_STATIONS.slice(3, 10).map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleJumpToStation(st)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                    selectedStation.id === st.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {st.id === 'crescent-city' ? '★ Crescent City' : st.name.split(' (')[0].split(' / ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

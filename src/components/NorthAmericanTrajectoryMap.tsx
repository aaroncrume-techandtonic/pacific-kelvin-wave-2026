import React, { useState, useEffect } from 'react';
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
  Sparkles,
} from 'lucide-react';

interface NorthAmericanTrajectoryMapProps {
  onSyncSimulationProgress?: (progress: number) => void;
}

export const NorthAmericanTrajectoryMap: React.FC<NorthAmericanTrajectoryMapProps> = ({
  onSyncSimulationProgress,
}) => {
  // Days from WWB initiation: Day 65 (Equatorial landfall) to Day 120 (Alaska)
  const [coastalDay, setCoastalDay] = useState<number>(90); // default to Dec 30 / San Diego arrival
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedStation, setSelectedStation] = useState<CoastalStation>(COASTAL_STATIONS[3]); // San Diego

  // Layer toggles
  const [showAtmosphericRivers, setShowAtmosphericRivers] = useState<boolean>(true);
  const [showKingTidesRisk, setShowKingTidesRisk] = useState<boolean>(true);
  const [showThermalAnomaly, setShowThermalAnomaly] = useState<boolean>(true);

  // Animation loop
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const interval = setInterval(() => {
        setCoastalDay((prev) => {
          const next = prev + 0.5;
          return next > 120 ? 65 : next;
        });
      }, 70);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

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
  const activeStation =
    COASTAL_STATIONS.reduce((prev, curr) => {
      return Math.abs(curr.latitude - currentLatitude) < Math.abs(prev.latitude - currentLatitude)
        ? curr
        : prev;
    }, COASTAL_STATIONS[0]);

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Waves className="w-4 h-4 text-cyan-400" />
            Poleward Coastal Kelvin Wave (CKW) Trajectory
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white">
            North American West Coast Trajectory Map
          </h3>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Upon striking the Americas at 80°W, the equatorial Kelvin wave bifurcates into a boundary-trapped coastal
            wave propagating northward along California, Oregon, and Washington, elevating sea levels by 6–12 inches
            during winter King Tides.
          </p>
        </div>

        {/* Play/Pause & Reset Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-500/40 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Trajectory' : 'Play Trajectory'}</span>
          </button>

          <button
            onClick={() => setCoastalDay(68)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Reset to Central America reflection point"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Trajectory Scrub Timeline Bar */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold text-white font-mono">Coastal Arrival Timeline:</span>
            <span className="text-cyan-400 font-bold font-mono text-sm">{formattedDate}</span>
            <span className="text-slate-500">(Day +{Math.round(coastalDay)} from WWB genesis)</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Current Wave Front:</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
              ~{currentLatitude.toFixed(1)}°N ({activeStation.name.split(' (')[0]})
            </span>
          </div>
        </div>

        {/* Range slider */}
        <input
          type="range"
          min={65}
          max={120}
          step={0.5}
          value={coastalDay}
          onChange={(e) => setCoastalDay(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-ew-resize focus:outline-none"
        />

        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>Dec 05 (Panama 8°N)</span>
          <span>Dec 22 (Baja 23°N)</span>
          <span>Dec 30 (San Diego 32°N)</span>
          <span>Jan 07 (SF Bay 38°N)</span>
          <span>Jan 16 (Columbia R. 46°N)</span>
          <span>Jan 25 (Alaska 54°N)</span>
        </div>
      </div>

      {/* Layer Toggles Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowKingTidesRisk(!showKingTidesRisk)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              showKingTidesRisk
                ? 'bg-red-950/70 border-red-500/60 text-red-300'
                : 'bg-slate-800/40 border-slate-700 text-slate-500'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>King Tides High Hazard Zones</span>
          </button>

          <button
            onClick={() => setShowAtmosphericRivers(!showAtmosphericRivers)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              showAtmosphericRivers
                ? 'bg-blue-950/70 border-blue-500/60 text-blue-300'
                : 'bg-slate-800/40 border-slate-700 text-slate-500'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Atmospheric River Storm Tracks</span>
          </button>

          <button
            onClick={() => setShowThermalAnomaly(!showThermalAnomaly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              showThermalAnomaly
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                : 'bg-slate-800/40 border-slate-700 text-slate-500'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>Coastal SST Warm Anomaly</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Coastal Phase Speed: <span className="text-white font-bold">~1.7 m/s</span> (~150 km/day)
        </div>
      </div>

      {/* Main Map & Station Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Coastal Vector Map (8 cols on large screens) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center justify-center shadow-inner">
          {/* Map Background Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

          {/* SVG Map Canvas */}
          <svg
            viewBox="0 0 700 750"
            className="w-full h-full max-h-[660px] select-none pointer-events-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Landmass gradient */}
              <linearGradient id="landGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#172033" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Ocean deep water gradient */}
              <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#020817" />
                <stop offset="60%" stopColor="#05142b" />
                <stop offset="100%" stopColor="#082347" />
              </linearGradient>

              {/* Coastal wave energy glow */}
              <filter id="waveGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
              </filter>

              {/* Continental shelf halo */}
              <filter id="shelfGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
              </filter>

              {/* Atmospheric River gradient */}
              <linearGradient id="arGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
                <stop offset="35%" stopColor="rgba(56, 189, 248, 0.35)" />
                <stop offset="75%" stopColor="rgba(59, 130, 246, 0.65)" />
                <stop offset="100%" stopColor="rgba(37, 99, 235, 0.05)" />
              </linearGradient>
            </defs>

            {/* 1. Deep Ocean Background (Pacific Ocean) */}
            <rect width="700" height="750" fill="url(#oceanGrad)" />

            {/* Bathymetry Depth Contour Lines in Pacific Ocean */}
            <path
              d="M 50 730 C 120 620, 220 540, 260 440 C 290 360, 210 240, 130 90"
              fill="none"
              stroke="rgba(56, 189, 248, 0.08)"
              strokeWidth="2"
              strokeDasharray="4 6"
            />
            <path
              d="M 120 740 C 220 630, 290 560, 315 455 C 330 380, 260 260, 180 80"
              fill="none"
              stroke="rgba(56, 189, 248, 0.12)"
              strokeWidth="2"
            />

            {/* Ocean Geographic Water Labels */}
            <text x="70" y="280" fill="rgba(56, 189, 248, 0.25)" fontSize="16" fontFamily="sans-serif" fontWeight="900" letterSpacing="4">
              PACIFIC OCEAN
            </text>
            <text x="70" y="305" fill="rgba(148, 163, 184, 0.3)" fontSize="11" fontFamily="monospace">
              EASTERN BOUNDARY CURRENT DOMAIN (WATER SIDE)
            </text>

            {/* Atmospheric River moisture plume (if enabled) */}
            {showAtmosphericRivers && (
              <g opacity="0.85">
                <path
                  d="M 30 520 C 130 480, 210 430, 305 385 C 330 370, 360 365, 410 380"
                  fill="none"
                  stroke="url(#arGrad)"
                  strokeWidth="36"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 560 C 120 520, 200 470, 310 430 C 330 420, 360 415, 410 425"
                  fill="none"
                  stroke="url(#arGrad)"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                <text x="40" y="475" fill="#38bdf8" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                  Atmospheric River Moisture Stream (Pineapple Express)
                </text>
              </g>
            )}

            {/* 2. Continental Shelf Shading (Narrow coastal ocean boundary along right edge of water) */}
            {/* Sits strictly offshore in the water, hugging the continent */}
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
              fill="rgba(6, 182, 212, 0.08)"
              filter="url(#shelfGlow)"
            />

            {/* 3. North America Continental Landmass (RIGHT / EAST SIDE) */}
            {/* The Pacific coastline runs from Alaska down to Panama */}
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
                 L 700 745
                 L 625 715
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

            {/* Puget Sound / Salish Sea & San Francisco Bay Indentations */}
            <path d="M 270 215 C 290 220, 295 235, 275 245 Z" fill="#05142b" />
            <ellipse cx="320" cy="418" rx="8" ry="4" fill="#05142b" />

            {/* US State & Regional Labels on Land */}
            <text x="350" y="320" fill="#94a3b8" fontSize="12" fontFamily="sans-serif" fontWeight="800" letterSpacing="2">
              OREGON
            </text>
            <text x="350" y="240" fill="#94a3b8" fontSize="12" fontFamily="sans-serif" fontWeight="800" letterSpacing="2">
              WASHINGTON
            </text>
            <text x="375" y="440" fill="#cbd5e1" fontSize="14" fontFamily="sans-serif" fontWeight="900" letterSpacing="3">
              CALIFORNIA
            </text>
            <text x="460" y="480" fill="#64748b" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
              NEVADA
            </text>
            <text x="480" y="540" fill="#64748b" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
              ARIZONA
            </text>
            <text x="500" y="650" fill="#94a3b8" fontSize="14" fontFamily="sans-serif" fontWeight="900" letterSpacing="2">
              MEXICO
            </text>
            <text x="430" y="585" fill="#475569" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
              BAJA
            </text>
            <text x="330" y="140" fill="#94a3b8" fontSize="13" fontFamily="sans-serif" fontWeight="800" letterSpacing="2">
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

            {/* 4. Coastal Kelvin Wave Trajectory Path Line (STRICTLY ON THE OCEAN WATER SIDE) */}
            {/* Positioned 30px to 45px offshore (to the left / west) in the Pacific Ocean */}
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
              strokeWidth="10"
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

            {/* Text Annotation strictly on the ocean water */}
            <text x="360" y="475" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
              ← WATER SIDE (PACIFIC OCEAN)
            </text>

            {/* 5. Active Coastal Kelvin Wave Pulse (STRICTLY ON WATER SIDE) */}
            {(() => {
              // Interpolate wave position strictly on the ocean water path based on currentLatitude (8°N to 54°N)
              const t = Math.max(0, Math.min(1, (currentLatitude - 8) / (54 - 8)));

              // Coordinates along the water path:
              // South (t=0, 8°N): px = 585, py = 700
              // North (t=1, 54°N): px = 185, py = 95
              const py = 700 - t * (700 - 95);

              // Accurately map x along the ocean curve, staying strictly 35px WEST of the coastline
              // Coastline at py:
              let coastX = 210;
              if (py > 620) {
                // Panama to Oaxaca
                coastX = 430 + ((py - 620) / 80) * 195;
              } else if (py > 520) {
                // Mexico to San Diego
                coastX = 370 + ((py - 520) / 100) * 60;
              } else if (py > 418) {
                // San Diego to SF Bay
                coastX = 315 + ((py - 418) / 102) * 55;
              } else if (py > 260) {
                // SF Bay to Oregon
                coastX = 275 + ((py - 260) / 158) * 40;
              } else {
                // Oregon to Alaska
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
                    rx="32"
                    ry="20"
                    fill="rgba(239, 68, 68, 0.35)"
                    filter="url(#waveGlow)"
                  />
                  <ellipse
                    cx={px}
                    cy={py}
                    rx="20"
                    ry="12"
                    fill="rgba(249, 115, 22, 0.7)"
                    transform={`rotate(-45, ${px}, ${py})`}
                  />

                  {/* Core wave crest in the ocean water */}
                  <circle cx={px} cy={py} r="8" fill="#ffffff" />
                  <circle cx={px} cy={py} r="14" fill="none" stroke="#ef4444" strokeWidth="2.5" />

                  {/* Dynamic probe line from wave crest in the water to the nearest onshore station */}
                  <line
                    x1={px}
                    y1={py}
                    x2={coastX}
                    y2={py}
                    stroke="rgba(255, 255, 255, 0.7)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Floating Telemetry Tag (pointing to the water pulse) */}
                  <g transform={`translate(${px - 140}, ${py - 16})`}>
                    <rect
                      width="130"
                      height="24"
                      rx="6"
                      fill="rgba(15, 23, 42, 0.95)"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      className="shadow-xl"
                    />
                    <text
                      x="65"
                      y="16"
                      fill="#fecaca"
                      fontSize="9.5"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      🌊 OCEAN WAVE CREST
                    </text>
                  </g>
                </g>
              );
            })()}

            {/* 6. Onshore Station Markers (Along the Coastline) */}
            {COASTAL_STATIONS.map((station) => {
              const isSelected = selectedStation.id === station.id;
              // Map xPercent and yPercent to SVG width (700) and height (750)
              const sx = (station.xPercent / 100) * 700;
              const sy = (station.yPercent / 100) * 750;

              // Check if wave has reached or is near this station
              const hasReached = currentLatitude >= station.latitude - 1.5;
              const isPeak = Math.abs(currentLatitude - station.latitude) <= 2;

              return (
                <g
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className="cursor-pointer group"
                >
                  {/* Ping effect if station is experiencing the peak surge */}
                  {isPeak && (
                    <circle cx={sx} cy={sy} r="18" fill="rgba(239,68,68,0.4)" className="animate-ping" />
                  )}

                  {/* Station dot on coast */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isSelected ? 7 : 5}
                    fill={isPeak ? '#ef4444' : hasReached ? '#f59e0b' : '#38bdf8'}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />

                  {/* Station Label */}
                  <text
                    x={sx + 10}
                    y={sy + 3}
                    fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                    fontSize={isSelected ? '10' : '9'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="start"
                    fontFamily="sans-serif"
                    className="drop-shadow-md select-none"
                  >
                    {station.name.split(' (')[0]}
                  </text>

                    {/* Sea level anomaly surge indicator */}
                  {showKingTidesRisk && (
                    <text
                      x={sx + 10}
                      y={sy + 14}
                      fill="#f87171"
                      fontSize="8.5"
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
          <div className="absolute bottom-4 left-4 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1 backdrop-blur-md max-w-[210px]">
            <div className="font-bold text-white uppercase text-[10px] tracking-wider mb-1">
              Coastal Wave Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Active Kelvin Wave Crest</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Passed / Elevated Sea State</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>Pending Arrival</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
              <span>Trap Width: ~120 km Shelf</span>
            </div>
          </div>
        </div>

        {/* Selected Coastal Station Telemetry Inspector (5 cols on large screens) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-slate-950/70 rounded-2xl border border-slate-800 p-5 md:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  {selectedStation.stateOrRegion}
                </span>
                <h4 className="text-xl font-black text-white mt-0.5">{selectedStation.name}</h4>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  selectedStation.kingTideRisk === 'Extreme'
                    ? 'bg-red-950 text-red-300 border border-red-500/40'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}
              >
                {selectedStation.kingTideRisk} Risk
              </span>
            </div>

            {/* Key Coastal Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sea Level Surge</span>
                </div>
                <div className="text-xl font-black text-cyan-300 font-mono">
                  +{selectedStation.seaLevelSurgeInches}" ({selectedStation.seaLevelSurgeCm} cm)
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Thermal water expansion</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-red-400" />
                  <span>Coastal SST Anomaly</span>
                </div>
                <div className="text-xl font-black text-red-400 font-mono">
                  +{selectedStation.sstAnomalyC}°C (+{(selectedStation.sstAnomalyC * 1.8).toFixed(1)}°F)
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Upwelling shut down</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
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

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
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
              <ul className="space-y-1.5 text-xs text-slate-300 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
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

          {/* Quick Select Buttons for West Coast Regions */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">
              Select Coastal Landmark Station:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COASTAL_STATIONS.slice(3, 10).map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStation(st)}
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

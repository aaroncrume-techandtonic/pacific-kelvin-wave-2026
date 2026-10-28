import React, { useState } from 'react';
import {
  HISTORICAL_ENSO_DATASETS,
  NORMAL_CLIMATOLOGY_TRANSECT,
  HistoricalEnsoDataset,
} from '../data/historicalEnsoData';
import {
  Layers,
  Thermometer,
  Waves,
  Activity,
  Wind,
  CheckCircle2,
  TrendingUp,
  Info,
  Sparkles,
} from 'lucide-react';

type ComparisonMode = '2026' | '1997' | '2015' | 'overlay';
type GraphMetric = 'thermocline' | 'subsurfaceAnomaly' | 'sstAnomaly';

export const HistoricalComparisonToggle: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<ComparisonMode>('overlay');
  const [activeMetric, setActiveMetric] = useState<GraphMetric>('thermocline');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const dataset2026 = HISTORICAL_ENSO_DATASETS['2026'];
  const dataset1997 = HISTORICAL_ENSO_DATASETS['1997'];
  const dataset2015 = HISTORICAL_ENSO_DATASETS['2015'];

  // Meridians list
  const meridians = dataset2026.transectProfile.map((p) => p.lon);

  // SVG coordinate calculation
  const graphWidth = 650;
  const graphHeight = 220;
  const paddingX = 50;
  const paddingY = 25;

  const getX = (index: number) => {
    return paddingX + (index / (meridians.length - 1)) * (graphWidth - 2 * paddingX);
  };

  // Map value to Y coordinate based on selected metric
  const getY = (value: number, metric: GraphMetric) => {
    if (metric === 'thermocline') {
      // Depth 0m (top, Y=paddingY) to 250m (bottom, Y=graphHeight - paddingY)
      // Note: deeper thermocline is DOWNWARDS
      return paddingY + (value / 250) * (graphHeight - 2 * paddingY);
    } else if (metric === 'subsurfaceAnomaly') {
      // Anomaly 0°C (bottom) to 12°C (top)
      const norm = Math.max(0, Math.min(1, value / 12));
      return (graphHeight - paddingY) - norm * (graphHeight - 2 * paddingY);
    } else {
      // SST Anomaly 0°C (bottom) to 5°C (top)
      const norm = Math.max(0, Math.min(1, value / 5));
      return (graphHeight - paddingY) - norm * (graphHeight - 2 * paddingY);
    }
  };

  // Generate SVG path for a dataset
  const generatePath = (
    data: { thermoclineDepthM: number; tempAnomalyC: number; sstAnomalyC: number }[],
    metric: GraphMetric
  ) => {
    return data
      .map((pt, idx) => {
        const val =
          metric === 'thermocline'
            ? pt.thermoclineDepthM
            : metric === 'subsurfaceAnomaly'
              ? pt.tempAnomalyC
              : pt.sstAnomalyC;
        const x = getX(idx);
        const y = getY(val, metric);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-5 md:p-6 space-y-6 shadow-xl">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-cyan-400" />
            Illustrative Model Comparison
          </div>
          <h4 className="text-xl font-extrabold text-white">
            2026 Scenario vs. 1997 & 2015 Reference Scenarios
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore conceptual thermocline and temperature patterns. The displayed curves are illustrative and are
            not NOAA observational transects.
          </p>
        </div>

        {/* Dataset Selection Toggle Buttons */}
        <div className="flex flex-wrap items-center bg-slate-900 border border-slate-700 p-1 rounded-xl self-start lg:self-auto shadow-inner">
          <button
            onClick={() => setSelectedDataset('2026')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedDataset === '2026'
                ? 'bg-red-500 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span>2026 Scenario</span>
          </button>

          <button
            onClick={() => setSelectedDataset('1997')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedDataset === '1997'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>1997 Benchmark</span>
          </button>

          <button
            onClick={() => setSelectedDataset('2015')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedDataset === '2015'
                ? 'bg-purple-500 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>2015 Benchmark</span>
          </button>

          <button
            onClick={() => setSelectedDataset('overlay')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedDataset === 'overlay'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Overlay All 3</span>
          </button>
        </div>
      </div>

      {/* Metric Display Switcher (Thermocline Depth vs Subsurface Anomaly vs SST Anomaly) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Compare Metric:</span>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setActiveMetric('thermocline')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeMetric === 'thermocline'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thermocline Depth (20°C Isotherm)
            </button>
            <button
              onClick={() => setActiveMetric('subsurfaceAnomaly')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeMetric === 'subsurfaceAnomaly'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Subsurface Core Anomaly (°C)
            </button>
            <button
              onClick={() => setActiveMetric('sstAnomaly')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeMetric === 'sstAnomaly'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sea Surface Temp (SST) Anomaly
            </button>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
          {(selectedDataset === '2026' || selectedDataset === 'overlay') && (
            <span className="flex items-center gap-1.5 text-red-400 font-bold">
            <span className="w-2.5 h-0.5 bg-red-500"></span> 2026 Illustrative Scenario
            </span>
          )}
          {(selectedDataset === '1997' || selectedDataset === 'overlay') && (
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <span className="w-2.5 h-0.5 bg-amber-500"></span> 1997 Benchmark
            </span>
          )}
          {(selectedDataset === '2015' || selectedDataset === 'overlay') && (
            <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <span className="w-2.5 h-0.5 bg-purple-500"></span> 2015 Benchmark
            </span>
          )}
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-0.5 bg-slate-500 stroke-dasharray"></span> Normal Mean
          </span>
        </div>
      </div>

      {/* SVG Comparative Transect Graph (Equatorial Pacific 140°E to 80°W) */}
      <div className="relative bg-slate-900/90 rounded-xl border border-slate-800 p-3 pt-6 overflow-hidden shadow-inner">
        <div className="w-full h-56">
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full select-none" preserveAspectRatio="none">
            {/* Grid Lines */}
            {activeMetric === 'thermocline' &&
              [50, 100, 150, 200].map((d) => {
                const y = getY(d, 'thermocline');
                return (
                  <g key={d}>
                    <line x1={paddingX} y1={y} x2={graphWidth - paddingX} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                    <text x={paddingX - 8} y={y + 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                      {d}m
                    </text>
                  </g>
                );
              })}

            {activeMetric === 'subsurfaceAnomaly' &&
              [2, 4, 6, 8, 10].map((a) => {
                const y = getY(a, 'subsurfaceAnomaly');
                return (
                  <g key={a}>
                    <line x1={paddingX} y1={y} x2={graphWidth - paddingX} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                    <text x={paddingX - 8} y={y + 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                      +{a}°C
                    </text>
                  </g>
                );
              })}

            {activeMetric === 'sstAnomaly' &&
              [1, 2, 3, 4].map((s) => {
                const y = getY(s, 'sstAnomaly');
                return (
                  <g key={s}>
                    <line x1={paddingX} y1={y} x2={graphWidth - paddingX} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                    <text x={paddingX - 8} y={y + 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                      +{s}°C
                    </text>
                  </g>
                );
              })}

            {/* Vertical Meridian Guide Lines */}
            {meridians.map((m, idx) => {
              const x = getX(idx);
              return (
                <g key={m}>
                  <line x1={x} y1={paddingY} x2={x} y2={graphHeight - paddingY} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <text x={x} y={graphHeight - 8} fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    {m}
                  </text>
                </g>
              );
            })}

            {/* Normal Climatology Path */}
            <path
              d={generatePath(NORMAL_CLIMATOLOGY_TRANSECT, activeMetric)}
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.7"
            />

            {/* 1997 Benchmark Path */}
            {(selectedDataset === '1997' || selectedDataset === 'overlay') && (
              <path
                d={generatePath(dataset1997.transectProfile, activeMetric)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={selectedDataset === '1997' ? 3 : 2}
                opacity={selectedDataset === '1997' ? 1 : 0.8}
              />
            )}

            {/* 2015 Benchmark Path */}
            {(selectedDataset === '2015' || selectedDataset === 'overlay') && (
              <path
                d={generatePath(dataset2015.transectProfile, activeMetric)}
                fill="none"
                stroke="#a855f7"
                strokeWidth={selectedDataset === '2015' ? 3 : 2}
                opacity={selectedDataset === '2015' ? 1 : 0.8}
              />
            )}

            {/* 2026 Illustrative Scenario Path */}
            {(selectedDataset === '2026' || selectedDataset === 'overlay') && (
              <path
                d={generatePath(dataset2026.transectProfile, activeMetric)}
                fill="none"
                stroke="#ef4444"
                strokeWidth={selectedDataset === '2026' ? 3.5 : 2.5}
                className="drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              />
            )}

            {/* Interactive Data Points */}
            {meridians.map((m, idx) => {
              const x = getX(idx);
              const p2026 = dataset2026.transectProfile[idx];
              const val2026 =
                activeMetric === 'thermocline'
                  ? p2026.thermoclineDepthM
                  : activeMetric === 'subsurfaceAnomaly'
                    ? p2026.tempAnomalyC
                    : p2026.sstAnomalyC;
              const y2026 = getY(val2026, activeMetric);

              return (
                <g key={m} className="cursor-pointer" onMouseEnter={() => setHoveredPointIndex(idx)} onMouseLeave={() => setHoveredPointIndex(null)}>
                  <circle cx={x} cy={y2026} r={hoveredPointIndex === idx ? 6 : 4} fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Tooltip on Hover */}
        {hoveredPointIndex !== null && (
          <div className="absolute top-2 right-4 bg-slate-950/95 border border-slate-700 rounded-xl p-3 text-xs shadow-2xl space-y-1.5 backdrop-blur-md">
            <div className="font-bold text-cyan-400 font-mono border-b border-slate-800 pb-1">
              Meridian: {meridians[hoveredPointIndex]}
            </div>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between gap-4 text-red-400 font-bold">
                <span>2026 Scenario:</span>
                <span>
                  {activeMetric === 'thermocline'
                    ? `${dataset2026.transectProfile[hoveredPointIndex].thermoclineDepthM}m`
                    : activeMetric === 'subsurfaceAnomaly'
                      ? `+${dataset2026.transectProfile[hoveredPointIndex].tempAnomalyC}°C`
                      : `+${dataset2026.transectProfile[hoveredPointIndex].sstAnomalyC}°C`}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-amber-400">
                <span>1997 Benchmark:</span>
                <span>
                  {activeMetric === 'thermocline'
                    ? `${dataset1997.transectProfile[hoveredPointIndex].thermoclineDepthM}m`
                    : activeMetric === 'subsurfaceAnomaly'
                      ? `+${dataset1997.transectProfile[hoveredPointIndex].tempAnomalyC}°C`
                      : `+${dataset1997.transectProfile[hoveredPointIndex].sstAnomalyC}°C`}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-purple-400">
                <span>2015 Benchmark:</span>
                <span>
                  {activeMetric === 'thermocline'
                    ? `${dataset2015.transectProfile[hoveredPointIndex].thermoclineDepthM}m`
                    : activeMetric === 'subsurfaceAnomaly'
                      ? `+${dataset2015.transectProfile[hoveredPointIndex].tempAnomalyC}°C`
                      : `+${dataset2015.transectProfile[hoveredPointIndex].sstAnomalyC}°C`}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-slate-500 pt-1 border-t border-slate-800">
                <span>Normal Climatology:</span>
                <span>
                  {activeMetric === 'thermocline'
                    ? `${NORMAL_CLIMATOLOGY_TRANSECT[hoveredPointIndex].thermoclineDepthM}m`
                    : '+0.0°C'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Metric Comparison Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 2026 Illustrative Scenario */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            selectedDataset === '2026' || selectedDataset === 'overlay'
              ? 'bg-red-950/20 border-red-500/50 shadow-md ring-1 ring-red-500/30'
              : 'bg-slate-900/40 border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              2026–2027 Scenario
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30">
              Model
            </span>
          </div>
          <h5 className="text-sm font-bold text-white mb-2">{dataset2026.title}</h5>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Scenario Niño 3.4 SST:</span>
              <span className="text-red-400 font-bold">+{dataset2026.nino34Anomaly}°C</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Scenario Subsurface Core:</span>
              <span className="text-red-400 font-bold">+{dataset2026.peakSubsurfaceAnomaly}°C</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Scenario Thermocline Change:</span>
              <span className="text-white">+{dataset2026.thermoclineMaxDepression}m</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Scenario SOI:</span>
              <span className="text-cyan-300">{dataset2026.soiIndex}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Scenario Basin Energy:</span>
              <span className="text-amber-300">{dataset2026.totalEnergyZJ} ZJ</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80 leading-relaxed">
            {dataset2026.keyCharacteristic}
          </p>
        </div>

        {/* Card 2: 1997 Benchmark */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            selectedDataset === '1997' || selectedDataset === 'overlay'
              ? 'bg-amber-950/20 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'bg-slate-900/40 border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              1997–1998 Event
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
              Historic
            </span>
          </div>
          <h5 className="text-sm font-bold text-white mb-2">{dataset1997.title}</h5>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Peak Niño 3.4 SST:</span>
              <span className="text-amber-300 font-bold">+{dataset1997.nino34Anomaly}°C</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Max Subsurface Core:</span>
              <span className="text-amber-300 font-bold">+{dataset1997.peakSubsurfaceAnomaly}°C</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Thermocline Downwelling:</span>
              <span className="text-white">+{dataset1997.thermoclineMaxDepression}m</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Southern Oscillation (SOI):</span>
              <span className="text-cyan-300">{dataset1997.soiIndex}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Total Basin Energy:</span>
              <span className="text-amber-300">{dataset1997.totalEnergyZJ} ZJ</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80 leading-relaxed">
            {dataset1997.keyCharacteristic}
          </p>
        </div>

        {/* Card 3: 2015 Benchmark */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            selectedDataset === '2015' || selectedDataset === 'overlay'
              ? 'bg-purple-950/20 border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
              : 'bg-slate-900/40 border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
              2015–2016 Event
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
              "Godzilla"
            </span>
          </div>
          <h5 className="text-sm font-bold text-white mb-2">{dataset2015.title}</h5>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Peak Niño 3.4 SST:</span>
              <span className="text-purple-300 font-bold">+{dataset2015.nino34Anomaly}°C</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Max Subsurface Core:</span>
              <span className="text-purple-300 font-bold">+{dataset2015.peakSubsurfaceAnomaly}°C</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Thermocline Downwelling:</span>
              <span className="text-white">+{dataset2015.thermoclineMaxDepression}m</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Southern Oscillation (SOI):</span>
              <span className="text-cyan-300">{dataset2015.soiIndex}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Total Basin Energy:</span>
              <span className="text-amber-300">{dataset2015.totalEnergyZJ} ZJ</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80 leading-relaxed">
            {dataset2015.keyCharacteristic}
          </p>
        </div>
      </div>
    </div>
  );
};

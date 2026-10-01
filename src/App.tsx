import React, { useState, useEffect } from 'react';
import { WaveCanvas } from './components/WaveCanvas';
import { SshSatelliteMap } from './components/SshSatelliteMap';
import { ThermoclineComparison } from './components/ThermoclineComparison';
import { NorthAmericanTrajectoryMap } from './components/NorthAmericanTrajectoryMap';
import { KelvinRealtimeStats } from './components/KelvinRealtimeStats';
import { StagesSection } from './components/StagesSection';
import { MetricsSection } from './components/MetricsSection';
import { EnsoDiagnostics } from './components/EnsoDiagnostics';
import { BuoyInspectorModal } from './components/BuoyInspectorModal';
import { TeleconnectionsModal } from './components/TeleconnectionsModal';
import { GlossaryModal } from './components/GlossaryModal';
import { ShareScenarioModal } from './components/ShareScenarioModal';
import { ViewMode, BuoyStation } from './types/kelvin';
import { Compass, Waves, Radio, Sliders, BookOpen, Globe2, Sparkles, MapPin, Share2 } from 'lucide-react';

export default function App() {
  // Wave animation progress (-0.3 to 1.3)
  const [progress, setProgress] = useState<number>(-0.1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Active visualization mode
  const [viewMode, setViewMode] = useState<ViewMode>('cross-section');

  // Modals & Inspectors
  const [selectedBuoy, setSelectedBuoy] = useState<BuoyStation | null>(null);
  const [showTeleconnections, setShowTeleconnections] = useState<boolean>(false);
  const [teleconnectionRegion, setTeleconnectionRegion] = useState<string | undefined>(undefined);
  const [showGlossary, setShowGlossary] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Restore simulation scenario state from URL search parameters on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view') as ViewMode | null;
      const urlProgress = params.get('progress');
      const urlSpeed = params.get('speed');
      const urlPlay = params.get('play');

      if (urlView && ['cross-section', 'satellite-ssh', 'comparison', 'north-america'].includes(urlView)) {
        setViewMode(urlView);
      }
      if (urlProgress !== null) {
        const p = parseFloat(urlProgress);
        if (!isNaN(p)) setProgress(p);
      }
      if (urlSpeed !== null) {
        const s = parseFloat(urlSpeed);
        if (!isNaN(s) && [0.5, 1, 2, 4].includes(s)) setPlaybackSpeed(s);
      }
      if (urlPlay !== null) {
        setIsPlaying(urlPlay === '1');
      }
    } catch (e) {
      console.error('Error parsing URL parameters:', e);
    }
  }, []);

  // Handle stage jump
  const handleJumpToStage = (progressVal: number) => {
    setProgress(progressVal);
    setIsPlaying(true);
    // If not in cross-section or satellite mode, switch to cross-section to see the wave in action
    if (viewMode === 'comparison') {
      setViewMode('cross-section');
    }
  };

  const handleOpenTeleconnections = (regionId?: string) => {
    setTeleconnectionRegion(regionId);
    setShowTeleconnections(true);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute top-48 left-1/3 w-[500px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Navigation & Header */}
      <header className="relative pt-16 pb-12 px-4 overflow-hidden border-b border-slate-800/80">
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          {/* Live Data Badge & Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/50 border border-blue-500/40 text-blue-300 text-xs font-semibold tracking-wide uppercase shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              Live Data: October 2026
            </div>

            <button
              onClick={() => setShowGlossary(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Physics Glossary</span>
            </button>

            <button
              onClick={() => handleOpenTeleconnections()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Globe2 className="w-3.5 h-3.5 text-red-400" />
              <span>Global Impacts Map</span>
            </button>

            <button
              onClick={() => {
                setViewMode('north-america');
                const simSection = document.getElementById('simulation-section');
                if (simSection) simSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>North America Trajectory</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/50 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer hover:scale-105"
              title="Generate a unique shareable URL for this simulation state"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Share Scenario</span>
            </button>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-600 tracking-tight drop-shadow-sm">
            The Planetary Kelvin Wave
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-2xl text-slate-300/90 font-light max-w-3xl mx-auto leading-relaxed">
            A massive, deep-ocean pulse of extreme warmth is traveling across the Pacific, serving as the powerful
            engine behind the historic 2026/2027 Super El Niño.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-20 relative z-10">
        {/* Interactive Simulation Section */}
        <section id="simulation-section" aria-label="Interactive Diagram of a Kelvin Wave" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4 text-cyan-400" />
                Real-Time Oceanographic Simulation
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Anatomy of the Wave</h2>
              <p className="text-slate-400 max-w-2xl text-sm mt-1">
                Watch how anomalous westerly winds push warm surface waters eastward, depressing the thermocline and
                carrying extreme subsurface heat across the Pacific Ocean.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700 p-1 rounded-xl self-start md:self-auto shrink-0 shadow-lg">
              <button
                onClick={() => setViewMode('cross-section')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'cross-section'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>Depth Cross-Section</span>
              </button>

              <button
                onClick={() => setViewMode('satellite-ssh')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'satellite-ssh'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Satellite Altimetry</span>
              </button>

              <button
                onClick={() => setViewMode('comparison')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'comparison'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Normal vs 2026</span>
              </button>

              <button
                onClick={() => setViewMode('north-america')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'north-america'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>North America Trajectory</span>
              </button>
            </div>
          </div>

          {/* Real-Time Kelvin Wave Hydrodynamic Stats & Telemetry */}
          <KelvinRealtimeStats progress={progress} isPlaying={isPlaying} />

          {/* Active Simulation View */}
          {viewMode === 'cross-section' && (
            <WaveCanvas
              progress={progress}
              setProgress={setProgress}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              onSelectBuoy={(buoy) => setSelectedBuoy(buoy)}
            />
          )}

          {viewMode === 'satellite-ssh' && <SshSatelliteMap progress={progress} />}

          {viewMode === 'comparison' && <ThermoclineComparison />}

          {viewMode === 'north-america' && (
            <NorthAmericanTrajectoryMap
              onSyncSimulationProgress={(prog) => {
                setProgress(prog);
                setIsPlaying(false);
              }}
            />
          )}
        </section>

        {/* The 2026 Reality: By The Numbers */}
        <MetricsSection onOpenTeleconnections={handleOpenTeleconnections} />

        {/* The 4 Stages of Propagation */}
        <StagesSection progress={progress} onJumpToStage={handleJumpToStage} />

        {/* Live Ocean & Atmospheric Diagnostics Panel with Forward-Projection Engine */}
        <EnsoDiagnostics
          onSelectBuoy={(buoy) => setSelectedBuoy(buoy)}
          onSyncSimulation={(progressVal) => {
            setProgress(progressVal);
            setIsPlaying(false);
          }}
        />
      </main>

      {/* Modals */}
      <BuoyInspectorModal buoy={selectedBuoy} onClose={() => setSelectedBuoy(null)} />

      {showTeleconnections && (
        <TeleconnectionsModal
          initialRegionId={teleconnectionRegion}
          onClose={() => setShowTeleconnections(false)}
        />
      )}

      {showGlossary && <GlossaryModal onClose={() => setShowGlossary(false)} />}

      <ShareScenarioModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        currentProgress={progress}
        currentViewMode={viewMode}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onApplyScenario={(newProg, newView, newPlaying, newSpeed) => {
          setProgress(newProg);
          setViewMode(newView);
          setIsPlaying(newPlaying);
          setPlaybackSpeed(newSpeed);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-20 py-10 bg-slate-950/60 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="font-semibold text-slate-300">
              Infographic based on NOAA and CPC ENSO Diagnostic Data - October 2026.
            </p>
            <p className="text-slate-500">
              Data sources: NOAA Pacific Marine Environmental Laboratory (PMEL) TAO/TRITON Array, Copernicus Sentinel-6
              Michael Freilich Radar Altimetry, and Argo Float Global Profiling Network.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Buoy Network Online (68/70 active)
            </span>
            <span>Version: 2026.10-ENSO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

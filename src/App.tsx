import React, { useState, useEffect, useCallback } from 'react';
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
import { ExportPdfModal } from './components/ExportPdfModal';
import { TechAndTonicLogo } from './components/TechAndTonicLogo';
import { OceanParticulateBackground } from './components/OceanParticulateBackground';
import { HistoricalTimelineOverlay } from './components/HistoricalTimelineOverlay';
import { ViewMode, BuoyStation } from './types/kelvin';
import { Compass, Waves, Radio, Sliders, BookOpen, Globe2, Sparkles, MapPin, Share2, FileDown, ExternalLink } from 'lucide-react';

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
  const [showExportPdf, setShowExportPdf] = useState<boolean>(false);

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

  // Stable callbacks for HistoricalTimelineOverlay
  const handleProgressChange = useCallback((newProg: number) => {
    setProgress(newProg);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handlePauseSimulation = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute top-48 left-1/3 w-[500px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Sticky Persistent Top Brand & Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Persistent Link to techandtonic.tech */}
          <a
            href="https://techandtonic.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group hover:opacity-95 transition-all cursor-pointer"
            title="Visit Tech & Tonic (techandtonic.tech)"
          >
            <TechAndTonicLogo variant="horizontal" size="sm" lightText={true} />
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 group-hover:border-emerald-400 transition-colors">
              techandtonic.tech
              <ExternalLink className="w-2.5 h-2.5 text-emerald-400" />
            </span>
          </a>

          {/* Quick Actions & Persistent Website Link */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportPdf(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/40 transition-all cursor-pointer"
              title="Export formatted PDF scientific summary report"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition-all cursor-pointer"
              title="Share simulation scenario link"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <a
              href="https://techandtonic.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:scale-105 cursor-pointer"
              title="Visit techandtonic.tech"
            >
              <span>techandtonic.tech</span>
              <ExternalLink className="w-3 h-3 text-slate-950 stroke-[2.5]" />
            </a>
          </div>
        </div>
      </nav>

      {/* Navigation & Header */}
      <header className="relative pt-12 pb-12 px-4 overflow-hidden border-b border-slate-800/80">
        {/* Subtle Ambient Ocean Particulates & Atmospheric Molecule Drift */}
        <OceanParticulateBackground particleCount={60} />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          {/* Tech & Tonic Hero Presenter Badge */}
          <div className="flex justify-center">
            <a
              href="https://techandtonic.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 shadow-lg group transition-all hover:scale-105"
              title="Visit Tech & Tonic at techandtonic.tech"
            >
              <TechAndTonicLogo variant="mark-only" size="sm" lightText={true} />
              <div className="text-left text-xs">
                <span className="text-slate-400 text-[10px] block uppercase font-mono tracking-wider">A Climate Dynamics Exploration by</span>
                <span className="text-white font-bold group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  Tech &amp; Tonic <span className="text-emerald-400 font-mono text-[11px]">· techandtonic.tech ↗</span>
                </span>
              </div>
            </a>
          </div>

          {/* NOAA Update Badge & Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/50 border border-blue-500/40 text-blue-300 text-xs font-semibold tracking-wide uppercase shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              NOAA CPC update: October 2026
            </div>

            <button
              onClick={() => setShowGlossary(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Physics Glossary</span>
            </button>

            <button
              onClick={() => handleOpenTeleconnections()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
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

            <button
              onClick={() => setShowExportPdf(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600/25 hover:bg-blue-600/35 text-blue-300 text-xs font-semibold border border-blue-500/50 transition-all shadow-[0_0_12px_rgba(59,130,246,0.25)] cursor-pointer hover:scale-105"
              title="Export formatted PDF scientific summary report for professional use"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Export PDF Report</span>
            </button>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-600 tracking-tight drop-shadow-sm">
            The Planetary Kelvin Wave
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-2xl text-slate-300/90 font-light max-w-3xl mx-auto leading-relaxed">
            Explore how equatorial Kelvin waves can redistribute heat across the Pacific. The interactive graphics
            are illustrative simulations; the latest NOAA observations and outlook are identified separately below.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-20 relative z-10">
        {/* Interactive Simulation Section */}
        <section id="simulation-section" aria-label="Interactive Diagram of a Kelvin Wave" className="space-y-6 relative">
          {/* Subtle ocean particulate drift adding visual depth to the Anatomy of the Wave section */}
          <div className="absolute -top-8 -left-4 -right-4 h-72 overflow-hidden pointer-events-none rounded-3xl opacity-50 z-0">
            <OceanParticulateBackground particleCount={35} />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4 text-cyan-400" />
                Illustrative Oceanographic Simulation
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Anatomy of the Wave</h2>
              <p className="text-slate-400 max-w-2xl text-sm mt-1">
                Explore how anomalous westerly winds can push warm surface waters eastward, depress the thermocline,
                and carry subsurface heat across the Pacific Ocean.
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

          {/* Illustrative Kelvin Wave Model Telemetry */}
          <KelvinRealtimeStats progress={progress} isPlaying={isPlaying} />

          {/* Active Simulation View with Interactive Historical Timeline Overlay */}
          <div className="space-y-4">
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

            {/* Interactive Timeline Slider Component Overlaying the bottom of the main visualization section */}
            <HistoricalTimelineOverlay
              currentProgress={progress}
              onProgressChange={handleProgressChange}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onPauseSimulation={handlePauseSimulation}
            />
          </div>
        </section>

        {/* Scientific context for the NOAA update */}
        <MetricsSection />

        {/* The 4 Stages of Propagation */}
        <StagesSection progress={progress} onJumpToStage={handleJumpToStage} />

        {/* NOAA ENSO observations and illustrative scenario tools */}
        <EnsoDiagnostics
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

      <ExportPdfModal
        isOpen={showExportPdf}
        onClose={() => setShowExportPdf(false)}
        currentProgress={progress}
        currentViewMode={viewMode}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-24 py-14 bg-slate-950/95 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80 text-center md:text-left">
            <a
              href="https://techandtonic.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col sm:flex-row items-center gap-4 group cursor-pointer"
              title="Visit Tech & Tonic at techandtonic.tech"
            >
              <TechAndTonicLogo variant="full" size="md" lightText={true} />
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Tech &amp; Tonic
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    techandtonic.tech
                  </span>
                </div>
                <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                  Computational earth observation, planetary hydrodynamics, and interactive science engineering.
                </p>
              </div>
            </a>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://techandtonic.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 cursor-pointer"
              >
                <span>Visit techandtonic.tech</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>

              <a
                href="https://github.com/techandtonic/pacific-kelvin-wave-2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-slate-500 text-[11px]">
            <div>
              <p className="text-slate-400 font-medium">
                NOAA observations and outlooks are linked in the page. Interactive wave, timeline, station-profile, and projection graphics are illustrative and are not live data.
              </p>
              <p className="text-slate-500 mt-0.5">
                © {new Date().getFullYear()} Tech &amp; Tonic. Educational simulation; see NOAA CPC for current observations and forecasts.
              </p>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                NOAA source linked
              </span>
              <a
                href="https://techandtonic.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                techandtonic.tech
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { ViewMode } from '../types/kelvin';
import {
  Share2,
  Copy,
  Check,
  Mail,
  X,
  Sparkles,
  ExternalLink,
  Compass,
  MapPin,
  Waves,
  Radio,
  Sliders,
  Twitter,
  Send,
} from 'lucide-react';

interface ShareScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProgress: number;
  currentViewMode: ViewMode;
  isPlaying: boolean;
  playbackSpeed: number;
  onApplyScenario?: (progress: number, viewMode: ViewMode, isPlaying: boolean, speed: number) => void;
}

interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  viewMode: ViewMode;
  isPlaying: boolean;
  speed: number;
  icon: typeof Waves;
  anomaly: string;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'wwb-genesis',
    title: 'Westerly Wind Burst Genesis',
    subtitle: 'Warm pool water pushed eastward by 15 m/s anomalous trade wind collapse',
    progress: 0.1,
    viewMode: 'cross-section',
    isPlaying: false,
    speed: 1,
    icon: Compass,
    anomaly: '+2.2°C at 165°E',
  },
  {
    id: 'peak-core',
    title: 'Peak Central Basin Downwelling Core',
    subtitle: 'Maximum subsurface thermal pulse (+10.4°C) with thermocline depressed 95m',
    progress: 0.55,
    viewMode: 'cross-section',
    isPlaying: false,
    speed: 1,
    icon: Waves,
    anomaly: '+10.4°C at 140°W',
  },
  {
    id: 'eastern-surfacing',
    title: 'Eastern Landfall & Upwelling Shutdown',
    subtitle: 'Internal wave breaches cold tongue off South America, halting nutrient supply',
    progress: 0.88,
    viewMode: 'satellite-ssh',
    isPlaying: false,
    speed: 1,
    icon: Radio,
    anomaly: '+3.8°C at 95°W',
  },
  {
    id: 'north-america-ckw',
    title: 'North American Coastal Trajectory & King Tides',
    subtitle: 'Poleward coastal Kelvin wave elevates sea levels 6–12 inches along California',
    progress: 0.95,
    viewMode: 'north-america',
    isPlaying: false,
    speed: 1,
    icon: MapPin,
    anomaly: '+10.2" Surge (San Diego / SF)',
  },
];

export const ShareScenarioModal: React.FC<ShareScenarioModalProps> = ({
  isOpen,
  onClose,
  currentProgress,
  currentViewMode,
  isPlaying,
  playbackSpeed,
  onApplyScenario,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Determine current active scenario parameters (either current state or selected preset)
  const activeProgress = activePresetId
    ? PRESET_SCENARIOS.find((s) => s.id === activePresetId)?.progress ?? currentProgress
    : currentProgress;

  const activeView = activePresetId
    ? PRESET_SCENARIOS.find((s) => s.id === activePresetId)?.viewMode ?? currentViewMode
    : currentViewMode;

  const activePlaying = activePresetId
    ? PRESET_SCENARIOS.find((s) => s.id === activePresetId)?.isPlaying ?? isPlaying
    : isPlaying;

  const activeSpeed = activePresetId
    ? PRESET_SCENARIOS.find((s) => s.id === activePresetId)?.speed ?? playbackSpeed
    : playbackSpeed;

  // Build the unique URL
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  const searchParams = new URLSearchParams();
  searchParams.set('view', activeView);
  searchParams.set('progress', activeProgress.toFixed(3));
  searchParams.set('speed', activeSpeed.toString());
  searchParams.set('play', activePlaying ? '1' : '0');
  if (activePresetId) {
    searchParams.set('scenario', activePresetId);
  }

  const shareUrl = `${baseUrl}?${searchParams.toString()}`;

  // Human-readable summary for social sharing
  const getScenarioLabel = () => {
    if (activePresetId) {
      return PRESET_SCENARIOS.find((s) => s.id === activePresetId)?.title ?? 'Kelvin Wave Simulation';
    }
    if (activeView === 'north-america') {
      return 'North American Coastal Kelvin Wave & King Tides Surge';
    }
    if (activeProgress < 0.25) {
      return 'Stage 1: Westerly Wind Burst Genesis (Western Pacific)';
    }
    if (activeProgress < 0.55) {
      return 'Stage 2: Mid-Pacific Equatorial Downwelling Pulse';
    }
    if (activeProgress < 0.8) {
      return 'Stage 3: Peak Downwelling Core (+10.4°C Anomaly at 140°W)';
    }
    return 'Stage 4: Eastern Basin Surfacing & Upwelling Collapse';
  };

  const scenarioTitle = getScenarioLabel();
  const shareText = `Check out this Planetary Kelvin Wave scenario: "${scenarioTitle}" with live NOAA 2026 oceanographic telemetry!`;

  // Social sharing links
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Planetary Kelvin Wave Scenario: ${scenarioTitle}`)}&body=${encodeURIComponent(
    `Explore this real-time oceanographic simulation scenario of the 2026 Super El Niño Kelvin Wave:\n\nScenario: ${scenarioTitle}\nView Mode: ${activeView}\n\nDirect Link to Simulation:\n${shareUrl}\n\nFeatures 2026 TAO buoy mooring CTD data, thermocline downwelling profiles, and West Coast sea level surge predictions.`
  )}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`Planetary Kelvin Wave Simulation: ${scenarioTitle}`)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSelectPreset = (preset: PresetScenario) => {
    setActivePresetId(preset.id);
    if (onApplyScenario) {
      onApplyScenario(preset.progress, preset.viewMode, preset.isPlaying, preset.speed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-cyan-500/40 p-6 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Share Simulation Scenario
              </h3>
              <p className="text-xs text-slate-400">
                Generate a unique state URL to share this Kelvin Wave scenario via link, email, or social media.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Scenario Snapshot Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Scenario Snapshot
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
              View: {activeView}
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-white">{scenarioTitle}</h4>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-1">
              <span>
                Progress: <strong className="text-cyan-300">{(activeProgress * 100).toFixed(0)}%</strong>
              </span>
              <span>
                Speed: <strong className="text-slate-200">{activeSpeed}x</strong>
              </span>
              <span>
                State: <strong className={activePlaying ? 'text-emerald-400' : 'text-amber-400'}>{activePlaying ? 'Simulating' : 'Paused Frame'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Unique Shareable URL Box */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Unique Scenario URL
          </label>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5 focus-within:border-cyan-500 transition-colors">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs font-mono text-slate-200 px-3 py-1.5 flex-1 focus:outline-none select-all truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Quick Social & Communication Share Actions */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Share Directly Via
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Email */}
            <a
              href={emailUrl}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Email</span>
            </a>

            {/* X / Twitter */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Twitter className="w-4 h-4 text-blue-400" />
              <span>X (Twitter)</span>
            </a>

            {/* LinkedIn */}
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-blue-500" />
              <span>LinkedIn</span>
            </a>

            {/* Reddit */}
            <a
              href={redditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Send className="w-4 h-4 text-orange-400" />
              <span>Reddit</span>
            </a>
          </div>
        </div>

        {/* Preset Scenarios Quick-Chooser */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Or Choose a Key Propagation Phase to Share
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_SCENARIOS.map((sc) => {
              const isSelected = activePresetId === sc.id;
              const IconComp = sc.icon;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectPreset(sc)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <IconComp className="w-3.5 h-3.5 text-cyan-400" />
                      {sc.title}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      {sc.anomaly}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{sc.subtitle}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

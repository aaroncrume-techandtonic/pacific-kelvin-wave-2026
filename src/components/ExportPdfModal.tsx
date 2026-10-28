import React, { useState } from 'react';
import { ViewMode } from '../types/kelvin';
import { generateKelvinPdfReport } from '../utils/pdfReportGenerator';
import { TechAndTonicLogo } from './TechAndTonicLogo';
import {
  FileDown,
  X,
  FileText,
  CheckCircle,
  Shield,
  Layers,
  Sparkles,
  Download,
  Info,
  Calendar,
  Building,
  User,
  ExternalLink,
} from 'lucide-react';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProgress: number;
  currentViewMode: ViewMode;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  currentProgress,
  currentViewMode,
}) => {
  const [includeBuoyData, setIncludeBuoyData] = useState<boolean>(true);
  const [includeCoastalTrajectory, setIncludeCoastalTrajectory] = useState<boolean>(true);
  const [includeTeleconnections, setIncludeTeleconnections] = useState<boolean>(true);
  const [analystName, setAnalystName] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsGenerating(true);
    setDownloadComplete(false);

    try {
      generateKelvinPdfReport({
        currentProgress,
        currentViewMode,
        includeBuoyData,
        includeCoastalTrajectory,
        includeTeleconnections,
        analystName: analystName.trim() || undefined,
        organization: organization.trim() || undefined,
        customNotes: customNotes.trim() || undefined,
      });

      setDownloadComplete(true);
      setTimeout(() => {
        setIsGenerating(false);
      }, 800);
    } catch (err) {
      console.error('PDF export failed:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-cyan-500/40 p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <a
              href="https://techandtonic.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer"
              title="Visit Tech & Tonic (techandtonic.tech)"
            >
              <TechAndTonicLogo variant="mark-only" size="sm" lightText={true} />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  Export NOAA Update & Scenario PDF
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30">
                  Tech &amp; Tonic
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Create an educational report that separates NOAA observations from illustrative model outputs (<a href="https://techandtonic.tech" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">techandtonic.tech</a>).
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

        {/* Current State Snapshot */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Report Context & Active Snapshot
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
              View: {currentViewMode.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-500">Thermal Core</div>
              <div className="text-cyan-300 font-bold text-sm">+10.4°C Anom.</div>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-500">Thermocline Dep.</div>
              <div className="text-slate-200 font-bold text-sm">+95 m Depressed</div>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-500">Phase Speed</div>
              <div className="text-slate-200 font-bold text-sm">~2.7 m/s (Internal)</div>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-500">Max SSHA Surge</div>
              <div className="text-red-400 font-bold text-sm">+24.8 cm (+9.8")</div>
            </div>
          </div>
        </div>

        {/* Sections to Include */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Report Sections & Data Packages
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={includeBuoyData}
                onChange={(e) => setIncludeBuoyData(e.target.checked)}
                className="mt-0.5 accent-cyan-400"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">Illustrative Model Waypoints</span>
                <span className="text-[11px] text-slate-400">Simulated profiles, not measured CTD data</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={includeCoastalTrajectory}
                onChange={(e) => setIncludeCoastalTrajectory(e.target.checked)}
                className="mt-0.5 accent-cyan-400"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">Coastal Scenario</span>
                <span className="text-[11px] text-slate-400">Illustrative timeline, not a hazard forecast</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={includeTeleconnections}
                onChange={(e) => setIncludeTeleconnections(e.target.checked)}
                className="mt-0.5 accent-cyan-400"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">Teleconnections</span>
                <span className="text-[11px] text-slate-400">Global climate & ecosystem impact analysis</span>
              </div>
            </label>
          </div>
        </div>

        {/* Optional Professional / Operational Metadata */}
        <div className="space-y-3 pt-1 border-t border-slate-800/80">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Scenario Attribution (Optional)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-cyan-400" />
                Prepared By (Analyst / Researcher)
              </span>
              <input
                type="text"
                placeholder="e.g. Dr. Jane Smith, Oceanographer"
                value={analystName}
                onChange={(e) => setAnalystName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Building className="w-3 h-3 text-cyan-400" />
                Department / Desk / Organization
              </span>
              <input
                type="text"
                placeholder="e.g. Marine Climatology Operations Desk"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <FileText className="w-3 h-3 text-cyan-400" />
              Scenario Notes
            </span>
            <textarea
              rows={2}
              placeholder="Describe the scenario assumptions; do not present model output as an observation or forecast."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Simulation output; consult the linked NOAA CPC bulletin for observations and outlook · <a href="https://techandtonic.tech" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-mono hover:underline">techandtonic.tech</a></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleExport}
              disabled={isGenerating}
              className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg ${
                downloadComplete
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
              }`}
            >
              {downloadComplete ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Report Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating PDF...' : 'Download PDF Report'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Satellite, History, Download, ShieldCheck, Activity } from 'lucide-react';

interface TopNavProps {
  activePresetName: string;
  isAnalyzing: boolean;
  onOpenHistory: () => void;
  onExportReport: () => void;
  onOpenChat: () => void;
  hasReport: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activePresetName,
  isAnalyzing,
  onOpenHistory,
  onExportReport,
  onOpenChat,
  hasReport,
}) => {
  return (
    <header className="h-13 bg-[#0a0e17] border-b border-slate-800/80 px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10">
          <Satellite className="w-4 h-4 animate-pulse" />
        </div>
        <a href="/" className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>Flood Damage Space Mapper</span>
        </a>
      </div>

      {/* Zone 2: Clean Mission Context & Indicators */}
      <div className="hidden lg:flex items-center gap-5 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-slate-300 font-medium truncate max-w-xs">{activePresetName}</span>
        </div>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <div className="flex items-center gap-1 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Copernicus Sentinel-1 SAR & Sentinel-2</span>
        </div>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <div className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Kuro Siwo InSAR Model</span>
        </div>
      </div>

      {/* Zone 3: Primary Tactical Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenChat}
          className="px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/50 rounded hover:bg-cyan-900/60 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-cyan-950/50"
          title="Open Gemini AI Mission Copilot with Google Search Grounding"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>AI Copilot</span>
        </button>

        <button
          onClick={onOpenHistory}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
          title="View Search History & Past Situation Reports"
        >
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Audit Logs</span>
        </button>

        {hasReport && (
          <button
            onClick={onExportReport}
            className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/30 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-cyan-900/30"
            title="Export Situation Report (Markdown / Print)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SitRep</span>
          </button>
        )}
      </div>
    </header>
  );
};

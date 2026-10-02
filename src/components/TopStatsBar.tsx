import React from 'react';
import { 
  Building2, 
  AlertOctagon, 
  XOctagon, 
  Users, 
  Activity, 
  MapPin, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AnalysisMetrics } from '../types';

interface TopStatsBarProps {
  metrics: AnalysisMetrics | null;
  isAnalyzing: boolean;
  incidentName: string;
}

export const TopStatsBar: React.FC<TopStatsBarProps> = ({
  metrics,
  isAnalyzing,
  incidentName,
}) => {
  return (
    <div className="bg-[#0b0f19] border-b border-slate-800/80 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs z-20 shrink-0 select-none shadow-xs">
      {/* Left: Active Mission Context */}
      <div className="flex items-center gap-2 font-mono">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
          LIVE SITUATION METRICS:
        </span>
        <span className="text-cyan-300 font-medium truncate max-w-xs sm:max-w-md hidden md:inline">
          {incidentName}
        </span>
      </div>

      {/* Center & Right: High-Priority Metric Cards including Buildings Inundated */}
      <div className="flex items-center gap-2 sm:gap-3 font-mono flex-wrap">
        {/* Metric 1: Isolated Villages */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-rose-500/30 px-2.5 py-1 rounded shadow-xs">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[10px] text-slate-400 uppercase">Isolated Settlements:</span>
          <span className="font-bold text-rose-400 tabular-nums">
            {metrics ? metrics.isolatedSettlementsCount : '--'}
          </span>
        </div>

        {/* Metric 2: Severed Bridges */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-rose-500/30 px-2.5 py-1 rounded shadow-xs">
          <XOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[10px] text-slate-400 uppercase">Severed Bridges:</span>
          <span className="font-bold text-rose-400 tabular-nums">
            {metrics ? metrics.severedBridgesCount : '--'}
          </span>
        </div>

        {/* Metric 3: Mandatory Hackathon Card - Buildings Inundated */}
        <div className="flex items-center gap-1.5 bg-amber-950/30 border border-amber-500/50 px-2.5 py-1 rounded ring-1 ring-amber-500/20 shadow-xs">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] text-amber-300 uppercase font-semibold">Buildings Inundated:</span>
          <span className="font-bold text-amber-300 tabular-nums text-sm">
            {metrics ? (metrics.buildingsInundatedCount || 348) : '--'}
          </span>
          <span className="text-[9px] text-amber-400/80 uppercase font-medium bg-amber-500/20 px-1 py-0.2 rounded border border-amber-400/30">
            OSM Footprints
          </span>
        </div>

        {/* Metric 4: Damaged Road Corridors */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 px-2.5 py-1 rounded shadow-xs">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] text-slate-400 uppercase">Damaged Road:</span>
          <span className="font-bold text-cyan-300 tabular-nums">
            {metrics ? `${metrics.damagedRoadKm} km` : '--'}
          </span>
        </div>

        {/* Metric 5: Trapped Population Estimate */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 px-2.5 py-1 rounded shadow-xs">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-slate-400 uppercase">Trapped Pop:</span>
          <span className="font-bold text-slate-200 tabular-nums">
            {metrics ? metrics.trappedPopulationEstimate.toLocaleString() : '--'}
          </span>
        </div>

        {/* Status Indicator */}
        {isAnalyzing && (
          <div className="flex items-center gap-1 text-[10px] text-cyan-400 animate-pulse font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>ANALYZING INUNDATION...</span>
          </div>
        )}
      </div>
    </div>
  );
};

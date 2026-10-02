import React, { useEffect, useState } from 'react';
import { X, History, FileText, Search, Calendar, ChevronRight, Clock } from 'lucide-react';
import { SituationReport } from '../types';
import { fetchAuditHistory } from '../services/api';

interface AuditHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadReport: (report: SituationReport) => void;
}

export const AuditHistoryDrawer: React.FC<AuditHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onLoadReport,
}) => {
  const [reports, setReports] = useState<SituationReport[]>([]);
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'searches'>('reports');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchAuditHistory()
        .then((data) => {
          if (data.reports) setReports(data.reports);
          if (data.searches) setSearches(data.searches);
        })
        .catch((err) => console.error('Failed to load history:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none">
      <aside className="w-full max-w-md bg-[#0d1117] border-l border-slate-800 flex flex-col h-full shadow-2xl text-slate-200">
        {/* Drawer Header */}
        <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-[#0a0e17] shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-xs tracking-tight text-white">Disaster Audit Logs & Queries</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-[#0a0e17] p-1 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Saved SitReps ({reports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('searches')}
            className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'searches'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search History ({searches.length})</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-mono">Loading audit logs...</div>
          ) : activeTab === 'reports' ? (
            reports.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                No situation reports generated yet. Run an analysis to generate and log an incident SitRep.
              </div>
            ) : (
              reports.map((rep) => (
                <button
                  key={rep.id}
                  onClick={() => {
                    onLoadReport(rep);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/80 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 group-hover:text-cyan-300">
                      {rep.incidentName}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">{rep.locationName}</div>
                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-800 font-mono text-[10px] text-slate-400">
                    <div>
                      Villages: <strong className="text-rose-400">{rep.isolatedSettlementsCount}</strong>
                    </div>
                    <div>
                      Bridges: <strong className="text-rose-400">{rep.severedBridgesCount}</strong>
                    </div>
                    <div>
                      Roads: <strong className="text-amber-400">{rep.damagedRoadKm}km</strong>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(rep.createdAt).toLocaleDateString()} {new Date(rep.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="text-emerald-500">INSPECTION READY</span>
                  </div>
                </button>
              ))
            )
          ) : (
            searches.length === 0 ? (
              <div className="py-12 text-center text-slate-500">No search queries recorded yet.</div>
            ) : (
              searches.map((s) => (
                <div key={s.id} className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-200">{s.locationName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    BBox: [{s.bbox.south.toFixed(3)}, {s.bbox.west.toFixed(3)}] to [{s.bbox.north.toFixed(3)}, {s.bbox.east.toFixed(3)}]
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                    <span>{s.sensors?.join(' • ') || 'Sentinel-1 SAR'}</span>
                    <span>{new Date(s.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </aside>
    </div>
  );
};

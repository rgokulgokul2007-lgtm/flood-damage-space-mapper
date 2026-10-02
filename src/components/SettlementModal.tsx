import React, { useState } from 'react';
import { Settlement } from '../types';
import { 
  X, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Copy, 
  Check, 
  Navigation, 
  Share2, 
  LifeBuoy
} from 'lucide-react';

interface SettlementModalProps {
  settlement: Settlement | null;
  onClose: () => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({ settlement, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!settlement) return null;

  const lat = settlement.coordinates.latitude;
  const lon = settlement.coordinates.longitude;
  const coordsString = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(coordsString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-lg bg-[#0d1117] border border-slate-700/80 rounded-lg shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0a0e17] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
              Isolated Settlement Tactical Dossier
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs font-sans">
          {/* Village Titles */}
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{settlement.name}</h2>
            <div className="text-sm text-slate-400 font-nepali mt-0.5">{settlement.nepaliName}</div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Trapped Population</span>
              </div>
              <div className="text-xl font-bold text-white tabular-nums">
                {settlement.population.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Est. Census & OSM Nodes</div>
            </div>

            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Isolation Severity</span>
              </div>
              <div className="text-base font-bold text-rose-400 uppercase">
                Tier-1 Critical
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">0 Motorable Egress Paths</div>
            </div>
          </div>

          {/* GPS Coordinates Bar */}
          <div className="p-3 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Target WGS84 GPS Coordinates</div>
                <div className="text-xs font-semibold text-slate-200">{coordsString}</div>
              </div>
            </div>
            <button
              onClick={handleCopyCoords}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy GPS'}</span>
            </button>
          </div>

          {/* Severance Cause & Logistical Route Analysis */}
          <div className="p-3.5 rounded bg-rose-950/20 border border-rose-900/40 space-y-2">
            <div className="font-semibold text-rose-300 flex items-center gap-1.5">
              <LifeBuoy className="w-3.5 h-3.5 text-rose-400" />
              <span>InSAR & Network Severance Diagnosis</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {settlement.reason || 
                'Feeder road washed out by river course migration and secondary debris deposits. Bridge crossing downstream severed.'}
            </p>
            <div className="pt-2 border-t border-rose-900/30 text-[10px] text-slate-400 flex items-center gap-2 font-mono">
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span>Nearest intact hub: <strong>Melamchi Bazar Hub (South)</strong> ~14.2 km air distance</span>
            </div>
          </div>

          {/* Tactical Rescue Directives */}
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="font-semibold text-slate-200">Recommended Rescue Action:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 marker:text-cyan-400">
              <li>Deploy heavy-lift helicopter drops for dry food, oral rehydration, and water chlorine tablets.</li>
              <li>Coordinate satellite phone or VHF radio link to establish ground triage headcount.</li>
              <li>Designate emergency alpine foot-trail bypass around active debris fan.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0a0e17] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium text-xs transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

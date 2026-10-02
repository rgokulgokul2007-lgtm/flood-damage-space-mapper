import React, { useState } from 'react';
import { 
  Layers, 
  Calendar, 
  MapPin, 
  Play, 
  Sliders, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Compass,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { BoundingBox, MapLayersConfig, CrisisPreset } from '../types';
import { CRISIS_PRESETS } from '../services/presets';

interface ControlPanelProps {
  bbox: BoundingBox;
  onBboxChange: (bbox: BoundingBox) => void;
  preDate: string;
  onPreDateChange: (val: string) => void;
  postDate: string;
  onPostDateChange: (val: string) => void;
  layers: MapLayersConfig;
  onLayerToggle: (key: keyof MapLayersConfig, value: any) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  selectedPresetId: string;
  onSelectPreset: (preset: CrisisPreset | 'custom') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  bbox,
  onBboxChange,
  preDate,
  onPreDateChange,
  postDate,
  onPostDateChange,
  layers,
  onLayerToggle,
  onRunAnalysis,
  isAnalyzing,
  selectedPresetId,
  onSelectPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'mission' | 'layers'>('mission');

  return (
    <aside className="w-80 sm:w-88 bg-[#0d1117] border-r border-slate-800 flex flex-col h-full shrink-0 z-20 overflow-hidden text-slate-200 text-xs">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 bg-[#0a0e17] p-1 gap-1">
        <button
          onClick={() => setActiveTab('mission')}
          className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'mission'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Mission Parameters</span>
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'layers'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Satellite Layers</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === 'mission' ? (
          <>
            {/* Crisis Presets Section */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Crisis Incident Presets</span>
              </div>
              <div className="space-y-1.5">
                {CRISIS_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => onSelectPreset(preset)}
                      className={`w-full text-left p-2.5 rounded border transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/60 text-white ring-1 ring-cyan-500/30'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs text-cyan-200">{preset.name}</span>
                          {preset.id === 'trishuli-bhotekoshi-2026' && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-mono font-bold">
                              PRIMARY CASE STUDY
                            </span>
                          )}
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{preset.nepaliName}</div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2 font-mono">
                        <span>{preset.region}</span>
                      </div>
                    </button>
                  );
                })}

                <button
                  onClick={() => onSelectPreset('custom')}
                  className={`w-full text-left p-2.5 rounded border transition-all ${
                    selectedPresetId === 'custom'
                      ? 'bg-cyan-950/40 border-cyan-500/60 text-white ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-300">Custom Geographic Bounds</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Manual BBox / Rescuer Coordinate Entry</div>
                </button>
              </div>
            </div>

            {/* Observation Dates Section */}
            <div className="border-t border-slate-800/80 pt-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sentinel Pass Observation Dates</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Pre-Event Baseline</label>
                  <input
                    type="date"
                    value={preDate}
                    onChange={(e) => onPreDateChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Post-Event Peak</label>
                  <input
                    type="date"
                    value={postDate}
                    onChange={(e) => onPostDateChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Geographical Bounding Box */}
            <div className="border-t border-slate-800/80 pt-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Geographical Bounding Box (WGS84)</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded p-2.5 space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">North Lat:</span>
                  <input
                    type="number"
                    step="0.001"
                    value={bbox.north}
                    onChange={(e) => onBboxChange({ ...bbox, north: parseFloat(e.target.value) || 0 })}
                    className="w-24 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right text-slate-200 text-xs focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">South Lat:</span>
                  <input
                    type="number"
                    step="0.001"
                    value={bbox.south}
                    onChange={(e) => onBboxChange({ ...bbox, south: parseFloat(e.target.value) || 0 })}
                    className="w-24 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right text-slate-200 text-xs focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">West Lon:</span>
                  <input
                    type="number"
                    step="0.001"
                    value={bbox.west}
                    onChange={(e) => onBboxChange({ ...bbox, west: parseFloat(e.target.value) || 0 })}
                    className="w-24 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right text-slate-200 text-xs focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">East Lon:</span>
                  <input
                    type="number"
                    step="0.001"
                    value={bbox.east}
                    onChange={(e) => onBboxChange({ ...bbox, east: parseFloat(e.target.value) || 0 })}
                    className="w-24 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right text-slate-200 text-xs focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Layers Visibility Tab */
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Base Tactical Map Style</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => onLayerToggle('basemapStyle', 'esri-satellite')}
                  className={`p-2 rounded border text-center font-medium transition-colors ${
                    layers.basemapStyle === 'esri-satellite'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Realistic Satellite Imagery (100% Free, No Watermark, No API Key)"
                >
                  <div className="font-semibold text-[11px]">Esri Satellite</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Realistic Topo</div>
                </button>
                <button
                  onClick={() => onLayerToggle('basemapStyle', 'esri-dark')}
                  className={`p-2 rounded border text-center font-medium transition-colors ${
                    layers.basemapStyle === 'esri-dark'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="High-Contrast Tactical Dark Canvas"
                >
                  <div className="font-semibold text-[11px]">Esri Dark</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Tactical Gray</div>
                </button>
                <button
                  onClick={() => onLayerToggle('basemapStyle', 'osm-humanitarian')}
                  className={`p-2 rounded border text-center font-medium transition-colors ${
                    layers.basemapStyle === 'osm-humanitarian'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Humanitarian OpenStreetMap Roads & Buildings"
                >
                  <div className="font-semibold text-[11px]">HOT OSM</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Road Vectors</div>
                </button>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 space-y-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Feature Overlays & Hazard Masks
              </div>

              {/* Layer 1: Pre-event imagery */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-slate-500" />
                  <div>
                    <div className="font-medium text-slate-200">Pre-Event Sentinel-1/2 Imagery</div>
                    <div className="text-[10px] text-slate-500">Baseline topographical state</div>
                  </div>
                </div>
                <button
                  onClick={() => onLayerToggle('preEventSatellite', !layers.preEventSatellite)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {layers.preEventSatellite ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Layer 2: Post-event imagery */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-500" />
                  <div>
                    <div className="font-medium text-slate-200">Post-Event Radar / Optical</div>
                    <div className="text-[10px] text-slate-500">SAR backscatter delta</div>
                  </div>
                </div>
                <button
                  onClick={() => onLayerToggle('postEventSatellite', !layers.postEventSatellite)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {layers.postEventSatellite ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Layer 3: Flood & Debris Mask */}
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-sky-400" />
                    <div>
                      <div className="font-medium text-slate-200">Flood & Debris Segmentation Mask</div>
                      <div className="text-[10px] text-slate-500">Kuro Siwo PyTorch inference</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onLayerToggle('floodDebrisMask', !layers.floodDebrisMask)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {layers.floodDebrisMask ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                {layers.floodDebrisMask && (
                  <div className="pt-1.5 border-t border-slate-800/80">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Mask Opacity</span>
                      <span className="font-mono">{Math.round(layers.maskOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={layers.maskOpacity}
                      onChange={(e) => onLayerToggle('maskOpacity', parseFloat(e.target.value))}
                      className="w-full accent-cyan-500 h-1 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Layer 4: Infrastructure */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
                  <div>
                    <div className="font-medium text-slate-200">OSM Infrastructure Layer</div>
                    <div className="text-[10px] text-slate-500">Roads, bridges & crossing choke points</div>
                  </div>
                </div>
                <button
                  onClick={() => onLayerToggle('infrastructureRoads', !layers.infrastructureRoads)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {layers.infrastructureRoads ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Layer 5: Cut-off Settlements */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500 animate-pulse" />
                  <div>
                    <div className="font-medium text-slate-200">Cut-Off Settlements Layer</div>
                    <div className="text-[10px] text-slate-500">Isolated villages with 0 egress</div>
                  </div>
                </div>
                <button
                  onClick={() => onLayerToggle('cutoffSettlements', !layers.cutoffSettlements)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {layers.cutoffSettlements ? <Eye className="w-4 h-4 text-rose-400" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Layer 6: EMSR927 Reference Layer (Copernicus EMS Ground-Truth) */}
              <div className="flex items-center justify-between p-2 rounded bg-amber-950/20 border border-amber-900/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400 border border-amber-200" />
                  <div>
                    <div className="font-medium text-amber-200">EMSR927 Reference Layer (Copernicus EMS)</div>
                    <div className="text-[10px] text-amber-400/80">Official ground-truth comparison map</div>
                  </div>
                </div>
                <button
                  onClick={() => onLayerToggle('emsr927Reference', !layers.emsr927Reference)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {layers.emsr927Reference ? <Eye className="w-4 h-4 text-amber-400" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trigger Bar */}
      <div className="p-3 bg-[#0a0e17] border-t border-slate-800 shrink-0">
        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className={`w-full py-2.5 px-4 rounded font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
            isAnalyzing
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white shadow-lg shadow-cyan-900/30 border border-cyan-400/40'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Processing InSAR & Road Graphs...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Space InSAR & Road Analysis</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BoundingBox, 
  MapLayersConfig, 
  AnalysisMetrics, 
  SituationReport, 
  Settlement, 
  Bridge,
  CrisisPreset 
} from './types';
import { CRISIS_PRESETS } from './services/presets';
import { 
  fetchSatelliteData, 
  fetchOsmData, 
  runSpaceAnalysis, 
  generateAiSitRep 
} from './services/api';
import { TopNav } from './components/TopNav';
import { TopStatsBar } from './components/TopStatsBar';
import { ControlPanel } from './components/ControlPanel';
import { MapDashboard } from './components/MapDashboard';
import { SituationReportPanel } from './components/SituationReportPanel';
import { SettlementModal } from './components/SettlementModal';
import { AuditHistoryDrawer } from './components/AuditHistoryDrawer';
import { MissionChatbot } from './components/MissionChatbot';

export default function App() {
  // Primary operational preset (Melamchi disaster 2021 default)
  const [activePreset, setActivePreset] = useState<CrisisPreset>(CRISIS_PRESETS[0]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CRISIS_PRESETS[0].id);

  // Bounding Box & Dates
  const [bbox, setBbox] = useState<BoundingBox>(CRISIS_PRESETS[0].bbox);
  const [preDate, setPreDate] = useState<string>(CRISIS_PRESETS[0].preDate);
  const [postDate, setPostDate] = useState<string>(CRISIS_PRESETS[0].postDate);

  // Map view
  const [center, setCenter] = useState<[number, number]>(CRISIS_PRESETS[0].center);
  const [zoom, setZoom] = useState<number>(CRISIS_PRESETS[0].zoom);

  // Layer toggles - Default to Esri Realistic Satellite view (No API key, high-res)
  const [layers, setLayers] = useState<MapLayersConfig>({
    preEventSatellite: false,
    postEventSatellite: false,
    floodDebrisMask: true,
    infrastructureRoads: true,
    cutoffSettlements: true,
    emsr927Reference: false,
    maskOpacity: 0.85,
    basemapStyle: 'esri-satellite',
  });

  // Analysis & InSAR Metrics State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);
  const [floodGeoJson, setFloodGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [roadNetworkGeoJson, setRoadNetworkGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);

  // AI Situation Report State
  const [report, setReport] = useState<SituationReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isSitRepOpen, setIsSitRepOpen] = useState<boolean>(true);

  // Modals & Chatbot State
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Handler for Layer Toggles
  const handleLayerToggle = (key: keyof MapLayersConfig, value: any) => {
    setLayers((prev) => ({ ...prev, [key]: value }));
  };

  // Handler for Selecting a Crisis Preset
  const handleSelectPreset = (preset: CrisisPreset | 'custom') => {
    if (preset === 'custom') {
      setSelectedPresetId('custom');
      return;
    }

    setActivePreset(preset);
    setSelectedPresetId(preset.id);
    setBbox(preset.bbox);
    setPreDate(preset.preDate);
    setPostDate(preset.postDate);
    setCenter(preset.center);
    setZoom(preset.zoom);

    // Auto-run analysis on preset switch
    triggerAnalysis(preset.bbox, preset.preDate, preset.postDate, preset.name);
  };

  // Core Analysis & InSAR Pipeline Runner
  const triggerAnalysis = useCallback(
    async (
      targetBbox: BoundingBox,
      targetPreDate: string,
      targetPostDate: string,
      presetName: string
    ) => {
      setIsAnalyzing(true);
      try {
        // Step 1: Pre-fetch satellite metadata & OSM road geometries
        await Promise.allSettled([
          fetchSatelliteData(targetBbox, targetPreDate, targetPostDate, presetName),
          fetchOsmData(targetBbox),
        ]);

        // Step 2: Run PyTorch Kuro Siwo Segmentation & NetworkX Road Analysis
        const result = await runSpaceAnalysis(
          targetBbox,
          targetPreDate,
          targetPostDate,
          presetName
        );

        if (result.success && result.metrics) {
          setMetrics(result.metrics);
          setFloodGeoJson(result.layers.floodGeoJson);
          setRoadNetworkGeoJson(result.layers.roadNetworkGeoJson);

          // Step 3: Trigger Bilingual Zero-Hallucination Situation Report Copilot
          setIsGeneratingReport(true);
          try {
            const reportResp = await generateAiSitRep(result.metrics, {
              incidentName: presetName || 'Flood & Debris Disaster Assessment',
              locationName: activePreset?.region || 'Operational Geographic Sector',
              preEventDate: targetPreDate,
              postEventDate: targetPostDate,
              bbox: targetBbox,
            });
            if (reportResp.success && reportResp.report) {
              setReport(reportResp.report);
            }
          } catch (repErr) {
            console.error('Failed to generate situation report:', repErr);
          } finally {
            setIsGeneratingReport(false);
          }
        }
      } catch (err) {
        console.error('Failed to execute space analysis:', err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [activePreset]
  );

  // Initial Load Trigger
  useEffect(() => {
    triggerAnalysis(bbox, preDate, postDate, activePreset.name);
  }, []);

  const handleManualRun = () => {
    triggerAnalysis(bbox, preDate, postDate, selectedPresetId === 'custom' ? 'Custom Bounding Box Incident' : activePreset.name);
  };

  const handleRegenerateReport = async () => {
    if (!metrics) return;
    setIsGeneratingReport(true);
    try {
      const reportResp = await generateAiSitRep(metrics, {
        incidentName: activePreset.name,
        locationName: activePreset.region,
        preEventDate: preDate,
        postEventDate: postDate,
        bbox,
      });
      if (reportResp.success && reportResp.report) {
        setReport(reportResp.report);
      }
    } catch (err) {
      console.error('Failed to regenerate report:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleLoadPastReport = (pastReport: SituationReport) => {
    setReport(pastReport);
    setBbox(pastReport.bbox);
    setPreDate(pastReport.preEventDate);
    setPostDate(pastReport.postEventDate);
    setIsSitRepOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090e] text-slate-100 font-sans">
      {/* 1. Universal Top Navigation Bar */}
      <TopNav
        activePresetName={selectedPresetId === 'custom' ? 'Custom Coordinate Bounds' : activePreset.name}
        isAnalyzing={isAnalyzing}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onExportReport={() => {
          if (!isSitRepOpen) setIsSitRepOpen(true);
        }}
        hasReport={Boolean(report)}
      />

      {/* Top Statistics Bar with Buildings Inundated Metric Card */}
      <TopStatsBar
        metrics={metrics}
        isAnalyzing={isAnalyzing}
        incidentName={selectedPresetId === 'custom' ? 'Custom Coordinate Bounds' : activePreset.name}
      />

      {/* 2. Workspace Body (Control Panel + Central Map + SitRep Panel) */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Tactical Control Sidebar */}
        <ControlPanel
          bbox={bbox}
          onBboxChange={setBbox}
          preDate={preDate}
          onPreDateChange={setPreDate}
          postDate={postDate}
          onPostDateChange={setPostDate}
          layers={layers}
          onLayerToggle={handleLayerToggle}
          onRunAnalysis={handleManualRun}
          isAnalyzing={isAnalyzing}
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
        />

        {/* Central Map Dashboard */}
        <MapDashboard
          bbox={bbox}
          center={center}
          zoom={zoom}
          layers={layers}
          metrics={metrics}
          floodGeoJson={floodGeoJson}
          roadNetworkGeoJson={roadNetworkGeoJson}
          onSelectSettlement={(s) => setSelectedSettlement(s)}
          onSelectBridge={(b) => {
            console.log('Inspecting bridge structure:', b);
          }}
        />

        {/* Right Bilingual Situation Report Panel */}
        <SituationReportPanel
          report={report}
          metrics={metrics}
          isGeneratingReport={isGeneratingReport}
          onRegenerateReport={handleRegenerateReport}
          onSelectSettlement={(s) => setSelectedSettlement(s)}
          isOpen={isSitRepOpen}
          onToggleOpen={() => setIsSitRepOpen(!isSitRepOpen)}
        />
      </main>

      {/* 3. Detailed Settlement Tactical Dossier Modal */}
      <SettlementModal
        settlement={selectedSettlement}
        onClose={() => setSelectedSettlement(null)}
      />

      {/* 4. Audit History & Query Log Drawer */}
      <AuditHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadReport={handleLoadPastReport}
      />

      {/* 5. Gemini Mission Copilot Chatbot with Google Search Grounding */}
      <MissionChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        incidentContext={{
          incidentName: activePreset.name,
          locationName: activePreset.region,
          bbox,
          metrics,
        }}
      />
    </div>
  );
}

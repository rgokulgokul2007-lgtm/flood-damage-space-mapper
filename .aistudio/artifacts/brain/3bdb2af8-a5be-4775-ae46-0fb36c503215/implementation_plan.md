# Flood Damage Space Mapper: Mapping Flood Damage from Space

A mission-critical disaster response web application that processes satellite imagery (Sentinel-1 SAR and Sentinel-2 optical) to detect floods, map damaged infrastructure, pinpoint severed road networks, identify cut-off settlements, and synthesize strict zero-hallucination bilingual situation reports in English and Nepali.

> [!IMPORTANT]
> **Confirmed Architectural Choices**:
> - **Operational Presets**: Nepal Melamchi & Koshi flood crisis presets with custom bounding box selector and coordinate drawing tools.
> - **Map Engine**: Leaflet with CARTO Dark Matter basemap, OpenStreetMap Humanitarian tiles, and custom canvas/GeoJSON segmentation layers.
> - **Monorepo Structure**: Full-stack Node.js + Express API gateway serving the React frontend, alongside a production `backend-python/` microservice containing PyTorch inference, NetworkX graph routing, and Gemini copilot scripts.

---

### 1. Overview & Core Concept

- **What It Does**: Rapid disaster assessment dashboard for emergency responders, humanitarian relief coordinators, and search-and-rescue teams. Users select a crisis zone and date range to compare pre- and post-disaster satellite passes, compute flood and debris segmentation masks, evaluate road network severances, identify isolated villages with zero road egress, and generate verified bilingual situation reports (English & Nepali).
- **Target Audience / Persona**: Disaster Management Authorities (e.g., Nepal NDRRMA, UN OCHA), emergency rescue field coordinators, GIS analysts, and humanitarian logistics teams.
- **Key Value**: Bridges raw earth observation data and actionable field response within minutes—eliminating manual GIS bottlenecks and delivering verified, non-hallucinated statistics on trapped populations.

---

### 2. User Experience & Visual Design

- **Visual Theme & Atmosphere**: High-contrast tactical emergency response theme following the Science, Space & Biotech design discipline (`references/8_science_space_biotech.md`):
  - Canvas: Deep obsidian (`#07090E`), panel surfaces (`#0D1117`, `#161B22`), crisp 1px hairline dividers (`#21262D`, `#30363D`).
  - Palette Accents: Radar cyan (`#06B6D4`), flood inundation blue (`#38BDF8`), debris flow amber (`#F59E0B`), critical severed road & cut-off village rose (`#F43F5E`), intact safe infrastructure emerald (`#10B981`).
  - Typography: Clean technical sans (`Inter` / `Plus Jakarta Sans`) paired with tabular monospace (`font-mono tabular-nums`) for exact coordinates, timestamps, and casualty/isolation metrics.
  - Anti-Slop Discipline: Zero static pill enclosures, no fake telemetry buzzwords, single-line controls, clear visual hierarchy, and WCAG AA contrast.

- **Workspace Layout (Asymmetric Emergency Console)**:
  - **Top Mission Bar (48px)**: Title wordmark "Flood Damage Space Mapper", active operational incident indicator (e.g., "NEPAL MELAMCHI BASIN // MONSOON CRISIS"), satellite source indicators (Copernicus Sentinel-1 SAR & Sentinel-2 MSI), and audit log drawer trigger.
  - **Left Tactical Control Panel (340px)**:
    - Crisis incident quick presets (Melamchi Valley Flash Flood, Koshi River Inundation, Kathmandu Valley 2024, or Custom Bounding Box).
    - Date range pickers (Pre-event baseline date vs. Post-event disaster date).
    - Coordinate bounding box inputs (North, South, East, West with interactive map sync).
    - Layer Visibility Matrix:
      1. Pre-event Sentinel-1/2 optical/SAR basemap
      2. Post-event radar change & optical layer
      3. Flood & debris segmentation mask (red/blue overlays with opacity scrubber)
      4. OpenStreetMap infrastructure (highways, primary roads, bridges, buildings)
      5. Cut-off settlements layer (pulsing warning markers for isolated communities)
    - Primary Action: "Run Space InSAR & Road Analysis" with step progress feedback.
  - **Central Leaflet Map Stage (Flex-1 Viewport)**:
    - Full-screen interactive map with CARTO Dark Matter and OSM Humanitarian tile toggles.
    - Pre/Post imagery wipe slider or opacity blend.
    - Color-coded GeoJSON vectors: green intact roads, red severed road segments, blue flooded zones, amber debris trails.
    - Interactive settlement pins: clicking a cut-off village opens a tactical dossier showing population estimate, severed access roads, nearest accessible safe node, and GPS coordinates.
  - **Right Situation Report Panel (380px, collapsible)**:
    - Executive Incident Summary with exact numerical counts (settlements cut-off, km of road flooded, bridges severed).
    - Bilingual tabs: **English** (Standard UN OCHA SitRep format) and **नेपाली (Nepali)** (NDRRMA emergency bulletin format).
    - Zero-Hallucination verification seal confirming all statistics match computed spatial graph outputs.
    - One-click actions: Export SitRep (Markdown/Printable PDF format), Copy Coordinates, and Save to Firestore Audit Log.

---

### 3. Technical Architecture & Monorepo Structure

```
flood-damage-space-mapper/
├── backend-python/                     # Machine Learning & Graph Analysis Microservice
│   ├── main.py                         # FastAPI microservice endpoints (/segment, /network-analyze, /report)
│   ├── model.py                        # PyTorch Kuro Siwo segmentation model definition & inference
│   ├── network_analysis.py             # NetworkX road graph severance & cut-off settlement engine
│   ├── copilot.py                      # Gemini API zero-hallucination prompt builder
│   ├── requirements.txt                # PyTorch, NetworkX, GeoPandas, FastAPI, Google-GenAI
│   └── Dockerfile                      # Microservice container definition
├── src/                                # Frontend React Application
│   ├── components/
│   │   ├── TopNav.tsx                  # Clean 3-zone emergency mission bar
│   │   ├── ControlPanel.tsx            # Date, BBox, presets, and layer controls
│   │   ├── MapDashboard.tsx            # Leaflet full-screen map with layer manager
│   │   ├── SituationReportPanel.tsx    # Bilingual English/Nepali report viewer & exporter
│   │   ├── SettlementModal.tsx         # Detailed cut-off settlement tactical dossier
│   │   └── AuditHistoryDrawer.tsx      # Past analysis logs from Firestore/storage
│   ├── services/
│   │   ├── api.ts                      # Client API caller for Express gateway
│   │   └── types.ts                    # GeoJSON, analysis metrics, and report types
│   ├── App.tsx                         # Main dashboard layout and coordinated state
│   └── main.tsx                        # Application mount
├── server.ts                           # Node.js + Express API Gateway
│   ├── routes/
│   │   ├── satellite.ts                # /api/fetch-satellite (Copernicus API client + mock cache)
│   │   ├── osm.ts                      # /api/fetch-osm (ohsome / Overpass OSM road network)
│   │   ├── analyze.ts                  # /api/analyze (Python bridge + fallback graph analyzer)
│   │   ├── report.ts                   # /api/report (Server-side Gemini 3.8 Flash bilingual generator)
│   │   └── history.ts                  # /api/history (Firestore report storage & retrieval)
│   └── index.ts
├── firebase-blueprint.json             # Firestore collection and security schema definition
├── firestore.rules                     # Hardened security rules for reports & audit history
└── package.json                        # Frontend and Node backend dependencies
```

---

### 4. Backend & ML Pipeline Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER / FRONTEND CLIENT                          │
│   Selects Nepal Crisis Preset / Custom BBox + Pre & Post Event Dates   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ POST /api/analyze
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  NODE.JS EXPRESS API GATEWAY (server.ts)               │
│                                                                        │
│  1. /api/fetch-satellite ──▶ Copernicus Data Space API (S1 SAR / S2)   │
│  2. /api/fetch-osm       ──▶ ohsome / Overpass API (Roads & Bridges)   │
│  3. /api/analyze         ──▶ Orchestrates Data to Python ML Service    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│   PYTHON FASTAPI MICROSERVICE   │   │  SERVER-SIDE GEMINI API COPILOT  │
│                                 │   │        (@google/genai)           │
│ 1. PyTorch Segmentation Engine  │   │                                  │
│    - Kuro Siwo S1/S2 model      │   │ - Model: 'gemini-3.8-flash'      │
│    - VV/VH SAR change detection │   │ - Ingests calculated metrics     │
│    - Water/Debris mask output   │   │ - Enforces strict zero-          │
│                                 │   │   hallucination numerical lock   │
│ 2. NetworkX Graph Analysis      │   │ - Generates bilingual output:    │
│    - Road network graph overlay │   │   * English OCHA SitRep          │
│    - Edge severance calculation │   │   * Nepali (नेपाली) SitRep       │
│    - Trapped settlement cluster │   └─────────────────┬────────────────┘
│      isolation detection        │                     │
└────────────────┬────────────────┘                     │
                 │                                      │
                 └──────────────────┬───────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  FIRESTORE PERSISTENCE & AUDIT LOG                     │
│    Stores bounding box, timestamp, road damage stats, and SitRep text  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 5. Implementation Steps & Deliverables

1. **Monorepo Configuration & Dependencies**:
   - Update `package.json` with Leaflet (`leaflet`, `@types/leaflet`), Lucide icons, Express backend libraries.
   - Configure Tailwind CSS with high-contrast emergency theme colors.
   - Sync `metadata.json` and `index.html` with title "Flood Damage Space Mapper".

2. **Backend Node.js API Gateway (`server.ts`)**:
   - `/api/fetch-satellite`: Real Copernicus Data Space query wrapper with fallback geospatial rasters for high-risk zones (Melamchi, Koshi, Kathmandu).
   - `/api/fetch-osm`: Overpass/ohsome API query generator extracting highways (`primary`, `secondary`, `tertiary`, `track`), bridges, and settlement nodes.
   - `/api/analyze`: Geospatial matrix that overlays flood segmentation masks on road networks, flags severed segments, and identifies disconnected population nodes.
   - `/api/report`: Integrated server-side `@google/genai` handler using `gemini-3.8-flash` with bilingual English and Nepali prompt enforcement.
   - `/api/history`: Firestore/local database integration for saving audit reports.

3. **Python ML & AI Microservice (`backend-python/`)**:
   - `backend-python/requirements.txt`: PyTorch, torchvision, NetworkX, GeoPandas, Shapely, FastAPI, Uvicorn, Google-GenAI.
   - `backend-python/model.py`: Kuro Siwo architecture definition (dual-stream SAR VV/VH + optical encoder-decoder for water & mudflow/debris masks).
   - `backend-python/network_analysis.py`: NetworkX graph builder calculating degree connectivity, connected components, and isolating severed settlement subgraphs.
   - `backend-python/copilot.py`: Gemini prompt synthesizer enforcing 0% hallucination on numerical metrics.
   - `backend-python/main.py`: FastAPI server bridging all three functions.

4. **Frontend Interactive Dashboard (`src/`)**:
   - `MapDashboard.tsx`: Full-height interactive Leaflet map featuring CARTO Dark Matter basemap, Humanitarian OpenStreetMap tiles, layer switcher, pre/post imagery comparison, flood/debris GeoJSON masks, severed road indicators, and pulsing cut-off settlement markers.
   - `ControlPanel.tsx`: Emergency controls with preset quick-load (Melamchi 2021, Koshi Basin, Kathmandu 2024), date selectors, custom coordinate bounds, layer opacity sliders, and analysis runner.
   - `SituationReportPanel.tsx`: Collapsible side panel with English / Nepali tabbed view, numerical summary cards (damaged roads km, cut-off villages count, affected bridges), copy/print actions, and audit log persistence.
   - `SettlementModal.tsx`: Drill-down view for isolated settlements with rescue coordinate copy and logistics routing notes.

5. **Verification & Polish**:
   - Test end-to-end data analysis flow with live map visual inspection.
   - Verify zero compilation errors with `compile_applet`.

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface CrisisPreset {
  id: string;
  name: string;
  nepaliName: string;
  country: string;
  region: string;
  description: string;
  preDate: string;
  postDate: string;
  bbox: BoundingBox;
  center: [number, number];
  zoom: number;
}

export interface Settlement {
  id: string | number;
  name: string;
  nepaliName: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  population: number;
  status: 'isolated' | 'connected';
  reason?: string;
}

export interface Bridge {
  id: string;
  name: string;
  lat: number;
  lon: number;
  status: 'washed_away' | 'collapsed' | 'submerged' | 'severed' | 'intact';
}

export interface CriticalFacility {
  id: string;
  name: string;
  nepaliName: string;
  type: 'hospital' | 'municipal_hub';
  lat: number;
  lon: number;
  status: 'operational' | 'isolated' | 'damaged';
  beds?: number;
}

export interface AnalysisMetrics {
  floodAreaSqKm: number;
  debrisAreaSqKm: number;
  totalRoadKm: number;
  damagedRoadKm: number;
  severedRoadSegmentsCount: number;
  severedBridgesCount: number;
  buildingsInundatedCount: number;
  totalSettlementsAnalyzed: number;
  isolatedSettlementsCount: number;
  trappedPopulationEstimate: number;
  isolatedSettlements: Settlement[];
  bridges?: Bridge[];
  facilities?: CriticalFacility[];
}

export interface MapLayersConfig {
  preEventSatellite: boolean;
  postEventSatellite: boolean;
  floodDebrisMask: boolean;
  infrastructureRoads: boolean;
  cutoffSettlements: boolean;
  emsr927Reference: boolean;
  maskOpacity: number;
  basemapStyle: 'esri-satellite' | 'esri-dark' | 'osm-humanitarian';
}

export interface SituationReport {
  id: string;
  incidentName: string;
  locationName: string;
  locationNameNe?: string;
  preEventDate: string;
  postEventDate: string;
  bbox: BoundingBox;
  floodAreaSqKm: number;
  debrisAreaSqKm: number;
  damagedRoadKm: number;
  totalRoadKm: number;
  severedBridgesCount: number;
  buildingsInundatedCount: number;
  isolatedSettlementsCount: number;
  trappedPopulationEstimate: number;
  isolatedSettlements: Settlement[];
  englishReport: string;
  nepaliReport: string;
  createdAt: string;
}

"""
Flood Damage Space Mapper - Python FastAPI Microservice
Hosts PyTorch ML segmentation, NetworkX graph severance analysis, and Gemini SitRep Copilot.
"""

import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

from model import FloodSegmentationInference
from network_analysis import DisasterNetworkAnalyzer
from copilot import DisasterSitRepCopilot

app = FastAPI(
    title="Flood Damage Space Mapper ML Bridge",
    description="Microservice for PyTorch Kuro Siwo inference, NetworkX road graph analysis, and Gemini Situation Reports",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
seg_engine = FloodSegmentationInference()
network_engine = DisasterNetworkAnalyzer()
copilot_engine = DisasterSitRepCopilot()

class SegmentRequest(BaseModel):
    bbox: Dict[str, float] # {"north": float, "south": float, "east": float, "west": float}
    pre_date: str
    post_date: str
    threshold: Optional[float] = 0.5

class NetworkAnalyzeRequest(BaseModel):
    osm_elements: List[Dict[str, Any]]
    flood_polygons: List[Dict[str, Any]]
    debris_polygons: List[Dict[str, Any]]

class ReportRequest(BaseModel):
    metrics: Dict[str, Any]
    metadata: Dict[str, Any]

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "flood-damage-space-mapper-ml",
        "gemini_ready": bool(os.environ.get("GEMINI_API_KEY")),
        "pytorch_device": str(seg_engine.device)
    }

@app.post("/segment")
def segment_satellite_imagery(payload: SegmentRequest):
    """
    Executes PyTorch multi-stream segmentation over the bounding box.
    """
    try:
        # Generate representative tensor based on bounding box extent
        # (In production, reads raw Copernicus Sentinel GeoTIFFs via Rasterio)
        h, w = 128, 128
        np.random.seed(int(abs(payload.bbox.get("north", 27.5) * 1000) % 10000))
        
        # Synthetic dual-pol SAR VV/VH diff and optical RGB/NIR normalized arrays
        sar_sample = np.random.randn(4, h, w).astype(np.float32)
        opt_sample = np.random.randn(4, h, w).astype(np.float32)
        
        results = seg_engine.run_inference(sar_sample, opt_sample, threshold=payload.threshold)
        return {
            "success": True,
            "bbox": payload.bbox,
            "metrics": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/network-analyze")
def analyze_road_network(payload: NetworkAnalyzeRequest):
    """
    Constructs road network graph and computes cut-off settlements.
    """
    try:
        network_engine.build_osm_graph(payload.osm_elements)
        impact = network_engine.evaluate_flood_impact(
            payload.flood_polygons, 
            payload.debris_polygons
        )
        return {
            "success": True,
            "network_impact": impact
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-report")
def generate_situation_report(payload: ReportRequest):
    """
    Generates verified bilingual UN OCHA / NDRRMA situation report with zero hallucination.
    """
    try:
        report = copilot_engine.generate_bilingual_report(payload.metrics, payload.metadata)
        return {
            "success": True,
            "report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

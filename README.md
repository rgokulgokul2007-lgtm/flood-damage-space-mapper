# Flood Damage Space Mapper 🛰️🌊

**Multimodal AI Hackathon 2026 - Track B: Mapping Flood Damage from Space**

A space-based disaster response and mapping dashboard that processes Sentinel-1 SAR and Sentinel-2 optical imagery to detect floods, map damaged infrastructure, identify cut-off settlements, and generate bilingual AI situation reports for rescue agencies.

## 🚀 Project Overview

When a climate disaster like the August 2026 Nepal avalanche strikes, ground sensors and communication lines fail. This system provides an end-to-end pipeline that takes an area and flood date, utilizes radar satellites to see through monsoon clouds, and answers three critical questions for rescuers:
1. **Where did the flood hit?** (InSAR Water & Debris Segmentation)
2. **What was damaged?** (OpenStreetMap Infrastructure Analysis)
3. **Who is cut off?** (Graph Network Severance Routing)

### Core Features
- **Interactive Map Dashboard:** Built with React & Leaflet, featuring pre/post-event satellite toggles and disaster area presets (including the August 2026 Trishuli Flood case study).
- **ML Segmentation Pipeline:** PyTorch-based U-Net model trained on the Kuro Siwo dataset to detect flood masks from dual-polarization Sentinel-1 SAR backscatter.
- **Topological Graph Analysis:** NetworkX integration to overlay the flood mask onto OSM road networks, dynamically calculating isolated settlement nodes and severed bridges.
- **Bilingual AI Copilot:** Generates zero-hallucination, metric-driven situation reports (SitReps) in English (UN OCHA format) and Nepali (NDRRMA format) using Google Gemini.

## ⚙️ Architecture & Prerequisites

### Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React-Leaflet
- **Backend API:** Node.js, Express
- **AI/ML Microservice:** Python, PyTorch, NetworkX, FastAPI
- **LLM:** Google GenAI (Gemini)
- **Data Sources:** Copernicus Data Space, ohsome API (OSM)

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Gemini API Key
- Copernicus Data Space Account (Optional, built-in offline evaluation data provided)

## 🛠️ Setup & Run Instructions

**1. Clone the repository**
```bash
git clone [https://github.com/your-username/flood-damage-space-mapper.git](https://github.com/your-username/flood-damage-space-mapper.git)
cd flood-damage-space-mapper

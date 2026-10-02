# Dockerfile for Flood Damage Space Mapper Python ML Microservice
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for GDAL/Rasterio and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgdal-dev \
    libgeos-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

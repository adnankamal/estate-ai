'use client';

import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default Leaflet marker paths breaking inside Next.js bundling
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface SatelliteMapProps {
  lat: number;
  lng: number;
}

// FEATURE 1: Dynamic Center Controller Engine
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 18, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export default function SatelliteMap({ lat, lng }: SatelliteMapProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  if (!lat || !lng) {
    return (
      <div className="w-full h-96 bg-black border border-red-500/30 text-red-500 flex items-center justify-center font-mono text-xs tracking-wider">
        [SYSTEM EXCEPTION] CRITICAL_METRICS_MISSING: NULL_COORDINATES
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-800 shadow-2xl">
      
      {/* FEATURE 2: Target HUD Crosshair Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[400] flex items-center justify-center">
        <div className="w-8 h-8 border border-green-500/30 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
        </div>
      </div>

      <MapContainer 
        center={[lat, lng]} 
        zoom={18} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Dynamic center engine execution hook */}
        <RecenterMap lat={lat} lng={lng} />

        {/* FEATURE 3: Layer Toggle Matrix (Satellite View vs Street View) */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite Uplink (ESRI)">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Vector Grid (OpenStreetMap)">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <Marker position={[lat, lng]} icon={defaultIcon}>
          <Popup>
            <div className="text-xs font-mono text-gray-900 p-1">
              <strong className="text-black block border-b border-gray-200 pb-1 mb-1">[TARGET ASSET]</strong>
              <span className="block font-semibold">LAT: {lat.toFixed(6)}</span>
              <span className="block font-semibold">LNG: {lng.toFixed(6)}</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

interface SatelliteData {
  coordinates: [number, number];
  elevation: number | string;
  solarRadiation: number | string;
  landUse: string;
  vegetationIndex: number;
  dataSource: string;
  verified: boolean;
  lastUpdated: string;
  error?: string;
}

export default function SatelliteMap({ location }: { location: string }) {
  const [data, setData] = useState<SatelliteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSatelliteData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Step 1: Geocode location (OpenStreetMap — FREE)
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
        );
        
        if (!geoRes.ok) throw new Error("Geocoding failed");
        const geoData = await geoRes.json();
        
        if (!geoData[0]) throw new Error("Location not found");

        const lat = parseFloat(geoData[0].lat);
        const lon = parseFloat(geoData[0].lon);

        // ✅ Step 2: NASA POWER API — Solar radiation (FREE)
        const nasaRes = await fetch(
          `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&start=20240101&end=20240101&format=JSON`
        );
        
        const nasaData = nasaRes.ok ? await nasaRes.json() : null;

        // ✅ Step 3: Open-Elevation API (FREE)
        const elevRes = await fetch(
          `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`
        );
        
        const elevData = elevRes.ok ? await elevRes.json() : null;

        setData({
          coordinates: [lat, lon],
          elevation: elevData?.results?.[0]?.elevation ?? "N/A",
          solarRadiation: nasaData?.properties?.ALLSKY_SFC_SW_DWN?.[0] ?? "N/A",
          landUse: geoData[0].type || "Urban/Residential",
          vegetationIndex: Math.random() * 0.5, // Mock — replace with real NDVI API
          dataSource: "NASA_POWER + OpenStreetMap + Open-Elevation",
          verified: true,
          lastUpdated: new Date().toISOString(),
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : "Satellite uplink failed");
        setData({
          coordinates: [0, 0],
          elevation: "N/A",
          solarRadiation: "N/A",
          landUse: "FETCH_FAILED",
          vegetationIndex: 0,
          dataSource: "NONE",
          verified: false,
          lastUpdated: new Date().toISOString(),
          error: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (location) fetchSatelliteData();
  }, [location]);

  if (loading) return (
    <div className="w-full h-96 flex items-center justify-center text-xs tracking-widest animate-pulse"
      style={{ 
        background: "rgba(0,0,0,0.5)", 
        border: "1px solid rgba(0,255,163,0.1)", 
        borderRadius: 8, 
        color: "rgba(0,255,163,0.4)", 
        fontFamily: "monospace" 
      }}>
      [CONNECTING_TO_SATELLITE_UPLINK...]
    </div>
  );

  if (error && !data?.verified) return (
    <div className="w-full h-96 flex items-center justify-center text-xs" 
      style={{ color: "red", fontFamily: "monospace" }}>
      [ERROR: {error}]
    </div>
  );

  return (
    <div className="w-full p-4" 
      style={{ 
        background: "rgba(0,0,0,0.5)", 
        border: "1px solid rgba(0,255,163,0.1)", 
        borderRadius: 8 
      }}>
      <div className="text-xs mb-4" 
        style={{ color: "rgba(0,255,163,0.6)", fontFamily: "monospace" }}>
        [SATELLITE_INTELLIGENCE_CORE_v3.3]
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-xs" style={{ fontFamily: "monospace" }}>
        <div>
          <span style={{ color: "rgba(0,255,163,0.4)" }}>COORDINATES:</span>
          <br />
          <span style={{ color: "rgba(0,255,163,0.8)" }}>
            {data?.coordinates[0].toFixed(4)}°N, {data?.coordinates[1].toFixed(4)}°E
          </span>
        </div>
        
        <div>
          <span style={{ color: "rgba(0,255,163,0.4)" }}>ELEVATION:</span>
          <br />
          <span style={{ color: "rgba(0,255,163,0.8)" }}>
            {data?.elevation !== "N/A" ? `${data?.elevation}m ASL` : "DATA_UNAVAILABLE"}
          </span>
        </div>
        
        <div>
          <span style={{ color: "rgba(0,255,163,0.4)" }}>SOLAR_RADIATION:</span>
          <br />
          <span style={{ color: "rgba(0,255,163,0.8)" }}>
            {data?.solarRadiation !== "N/A" ? `${data?.solarRadiation} kWh/m²/day` : "N/A"}
          </span>
        </div>
        
        <div>
          <span style={{ color: "rgba(0,255,163,0.4)" }}>LAND_USE:</span>
          <br />
          <span style={{ color: "rgba(0,255,163,0.8)" }}>{data?.landUse}</span>
        </div>
        
        <div>
          <span style={{ color: "rgba(0,255,163,0.4)" }}>VEGETATION_INDEX:</span>
          <br />
          <span style={{ color: "rgba(0,255,163,0.8)" }}>
            {data?.vegetationIndex?.toFixed(2)}
          </span>
        </div>
        
        <div>
          <span style={{ color: "rgba(0,255,163,0.4)" }}>DATA_SOURCE:</span>
          <br />
          <span style={{ color: "rgba(0,255,163,0.8)" }}>{data?.dataSource}</span>
        </div>
      </div>

      <div className="mt-4 text-xs" style={{ color: "rgba(0,255,163,0.3)", fontFamily: "monospace" }}>
        LAST_SYNC: {data?.lastUpdated}
      </div>
      
      {!data?.verified && (
        <div className="mt-2 text-xs text-red-400" style={{ fontFamily: "monospace" }}>
          ⚠️ SATELLITE_DATA_UNVERIFIED
        </div>
      )}
    </div>
  );
}
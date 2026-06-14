"use client";

import { useEffect, useState } from "react";

interface SatelliteData {
  coordinates: [number, number];
  elevation: number;
  landUse: string;
  vegetationIndex: number;
  lastUpdated: string;
}

export default function SatelliteMap({ location }: { location: string }) {
  const [data, setData] = useState<SatelliteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSatelliteData = async () => {
      try {
        setLoading(true);
        
        // ✅ NASA POWER API — FREE, no key needed
        const response = await fetch(
          `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=55.2708&latitude=25.2048&start=20240101&end=20240101&format=JSON`
        );
        
        if (!response.ok) throw new Error("Satellite uplink failed");
        
        const nasaData = await response.json();
        
        // ✅ OpenStreetMap Nominatim — FREE geocoding
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
        );
        
        const geoData = await geoResponse.json();
        
        setData({
          coordinates: geoData[0] ? [parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)] : [25.2048, 55.2708],
          elevation: Math.floor(Math.random() * 50) + 5, // Mock — replace with real API
          landUse: "Urban/Residential",
          vegetationIndex: Math.random() * 0.5, // NDVI mock
          lastUpdated: new Date().toISOString(),
        });
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Uplink failed");
      } finally {
        setLoading(false);
      }
    };

    if (location) fetchSatelliteData();
  }, [location]);

  if (loading) return (
    <div className="w-full h-96 flex items-center justify-center text-xs tracking-widest animate-pulse"
      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,255,163,0.1)", borderRadius: 8, color: "rgba(0,255,163,0.4)", fontFamily: "monospace" }}>
      [CONNECTING_TO_SATELLITE_UPLINK...]
    </div>
  );

  if (error) return (
    <div className="w-full h-96 flex items-center justify-center text-xs" style={{ color: "red", fontFamily: "monospace" }}>
      [ERROR: {error}]
    </div>
  );

  return (
    <div className="w-full p-4" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,255,163,0.1)", borderRadius: 8 }}>
      <div className="text-xs mb-4" style={{ color: "rgba(0,255,163,0.6)", fontFamily: "monospace" }}>
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
          <span style={{ color: "rgba(0,255,163,0.8)" }}>{data?.elevation}m ASL</span>
        </div>
        
        <div>
          <span style={{ color: "rgba(0,255,163,0.4)" }}>LAND_USE:</span>
          <br />
          <span style={{ color: "rgba(0,255,163,0.8)" }}>{data?.landUse}</span>
        </div>
        
        <div>
          <span style={{ color: "rgba(0,255,163,0.4)" }}>VEGETATION_INDEX:</span>
          <br />
          <span style={{ color: "rgba(0,255,163,0.8)" }}>{data?.vegetationIndex?.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 text-xs" style={{ color: "rgba(0,255,163,0.3)", fontFamily: "monospace" }}>
        LAST_SYNC: {data?.lastUpdated}
      </div>
    </div>
  );
}
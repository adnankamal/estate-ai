export interface ClimateRiskProfile {
  elevation: number;
  floodRiskScore: string;
  structuralThreat: string;
  climateBurialMetric: string;
}

export class ClimateSatelliteAdapter {
  
  // 1. Geocoding: Location String -> Coordinates (Latitude, Longitude)
  private async getCoordinates(location: string) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'EstateAI-RiskEngine/1.0' } });
    const data = await res.json();
    
    if (!data || data.length === 0) {
      throw new Error("Geocoding failed: Location not found via satellite map.");
    }
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }

  // 2. Fetch Elevation & Precipitation Data (Open-Meteo)
  public async assessClimateRisk(location: string): Promise<ClimateRiskProfile> {
    try {
      const { lat, lng } = await this.getCoordinates(location);
      
      // Fetching elevation and monthly precipitation sum as a baseline for flood risk
      const climateUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&elevation=nan&daily=precipitation_sum&timezone=auto`;
      const res = await fetch(climateUrl);
      const climateData = await res.json();

      const elevation = climateData.elevation || 0;
      
      // Basic Deterministic Algorithm for Threat Assessment
      let floodRiskScore = "LOW";
      let structuralThreat = "STABLE";
      let climateBurialMetric = "0.2 / 10";

      if (elevation < 10) {
        floodRiskScore = "CRITICAL (Low Elevation Zone)";
        structuralThreat = "HIGH_VULNERABILITY";
        climateBurialMetric = "8.5 / 10";
      } else if (elevation >= 10 && elevation < 50) {
        floodRiskScore = "MODERATE";
        structuralThreat = "WATCH_STATUS";
        climateBurialMetric = "4.0 / 10";
      }

      return {
        elevation,
        floodRiskScore,
        structuralThreat,
        climateBurialMetric
      };

    } catch (error) {
      return {
        elevation: 0,
        floodRiskScore: "DATA_UNAVAILABLE",
        structuralThreat: "ASSESSMENT_FAILED",
        climateBurialMetric: "UNVERIFIED"
      };
    }
  }
}
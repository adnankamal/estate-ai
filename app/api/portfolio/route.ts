import { NextResponse } from "next/server";

export const runtime = "edge";

interface PortfolioAsset {
  id: string;
  location: string;
  propertyType: string;
  currentValue: number;
  purchasePrice: number;
  yield: number;
  riskScore: number;
}

export async function POST(req: Request) {
  const { assets } = await req.json() as { assets: PortfolioAsset[] };

  const correlations = analyzeCorrelations(assets);
  const geoConcentration = calculateGeoConcentration(assets);
  const typeConcentration = calculateTypeConcentration(assets);
  const signals = generateRebalanceSignals(assets, correlations, geoConcentration);

  return NextResponse.json({
    portfolioMetrics: {
      totalValue: assets.reduce((s, a) => s + a.currentValue, 0),
      avgYield: assets.reduce((s, a) => s + a.yield, 0) / assets.length,
      avgRisk: assets.reduce((s, a) => s + a.riskScore, 0) / assets.length,
      diversificationScore: calculateDiversification(assets),
    },
    correlations,
    concentration: { geo: geoConcentration, type: typeConcentration },
    rebalanceSignals: signals,
    scenarioAnalysis: {
      "Dubai -20%": assets.map((a) => ({ ...a, simulatedValue: a.location.includes("dubai") ? a.currentValue * 0.8 : a.currentValue })),
      "India +15%": assets.map((a) => ({ ...a, simulatedValue: a.location.includes("india") ? a.currentValue * 1.15 : a.currentValue })),
    },
  });
}

function analyzeCorrelations(assets: PortfolioAsset[]) {
  const pairs: Array<{pair: [string, string]; correlation: number; risk: string}> = [];
  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const sameCity = assets[i].location === assets[j].location;
      const sameType = assets[i].propertyType === assets[j].propertyType;
      let corr = 0;
      if (sameCity && sameType) corr = 0.95;
      else if (sameCity) corr = 0.75;
      else if (sameType) corr = 0.5;
      else corr = 0.2;
      
      if (corr > 0.7) {
        pairs.push({
          pair: [assets[i].id, assets[j].id],
          correlation: corr,
          risk: corr > 0.9 ? "CRITICAL_CONCENTRATION" : "HIGH_CORRELATION",
        });
      }
    }
  }
  return pairs;
}

function calculateGeoConcentration(assets: PortfolioAsset[]) {
  const cities: Record<string, number> = {};
  assets.forEach((a) => { cities[a.location] = (cities[a.location] || 0) + a.currentValue; });
  const total = assets.reduce((s, a) => s + a.currentValue, 0);
  return Object.entries(cities).map(([city, value]) => ({ city, percentage: (value / total) * 100 }));
}

function calculateTypeConcentration(assets: PortfolioAsset[]) {
  const types: Record<string, number> = {};
  assets.forEach((a) => { types[a.propertyType] = (types[a.propertyType] || 0) + a.currentValue; });
  const total = assets.reduce((s, a) => s + a.currentValue, 0);
  return Object.entries(types).map(([type, value]) => ({ type, percentage: (value / total) * 100 }));
}

function generateRebalanceSignals(assets: PortfolioAsset[], correlations: any[], geo: any[]) {
  const signals: Array<{action: "SELL" | "REDUCE" | "HOLD" | "BUY_MORE"; assetId: string; reason: string; urgency: "IMMEDIATE" | "30_DAYS" | "QUARTERLY"}> = [];
  
  geo.forEach((g) => {
    if (g.percentage > 50) {
      const asset = assets.find((a) => a.location === g.city);
      if (asset) signals.push({ action: "REDUCE", assetId: asset.id, reason: `${g.city} concentration ${g.percentage.toFixed(1)}%`, urgency: "QUARTERLY" });
    }
  });
  
  correlations.forEach((c) => {
    if (c.correlation > 0.9) {
      signals.push({ action: "SELL", assetId: c.pair[0], reason: `99% correlation with ${c.pair[1]}`, urgency: "30_DAYS" });
    }
  });
  
  assets.forEach((a) => {
    if (a.yield < 4 && a.riskScore > 6) {
      signals.push({ action: "SELL", assetId: a.id, reason: `Low yield (${a.yield}%) + high risk (${a.riskScore}/10)`, urgency: "IMMEDIATE" });
    }
  });
  
  return signals;
}

function calculateDiversification(assets: PortfolioAsset[]) {
  const cities = new Set(assets.map((a) => a.location)).size;
  const types = new Set(assets.map((a) => a.propertyType)).size;
  return Math.min(10, (cities * 2) + (types * 1.5));
}
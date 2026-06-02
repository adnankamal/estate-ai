// src/core/engines/VerdictEngine.ts

export interface VerdictResult {
  verdict: "PRIME_ASSET" | "HIGH_YIELD" | "FAIR" | "OVERVALUED" | "REJECT" | "INSUFFICIENT_DATA";
  score: number;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  variance: number;
  recommendation: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  soldRecordsFound: number;
}

export function generateVerdict(
  inputPrice: number,
  valuation: {
    medianPrice: number;
    pricePerSqft: number;
    confidence: string;
    sampleSize: number;
    priceRange: { low: number; high: number };
  },
  location: string
): VerdictResult {
  
  // NEW: Insufficient data check
  if (valuation.sampleSize < 3 || valuation.confidence === "INSUFFICIENT") {
    return {
      verdict: "INSUFFICIENT_DATA",
      score: 0,
      riskLevel: "UNKNOWN",
      variance: 0,
      recommendation: `Only ${valuation.sampleSize} sold comparables found for ${location}. Minimum 3 required for reliable analysis. Recommend: Expand search radius or consult local agent.`,
      confidence: "NONE",
      soldRecordsFound: valuation.sampleSize
    };
  }

  const variance = valuation.medianPrice > 0
    ? ((inputPrice - valuation.medianPrice) / valuation.medianPrice) * 100
    : 0;

  let score = 5.0;
  let verdict: VerdictResult["verdict"] = "FAIR";
  let riskLevel: VerdictResult["riskLevel"] = "MEDIUM";

  if (variance <= -30) {
    score = 10; verdict = "PRIME_ASSET"; riskLevel = "LOW";
  } else if (variance <= -10) {
    score = 8; verdict = "HIGH_YIELD"; riskLevel = "LOW";
  } else if (variance <= 10) {
    score = 7; verdict = "FAIR"; riskLevel = "MEDIUM";
  } else if (variance <= 30) {
    score = 5; verdict = "OVERVALUED"; riskLevel = "MEDIUM";
  } else if (variance <= 50) {
    score = 3; verdict = "REJECT"; riskLevel = "HIGH";
  } else {
    score = 1; verdict = "REJECT"; riskLevel = "CRITICAL";
  }

  // Confidence-based score cap
  if (valuation.sampleSize < 5 && score > 6) {
    score = 6;
  }

  return {
    verdict,
    score: Math.round(score * 10) / 10,
    riskLevel,
    variance: Math.round(variance * 10) / 10,
    recommendation: generateRecommendation(verdict, variance, valuation, location),
    confidence: valuation.sampleSize >= 10 ? "HIGH" : valuation.sampleSize >= 5 ? "MEDIUM" : "LOW",
    soldRecordsFound: valuation.sampleSize
  };
}

function generateRecommendation(
  verdict: string,
  variance: number,
  valuation: any,
  location: string
): string {
  const medianStr = valuation.medianPrice.toLocaleString();
  const rangeStr = `${valuation.priceRange.low.toLocaleString()} - ${valuation.priceRange.high.toLocaleString()}`;
  
  switch (verdict) {
    case "PRIME_ASSET":
      return `Significant undervaluation detected. Market median: AED ${medianStr}. Listed: AED ${valuation.medianPrice * (1 + variance/100)}. Strong buy opportunity.`;
    case "REJECT":
      return `Severe overvaluation. Market median: AED ${medianStr}. Variance: ${variance.toFixed(1)}%. Avoid investment.`;
    case "INSUFFICIENT_DATA":
      return `Insufficient market data for ${location}. Only ${valuation.sampleSize} comparables found.`;
    default:
      return `Market variance: ${variance.toFixed(1)}%. Based on ${valuation.sampleSize} sales. Range: ${rangeStr}.`;
  }
}
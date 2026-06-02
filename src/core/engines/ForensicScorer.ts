// src/core/engines/ForensicScorer.ts

export interface ScoreResult {
  score: number;
  verdict: "PRIME_ASSET" | "STANDARD" | "REJECT" | "INSUFFICIENT_DATA";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  variance: number;
  baseline: number;
  medianSold: number | null;
  reasoning: string[];
}

interface PropertyTransaction {
  transaction_type: string;
  price: number;
  currency: string;
  sqft?: number;
}

export class ForensicScorer {
  static calculate(
    transactions: PropertyTransaction[],
    target: { price: number; sqft: number; currency: string }
  ): ScoreResult {
    
    // STRICT: Only SOLD data
    const soldData = transactions.filter(t => t.transaction_type === "SOLD");
    
    // INSUFFICIENT DATA path
    if (soldData.length < 3) {
      return {
        score: 0,
        verdict: "INSUFFICIENT_DATA",
        confidence: "LOW",
        variance: 0,
        baseline: 0,
        medianSold: null,
        reasoning: [
          `Only ${soldData.length} sold comparables available.`,
          "Minimum 3 required for reliable market analysis.",
          "Recommend: Expand search radius or wait for more data."
        ]
      };
    }
    
    // Calculate baseline (market median)
    const prices = soldData.map(t => t.price);
    const medianSold = this.calculateMedian(prices);
    const baseline = medianSold;
    
    // Variance calculation
    const variance = ((target.price - baseline) / baseline) * 100;
    
    // Deterministic scoring (no randomness)
    let score: number;
    let verdict: ScoreResult["verdict"];
    
    if (variance <= -30) {
      score = 10;
      verdict = "PRIME_ASSET";
    } else if (variance <= -10) {
      score = 8;
      verdict = "PRIME_ASSET";
    } else if (variance <= 10) {
      score = 7;
      verdict = "STANDARD";
    } else if (variance <= 30) {
      score = 5;
      verdict = "STANDARD";
    } else if (variance <= 50) {
      score = 3;
      verdict = "REJECT";
    } else {
      score = 1;
      verdict = "REJECT";
    }
    
    // Confidence based on data volume
    const confidence = soldData.length >= 10 ? "HIGH" 
      : soldData.length >= 5 ? "MEDIUM" 
      : "LOW";
    
    return {
      score,
      verdict,
      confidence,
      variance: parseFloat(variance.toFixed(1)),
      baseline,
      medianSold,
      reasoning: [
        `Market median sold: ${target.currency} ${medianSold.toLocaleString()}`,
        `Listed price variance: ${variance.toFixed(1)}%`,
        `Based on ${soldData.length} comparable sales`,
        variance > 0 ? "Listed above market median" : "Listed below market median",
        variance <= -20 ? "Potential undervaluation opportunity" : ""
      ].filter(Boolean)
    };
  }
  
  private static calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 
      ? sorted[mid] 
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }
}
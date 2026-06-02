// src/core/engines/ForensicScorer.ts

export interface ScoreResult {
  score: number;
  verdict: "PRIME_ASSET" | "STANDARD" | "REJECT" | "INSUFFICIENT_DATA";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  variance: number; // Represents variance in Price per Sqft
  baseline: number; // Median Market Price per Sqft
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
    
    if (!target.sqft || target.sqft <= 0 || target.price <= 0) {
      throw new Error("Invalid target parameters: price and sqft must be greater than zero.");
    }

    const targetPPSF = target.price / target.sqft;

    // STRICT FILTERING: Only matching currency, transaction type, and valid area data
    const validSoldData = transactions.filter(t => 
      t.transaction_type === "SOLD" && 
      t.currency === target.currency && 
      t.sqft && t.sqft > 0 && t.price > 0
    );
    
    // INSUFFICIENT DATA PATH
    if (validSoldData.length < 3) {
      return {
        score: 0,
        verdict: "INSUFFICIENT_DATA",
        confidence: "LOW",
        variance: 0,
        baseline: 0,
        medianSold: null,
        reasoning: [
          `Only ${validSoldData.length} valid currency-matched sold comparables available.`,
          "Minimum 3 required for reliable mathematical market analysis.",
          "Recommend: Expand search radius or verify dataset currency parameters."
        ]
      };
    }
    
    // Normalize to Price Per Square Foot (PPSF) to ensure accurate baseline comparison
    const ppsfValues = validSoldData.map(t => t.price / (t.sqft as number));
    const medianPPSF = this.calculateMedian(ppsfValues);
    
    if (medianPPSF === 0) {
      throw new Error("Mathematical anomaly: Median market price per square foot resolved to zero.");
    }

    // Variance calculation normalized against market PPSF baseline
    const variance = ((targetPPSF - medianPPSF) / medianPPSF) * 100;
    
    // Deterministic scoring matrix
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
    
    // Confidence based on data density
    const confidence = validSoldData.length >= 10 ? "HIGH" 
      : validSoldData.length >= 5 ? "MEDIUM" 
      : "LOW";
    
    return {
      score,
      verdict,
      confidence,
      variance: parseFloat(variance.toFixed(1)),
      baseline: parseFloat(medianPPSF.toFixed(2)),
      medianSold: parseFloat(medianPPSF.toFixed(2)),
      reasoning: [
        `Market Median: ${target.currency} ${medianPPSF.toFixed(2)} / sqft`,
        `Target Asset: ${target.currency} ${targetPPSF.toFixed(2)} / sqft`,
        `Normalized variance: ${variance.toFixed(1)}%`,
        `Analysis computed across ${validSoldData.length} validated context matches.`,
        variance > 0 ? "Asset listed premium relative to normalized baseline." : "Asset listed discount relative to normalized baseline."
      ]
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
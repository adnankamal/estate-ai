// src/core/engines/RealityCheckProtocol.ts

export interface RealityCheckResult {
  passed: boolean;
  severity: "CRITICAL" | "WARNING" | "INFO";
  issues: string[];
  recommendedAction: "HALT" | "FLAG_REVIEW" | "PROCEED_WITH_CAUTION";
}

interface PropertyTransaction {
  transaction_type: string;
  price: number;
  currency: string;
  sqft?: number;
  location: string;
  source_confidence: string;
}

interface TargetProperty {
  listedPrice: number;
  currency: string;
  location: string;
  sqft: number;
}

export class RealityCheckProtocol {
  static validate(
    transactions: PropertyTransaction[],
    targetProperty: TargetProperty
  ): RealityCheckResult {
    
    const issues: string[] = [];
    let severity: RealityCheckResult["severity"] = "INFO";
    
    // Check 1: Currency Consistency
    const currencies = new Set(transactions.map(t => t.currency));
    if (currencies.size > 1) {
      issues.push(`Multiple currencies: ${Array.from(currencies).join(", ")}. Expected: ${targetProperty.currency}`);
      severity = "CRITICAL";
    }
    
    // Check 2: Data Sufficiency
    const soldTransactions = transactions.filter(t => t.transaction_type === "SOLD");
    if (soldTransactions.length < 3) {
      issues.push(`Only ${soldTransactions.length} sold comparables. Minimum: 3 for reliable median.`);
      if (severity !== "CRITICAL") severity = "WARNING";
    }
    
    // Check 3: Price Variance Sanity
    if (soldTransactions.length > 0) {
      const prices = soldTransactions.map(t => t.price);
      const median = this.calculateMedian(prices);
      const variance = ((targetProperty.listedPrice - median) / median) * 100;
      
      if (Math.abs(variance) > 200) {
        issues.push(`Variance ${variance.toFixed(1)}% exceeds 200% threshold. Verify data accuracy.`);
        severity = "CRITICAL";
      } else if (Math.abs(variance) > 100) {
        issues.push(`Variance ${variance.toFixed(1)}% exceeds 100%. High deviation detected.`);
        if (severity === "INFO") severity = "WARNING";
      }
    }
    
    // Check 4: Sqft Consistency
    const sqftValues = transactions.filter(t => t.sqft).map(t => t.sqft!);
    if (sqftValues.length > 0) {
      const avgSqft = sqftValues.reduce((a, b) => a + b, 0) / sqftValues.length;
      const sqftVariance = Math.abs((targetProperty.sqft - avgSqft) / avgSqft) * 100;
      if (sqftVariance > 50) {
        issues.push(`Sqft variance ${sqftVariance.toFixed(1)}% vs comparables. Verify property size.`);
        if (severity === "INFO") severity = "WARNING";
      }
    }
    
    // Check 5: Location Clustering
    const locations = new Set(transactions.map(t => t.location));
    if (locations.size > 3) {
      issues.push(`Data scattered across ${locations.size} locations. Comparability questionable.`);
      if (severity === "INFO") severity = "WARNING";
    }
    
    // Check 6: Confidence Threshold
    const lowConfidenceCount = transactions.filter(t => t.source_confidence === "LOW").length;
    if (lowConfidenceCount / transactions.length > 0.5) {
      issues.push(`>50% data from low-confidence sources. Verify with additional research.`);
      if (severity === "INFO") severity = "WARNING";
    }
    
    // Determine Action
    let action: RealityCheckResult["recommendedAction"];
    if (severity === "CRITICAL") action = "HALT";
    else if (severity === "WARNING") action = "FLAG_REVIEW";
    else action = "PROCEED_WITH_CAUTION";
    
    return {
      passed: issues.length === 0,
      severity,
      issues,
      recommendedAction: action
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
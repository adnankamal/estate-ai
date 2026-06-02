// MedianValuation.ts
import { TransactionRecord } from "./TransactionScraper";

export interface ValuationResult {
  medianPrice: number;
  meanPrice: number;
  pricePerSqft: number;
  sampleSize: number;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
  priceRange: { low: number; high: number };
}

export function calculateValuation(
  records: TransactionRecord[],
  targetSqft: number,
  targetBeds: number,
  targetBaths: number
): ValuationResult {
  
  if (records.length === 0) {
    return {
      medianPrice: 0,
      meanPrice: 0,
      pricePerSqft: 0,
      sampleSize: 0,
      confidence: "INSUFFICIENT",
      priceRange: { low: 0, high: 0 }
    };
  }

  const prices = records.map((r: any) => r.price || r.soldPrice).sort((a, b) => a - b);
  
  const mid = Math.floor(prices.length / 2);
  const median = prices.length % 2 === 0
    ? (prices[mid - 1] + prices[mid]) / 2
    : prices[mid];
  
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  const p25 = prices[Math.floor(prices.length * 0.25)] || prices[0];
  const p75 = prices[Math.floor(prices.length * 0.75)] || prices[prices.length - 1];
  
  const estimatedSqft = targetSqft || estimateSqft(targetBeds, targetBaths);
  
  const pricePerSqft = median / estimatedSqft;
  
  let confidence: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
  if (records.length >= 10) confidence = "HIGH";
  else if (records.length >= 5) confidence = "MEDIUM";
  else if (records.length >= 2) confidence = "LOW";
  else confidence = "INSUFFICIENT";

  return {
    medianPrice: Math.round(median),
    meanPrice: Math.round(mean),
    pricePerSqft: Math.round(pricePerSqft),
    sampleSize: records.length,
    confidence,
    priceRange: { low: Math.round(p25), high: Math.round(p75) }
  };
}

function estimateSqft(beds: number, baths: number): number {
  return 800 + (beds * 250) + (baths * 150);
}
export interface VarianceInput {
  proposedPrice: string;
  marketRealityPrice: string;
}

export interface VarianceOutput {
  variancePercentage: number;
  riskLevel: "CRITICAL_OVERPAYMENT_ALERT" | "MODERATE_PRICE_VARIANCE" | "OPTIMAL_VALUATION" | "UNDERVALUED_MARKET_ASSET" | "NEUTRAL_TELEMETRY";
}

export function analyzeAssetVariance(input: VarianceInput): VarianceOutput {
  const parseNumericValue = (valueString: string | null | undefined): number => {
    if (!valueString) return 0;
    
    const cleanString = String(valueString).toUpperCase().replace(/[\$,]/g, '').trim();
    let multiplier = 1;
    
    if (cleanString.includes('M')) multiplier = 1000000;
    if (cleanString.includes('CR')) multiplier = 10000000;
    if (cleanString.includes('K')) multiplier = 1000;
    
    const numericMatch = cleanString.match(/\d+(\.\d+)?/);
    if (!numericMatch) return 0;
    
    const numericRaw = parseFloat(numericMatch[0]);
    return isNaN(numericRaw) ? 0 : numericRaw * multiplier;
  };

  const userPrice = parseNumericValue(input.proposedPrice);
  const realPrice = parseNumericValue(input.marketRealityPrice);

  if (userPrice <= 0 || realPrice <= 0) {
    return { variancePercentage: 0, riskLevel: "NEUTRAL_TELEMETRY" };
  }
  
  const variance = ((realPrice - userPrice) / realPrice) * 100;
  const roundedVariance = Math.round(variance * 100) / 100;
  
  let riskLevel: VarianceOutput["riskLevel"] = "OPTIMAL_VALUATION";
  if (roundedVariance <= -50) riskLevel = "CRITICAL_OVERPAYMENT_ALERT";
  else if (roundedVariance <= -20) riskLevel = "MODERATE_PRICE_VARIANCE";
  else if (roundedVariance >= 30) riskLevel = "UNDERVALUED_MARKET_ASSET";

  return { variancePercentage: roundedVariance, riskLevel };
}
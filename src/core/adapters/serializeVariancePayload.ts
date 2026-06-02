import { analyzeAssetVariance, VarianceInput, VarianceOutput } from "../use-cases/analyzeAssetVariance";

export interface AuditRequestPayload {
  investmentValuation: string;
  marketRealityBaseline?: string;
}

export interface StandardizedAuditResponse {
  success: boolean;
  varianceRatio: string;
  riskStatus: string;
  timestamp: string;
}

export function serializeVariancePayload(payload: AuditRequestPayload): StandardizedAuditResponse {
  const defaultBaseline = "$234,813";
  
  const domainInput: VarianceInput = {
    proposedPrice: payload.investmentValuation || "0",
    marketRealityPrice: payload.marketRealityBaseline || defaultBaseline
  };

  const domainResult: VarianceOutput = analyzeAssetVariance(domainInput);

  return {
    success: domainResult.riskLevel !== "NEUTRAL_TELEMETRY",
    varianceRatio: `${domainResult.variancePercentage}%`,
    riskStatus: domainResult.riskLevel,
    timestamp: new Date().toISOString()
  };
}
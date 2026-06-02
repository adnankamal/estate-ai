import { APAC_GEO_REGISTRY } from "./asia-pacific";
import { EUROPE_GEO_REGISTRY } from "./europe";
import { AMERICAS_GEO_REGISTRY } from "./americas";
import { ME_AFRICA_GEO_REGISTRY } from "./me-africa";

export interface GeoCountryContext {
  countryName: string;
  standardCurrency: string;
  currencySymbol: string;
  defaultPricePerSqftUSD: number;
  averageResidentialYield: number;
  validationRegexString: string;
  marketVolatilityIndex: "LOW" | "MEDIUM" | "HIGH";
}

// Global Aggregation Chamber for all 195+ targeted jurisdictions
const GLOBAL_REGISTRY: Record<string, GeoCountryContext> = {
  ...APAC_GEO_REGISTRY,
  ...EUROPE_GEO_REGISTRY,
  ...AMERICAS_GEO_REGISTRY,
  ...ME_AFRICA_GEO_REGISTRY,
};

/**
 * Parses raw context string and extracts targeted geographic metadata
 */
export function detectCountry(location: string): GeoCountryContext {
  if (!location) return GLOBAL_REGISTRY["IN"];
  const locUpper = location.toUpperCase();

  for (const [code, context] of Object.entries(GLOBAL_REGISTRY)) {
    if (
      locUpper.includes(code) || 
      locUpper.includes(context.countryName.toUpperCase())
    ) {
      return context;
    }
  }
  return GLOBAL_REGISTRY["IN"]; // Fallback pattern to baseline node
}

/**
 * Standardizes regional multi-currency values to USD metrics
 */
export function convertToUSD(amount: number, currency: string): number {
  const rates: Record<string, number> = {
    USD: 1.0,
    INR: 0.012,
    EUR: 1.08,
    GBP: 1.27,
    CAD: 0.73,
    BRL: 0.19,
    AED: 0.27,
    SAR: 0.27,
  };
  return amount * (rates[currency.toUpperCase()] || 1.0);
}

/**
 * Formats clean currency outputs for frontend presentation layers
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
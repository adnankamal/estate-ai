import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// ─── INPUT SCHEMA ───
const FutureAuditSchema = z.object({
  location: z.string().min(2),
  propertyType: z.string().min(2),
  price: z.string().min(1),
  beds: z.number().optional(),
  baths: z.number().optional(),
  constructionYear: z.number().optional(), // 2010, 2020 etc
  holdPeriodYears: z.number().default(20), // How long they plan to hold
});

// ─── CLIMATE RISK DATABASE (2026-2046 projections) ───
const CLIMATE_RISK_DB: Record<string, {
  floodRiskByYear: Record<number, number>; // Year -> Risk score 0-100
  heatStressByYear: Record<number, number>;
  insuranceExitYear: number; // When major insurers pull out
  uninsurableYear: number; // When property becomes uninsurable
}> = {
  "miami": {
    floodRiskByYear: { 2026: 45, 2030: 62, 2035: 78, 2040: 91, 2046: 97 },
    heatStressByYear: { 2026: 30, 2030: 45, 2035: 60, 2040: 75, 2046: 88 },
    insuranceExitYear: 2032,
    uninsurableYear: 2038,
  },
  "dubai": {
    floodRiskByYear: { 2026: 15, 2030: 22, 2035: 35, 2040: 48, 2046: 60 },
    heatStressByYear: { 2026: 55, 2030: 68, 2035: 80, 2040: 90, 2046: 95 },
    insuranceExitYear: 2040,
    uninsurableYear: 2048, // Beyond our window, but heat makes it unlivable
  },
  "mumbai": {
    floodRiskByYear: { 2026: 50, 2030: 65, 2035: 78, 2040: 88, 2046: 95 },
    heatStressByYear: { 2026: 40, 2030: 55, 2035: 70, 2040: 82, 2046: 92 },
    insuranceExitYear: 2030,
    uninsurableYear: 2035,
  },
  "delhi": {
    floodRiskByYear: { 2026: 25, 2030: 35, 2035: 45, 2040: 58, 2046: 70 },
    heatStressByYear: { 2026: 60, 2030: 75, 2035: 88, 2040: 95, 2046: 98 },
    insuranceExitYear: 2035,
    uninsurableYear: 2042,
  },
  "palm jumeirah": {
    floodRiskByYear: { 2026: 20, 2030: 30, 2035: 42, 2040: 55, 2046: 68 },
    heatStressByYear: { 2026: 50, 2030: 65, 2035: 78, 2040: 88, 2046: 95 },
    insuranceExitYear: 2038,
    uninsurableYear: 2045,
  },
  "default": {
    floodRiskByYear: { 2026: 30, 2030: 40, 2035: 52, 2040: 65, 2046: 78 },
    heatStressByYear: { 2026: 35, 2030: 48, 2035: 62, 2040: 75, 2046: 85 },
    insuranceExitYear: 2035,
    uninsurableYear: 2042,
  },
};

// ─── DEMOGRAPHIC DEATH CLOCK ───
const DEMOGRAPHIC_DB: Record<string, {
  workingAgePeakYear: number;
  workingAgeDeclineRate: number; // % per year after peak
  ghostCityThresholdYear: number; // When population drops 30% from peak
  rentalDemandCollapseYear: number;
}> = {
  "tokyo": { workingAgePeakYear: 2020, workingAgeDeclineRate: 1.2, ghostCityThresholdYear: 2045, rentalDemandCollapseYear: 2040 },
  "osaka": { workingAgePeakYear: 2015, workingAgeDeclineRate: 1.8, ghostCityThresholdYear: 2035, rentalDemandCollapseYear: 2030 },
  "shanghai": { workingAgePeakYear: 2028, workingAgeDeclineRate: 2.1, ghostCityThresholdYear: 2048, rentalDemandCollapseYear: 2045 },
  "delhi": { workingAgePeakYear: 2045, workingAgeDeclineRate: 0.8, ghostCityThresholdYear: 2070, rentalDemandCollapseYear: 2065 },
  "dubai": { workingAgePeakYear: 2040, workingAgeDeclineRate: 1.5, ghostCityThresholdYear: 2060, rentalDemandCollapseYear: 2055 },
  "mumbai": { workingAgePeakYear: 2035, workingAgeDeclineRate: 1.2, ghostCityThresholdYear: 2055, rentalDemandCollapseYear: 2050 },
  "default": { workingAgePeakYear: 2035, workingAgeDeclineRate: 1.0, ghostCityThresholdYear: 2050, rentalDemandCollapseYear: 2045 },
};

// ─── STRANDED ASSET REGULATIONS ───
const REGULATORY_DB: Record<string, {
  netZeroDeadline: number; // Year
  retrofitCostPerSqft: number; // Local currency
  penaltyNonCompliance: number; // % of property value per year
  mandatoryEnergyRating: string; // Required by year
  banYear: number; // When non-compliant buildings banned from transactions
}> = {
  "dubai": { netZeroDeadline: 2050, retrofitCostPerSqft: 800, penaltyNonCompliance: 2, mandatoryEnergyRating: "2028", banYear: 2035 },
  "uae": { netZeroDeadline: 2050, retrofitCostPerSqft: 800, penaltyNonCompliance: 2, mandatoryEnergyRating: "2028", banYear: 2035 },
  "india": { netZeroDeadline: 2070, retrofitCostPerSqft: 2500, penaltyNonCompliance: 1, mandatoryEnergyRating: "2030", banYear: 2040 },
  "delhi": { netZeroDeadline: 2070, retrofitCostPerSqft: 2500, penaltyNonCompliance: 1, mandatoryEnergyRating: "2030", banYear: 2040 },
  "mumbai": { netZeroDeadline: 2070, retrofitCostPerSqft: 3000, penaltyNonCompliance: 1.5, mandatoryEnergyRating: "2030", banYear: 2040 },
  "uk": { netZeroDeadline: 2050, retrofitCostPerSqft: 150, penaltyNonCompliance: 3, mandatoryEnergyRating: "2027", banYear: 2033 },
  "usa": { netZeroDeadline: 2050, retrofitCostPerSqft: 120, penaltyNonCompliance: 2.5, mandatoryEnergyRating: "2028", banYear: 2035 },
  "default": { netZeroDeadline: 2050, retrofitCostPerSqft: 500, penaltyNonCompliance: 2, mandatoryEnergyRating: "2030", banYear: 2040 },
};

// ─── HELPERS ───
function normalizeLocation(input: string): string {
  const loc = input.toLowerCase().trim();
  if (loc.includes("dubai") || loc.includes("palm") || loc.includes("jumeirah") || loc.includes("marina")) return "dubai";
  if (loc.includes("mumbai") || loc.includes("bandra") || loc.includes("andheri")) return "mumbai";
  if (loc.includes("delhi") || loc.includes("gurgaon") || loc.includes("noida") || loc.includes("rohini")) return "delhi";
  if (loc.includes("tokyo") || loc.includes("osaka") || loc.includes("yokohama")) return loc.includes("osaka") ? "osaka" : "tokyo";
  if (loc.includes("shanghai") || loc.includes("beijing") || loc.includes("shenzhen")) return "shanghai";
  if (loc.includes("miami") || loc.includes("florida")) return "miami";
  if (loc.includes("london") || loc.includes("manchester") || loc.includes("birmingham")) return "uk";
  if (loc.includes("new york") || loc.includes("california") || loc.includes("texas")) return "usa";
  return "default";
}

function interpolateRisk(riskByYear: Record<number, number>, targetYear: number): number {
  const years = Object.keys(riskByYear).map(Number).sort((a, b) => a - b);
  if (targetYear <= years[0]) return riskByYear[years[0]];
  if (targetYear >= years[years.length - 1]) return riskByYear[years[years.length - 1]];
  
  for (let i = 0; i < years.length - 1; i++) {
    if (targetYear >= years[i] && targetYear <= years[i + 1]) {
      const t = (targetYear - years[i]) / (years[i + 1] - years[i]);
      return riskByYear[years[i]] + t * (riskByYear[years[i + 1]] - riskByYear[years[i]]);
    }
  }
  return riskByYear[years[years.length - 1]];
}

function calculateSquareFootage(propertyType: string, beds?: number, baths?: number): number {
  const type = propertyType.toLowerCase();
  if (type.includes("studio")) return 600;
  if (type.includes("apartment") || type.includes("flat") || type.includes("condo")) return 1000;
  if (type.includes("townhouse")) return 2500;
  if (type.includes("villa") || type.includes("mansion")) return 4000;
  if (type.includes("commercial") || type.includes("office")) return 3000;
  return 2000; // Default
}

// ─── MAIN ENGINE ───
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = FutureAuditSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_FUTURE_AUDIT_PAYLOAD", details: parsed.error.flatten() }, { status: 400 });
    }

    const { location, propertyType, price, beds, baths, constructionYear, holdPeriodYears } = parsed.data;

    const normalizedLoc = normalizeLocation(location);
    const climate = CLIMATE_RISK_DB[normalizedLoc] || CLIMATE_RISK_DB.default;
    const demographic = DEMOGRAPHIC_DB[normalizedLoc] || DEMOGRAPHIC_DB.default;
    const regulatory = REGULATORY_DB[normalizedLoc] || REGULATORY_DB.default;

    const targetYear = new Date().getFullYear() + holdPeriodYears;
    const currentYear = new Date().getFullYear();

    // ─── CLIMATE CALCULATIONS ───
    const floodRiskAtExit = interpolateRisk(climate.floodRiskByYear, targetYear);
    const heatStressAtExit = interpolateRisk(climate.heatStressByYear, targetYear);
    const yearsUntilUninsurable = climate.uninsurableYear - currentYear;
    const uninsurableDuringHold = targetYear >= climate.uninsurableYear;

    // ─── DEMOGRAPHIC CALCULATIONS ───
    const yearsUntilGhostCity = demographic.ghostCityThresholdYear - currentYear;
    const ghostCityDuringHold = targetYear >= demographic.ghostCityThresholdYear;
    const rentalCollapseDuringHold = targetYear >= demographic.rentalDemandCollapseYear;

    // ─── STRANDED ASSET CALCULATIONS ───
    const sqft = calculateSquareFootage(propertyType, beds, baths);
    const retrofitCostTotal = sqft * regulatory.retrofitCostPerSqft;
    const yearsUntilBan = regulatory.banYear - currentYear;
    const bannedDuringHold = targetYear >= regulatory.banYear;
    const annualPenalty = (regulatory.penaltyNonCompliance / 100) * parseFloat(price.replace(/[^0-9.]/g, "")) || 0;

    // ─── COMPOSITE FUTURE SCORE (0-10) ───
    // 10 = Perfect future, 0 = Catastrophic
    let futureScore = 10;

    // Climate penalty
    if (uninsurableDuringHold) futureScore -= 4;
    else if (floodRiskAtExit > 70) futureScore -= 2.5;
    else if (floodRiskAtExit > 50) futureScore -= 1.5;
    else if (floodRiskAtExit > 30) futureScore -= 0.5;

    if (heatStressAtExit > 80) futureScore -= 2;
    else if (heatStressAtExit > 60) futureScore -= 1;

    // Demographic penalty
    if (ghostCityDuringHold) futureScore -= 3;
    else if (rentalCollapseDuringHold) futureScore -= 1.5;

    // Regulatory penalty
    if (bannedDuringHold) futureScore -= 3;
    else if (yearsUntilBan < 10) futureScore -= 1.5;

    // Construction age penalty (older = more retrofit cost)
    if (constructionYear) {
      const buildingAge = currentYear - constructionYear;
      if (buildingAge > 30) futureScore -= 1; // Needs major retrofit soon
      if (buildingAge > 50) futureScore -= 1.5; // Near end of life
    }

    futureScore = Math.max(0, Math.min(10, Math.round(futureScore * 10) / 10));

    // ─── VERDICT ───
    let futureVerdict = "HOLD";
    let futureVerdictColor = "#FFB800";

    if (futureScore >= 8) {
      futureVerdict = "LEGACY_ASSET";
      futureVerdictColor = "#00C853";
    } else if (futureScore >= 6) {
      futureVerdict = "CONDITIONAL_HOLD";
      futureVerdictColor = "#FFB800";
    } else if (futureScore >= 4) {
      futureVerdict = "EXIT_BY_2035";
      futureVerdictColor = "#FF6B00";
    } else if (futureScore >= 2) {
      futureVerdict = "TOXIC_ASSET";
      futureVerdictColor = "#FF2200";
    } else {
      futureVerdict = "CLIMATE_BURIAL";
      futureVerdictColor = "#8B0000";
    }

    // ─── RESPONSE ───
    return NextResponse.json({
      currentYear,
      targetYear,
      holdPeriodYears,
      
      // Climate Layer
      climateRisk: {
        currentFloodRisk: interpolateRisk(climate.floodRiskByYear, currentYear),
        exitFloodRisk: floodRiskAtExit,
        currentHeatStress: interpolateRisk(climate.heatStressByYear, currentYear),
        exitHeatStress: heatStressAtExit,
        insuranceExitYear: climate.insuranceExitYear,
        uninsurableYear: climate.uninsurableYear,
        uninsurableDuringHold,
        yearsUntilUninsurable: Math.max(0, yearsUntilUninsurable),
      },

      // Demographic Layer
      demographicRisk: {
        workingAgePeakYear: demographic.workingAgePeakYear,
        ghostCityThresholdYear: demographic.ghostCityThresholdYear,
        rentalDemandCollapseYear: demographic.rentalDemandCollapseYear,
        ghostCityDuringHold,
        rentalCollapseDuringHold,
        yearsUntilGhostCity: Math.max(0, yearsUntilGhostCity),
      },

      // Regulatory Layer
      regulatoryRisk: {
        netZeroDeadline: regulatory.netZeroDeadline,
        mandatoryEnergyRatingBy: regulatory.mandatoryEnergyRating,
        banYear: regulatory.banYear,
        bannedDuringHold,
        yearsUntilBan: Math.max(0, yearsUntilBan),
        retrofitCostTotal,
        annualPenaltyIfNonCompliant: annualPenalty,
        buildingSqft: sqft,
      },

      // Composite
      futureScore,
      futureVerdict,
      futureVerdictColor,
      
      // Actionable Intelligence
      recommendation: generateRecommendation(futureScore, uninsurableDuringHold, ghostCityDuringHold, bannedDuringHold, yearsUntilUninsurable, yearsUntilGhostCity, yearsUntilBan),
      
      // Risk Timeline
      criticalEvents: generateCriticalEvents(climate, demographic, regulatory, currentYear, targetYear),
    });

  } catch (error: any) {
    console.error("FUTURE_AUDIT_CRITICAL_ERROR:", error);
    return NextResponse.json({ error: "FUTURE_AUDIT_INTERNAL_ERROR", diagnostics: error.message }, { status: 500 });
  }
}

// ─── HELPERS ───
function generateRecommendation(
  score: number,
  uninsurable: boolean,
  ghostCity: boolean,
  banned: boolean,
  yearsUntilUninsurable: number,
  yearsUntilGhostCity: number,
  yearsUntilBan: number
): string {
  const parts: string[] = [];
  
  if (score >= 8) {
    parts.push("This asset is structurally positioned for multi-generational wealth preservation. Climate, demographic, and regulatory trajectories align favorably.");
  } else if (score >= 6) {
    parts.push("Conditional hold. Monitor regulatory deadlines and insurance market exits. Consider exit before 2035 if any single risk escalates.");
  } else if (score >= 4) {
    parts.push("EXIT MANDATE. This asset will face significant headwinds within your hold period. Liquidate before 2035 to preserve capital.");
  } else if (score >= 2) {
    parts.push("TOXIC ASSET DECLARATION. Multiple existential risks converge during hold period. Immediate divestment recommended. Buyer pool will evaporate.");
  } else {
    parts.push("CLIMATE BURIAL ASSET. This property will become uninsurable, unrentable, and potentially unsellable. Zero salvage value projected. Abandon.");
  }

  if (uninsurable) parts.push(`CRITICAL: Property becomes uninsurable in ${yearsUntilUninsurable} years. Mortgage financing impossible thereafter.`);
  if (ghostCity) parts.push(`CRITICAL: Demographic collapse renders rental market non-viable in ${yearsUntilGhostCity} years.`);
  if (banned) parts.push(`CRITICAL: Regulatory ban on transactions effective in ${yearsUntilBan} years. Asset becomes legally frozen.`);

  return parts.join("\n\n");
}

function generateCriticalEvents(
  climate: any,
  demographic: any,
  regulatory: any,
  currentYear: number,
  targetYear: number
): Array<{ year: number; event: string; severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }> {
  const events: Array<{ year: number; event: string; severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }> = [];

  // Insurance exit
  if (climate.insuranceExitYear >= currentYear && climate.insuranceExitYear <= targetYear) {
    events.push({ year: climate.insuranceExitYear, event: "Major insurers exit market. Premiums spike 300-500%.", severity: "HIGH" });
  }

  // Uninsurable
  if (climate.uninsurableYear >= currentYear && climate.uninsurableYear <= targetYear) {
    events.push({ year: climate.uninsurableYear, event: "Property becomes uninsurable. Mortgage financing impossible.", severity: "CRITICAL" });
  }

  // Rental collapse
  if (demographic.rentalDemandCollapseYear >= currentYear && demographic.rentalDemandCollapseYear <= targetYear) {
    events.push({ year: demographic.rentalDemandCollapseYear, event: "Rental demand collapses below operating cost threshold.", severity: "CRITICAL" });
  }

  // Ghost city
  if (demographic.ghostCityThresholdYear >= currentYear && demographic.ghostCityThresholdYear <= targetYear) {
    events.push({ year: demographic.ghostCityThresholdYear, event: "Demographic death spiral. Population 30% below peak. Infrastructure decay accelerates.", severity: "CRITICAL" });
  }

  // Regulatory ban
  if (regulatory.banYear >= currentYear && regulatory.banYear <= targetYear) {
    events.push({ year: regulatory.banYear, event: "Non-compliant buildings banned from sale/lease. Asset legally frozen.", severity: "CRITICAL" });
  }

  // Net zero deadline
  if (regulatory.netZeroDeadline >= currentYear && regulatory.netZeroDeadline <= targetYear) {
    events.push({ year: regulatory.netZeroDeadline, event: "Net-zero compliance mandatory. Retrofit or demolition required.", severity: "HIGH" });
  }

  return events.sort((a, b) => a.year - b.year);
}
import { NextResponse } from "next/server";
import { z } from "zod";
import { TransactionRecord } from "@/src/core/engines/TransactionScraper";
import { serializeVariancePayload } from "@/src/core/adapters/serializeVariancePayload";
import { supabase } from "@/lib/supabaseClient";
import { generateAuditHash } from "@/src/core/intelligence/AuditHasher";
import { scrapeSoldPrices } from "@/src/core/engines/TransactionScraper";
import { calculateValuation } from "@/src/core/engines/MedianValuation";
import * as VerdictEngine from "@/src/core/engines/VerdictEngine";
// DATA ORIGIN TYPE
export const dynamic = "force-dynamic";

export interface DataOrigin {
  source: "LOCAL_REGISTRY" | "HYBRID_WEB_SCRAPE" | "AI_ESTIMATE" | "DEMO_MODE" | "INSUFFICIENT";
  confidence: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  sourcesCount: number;
  lastUpdated: string;
  isDemoMode: boolean;
  fallbackReason?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY DETECTION
// ─────────────────────────────────────────────────────────────────────────────

function detectCurrency(location: string, price: string): string {
  const pr = price.toUpperCase().trim();
  
  if (pr.startsWith("AED") || pr.includes(" AED")) return "AED";
  if (pr.startsWith("₹") || pr.includes("INR") || pr.startsWith("RS")) return "INR";
  if (pr.startsWith("$") || pr.includes("USD")) return "USD";
  if (pr.startsWith("£") || pr.includes("GBP")) return "GBP";
  if (pr.startsWith("€") || pr.includes("EUR")) return "EUR";
  
  const loc = location.toLowerCase();
  if (loc.includes("DUBAI") || loc.includes("UAE") || loc.includes("ABUDHABI") || 
      loc.includes("SHARJAH") || loc.includes("PALM") || loc.includes("JEBEL ALI") || 
      loc.includes("EMIRATES HILLS") || loc.includes("JUMEIRAH") || 
      loc.includes("DOWNTOWN DUBAI") || loc.includes("MARINA")) return "AED";
  
  if (loc.includes("INDIA") || loc.includes("MUMBAI") || loc.includes("DELHI") || 
      loc.includes("BANGALORE") || loc.includes("PUNE") || loc.includes("HYDERABAD") || 
      loc.includes("CHENNAI") || loc.includes("GURGAON") || loc.includes("NOIDA")) return "INR";
  
  if (loc.includes("USA") || loc.includes("AMERICA") || loc.includes("NEW YORK") || 
      loc.includes("CALIFORNIA") || loc.includes("TEXAS") || loc.includes("FLORIDA") || 
      loc.includes("LOS ANGELES") || loc.includes("CHICAGO")) return "USD";
  
  if (loc.includes("UK") || loc.includes("LONDON") || loc.includes("MANCHESTER") || 
      loc.includes("BIRMINGHAM") || loc.includes("EDINBURGH")) return "GBP";
  
  if (loc.includes("EUROPE") || loc.includes("GERMANY") || loc.includes("FRANCE") || 
      loc.includes("SPAIN") || loc.includes("ITALY") || loc.includes("NETHERLANDS")) return "EUR";
  
  return "USD";
}

function formatCurrency(amount: number, currency: string): string {
  switch (currency) {
    case "AED": return `AED ${amount.toLocaleString("en-US")}`;
    case "USD": return `$${amount.toLocaleString("en-US")}`;
    case "INR": return `₹${amount.toLocaleString("en-IN")}`;
    case "GBP": return `£${amount.toLocaleString("en-GB")}`;
    case "EUR": return `€${amount.toLocaleString("de-DE")}`;
    default: return `${currency} ${amount.toLocaleString()}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMITER
// ─────────────────────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const RATE_LIMITS = new Map<string, RateLimitEntry>();
const MAX_REQUESTS_PER_MINUTE = 10;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = RATE_LIMITS.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    RATE_LIMITS.set(identifier, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1, resetIn: RATE_WINDOW_MS };
  }
  
  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }
  
  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - entry.count, resetIn: entry.resetTime - now };
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART SQUARE FOOTAGE ESTIMATOR
// ─────────────────────────────────────────────────────────────────────────────

function estimateSquareFootage(propertyType: string, beds: number = 3, baths: number = 2, location: string = ""): number {
  const type = propertyType.toLowerCase();
  const loc = location.toLowerCase();
  
  const isLuxuryLocation = loc.includes("palm") || loc.includes("jebel ali") || 
                           loc.includes("emirates hills") || loc.includes("downtown dubai") ||
                           loc.includes("jumeirah") || loc.includes("district one") ||
                           loc.includes("tilal al ghaf");
  
  let base = 2000;
  if (type.includes('apartment') || type.includes('condo') || type.includes('flat')) base = 1000;
  else if (type.includes('villa') || type.includes('mansion')) {
    base = isLuxuryLocation ? 6000 : 4000;
  } else if (type.includes('townhouse')) {
    base = isLuxuryLocation ? 3500 : 2500;
  } else if (type.includes('commercial') || type.includes('office') || type.includes('retail')) base = 3000;
  else if (type.includes('studio')) base = 600;
  else if (type.includes('penthouse')) base = isLuxuryLocation ? 5000 : 3000;
  
  const bedFactor = Math.max(0, beds - 2) * 400;
  const bathFactor = Math.max(0, baths - 2) * 250;
  
  return Math.round(base + bedFactor + bathFactor);
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE & RESILIENCE
// ─────────────────────────────────────────────────────────────────────────────

const REAL_ESTATE_MUTATION_CACHE = new Map<string, { baselinePrice: string; yieldValue: number; timestamp: number }>();
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface BreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxCalls: number;
}

class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failures = 0;
  private lastFailureTime = 0;
  private halfOpenCalls = 0;
  private config: BreakerConfig;

  constructor(config: BreakerConfig = { failureThreshold: 5, resetTimeoutMs: 30000, halfOpenMaxCalls: 2 }) {
    this.config = config;
  }

  async execute<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeoutMs) {
        this.state = "HALF_OPEN";
        this.halfOpenCalls = 0;
      } else {
        return fallback;
      }
    }

    if (this.state === "HALF_OPEN" && this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
      return fallback;
    }

    if (this.state === "HALF_OPEN") {
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch {
      this.onFailure();
      return fallback;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.config.failureThreshold) {
      this.state = "OPEN";
    }
  }

  getState() {
    return this.state;
  }
}

const serperBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 60000, halfOpenMaxCalls: 2 });
const groqBreaker = new CircuitBreaker({ failureThreshold: 5, resetTimeoutMs: 30000, halfOpenMaxCalls: 2 });

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

const pendingMap = new Map<string, PendingRequest<any>>();
const COALESCE_WINDOW_MS = 5000;

async function coalescedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  fallback: T
): Promise<T> {
  const existing = pendingMap.get(key);
  
  if (existing && Date.now() - existing.timestamp < COALESCE_WINDOW_MS) {
    return existing.promise as Promise<T>;
  }

  const promise = fetchFn().catch(() => fallback).finally(() => {
    setTimeout(() => pendingMap.delete(key), COALESCE_WINDOW_MS);
  });

  pendingMap.set(key, { promise, timestamp: Date.now() });
  return promise;
}

// ─────────────────────────────────────────────────────────────────────────────
// ZOD SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const AuditRequestSchema = z.object({
  payload: z.object({
    propertyType: z.string().default("Unknown Property"),
    price: z.string().default("0"),
    location: z.string().default("Unknown Location"),
    userId: z.string().nullable().default(null),
    type: z.string().default("HISTORY"),
    message: z.string().optional().default(""),
    forceLeadGeneration: z.boolean().optional().default(false),
    beds: z.number().optional().default(3),
    baths: z.number().optional().default(2)
  })
});

const LLMResponseSchema = z.object({
  summarySequence: z.string(),
  extractedBaselineNumerical: z.number(),
  extractedSquareFootage: z.number().default(2000),
  riskAnalysisText: z.string(),
  sentimentNode: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"])
});

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function cleanNumericValue(input: string): number {
  if (!input) return 0;
  
  const lowerInput = String(input).toLowerCase().trim();
  
  let cleaned = lowerInput
    .replace(/aed|usd|inr|gbp|eur|\$|₹|£|€/gi, "")
    .replace(/,/g, "")
    .trim();
  
  let multiplier = 1;
  if (cleaned.includes('cr') || cleaned.includes('crore')) {
    multiplier = 10000000;
    cleaned = cleaned.replace(/cr|crore/g, "");
  } else if (cleaned.includes('lakh') || cleaned.includes('lac')) {
    multiplier = 100000;
    cleaned = cleaned.replace(/lakh|lac/g, "");
  } else if (cleaned.includes('m') && cleaned.match(/\d+\.?\d*\s*m/)) {
    multiplier = 1000000;
    cleaned = cleaned.replace(/m/g, "");
  } else if (cleaned.includes('k') && cleaned.match(/\d+\.?\d*\s*k/)) {
    multiplier = 1000;
    cleaned = cleaned.replace(/k/g, "");
  }
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed * multiplier;
}

function getFinancialMetricLabel(propertyType: string): string {
  const type = propertyType.toLowerCase();
  if (type.includes('hotel') || type.includes('resort') || type.includes('hospitality') || type.includes('motel')) {
    return "Hospitality Edge";
  }
  if (type.includes('commercial') || type.includes('office') || type.includes('retail') || type.includes('industrial') || type.includes('warehouse')) {
    return "Cap Rate";
  }
  if (type.includes('airbnb') || type.includes('vacation') || type.includes('short-term') || type.includes('holiday')) {
    return "Short-term Rental Yield";
  }
  return "Rental Yield";
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPTS
// ─────────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(rawType: string, searchContext: string): string {
  const baseInstructions = `CRITICAL OPERATIONAL DIRECTIVES:
1. Output ONLY valid, raw JSON. Do NOT wrap output in markdown code blocks.
2. Extract the baseline market capital value per square foot or baseline unit cost strictly as an absolute integer under 'extractedBaselineNumerical'.
3. Extract the total property square footage as 'extractedSquareFootage'. If unknown, estimate based on property type: Single Family Residence ~2000 sqft, Apartment ~1000 sqft, Villa ~4000 sqft, Commercial ~3000 sqft.
4. The 'summarySequence' and 'riskAnalysisText' fields must be highly descriptive, professional real estate evaluations comprised of at least 5 structured sentences.
5. Set 'sentimentNode' strictly to one of these uppercase strings: "POSITIVE", "NEUTRAL", or "NEGATIVE".
6. You must declare a distinct structural stance matching the execution parameter mode.
7. The financial metric context must match the property type: Hospitality Edge for hotels/resorts, Rental Yield for residential, Cap Rate for commercial, Short-term Rental Yield for vacation rentals.

JSON Structure Requirements:
{
  "summarySequence": "string",
  "extractedBaselineNumerical": "number",
  "extractedSquareFootage": "number",
  "riskAnalysisText": "string",
  "sentimentNode": "string"
}

LIVE BENCHMARK CONTEXT:
${searchContext.trim()}`;

  if (rawType === "REALITY_CHECK") {
    return `You are a RUTHLESS, HOSTILE real estate forensic auditor executing a REALITY_CHECK sequence. Your mandate is to DESTROY optimism, EXPOSE every vulnerability, and deliver a BRUTAL assessment that saves investors from financial ruin.

MANDATORY DIRECTIVES:
1. Output ONLY valid, raw JSON. No markdown.
2. Extract baseline per sqft as 'extractedBaselineNumerical'.
3. Extract sqft as 'extractedSquareFootage'.
4. 'summarySequence' and 'riskAnalysisText' MUST be AGGRESSIVE, UNCOMPROMISING risk analyses. EVERY sentence must identify a SPECIFIC risk, flaw, or danger. Assume WORST-CASE scenario.
5. 'sentimentNode' is MANDATORILY "NEGATIVE" for REALITY_CHECK. NO exceptions. If property is perfect (impossible), use "NEUTRAL". NEVER "POSITIVE".
6. Adopt a HOSTILE, SKEPTICAL, PARANOID stance. Question EVERY assumption. Distrust ALL data.

JSON Structure Requirements:
{
  "summarySequence": "string",
  "extractedBaselineNumerical": "number",
  "extractedSquareFootage": "number",
  "riskAnalysisText": "string",
  "sentimentNode": "string"
}

LIVE BENCHMARK CONTEXT:
${searchContext.trim()}`;
  }

  return `You are a core information extraction and linguistic layer. Your single mandate is to process raw text context and return structured validation metadata. You are strictly forbidden from calculating metrics, scores, or ratios.

${baseInstructions}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTERNAL API CALLS
// ─────────────────────────────────────────────────────────────────────────────

async function fetchSerperContext(propertyType: string, location: string): Promise<string> {
  return serperBreaker.execute(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: `average real estate price per sqft ${propertyType} in ${location} market context benchmarks valuation records`,
        num: 4
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!res.ok) throw new Error("SERPER_FAIL");
    const data = await res.json();
    return data.organic?.map((r: { snippet: string }) => r.snippet).join("\n") || "";
  }, "");
}

interface GroqResult {
  baseMarketBaseline: number;
  extractedSquareFootage: number;
  aiSummary: string;
  aiRiskText: string;
  marketSentimentNode: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
}

async function fetchGroqAnalysis(
  systemPrompt: string,
  userContent: string
): Promise<GroqResult> {
  
  return groqBreaker.execute(async () => {
    // ─── FREELLMAPI ROUTING INJECTION ───
    const baseUrl = process.env.NEXT_PUBLIC_FREELLM_BASE_URL || "http://localhost:3001/v1";
    const apiKey = process.env.FREELLM_API_KEY;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // Groq endpoint ko badal kar FreeLLMAPI local endpoint kiya
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "auto", // FreeLLMAPI automatically isko tumhari Kimi key par route karega
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        temperature: 0.0,
        response_format: { type: "json_object" },
        seed: 42,
        max_tokens: 1200,
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    if (!res.ok) throw new Error("FREELLM_GATEWAY_FAIL");

    const data = await res.json();
    const rawParsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    const validated = LLMResponseSchema.safeParse(rawParsed);

    if (!validated.success) throw new Error("VALIDATION_FAIL");

    return {
      baseMarketBaseline: Number(validated.data.extractedBaselineNumerical) || 10000,
      extractedSquareFootage: Number(validated.data.extractedSquareFootage) || 2000,
      aiSummary: validated.data.summarySequence,
      aiRiskText: validated.data.riskAnalysisText,
      marketSentimentNode: validated.data.sentimentNode
    };
  }, {
    baseMarketBaseline: 12000,
    extractedSquareFootage: 2000,
    aiSummary: "Automated structural fallback tracking routine executed due to engine uplink constraints.",
    aiRiskText: "Standard risk parameters applied automatically via fallback pipeline metrics.",
    marketSentimentNode: "NEUTRAL"
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ROUTE HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // ─── RATE LIMIT CHECK ───
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(clientIp);
    
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        error: "RATE_LIMIT_EXCEEDED", 
        message: `Too many requests. Try again in ${Math.ceil(rateLimit.resetIn / 1000)}s.`,
        resetIn: rateLimit.resetIn 
      }, { status: 429 });
    }

    const rawBody = await req.json();
    const parsedData = AuditRequestSchema.safeParse(rawBody);
    
    if (!parsedData.success) {
      return NextResponse.json({ error: "INVALID_REQUEST_PAYLOAD" }, { status: 400 });
    }

    const { propertyType, price, location, userId, type, message, forceLeadGeneration, beds, baths } = parsedData.data.payload;
    const rawType = type.toUpperCase();
    const messageStr = message.toLowerCase();
    
    const isAdversarialMode = rawType === "DESCRIPTION" || rawType === "REALITY_CHECK" || messageStr.includes("reality") || messageStr.includes("mitigation");
    const lookupCacheKey = `${propertyType.trim()}_${location.trim()}`.toLowerCase().replace(/\s+/g, "_");
    const operationalCache = REAL_ESTATE_MUTATION_CACHE.get(lookupCacheKey);
    const currentTime = Date.now();

    // ─── DETECT CURRENCY ───
    const detectedCurrency = detectCurrency(location, price);

    let baseMarketBaseline = 0;
    let extractedSquareFootage = estimateSquareFootage(propertyType, beds, baths, location);
    let fallbackTriggered = false;
    let aiSummary = "";
    let aiRiskText = "";
    let marketSentimentNode: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";

    // ─── NEW: REAL SOLD PRICE ENGINE ───
    let soldRecords: TransactionRecord[] = [];
    let valuation: any = null;
    let finalVerdict: any = null;

    const forceFreshExecution = isAdversarialMode || rawType !== "HISTORY";

    if (!forceFreshExecution && operationalCache && (currentTime - operationalCache.timestamp < CACHE_EXPIRATION_TIME)) {
      baseMarketBaseline = cleanNumericValue(operationalCache.baselinePrice);
    } else {
      // ─── STEP 1: SCRAPE REAL SOLD PRICES ───
      try {
        soldRecords = await scrapeSoldPrices(location, propertyType, beds || 3);
        console.log(`[ROUTE] Found ${soldRecords.length} sold records`);
      } catch (e) {
        console.error("[ROUTE] Sold price scraping failed:", e);
      }

      // ─── STEP 2: CALCULATE VALUATION ───
      if (soldRecords.length > 0) {
        valuation = calculateValuation(soldRecords, 0, beds || 3, baths || 2);
        baseMarketBaseline = valuation.pricePerSqft || 1000;
        console.log(`[ROUTE] Median sold price: ${valuation.medianPrice}, per sqft: ${valuation.pricePerSqft}`);
      }

      // ─── STEP 3: GENERATE VERDICT ───
      const inputPriceNumeric = cleanNumericValue(price);
      if (valuation && valuation.medianPrice > 0) {
        // VerdictEngine may expose different method names depending on implementation/version.
        const engine: any = VerdictEngine as any;
        const possibleFns = ["generate", "evaluate", "run", "analyze", "create"];
        let invoked = false;
        for (const fn of possibleFns) {
          if (engine && typeof engine[fn] === "function") {
            try {
              finalVerdict = await engine[fn](inputPriceNumeric, valuation, location);
              invoked = true;
              break;
            } catch (e) {
              console.warn(`[ROUTE] VerdictEngine.${fn} failed:`, e);
            }
          }
        }

        if (!invoked) {
          console.warn("[ROUTE] VerdictEngine method not found; skipping verdict generation.");
          finalVerdict = null;
        }
      }

      // ─── FALLBACK: GROQ IF NO SOLD DATA ───
      let llmResult: GroqResult;
      
      if (!valuation || valuation.confidence === "INSUFFICIENT") {
        const serperPromise = coalescedFetch(`serper_${lookupCacheKey}`, () => fetchSerperContext(propertyType, location), "");
        
        const resolvedContext = await Promise.race([
          serperPromise.then(ctx => ctx || ""),
          new Promise<string>(resolve => setTimeout(() => resolve(""), 3000))
        ]);

        const systemPrompt = buildSystemPrompt(rawType, resolvedContext);
        
        llmResult = await fetchGroqAnalysis(
          systemPrompt,
          `Extract data for ${propertyType} in ${location} listed at ${price}. Mode: ${rawType}.`
        );
        
        baseMarketBaseline = llmResult.baseMarketBaseline;
        extractedSquareFootage = llmResult.extractedSquareFootage || extractedSquareFootage;
        aiSummary = llmResult.aiSummary;
        aiRiskText = llmResult.aiRiskText;
        marketSentimentNode = llmResult.marketSentimentNode;
        fallbackTriggered = true;
      } else {
        // Use real data, minimal LLM for narrative
        llmResult = {
          baseMarketBaseline: valuation.pricePerSqft,
          extractedSquareFootage: extractedSquareFootage,
          aiSummary: `Real market analysis based on ${valuation.sampleSize} recent sold properties. Median sold price: ${valuation.medianPrice.toLocaleString()}. Price range: ${valuation.priceRange.low.toLocaleString()} - ${valuation.priceRange.high.toLocaleString()}.`,
          aiRiskText: `Market data confidence: ${valuation.confidence}. ${valuation.sampleSize < 5 ? 'Limited sample size - verify with local agent.' : 'Sufficient market data for reliable valuation.'}`,
          marketSentimentNode: "NEUTRAL"
        };
        
        baseMarketBaseline = valuation.pricePerSqft;
        extractedSquareFootage = extractedSquareFootage;
        aiSummary = llmResult.aiSummary;
        aiRiskText = llmResult.aiRiskText;
        marketSentimentNode = "NEUTRAL";
        fallbackTriggered = false;
      }

      if (!forceFreshExecution && !fallbackTriggered) {
        REAL_ESTATE_MUTATION_CACHE.set(lookupCacheKey, {
          baselinePrice: baseMarketBaseline.toString(),
          yieldValue: 0,
          timestamp: currentTime
        });
      }
    }

    // ─── MATHEMATICAL CALCULATIONS ───

    const inputPriceNumeric = cleanNumericValue(price);
    const totalMarketBaseline = baseMarketBaseline * extractedSquareFootage;
    
    const formattedMarketBaseline = formatCurrency(totalMarketBaseline, detectedCurrency);

    const adapterResult = serializeVariancePayload({
      investmentValuation: price,
      marketRealityBaseline: formattedMarketBaseline
    });

    // ─── VARIANCE CALCULATION ───
    let calculatedVariance = parseFloat(adapterResult.varianceRatio.replace("%", ""));
    if (isNaN(calculatedVariance)) {
      calculatedVariance = inputPriceNumeric > 0 && totalMarketBaseline > 0 
        ? ((inputPriceNumeric - totalMarketBaseline) / totalMarketBaseline) * 100 
        : 0;
    }

    // ─── YIELD CALCULATION WITH SOURCE & REALITY CHECK ───
    let explicitYield = 5.50;
    let yieldSource = "Default Estimate";

    if (totalMarketBaseline > 0 && inputPriceNumeric > 0) {
      const standardNetOperatingIncome = totalMarketBaseline * 0.06;
      explicitYield = (standardNetOperatingIncome / inputPriceNumeric) * 100;
      yieldSource = fallbackTriggered 
        ? "AI Estimate (no rental data available)" 
        : `Market Average (based on ${valuation?.sampleSize || 0} comparables)`;
    }

    // Dubai luxury reality check
    const isLuxuryDubai = location.toLowerCase().includes("palm") || 
                          location.toLowerCase().includes("jebel ali") ||
                          location.toLowerCase().includes("emirates hills") ||
                          location.toLowerCase().includes("district one") ||
                          location.toLowerCase().includes("tilal al ghaf");

    if (isLuxuryDubai && explicitYield > 5.0) {
      explicitYield = 3.5;
      yieldSource = "Adjusted to Dubai Luxury Market Reality (3-4% typical)";
    }

    explicitYield = Math.max(0.1, Math.min(20.0, explicitYield));

    let strictCalculatedScore = 5.0;
    if (calculatedVariance > 25) {
      strictCalculatedScore = Math.max(1.0, 4.0 - (calculatedVariance * 0.03));
    } else if (calculatedVariance > 0) {
      strictCalculatedScore = Math.max(4.0, 8.0 - (calculatedVariance * 0.15));
    } else {
      strictCalculatedScore = Math.min(10.0, 8.5 + (Math.abs(calculatedVariance) * 0.05));
    }

    // ─── SENTIMENT & REALITY_CHECK ADJUSTMENTS ───
    if (marketSentimentNode === "NEGATIVE") {
      strictCalculatedScore = Math.max(1.0, strictCalculatedScore - 1.5);
    } else if (marketSentimentNode === "POSITIVE") {
      strictCalculatedScore = Math.min(10.0, strictCalculatedScore + 0.5);
    }

    if (rawType === "REALITY_CHECK") {
      strictCalculatedScore = Math.max(1.0, strictCalculatedScore - 1.0);
      if (marketSentimentNode !== "NEGATIVE") {
        marketSentimentNode = "NEGATIVE";
      }
    }

    // ─── VERDICT OVERRIDE WITH INSUFFICIENT_DATA CHECK ───
    let verdictOverride = "HOLD";
    let hardDropTriggered = false;
    
    if (finalVerdict) {
      verdictOverride = finalVerdict.verdict;
      
      if (finalVerdict.verdict === "INSUFFICIENT_DATA") {
        strictCalculatedScore = 0;
        verdictOverride = "INSUFFICIENT_DATA";
      } else {
        strictCalculatedScore = finalVerdict.score;
        hardDropTriggered = finalVerdict.riskLevel === "CRITICAL" || finalVerdict.riskLevel === "HIGH";
      }
    } else {
      if (calculatedVariance > 25 || explicitYield < 3.5) {
        if (calculatedVariance > 10 || explicitYield < 4.0) {
          verdictOverride = "REJECT";
          strictCalculatedScore = Math.min(strictCalculatedScore, 3.0);
          hardDropTriggered = true;
        }
      } else if (strictCalculatedScore >= 8.5 && calculatedVariance <= 5) {
        verdictOverride = "PRIME_ASSET";
      } else if (strictCalculatedScore >= 7.0) {
        verdictOverride = "HIGH_YIELD";
      }
    }

    strictCalculatedScore = Math.round(strictCalculatedScore * 10) / 10;

    const financialMetricLabel = getFinancialMetricLabel(propertyType);

    // ─── HONEST TELEMETRY REPORT ───
    const hasRealData = valuation && valuation.sampleSize >= 3;
    
    const telemetryReportText = hasRealData
      ? `### REAL MARKET ANALYSIS
Based on ${valuation.sampleSize} actual recent sales in ${location}

### Discrepancy Analysis:
- User Listed Price: ${price}
- Market Median Sold: ${valuation.medianPrice.toLocaleString()}
- Sold Price Range: ${valuation.priceRange.low.toLocaleString()} - ${valuation.priceRange.high.toLocaleString()}
- Calculated Baseline: ${formattedMarketBaseline} (at ${baseMarketBaseline}/sqft × ${extractedSquareFootage.toLocaleString()} sqft)
- Price per Sqft: ${baseMarketBaseline}
- Data Sources: ${soldRecords.length} comparable transactions
- Market Confidence: ${valuation.confidence}

### VERDICT: ${verdictOverride}
${finalVerdict ? finalVerdict.recommendation : 'Standard market analysis applied.'}
Score: ${strictCalculatedScore}/10
Variance: ${calculatedVariance.toFixed(1)}%

### Financial Risk Profile: ${aiRiskText}

### ${financialMetricLabel}:
- Expected Yield Value: ${explicitYield.toFixed(2)}%
- Yield Source: ${yieldSource}

### Final Score:
${strictCalculatedScore.toFixed(1)}/10

### Next Step:
${hardDropTriggered 
  ? "IMMEDIATE_INVESTMENT_HALT: " + (finalVerdict ? finalVerdict.recommendation : "Financial overpayment variance breaks portfolio safety parameters.")
  : "Proceed with baseline tracking execution protocols."
}`
      : `### ⚠️ INSUFFICIENT MARKET DATA
${fallbackTriggered ? 'Based on AI estimates (no sold comparables found)' : 'Based on market estimates (limited sold data available)'}

### Discrepancy Analysis:
- User Listed Price: ${price}
- Market Median Sold: N/A (0 sold records found)
- Calculated Baseline: ${formattedMarketBaseline} (AI ESTIMATE - NOT VERIFIED)
- Price per Sqft: ${baseMarketBaseline}
- Data Sources: 0 comparable transactions
- Market Confidence: NONE

### ⚠️ VERDICT: INSUFFICIENT_DATA
Cannot provide reliable valuation. No recent sold transactions found for ${location}.
Score: N/A
Variance: N/A

### Financial Risk Profile:
${aiRiskText || 'No market data available for risk assessment. Proceed with extreme caution.'}

### ${financialMetricLabel}:
- Expected Yield Value: ${explicitYield.toFixed(2)}%
- ⚠️ Yield Source: ${yieldSource} - HIGHLY UNRELIABLE

### Final Score:
N/A

### Next Step:
MANUAL_VERIFICATION_REQUIRED: Consult local real estate agent for accurate market assessment.`;

    // ─── AUDIT HASH ───
    const auditPayload = {
      userId: userId || "anonymous",
      propertyType,
      location,
      price,
      consensus: baseMarketBaseline,
      variance: calculatedVariance,
      score: strictCalculatedScore,
      verdict: verdictOverride,
      timestamp: Date.now(),
    };
    const auditHash = generateAuditHash(auditPayload);

    // ─── DATA ORIGIN DETERMINATION ───
    let dataOrigin: DataOrigin;
    
    if (process.env.NEXT_PUBLIC_APP_MODE === "demo") {
      dataOrigin = {
        source: "DEMO_MODE",
        confidence: "HIGH",
        sourcesCount: soldRecords.length,
        lastUpdated: new Date().toISOString(),
        isDemoMode: true,
        fallbackReason: "Development mode with mock data"
      };
    } else if (hasRealData && soldRecords.length >= 3) {
      dataOrigin = {
        source: "LOCAL_REGISTRY",
        confidence: valuation?.confidence === "HIGH" ? "HIGH" : "MEDIUM",
        sourcesCount: soldRecords.length,
        lastUpdated: new Date().toISOString(),
        isDemoMode: false
      };
    } else if (fallbackTriggered && soldRecords.length > 0) {
      dataOrigin = {
        source: "HYBRID_WEB_SCRAPE",
        confidence: "MEDIUM",
        sourcesCount: soldRecords.length,
        lastUpdated: new Date().toISOString(),
        isDemoMode: false,
        fallbackReason: "Mixed web sources with AI validation"
      };
    } else if (fallbackTriggered) {
      dataOrigin = {
        source: "AI_ESTIMATE",
        confidence: "LOW",
        sourcesCount: 0,
        lastUpdated: new Date().toISOString(),
        isDemoMode: false,
        fallbackReason: "No web sources found, pure AI estimate"
      };
    } else {
      dataOrigin = {
        source: "INSUFFICIENT",
        confidence: "NONE",
        sourcesCount: 0,
        lastUpdated: new Date().toISOString(),
        isDemoMode: false,
        fallbackReason: "No data sources available"
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FIXED SUPABASE INSERTS — ts(2769) RESOLVED
    // Cast entire expression to `any` to bypass strict `never` type inference
    // caused by missing generated Supabase schema types.
    // ═══════════════════════════════════════════════════════════════════════

    if (userId) {
        // ─── FIX #1: ai_history insert ───
        try {
          await (supabase as any).from("ai_history").insert([{
            user_id: userId,
            action_type: rawType,
            input_params: { 
              propertyType, 
              price, 
              location, 
              varianceCalculated: calculatedVariance, 
              extractedYield: explicitYield, 
              hardDropTriggered, 
              extractedSquareFootage, 
              baseMarketBaseline,
              soldRecordsFound: soldRecords.length,
              valuationConfidence: valuation ? valuation.confidence : 'NONE',
              hasRealData,
              dataOrigin,
              auditHash
            },
            output_text: telemetryReportText
          }]);
        } catch (e: any) {
          console.error("ai_history insert failed:", e.message);
        }
      // ─── FIX #2: Line ~856 — contracts insert ───
     try {
          await (supabase as any).from("contracts").insert([{
            user_id: userId,
            property_type: propertyType,
            valuation_price: price,
            location_data: location,
            verdict_status: verdictOverride,
            initialization_payload: { 
              varianceRatio: hasRealData ? `${calculatedVariance.toFixed(2)}%` : 'N/A', 
              systemScore: hasRealData ? strictCalculatedScore : 'N/A', 
              projectedYield: explicitYield, 
              yieldSource,
              extractedSquareFootage, 
              baseMarketBaseline,
              soldRecordsFound: soldRecords.length,
              valuationConfidence: valuation ? valuation.confidence : 'NONE',
              hasRealData,
              dataOrigin,
              auditHash
            }
          }]);
        } catch (e: any) {
          console.error("contracts insert failed:", e.message);
        }

      // ─── FIX #3: Line ~882 — leads insert ───
     if (verdictOverride === "PRIME_ASSET" || verdictOverride === "HIGH_YIELD" || forceLeadGeneration) {
          try {
            await (supabase as any).from("leads").insert([{
              user_id: userId,
              target_value: price,
              location_data: location,
              audit_verdict: verdictOverride,
              output_text: telemetryReportText
            }]);
          } catch (e: any) {
            console.error("leads insert failed:", e.message);
          }
        }
      } // ← closes `if (userId)`

      return NextResponse.json({ 
        data: telemetryReportText,
        varianceRatio: hasRealData ? `${calculatedVariance.toFixed(2)}%` : 'N/A',
        scoreTelemetry: hasRealData ? `${strictCalculatedScore.toFixed(1)}/10` : 'N/A',
        riskClassification: hardDropTriggered ? "RISK_ALERT_REJECT" : (hasRealData ? adapterResult.riskStatus || "STABLE_MARG" : "INSUFFICIENT_DATA"),
        projectedYield: explicitYield,
        yieldSource,
        verdict: verdictOverride,
        baselineMarketValue: formattedMarketBaseline,
        perSqftBaseline: baseMarketBaseline,
        extractedSquareFootage: extractedSquareFootage,
        soldRecordsFound: soldRecords.length,
        valuationConfidence: valuation ? valuation.confidence : 'NONE',
        hasRealData,
        detectedCurrency,
        auditHash,
        rateLimitRemaining: rateLimit.remaining,
        dataOrigin,
        telemetryMetrics: {
          variance: hasRealData ? calculatedVariance : 'N/A',
          riskClassification: hardDropTriggered ? "RISK_ALERT_REJECT" : (hasRealData ? adapterResult.riskStatus || "STABLE_MARG" : "INSUFFICIENT_DATA"),
          projectedYield: explicitYield,
          yieldSource,
          systemScoreOverride: hasRealData ? strictCalculatedScore : 'N/A',
          verdict: verdictOverride,
          baselineMarketValue: formattedMarketBaseline,
          perSqftBaseline: baseMarketBaseline,
          extractedSquareFootage: extractedSquareFootage,
          soldRecordsFound: soldRecords.length,
          valuationConfidence: valuation ? valuation.confidence : 'NONE',
          hasRealData,
          detectedCurrency,
          auditHash,
          dataOrigin
        }
      });

    } catch (error: any) {  // ← POST handler catch
      console.error("CRITICAL_SYSTEM_INTERNAL_ERROR:", error);
      return NextResponse.json({ error: "SYSTEM_INTERNAL_ERROR", diagnostics: error.message }, { status: 500 });
    }
  } 
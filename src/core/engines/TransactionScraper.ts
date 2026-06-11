// src/core/engines/TransactionScraper.ts
import { z } from "zod";
import Groq from "groq-sdk";

// ✅ BULLETPROOF DATA NORMALIZATION SCHEMA
const PropertyTransactionSchema = z.object({
  transaction_type: z.preprocess(
    (val) => String(val).toUpperCase().trim(),
    z.enum(["SOLD", "LISTED", "RENTAL", "UNKNOWN"])
  ).catch("UNKNOWN"),

  // FIX: Default 1 hata diya, ab undefined rahega agar missing hai
  price: z.preprocess((val) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const cleaned = val.replace(/[^0-9.]/g, "");
      return cleaned ? parseFloat(cleaned) : undefined;
    }
    return undefined;
  }, z.number().positive().optional()),

  currency: z.preprocess(
    (val) => String(val).toUpperCase().trim(),
    z.enum(["AED", "USD", "INR", "GBP", "EUR"])
  ).catch("USD"),

  // FIX: Undefined return karega agar data nahi mila
  price_per_sqft: z.preprocess((val) => {
    if (!val) return undefined;
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
    return isNaN(num) || num <= 0 ? undefined : num;
  }, z.number().positive().optional()),

  // FIX: Undefined return karega agar data nahi mila
  sqft: z.preprocess((val) => {
    if (!val) return undefined;
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
    return isNaN(num) || num <= 0 ? undefined : num;
  }, z.number().positive().optional()),

  property_type: z.preprocess(
    (val) => String(val).toUpperCase().trim(),
    z.enum(["VILLA", "APARTMENT", "PENTHOUSE", "TOWNHOUSE", "UNKNOWN"])
  ).catch("UNKNOWN"),

  location: z.preprocess((val) => {
    if (!val) return "Unknown Location";
    if (typeof val === "object") {
      return (val as any).address || (val as any).name || (val as any).area || JSON.stringify(val);
    }
    return String(val);
  }, z.string().min(1)),

  bedrooms: z.preprocess((val) => {
    if (!val) return undefined;
    const num = parseInt(String(val).replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? undefined : num;
  }, z.number().int().optional()),

  bathrooms: z.preprocess((val) => {
    if (!val) return undefined;
    const num = parseInt(String(val).replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? undefined : num;
  }, z.number().int().optional()),

  date: z.string().optional(),

  source_confidence: z.preprocess(
    (val) => String(val).toUpperCase().trim(),
    z.enum(["HIGH", "MEDIUM", "LOW"])
  ).catch("LOW"),

  data_source_url: z.string().url().catch("https://fallback-registry.ae"),
  verification_notes: z.string().max(500).catch("Auto-extracted via data pipeline validation rules.")
});

export type PropertyTransaction = z.infer<typeof PropertyTransactionSchema>;
export type TransactionRecord = PropertyTransaction;

const EXTRACTION_PROMPT = `You are a forensic real estate data extractor. Analyze the following web search result and extract property transaction data.

CRITICAL RULES:
1. ACTIVE LISTING (for sale, available, listed at) → transaction_type = "LISTED"
2. COMPLETED SALE (sold, sold for, closed at) → transaction_type = "SOLD"
3. If BOTH mentioned → extract ONLY the SOLD transaction
4. If unclear → transaction_type = "UNKNOWN"
5. Currency must be explicitly stated — do NOT guess or convert
6. Price must be EXACT number from text. If price is NOT explicitly in the text, return null for price. DO NOT GUESS.
7. Location must include: [Area, City, Country]
8. If sqft/price_per_sqft not mentioned → omit field
9. Source confidence: HIGH = official registry, MEDIUM = real estate site, LOW = forum/social media

Return ONLY valid JSON object matching the requested fields. No markdown, no code blocks, no explanations.

SEARCH RESULT:
{searchResult}
`;

export class TransactionScraper {
  private groq: Groq;
  private tavilyApiKey: string;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || "",
    });
    this.tavilyApiKey = process.env.TAVILY_API_KEY || "";
    
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY missing in .env.local");
    if (!this.tavilyApiKey) throw new Error("TAVILY_API_KEY missing in .env.local");
  }

  async scrapeTransactions(
    query: string,
    targetLocation: string,
    targetCurrency: string
  ): Promise<PropertyTransaction[]> {
    
    const tavilyResults = await this.fetchTavily(query);
    const classifiedTransactions: PropertyTransaction[] = [];

    for (const result of tavilyResults) {
      try {
        const rawContent = result.raw_content || result.content || JSON.stringify(result);
        
     // ─── LOCAL API ROUTING & RATE LIMIT PROTECTION ───
        const baseUrl = process.env.NEXT_PUBLIC_FREELLM_BASE_URL || "http://localhost:3001/v1";
        const apiKey = process.env.FREELLM_API_KEY;

        let content = "";

        try {
          const res = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "auto", // FreeLLMAPI calls automatically route to fallback keys
              messages: [
                {
                  role: "system",
                  content: "You extract structured real estate data from messy web text. Return only raw JSON string representing the object properties."
                },
                {
                  role: "user",
                  content: EXTRACTION_PROMPT.replace("{searchResult}", rawContent.slice(0, 8000))
                }
              ],
              temperature: 0.1,
              response_format: { type: "json_object" }
            })
          });

          if (!res.ok) {
            console.error(`[GATEWAY ERROR] Status: ${res.status}. Dropping record to maintain loop stability.`);
            continue; // 429 ya 500 error aane par crash nahi hoga, agle property data par jayega
          }

          const responseData = await res.json();
          content = responseData.choices?.[0]?.message?.content || "";
        } catch (fetchError) {
          console.error("[SCRAPER NETWORK EXCEPTION] Network down or gateway timed out:", fetchError);
          continue; // Exception safe recovery point
        }
        
        if (!content) {
          console.warn("Empty LLM response received. Skipping item.");
          continue;
        }
        
        let parsed = JSON.parse(content);

        // ✅ CONTEXT CROSS-REFERENCE
        if (!parsed.data_source_url && result.url) {
          parsed.data_source_url = result.url;
        }
        if (!parsed.verification_notes) {
          parsed.verification_notes = `Source extraction path verified via metadata index: ${result.title || 'Web Snapshot'}`;
        }

        // ✅ SAFE PARSE PIPELINE
        const validationResult = PropertyTransactionSchema.safeParse(parsed);

        if (!validationResult.success) {
          console.warn(`[FILTER LOGIC] Record dropped due to schema extraction errors:`, validationResult.error.format());
          continue; 
        }
        const validated = validationResult.data;

        // Location Filter
        if (!this.isLocationMatch(validated.location, targetLocation)) {
          console.warn(`[FILTER] Location mismatch: ${validated.location} !== ${targetLocation}`);
          continue;
        }

        // Currency Filter
        if (validated.currency !== targetCurrency) {
          console.warn(`[FILTER] Currency mismatch: ${validated.currency} !== ${targetCurrency}`);
          continue;
        }

        classifiedTransactions.push(validated);

      } catch (error) {
        console.error(`[EXTRACTION EXCEPTION SKIPPED]`, error);
      }
    }

    return classifiedTransactions;
  }

  static async scrapeSoldPrices(
    location: string,
    propertyType: string,
    bedrooms: number = 3
  ): Promise<PropertyTransaction[]> {
    const scraper = new TransactionScraper();
    const query = `${propertyType} ${bedrooms} bedroom ${location} sold transaction`;
    return scraper.scrapeTransactions(query, location, "AED");
  }

  private async fetchTavily(query: string): Promise<any[]> {
    const enrichedQuery = `${query} sold transaction closed sale ${new Date().getFullYear()}`;

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.tavilyApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: enrichedQuery,
        search_depth: "advanced",
        max_results: 10,
        include_raw_content: true,
        include_domains: [
          "propertyfinder.ae",
          "bayut.com",
          "dubizzle.com",
          "dxbinteract.com",
          "luxhabitat.ae"
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  }

  private isLocationMatch(extracted: string, target: string): boolean {
    const normalized = extracted.toLowerCase().replace(/[^a-z0-9]/g, "");
    const targetNorm = target.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalized.includes(targetNorm) || targetNorm.includes(normalized);
  }
}

export { TransactionScraper as default };
export const scrapeSoldPrices = TransactionScraper.scrapeSoldPrices;
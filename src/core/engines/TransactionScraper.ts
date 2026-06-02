// src/core/engines/TransactionScraper.ts
import { z } from "zod";
import Groq from "groq-sdk"; // ✅ SDK import

// Zod Schema
const PropertyTransactionSchema = z.object({
  transaction_type: z.enum(["SOLD", "LISTED", "RENTAL", "UNKNOWN"]),
  price: z.number().positive(),
  currency: z.enum(["AED", "USD", "INR", "GBP", "EUR"]),
  price_per_sqft: z.number().positive().optional(),
  sqft: z.number().positive().optional(),
  property_type: z.enum(["VILLA", "APARTMENT", "PENTHOUSE", "TOWNHOUSE", "UNKNOWN"]),
  location: z.string().min(5),
  bedrooms: z.number().int().min(1).optional(),
  bathrooms: z.number().int().min(1).optional(),
  date: z.string().datetime().optional(),
  source_confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
  data_source_url: z.string().url(),
  verification_notes: z.string().max(500),
});

export type PropertyTransaction = z.infer<typeof PropertyTransactionSchema>;
export type TransactionRecord = PropertyTransaction;

// Prompt
const EXTRACTION_PROMPT = `You are a forensic real estate data extractor. Analyze the following web search result and extract property transaction data.

CRITICAL RULES:
1. ACTIVE LISTING (for sale, available, listed at) → transaction_type = "LISTED"
2. COMPLETED SALE (sold, sold for, closed at) → transaction_type = "SOLD"
3. If BOTH mentioned → extract ONLY the SOLD transaction
4. If unclear → transaction_type = "UNKNOWN"
5. Currency must be explicitly stated — do NOT guess or convert
6. Price must be EXACT number from text
7. Location must include: [Area, City, Country]
8. If sqft/price_per_sqft not mentioned → omit field
9. Source confidence: HIGH = official registry, MEDIUM = real estate site, LOW = forum/social media

Return ONLY valid JSON. No markdown, no explanations.

SEARCH RESULT:
{searchResult}
`;

export class TransactionScraper {
  private groq: Groq; // ✅ SDK client
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
        
        // ✅ SDK call
        const llmResponse = await this.groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You extract structured real estate data from messy web text. Be conservative — when in doubt, mark UNKNOWN."
            },
            {
              role: "user",
              content: EXTRACTION_PROMPT.replace("{searchResult}", rawContent.slice(0, 8000))
            }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        });
        
        const content = llmResponse.choices[0].message.content;
        if (!content) throw new Error("Empty LLM response");
        
        const parsed = JSON.parse(content);
        const validated = PropertyTransactionSchema.parse(parsed);

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
        console.error(`[EXTRACTION FAILED]`, error);
      }
    }

    return classifiedTransactions;
  }

  // ✅ SDK version - static method for backward compatibility
  static async scrapeSoldPrices(
    location: string,
    propertyType: string,
    bedrooms: number = 3
  ): Promise<PropertyTransaction[]> {
    const scraper = new TransactionScraper();
    const query = `${propertyType} ${bedrooms} bedroom ${location} sold transaction`;
    return scraper.scrapeTransactions(query, location, "AED");
  }

  // Tavily via fetch
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
import puppeteer from 'puppeteer';
import { Groq } from 'groq-sdk';
import { z } from 'zod';

// Strict Data Provenance & Real Estate Schema
export const PropertySchema = z.object({
  price: z.union([z.number(), z.literal('NOT_FOUND'), z.literal('AMBIGUOUS')]),
  sqft: z.union([z.number(), z.literal('NOT_FOUND'), z.literal('AMBIGUOUS')]),
  location: z.union([z.string(), z.literal('NOT_FOUND'), z.literal('AMBIGUOUS')]),
  bedrooms: z.union([z.number(), z.literal('NOT_FOUND'), z.literal('AMBIGUOUS')]),
  bathrooms: z.union([z.number(), z.literal('NOT_FOUND'), z.literal('AMBIGUOUS')]),
  property_type: z.union([z.string(), z.literal('NOT_FOUND'), z.literal('AMBIGUOUS')]),
  listing_date: z.union([z.string(), z.literal('NOT_FOUND'), z.literal('AMBIGUOUS')]),
  data_source: z.union([z.string().url(), z.literal('NOT_FOUND'), z.literal('AMBIGUOUS')]),
});

export type PropertyData = z.infer<typeof PropertySchema>;

export class PropertyFinderScraper {
  private groq: Groq;

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("CRITICAL: GROQ_API_KEY is missing in environment variables.");
    }
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  /**
   * Browser Automation Engine using Puppeteer
   */
  public async fetchRawHTML(url: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      const content = await page.evaluate(() => document.body.innerText);
      await browser.close();
      return content;
    } catch (error) {
      await browser.close();
      throw new Error(`Puppeteer extraction failed: ${(error as Error).message}`);
    }
  }

  /**
   * AI Extraction Pipeline with zero predictions, zero ratings, and zero hallucinations.
   */
  public async extractStructuredData(rawText: string, sourceUrl: string): Promise<PropertyData> {
    const SYSTEM_PROMPT = `
You are ESTATE.AI Data Extractor — a strict real estate data parsing engine.
Your ONLY job is to extract structured information from provided text.
You are NOT a valuation engine. You do NOT predict prices.
You do NOT generate forecasts. You do NOT assign scores.

DO NOT include markdown formatting, markdown code blocks, or conversational text. You must return ONLY raw JSON matching the required format.

RULES:
1. If data is present in text → extract it exactly as stated.
2. If data is missing → respond with "NOT_FOUND" — never guess.
3. If text is unclear → respond with "AMBIGUOUS" — never infer.
4. NEVER calculate price per sqft unless both price AND sqft are explicitly in text.
5. NEVER estimate rental yield unless both rent AND price are explicitly in text.
6. NEVER predict future values — no 1-year, 5-year, or 20-year forecasts.
7. NEVER assign confidence scores, risk scores, or investment ratings.

REQUIRED JSON OUTPUT FORMAT:
{
  "price": number or "NOT_FOUND" or "AMBIGUOUS",
  "sqft": number or "NOT_FOUND" or "AMBIGUOUS",
  "location": "string" or "NOT_FOUND" or "AMBIGUOUS",
  "bedrooms": number or "NOT_FOUND" or "AMBIGUOUS",
  "bathrooms": number or "NOT_FOUND" or "AMBIGUOUS",
  "property_type": "string" or "NOT_FOUND" or "AMBIGUOUS",
  "listing_date": "string" or "NOT_FOUND" or "AMBIGUOUS",
  "data_source": "string" or "NOT_FOUND" or "AMBIGUOUS"
}
`;

    const response = await this.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Source URL: ${sourceUrl}\n\nListing Content:\n${rawText.substring(0, 8000)}` }
      ],
      temperature: 0, // Strict zero variance
      response_format: { type: "json_object" },
      max_tokens: 600
    });

    const rawJsonString = response.choices[0]?.message?.content?.trim() || '{}';
    const parsedJson = JSON.parse(rawJsonString);

    // Overwrite data_source with verified URL if not found or empty
    if (!parsedJson.data_source || parsedJson.data_source === "NOT_FOUND") {
      parsedJson.data_source = sourceUrl;
    }

    return PropertySchema.parse(parsedJson);
  }
}
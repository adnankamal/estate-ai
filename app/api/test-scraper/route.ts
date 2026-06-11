import { NextRequest, NextResponse } from 'next/server';
import { PropertyFinderScraper } from '../../../src/core/engines/PropertyFinderScraper';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ 
      success: false, 
      error: "Missing 'url' query parameter. Provide a real real-estate listing URL." 
    }, { status: 400 });
  }

  console.log(`[ENGINE] Live check initiated for: ${targetUrl}`);
  
  try {
    const scraper = new PropertyFinderScraper();

    // 1. Live Extraction using Puppeteer
    const rawText = await scraper.fetchRawHTML(targetUrl);

    if (!rawText || rawText.trim().length === 0) {
      throw new Error("Puppeteer returned empty text content.");
    }

    // 2. Strict Parse
    const parsedData = await scraper.extractStructuredData(rawText, targetUrl);

    // 3. Mathematical validation of core elements
    const isPriceMissing = parsedData.price === 'NOT_FOUND' || parsedData.price === 'AMBIGUOUS';
    const isSqftMissing = parsedData.sqft === 'NOT_FOUND' || parsedData.sqft === 'AMBIGUOUS';

    // If core elements required for financial analysis are missing, enforce INSUFFICIENT_DATA
    if (isPriceMissing || isSqftMissing) {
      return NextResponse.json({
        success: false,
        status: "INSUFFICIENT_DATA",
        message: "Crucial financial metrics (price or sqft) could not be extracted cleanly from the source material. No estimations are allowed.",
        raw_extracted: parsedData
      });
    }

    // Pure deterministic calculation of price per sqft (Never let LLM calculate this)
    const pricePerSqFt = Number(parsedData.price) / Number(parsedData.sqft);

    return NextResponse.json({ 
      success: true,
      status: "DATA_VERIFIED",
      data: {
        ...parsedData,
        calculatedPricePerSqFt: parseFloat(pricePerSqFt.toFixed(2))
      }
    });

  } catch (error) {
    console.error("[ENGINE CRASH] Failed pipeline:", error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
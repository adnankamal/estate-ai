import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const DarkPoolQuerySchema = z.object({
  location: z.string().min(2),
  propertyType: z.string().optional(),
  maxPrice: z.string().optional(),
  investorProfile: z.enum(["AGGRESSIVE", "BALANCED", "CONSERVATIVE"]).default("BALANCED"),
});

// Simulated dark pool database — replace with actual scrapers/partnerships
const DARK_POOL_DB = [
  {
    id: "DP-001",
    location: "palm jumeirah",
    propertyType: "villa",
    type: "PRE_LAUNCH",
    developer: "Nakheel",
    discount: 18,
    unitsAvailable: 3,
    minInvestment: "AED 8,500,000",
    lockupPeriod: "24 months",
    confidence: "HIGH",
    source: "Developer CRM",
    expiresAt: "2026-07-15",
  },
  {
    id: "DP-002",
    location: "dubai hills",
    propertyType: "townhouse",
    type: "DISTRESSED",
    bank: "Emirates NBD",
    discount: 32,
    reason: "NPA Liquidation",
    auctionDate: "2026-06-20",
    reservePrice: "AED 2,800,000",
    confidence: "MEDIUM",
    source: "Court Auction",
    expiresAt: "2026-06-20",
  },
  {
    id: "DP-003",
    location: "business bay",
    propertyType: "commercial",
    type: "NRI_DISTRESS",
    ownerSituation: "Visa cancellation — forced sale",
    discount: 25,
    daysOnMarket: 2,
    confidence: "HIGH",
    source: "Broker Network",
    expiresAt: "2026-06-10",
  },
  {
    id: "DP-004",
    location: "jumeirah village circle",
    propertyType: "apartment",
    type: "PRE_LAUNCH",
    developer: "Ellington",
    discount: 12,
    unitsAvailable: 15,
    minInvestment: "AED 1,200,000",
    lockupPeriod: "12 months",
    confidence: "HIGH",
    source: "Developer CRM",
    expiresAt: "2026-08-01",
  },
  {
    id: "DP-005",
    location: "downtown dubai",
    propertyType: "penthouse",
    type: "DISTRESSED",
    bank: "ADCB",
    discount: 28,
    reason: "Developer default — bank takeover",
    auctionDate: "2026-06-25",
    reservePrice: "AED 15,000,000",
    confidence: "MEDIUM",
    source: "Court Auction",
    expiresAt: "2026-06-25",
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = DarkPoolQuerySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_DARK_POOL_QUERY" }, { status: 400 });
    }

    const { location, propertyType, maxPrice, investorProfile } = parsed.data;

    let matches = DARK_POOL_DB.filter((deal) => 
      deal.location.includes(location.toLowerCase()) || location.toLowerCase().includes(deal.location)
    );

    if (propertyType) {
      matches = matches.filter((deal) => deal.propertyType === propertyType.toLowerCase());
    }

    if (investorProfile === "CONSERVATIVE") {
      matches = matches.filter((deal) => deal.type === "PRE_LAUNCH" && deal.confidence === "HIGH");
    } else if (investorProfile === "BALANCED") {
      matches = matches.filter((deal) => deal.discount < 35);
    }

    matches.sort((a, b) => b.discount - a.discount);

    return NextResponse.json({
      query: { location, propertyType, investorProfile },
      matchesFound: matches.length,
      totalOpportunityValue: matches.reduce((sum, d) => {
        const val = parseFloat(d.minInvestment?.replace(/[^0-9.]/g, "") || d.reservePrice?.replace(/[^0-9.]/g, "") || "0") || 0;
        return sum + val;
      }, 0),
      deals: matches,
      expiresWithin7Days: matches.filter((d) => {
        const days = Math.ceil((new Date(d.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days <= 7;
      }).length,
    });

  } catch (error: any) {
    return NextResponse.json({ error: "DARK_POOL_ERROR", message: error.message }, { status: 500 });
  }
}
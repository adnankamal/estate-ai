import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    
    // Payload extraction (Beds/Baths optional hain)
    const { propertyType, price, beds, baths } = rawBody.payload || {}; 

    const numericAmount = Number(price);
    
    // Strict validation sirf core metrics par
    if (!propertyType || isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "INVALID_TRANSACTION_METRICS" }, { status: 400 });
    }

    // Database insertion with flexible fields — FIXED: ts(2769) bypass
    const { error: dbError } = await (supabaseAdmin as any).from("transactions").insert([
      {
        property_name: propertyType,
        amount: numericAmount,
        beds: beds ? Number(beds) : null,
        baths: baths ? Number(baths) : null,
        status: "completed"
      }
    ]);

    if (dbError) {
      console.error("SUPABASE_PERSISTENCE_REJECTION:", dbError.message);
      throw new Error(dbError.message);
    }

    return NextResponse.json({ success: true, message: "Transaction processed" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "INTERNAL_EXECUTION_ERROR" }, { status: 500 });
  }
}
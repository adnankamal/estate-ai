import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("CRITICAL_CONFIGURATION_MISSING: Core secure keys must be initialised.");
}

// Admin client strictly scoped for backend tasks
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export async function POST(req: Request) {
  try {
    // 1. Extract the correct data from the 'payload' wrapper
    const rawBody = await req.json();
    const { propertyType, price } = rawBody.payload;

    // 2. Convert the string price ("10000000") to a valid number
    const numericAmount = Number(price);

    // 3. Apply the strict validation check
    if (!propertyType || isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "INVALID_TRANSACTION_METRICS" }, { status: 400 });
    }

    // 4. Map the correctly extracted variables to your database columns
    const { error: dbError } = await supabaseAdmin.from("transactions").insert([
      {
        property_name: propertyType,
        amount: numericAmount,
        status: "completed"
      }
    ]);

    if (dbError) {
      console.error("SUPABASE_PERSISTENCE_REJECTION:", dbError.message);
      throw new Error(dbError.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "INTERNAL_EXECUTION_ERROR" }, { status: 500 });
  }
}
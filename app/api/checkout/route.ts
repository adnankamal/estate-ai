import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("CRITICAL_CONFIGURATION_MISSING: Core secure keys must be initialised.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export async function POST(req: Request) {
  try {
    const { amount, propertyName } = await req.json();

    if (!propertyName || typeof amount !== 'number') {
      return NextResponse.json({ error: "INVALID_TRANSACTION_METRICS" }, { status: 400 });
    }

    const { error: dbError } = await supabase.from("transactions").insert([
      {
        property_name: propertyName,
        amount: amount,
        status: "completed",
        created_at: new Date().toISOString(),
      },
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
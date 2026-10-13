import { NextResponse } from "next/server";
import { readAuthSession } from "@/lib/sessionCookie";
import { supabaseConfigured } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });
  }
  const session = await readAuthSession();
  return NextResponse.json({ session });
}

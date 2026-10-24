import { NextResponse } from "next/server";
import { readAuthSession } from "@/lib/sessionCookie";
import { supabaseConfigured } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Public: tells the app whether this browser is signed in. It no longer
// lists staff names, since the login screen has people type their own name.
export async function GET() {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });
  }
  try {
    const session = await readAuthSession();
    return NextResponse.json({ session });
  } catch (error) {
    console.error("session check failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "session_unavailable" }, { status: 500 });
  }
}

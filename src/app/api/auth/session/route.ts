import { NextResponse } from "next/server";
import { readAuthSession } from "@/lib/sessionCookie";
import { loadShop } from "@/lib/shopStore";
import { supabaseConfigured } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });
  }
  const session = await readAuthSession();
  try {
    const data = await loadShop();
    const staff = data.employees
      .filter((item) => item.active)
      .map((item) => ({ id: item.id, name: item.name }));
    return NextResponse.json({ session, staff });
  } catch (error) {
    console.error("session roster failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ session, staff: [] });
  }
}

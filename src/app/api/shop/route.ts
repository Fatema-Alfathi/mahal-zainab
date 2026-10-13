import { NextResponse } from "next/server";
import { clearAuthCookie, readAuthSession } from "@/lib/sessionCookie";
import { loadShop, plausibleShopToday, saveShopAction, sessionAllows } from "@/lib/shopStore";
import { supabaseConfigured } from "@/lib/supabaseAdmin";
import { todayIso } from "@/lib/format";
import type { Action } from "@/lib/shopReducer";

export const runtime = "nodejs";

const BLOCKED = new Set(["sign-in", "sign-out", "hydrate-employees"]);

export async function GET() {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });
  }
  const session = await readAuthSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const data = await loadShop();
    if (!sessionAllows(session, data)) {
      await clearAuthCookie();
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("shop load failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "shop_unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });
  }
  const session = await readAuthSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { action?: Action; today?: unknown } | null;
  const action = body?.action;
  if (!action || typeof action !== "object" || typeof action.type !== "string" || BLOCKED.has(action.type)) {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }
  const today = typeof body?.today === "string" && plausibleShopToday(body.today) ? body.today : todayIso();
  try {
    const current = await loadShop();
    if (!sessionAllows(session, current)) {
      await clearAuthCookie();
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const data = await saveShopAction(session, action, today);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("shop save failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "shop_unavailable" }, { status: 500 });
  }
}

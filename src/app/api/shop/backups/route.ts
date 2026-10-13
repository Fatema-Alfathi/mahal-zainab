import { NextResponse } from "next/server";
import { clearAuthCookie, readAuthSession } from "@/lib/sessionCookie";
import { isBackupDate, listDailyBackups } from "@/lib/shopBackups";
import { loadShop, plausibleShopToday, restoreDailyBackup, sessionAllows } from "@/lib/shopStore";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabaseAdmin";
import { todayIso } from "@/lib/format";

export const runtime = "nodejs";

async function ownerSession() {
  const session = await readAuthSession();
  if (!session || session.role !== "owner") return null;
  const data = await loadShop();
  if (!sessionAllows(session, data)) {
    await clearAuthCookie();
    return null;
  }
  return session;
}

export async function GET() {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });
  }
  try {
    const session = await ownerSession();
    if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const backups = await listDailyBackups(supabaseAdmin());
    return NextResponse.json({ backups });
  } catch (error) {
    console.error("backup list failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "shop_unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as { date?: unknown; today?: unknown } | null;
  const date = typeof body?.date === "string" ? body.date : "";
  if (!isBackupDate(date)) return NextResponse.json({ error: "missing" }, { status: 400 });
  const today = typeof body?.today === "string" && plausibleShopToday(body.today) ? body.today : todayIso();
  try {
    const session = await ownerSession();
    if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const data = await restoreDailyBackup(session, date, today);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "missing") return NextResponse.json({ error: "missing" }, { status: 404 });
    if (message === "forbidden") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    console.error("backup restore failed", message);
    return NextResponse.json({ error: "shop_unavailable" }, { status: 500 });
  }
}

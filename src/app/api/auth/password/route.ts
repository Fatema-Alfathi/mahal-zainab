import { NextResponse } from "next/server";
import { readAuthSession } from "@/lib/sessionCookie";
import { setOwnerPassword } from "@/lib/shopAuth";
import { supabaseConfigured } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });
  }
  const session = await readAuthSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { current?: unknown; next?: unknown } | null;
  const current = typeof body?.current === "string" ? body.current : "";
  const next = typeof body?.next === "string" ? body.next : "";
  try {
    const result = await setOwnerPassword(current, next);
    if (result === "ok") return NextResponse.json({ ok: true });
    return NextResponse.json({ error: result }, { status: 400 });
  } catch (error) {
    console.error("owner password change failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}

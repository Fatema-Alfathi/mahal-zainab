import { NextResponse } from "next/server";
import { writeAuthCookie } from "@/lib/sessionCookie";
import { authenticate, loadShop } from "@/lib/shopStore";
import { supabaseConfigured } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as { username?: unknown; password?: unknown } | null;
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";
  try {
    const data = await loadShop();
    const session = await authenticate(data, username, password);
    if (!session) {
      return NextResponse.json({ error: "invalid_login" }, { status: 401 });
    }
    await writeAuthCookie(session);
    return NextResponse.json({ session, data });
  } catch (error) {
    console.error("login failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "shop_unavailable" }, { status: 500 });
  }
}

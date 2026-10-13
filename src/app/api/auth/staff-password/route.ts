import { NextResponse } from "next/server";
import { readAuthSession } from "@/lib/sessionCookie";
import { removeStaffPassword, setStaffPassword } from "@/lib/shopAuth";
import { loadShop, sessionAllows } from "@/lib/shopStore";
import { supabaseConfigured } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

async function ownerShop() {
  const session = await readAuthSession();
  if (!session || session.role !== "owner") return null;
  const data = await loadShop();
  if (!sessionAllows(session, data)) return null;
  return data;
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as { employeeId?: unknown; password?: unknown } | null;
  const employeeId = typeof body?.employeeId === "string" ? body.employeeId : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!employeeId) return NextResponse.json({ error: "forbidden" }, { status: 400 });
  try {
    const shop = await ownerShop();
    if (!shop || !shop.employees.some((item) => item.id === employeeId)) {
      return NextResponse.json({ error: "forbidden" }, { status: 401 });
    }
    const result = await setStaffPassword(employeeId, password);
    if (result !== "ok") return NextResponse.json({ error: result }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("staff password change failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as { employeeId?: unknown } | null;
  const employeeId = typeof body?.employeeId === "string" ? body.employeeId : "";
  if (!employeeId) return NextResponse.json({ error: "forbidden" }, { status: 400 });
  try {
    const shop = await ownerShop();
    if (!shop) return NextResponse.json({ error: "forbidden" }, { status: 401 });
    await removeStaffPassword(employeeId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("staff password removal failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}

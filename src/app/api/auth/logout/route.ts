import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/sessionCookie";

export const runtime = "nodejs";

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}

import { cookies } from "next/headers";
import type { AuthSession } from "@/lib/auth";
import { currentPasswordFingerprint } from "@/lib/shopAuth";
import { openSession, sealSession, SESSION_MAX_AGE_SECONDS } from "@/lib/sessionToken";

const COOKIE = "yal_session";

export async function readAuthSession(): Promise<AuthSession | null> {
  const jar = await cookies();
  const opened = openSession(jar.get(COOKIE)?.value);
  if (!opened) return null;
  const current = await currentPasswordFingerprint(opened.session);
  if (!current || current !== opened.pw) return null;
  return opened.session;
}

export async function writeAuthCookie(session: AuthSession) {
  const pw = await currentPasswordFingerprint(session);
  if (!pw) throw new Error("password missing");
  const jar = await cookies();
  jar.set(COOKIE, sealSession(session, pw), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

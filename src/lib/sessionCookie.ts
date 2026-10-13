import { cookies } from "next/headers";
import type { AuthSession } from "@/lib/auth";
import { openSession, sealSession, SESSION_MAX_AGE_SECONDS } from "@/lib/sessionToken";

const COOKIE = "yal_session";

export async function readAuthSession(): Promise<AuthSession | null> {
  const jar = await cookies();
  return openSession(jar.get(COOKIE)?.value);
}

export async function writeAuthCookie(session: AuthSession) {
  const jar = await cookies();
  jar.set(COOKIE, sealSession(session), {
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

import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { AuthSession } from "@/lib/auth";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

// pw is a short fingerprint of the password hash the user signed in with.
// When that password changes, old cookies stop matching and are refused.
type SealedSession = AuthSession & { exp: number; pw: string };

export type OpenedSession = { session: AuthSession; pw: string };

export function passwordFingerprint(hash: string): string {
  return createHash("sha256").update(hash).digest("base64url").slice(0, 16);
}

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error("SESSION_SECRET missing");
  }
  return value;
}

export function sealSession(session: AuthSession, pw: string): string {
  const payload: SealedSession = {
    role: session.role,
    name: session.name,
    employeeId: session.employeeId,
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
    pw,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function openSession(token: string | undefined): OpenedSession | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString()) as SealedSession;
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    if (parsed.role !== "owner" && parsed.role !== "employee") return null;
    if (!parsed.name) return null;
    if (typeof parsed.pw !== "string" || !parsed.pw) return null;
    return {
      session: { role: parsed.role, name: parsed.name, employeeId: parsed.employeeId ?? "" },
      pw: parsed.pw,
    };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE_SECONDS = MAX_AGE_SECONDS;

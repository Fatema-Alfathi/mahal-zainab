import { createHmac, timingSafeEqual } from "crypto";
import type { AuthSession } from "@/lib/auth";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

type SealedSession = AuthSession & { exp: number };

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error("SESSION_SECRET missing");
  }
  return value;
}

export function sealSession(session: AuthSession): string {
  const payload: SealedSession = {
    role: session.role,
    name: session.name,
    employeeId: session.employeeId,
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function openSession(token: string | undefined): AuthSession | null {
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
    return { role: parsed.role, name: parsed.name, employeeId: parsed.employeeId ?? "" };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE_SECONDS = MAX_AGE_SECONDS;

// Slows down password guessing. After MAX_FAILURES wrong tries from the same
// address (whatever name was typed), that address is locked for LOCK_MS.
// Kept in server memory: it resets on restart and is per server instance,
// so it is a brake, not a wall. Strong passwords are still the real defence.

const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_ENTRIES = 5000;

type Entry = { failures: number; firstAt: number; lockedUntil: number };

const entries = new Map<string, Entry>();

export function isLocked(key: string, now = Date.now()): boolean {
  const entry = entries.get(key);
  return Boolean(entry && entry.lockedUntil > now);
}

export function recordFailure(key: string, now = Date.now()) {
  let entry = entries.get(key);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    entry = { failures: 0, firstAt: now, lockedUntil: 0 };
  }
  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) {
    entry.lockedUntil = now + LOCK_MS;
    entry.failures = 0;
    entry.firstAt = now;
  }
  entries.delete(key);
  entries.set(key, entry);
  if (entries.size > MAX_ENTRIES) {
    const oldest = entries.keys().next().value;
    if (oldest !== undefined) entries.delete(oldest);
  }
}

export function recordSuccess(key: string) {
  entries.delete(key);
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function resetLoginThrottle() {
  entries.clear();
}

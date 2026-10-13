export const PASSWORD_KEY = "yal-auth-passwords";
export const DEFAULT_OWNER_PASSWORD = "yal";
export const DEFAULT_STAFF_PASSWORD = "1234";
export const MIN_PASSWORD_LENGTH = 3;

export type PasswordStore = {
  owner: string;
  staff: Record<string, string>;
};

export function sanitizePassword(value: string): string | null {
  const next = value.trim();
  if (next.length < MIN_PASSWORD_LENGTH) return null;
  return next;
}

export function defaultPasswordStore(): PasswordStore {
  return { owner: DEFAULT_OWNER_PASSWORD, staff: {} };
}

export function readPasswords(): PasswordStore {
  if (typeof window === "undefined") return defaultPasswordStore();
  try {
    const raw = window.localStorage.getItem(PASSWORD_KEY);
    if (!raw) return defaultPasswordStore();
    const parsed = JSON.parse(raw) as Partial<PasswordStore>;
    const owner = typeof parsed.owner === "string" ? parsed.owner.trim() : "";
    const staff =
      parsed.staff && typeof parsed.staff === "object" && !Array.isArray(parsed.staff)
        ? Object.fromEntries(
            Object.entries(parsed.staff).filter(
              (entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string",
            ),
          )
        : {};
    return {
      owner: owner || DEFAULT_OWNER_PASSWORD,
      staff,
    };
  } catch {
    return defaultPasswordStore();
  }
}

export function writePasswords(store: PasswordStore) {
  window.localStorage.setItem(PASSWORD_KEY, JSON.stringify(store));
}

export function ownerPassword(store: PasswordStore): string {
  return store.owner || DEFAULT_OWNER_PASSWORD;
}

export function staffPassword(store: PasswordStore, employeeId: string): string {
  return store.staff[employeeId] || DEFAULT_STAFF_PASSWORD;
}

export function passwordMatches(typed: string, stored: string): boolean {
  const pass = typed.trim();
  const expected = stored.trim();
  if (!pass || !expected) return false;
  if (pass === expected) return true;
  if (expected === DEFAULT_OWNER_PASSWORD) return pass.toLowerCase() === expected;
  return false;
}

export function setOwnerPasswordInStore(
  store: PasswordStore,
  current: string,
  next: string,
): PasswordStore | "wrong-current" | "too-short" {
  if (!passwordMatches(current, ownerPassword(store))) return "wrong-current";
  const sanitized = sanitizePassword(next);
  if (!sanitized) return "too-short";
  return { ...store, owner: sanitized };
}

export function setStaffPasswordInStore(
  store: PasswordStore,
  employeeId: string,
  next: string,
): PasswordStore | "too-short" {
  const sanitized = sanitizePassword(next);
  if (!sanitized) return "too-short";
  return {
    ...store,
    staff: { ...store.staff, [employeeId]: sanitized },
  };
}

export function removeStaffPasswordInStore(store: PasswordStore, employeeId: string): PasswordStore {
  if (!(employeeId in store.staff)) return store;
  const staff = { ...store.staff };
  delete staff[employeeId];
  return { ...store, staff };
}

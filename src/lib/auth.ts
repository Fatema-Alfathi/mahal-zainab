import type { Employee, UserRole } from "@/types";
import {
  DEFAULT_OWNER_PASSWORD,
  DEFAULT_STAFF_PASSWORD,
  ownerPassword,
  passwordMatches,
  readPasswords,
  staffPassword,
  type PasswordStore,
} from "@/lib/passwords";

export const SESSION_KEY = "yal-auth-session";
export const OWNER_PASSWORD = DEFAULT_OWNER_PASSWORD;
export const STAFF_PASSWORD = DEFAULT_STAFF_PASSWORD;

const OWNER_ALIASES = ["مالك", "المالكة", "owner", "yal"];

export type AuthSession = {
  role: UserRole;
  name: string;
  employeeId: string;
};

export function compactLoginName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function isReservedOwnerName(name: string): boolean {
  const user = compactLoginName(name);
  return Boolean(user) && OWNER_ALIASES.some((alias) => compactLoginName(alias) === user);
}

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

export function verifyLogin(
  employees: Employee[],
  username: string,
  password: string,
  store: PasswordStore = readPasswords(),
): AuthSession | null {
  const user = compactLoginName(username);
  const pass = password.trim();
  if (!user || !pass) return null;

  if (OWNER_ALIASES.some((alias) => compactLoginName(alias) === user) && passwordMatches(pass, ownerPassword(store))) {
    return { role: "owner", name: "المالكة", employeeId: "" };
  }

  const employee = employees.find((item) => {
    if (!item.active) return false;
    const name = compactLoginName(item.name);
    const number = compactLoginName(item.number);
    const phone = digits(item.phone);
    const typedPhone = digits(username);
    return (
      name === user ||
      name.startsWith(user) ||
      number === user ||
      number.replace(/-/g, "") === user ||
      (typedPhone.length >= 8 && phone === typedPhone)
    );
  });
  if (!employee) return null;
  if (!passwordMatches(pass, staffPassword(store, employee.id))) return null;
  return { role: "employee", name: employee.name, employeeId: employee.id };
}

export function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed.role !== "owner" && parsed.role !== "employee") return null;
    if (!parsed.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session: AuthSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

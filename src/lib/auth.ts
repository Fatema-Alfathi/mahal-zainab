import type { Employee, UserRole } from "@/types";

export const SESSION_KEY = "yal-auth-session";
export const OWNER_PASSWORD = "yal";
export const STAFF_PASSWORD = "1234";

const OWNER_ALIASES = ["مالك", "المالكة", "owner", "yal"];

export type AuthSession = {
  role: UserRole;
  name: string;
  employeeId: string;
};

function compact(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

export function verifyLogin(employees: Employee[], username: string, password: string): AuthSession | null {
  const user = compact(username);
  const pass = password.trim();
  if (!user || !pass) return null;

  if (OWNER_ALIASES.some((alias) => compact(alias) === user) && pass.toLowerCase() === OWNER_PASSWORD) {
    return { role: "owner", name: "المالكة", employeeId: "" };
  }

  if (pass !== STAFF_PASSWORD) return null;

  const employee = employees.find((item) => {
    if (!item.active) return false;
    const name = compact(item.name);
    const number = compact(item.number);
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

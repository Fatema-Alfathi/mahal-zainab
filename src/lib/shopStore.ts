import type { SupabaseClient } from "@supabase/supabase-js";
import { findEmployeeForLogin, isOwnerLogin, type AuthSession } from "@/lib/auth";
import { blankShop } from "@/lib/blankShop";
import { todayIso, withShopToday } from "@/lib/format";
import { assignInvoiceNumbers } from "@/lib/invoices";
import { parseShopBackup, snapshotFromState, type ShopSnapshot } from "@/lib/shopBackup";
import { shopReducer, type Action } from "@/lib/shopReducer";
import { ownerPasswordMatches, staffPasswordMatches } from "@/lib/shopAuth";
import { keepDailyBackup, readDailyBackup } from "@/lib/shopBackups";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Booking, ShopState } from "@/types";

const BLOCKED_ACTIONS = new Set(["sign-in", "sign-out", "hydrate-employees"]);

type ShopRow = { version: number; payload: ShopSnapshot };

export function seedShop(): ShopSnapshot {
  return blankShop();
}

export function normalizeSnapshot(value: unknown): ShopSnapshot | null {
  const parsed = parseShopBackup(value);
  if (!parsed) return null;
  return {
    ...parsed,
    bookings: assignInvoiceNumbers(
      parsed.bookings.map((booking) => ({
        ...booking,
        invoiceNumber: booking.invoiceNumber ?? "",
        bookedByEmployeeId: booking.bookedByEmployeeId ?? "",
        payments: Array.isArray(booking.payments) ? booking.payments : [],
      })) as Booking[],
    ),
  };
}

export function plausibleShopToday(today: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return false;
  const client = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(client)) return false;
  const serverDay = Date.parse(`${todayIso()}T00:00:00Z`);
  return Math.abs(client - serverDay) <= 36 * 60 * 60 * 1000;
}

export function sessionAllows(session: AuthSession, data: ShopSnapshot): boolean {
  if (session.role === "owner") return true;
  return data.employees.some((item) => item.id === session.employeeId && item.active);
}

export function applyShopAction(
  data: ShopSnapshot,
  session: AuthSession,
  action: Action,
  today: string,
): ShopSnapshot {
  if (BLOCKED_ACTIONS.has(action.type)) return data;
  const state: ShopState = {
    ...data,
    role: session.role,
    signedIn: true,
    sessionName: session.name,
    employeeId: session.employeeId,
  };
  const next = withShopToday(today, () => shopReducer(state, action));
  return snapshotFromState(next);
}

async function readRow(client: SupabaseClient): Promise<ShopRow | null> {
  const { data, error } = await client.from("shop_state").select("version, payload").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const payload = normalizeSnapshot(data.payload);
  if (!payload || typeof data.version !== "number") throw new Error("shop_state payload is invalid");
  return { version: data.version, payload };
}

export async function loadShop(): Promise<ShopSnapshot> {
  const client = supabaseAdmin();
  const existing = await readRow(client);
  if (existing) return existing.payload;
  const seed = seedShop();
  const { error } = await client.from("shop_state").insert({ id: 1, version: 1, payload: seed });
  if (!error) return seed;
  const again = await readRow(client);
  if (again) return again.payload;
  throw new Error(error.message);
}

export async function saveShopAction(session: AuthSession, action: Action, today: string): Promise<ShopSnapshot> {
  const client = supabaseAdmin();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let row = await readRow(client);
    if (!row) {
      await loadShop();
      row = await readRow(client);
      if (!row) throw new Error("shop_state missing");
    }
    const next = applyShopAction(row.payload, session, action, today);
    await keepDailyBackup(client, today, row.version, row.payload);
    const { data, error } = await client
      .from("shop_state")
      .update({
        payload: next,
        version: row.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .eq("version", row.version)
      .select("version, payload")
      .maybeSingle();
    if (error) throw new Error(error.message);
    const payload = data ? normalizeSnapshot(data.payload) : null;
    if (payload) return payload;
  }
  throw new Error("shop_state version conflict");
}

export async function restoreDailyBackup(session: AuthSession, date: string, today: string): Promise<ShopSnapshot> {
  if (session.role !== "owner") throw new Error("forbidden");
  const snapshot = await readDailyBackup(supabaseAdmin(), date);
  if (!snapshot) throw new Error("missing");
  return saveShopAction(session, { type: "hydrate-shop", snapshot }, today);
}

export async function authenticate(
  data: ShopSnapshot,
  username: string,
  password: string,
): Promise<AuthSession | null> {
  const pass = password.trim();
  if (!pass) return null;
  if (isOwnerLogin(username)) {
    const folded = pass.toLowerCase();
    const ok = (await ownerPasswordMatches(pass)) || (folded !== pass && (await ownerPasswordMatches(folded)));
    if (!ok) return null;
    return { role: "owner", name: "المالكة", employeeId: "" };
  }
  const employee = findEmployeeForLogin(data.employees, username);
  if (!employee || !(await staffPasswordMatches(employee.id, pass))) return null;
  return { role: "employee", name: employee.name, employeeId: employee.id };
}

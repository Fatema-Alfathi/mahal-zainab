import type { SupabaseClient } from "@supabase/supabase-js";
import { verifyLogin, type AuthSession } from "@/lib/auth";
import { todayIso, withShopToday } from "@/lib/format";
import { initialState, shopReducer, type Action } from "@/lib/shopReducer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { PersistedShop, ShopState } from "@/types";

const BLOCKED_ACTIONS = new Set(["sign-in", "sign-out", "replace-data"]);

type ShopRow = { version: number; payload: PersistedShop };

export function toPersisted(state: ShopState): PersistedShop {
  return {
    dresses: state.dresses,
    customers: state.customers,
    employees: state.employees,
    governmentRecords: state.governmentRecords,
    fixedExpenses: state.fixedExpenses,
    variableExpenses: state.variableExpenses,
    bookings: state.bookings,
    discountPolicy: state.discountPolicy,
  };
}

export function seedShop(): PersistedShop {
  return toPersisted(initialState);
}

export function isPersistedShop(value: unknown): value is PersistedShop {
  if (!value || typeof value !== "object") return false;
  const row = value as PersistedShop;
  return (
    Array.isArray(row.dresses) &&
    Array.isArray(row.customers) &&
    Array.isArray(row.employees) &&
    Array.isArray(row.governmentRecords) &&
    Array.isArray(row.fixedExpenses) &&
    Array.isArray(row.variableExpenses) &&
    Array.isArray(row.bookings) &&
    Boolean(row.discountPolicy) &&
    typeof row.discountPolicy === "object"
  );
}

export function plausibleShopToday(today: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return false;
  const client = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(client)) return false;
  const serverDay = Date.parse(`${todayIso()}T00:00:00Z`);
  return Math.abs(client - serverDay) <= 36 * 60 * 60 * 1000;
}

export function sessionAllows(session: AuthSession, data: PersistedShop): boolean {
  if (session.role === "owner") return true;
  return data.employees.some((item) => item.id === session.employeeId && item.active);
}

export function applyShopAction(
  data: PersistedShop,
  session: AuthSession,
  action: Action,
  today: string,
): PersistedShop {
  if (BLOCKED_ACTIONS.has(action.type)) return data;
  const state: ShopState = {
    ...data,
    role: session.role,
    signedIn: true,
    sessionName: session.name,
    employeeId: session.employeeId,
  };
  return toPersisted(withShopToday(today, () => shopReducer(state, action)));
}

async function readRow(client: SupabaseClient): Promise<ShopRow | null> {
  const { data, error } = await client.from("shop_state").select("version, payload").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  if (!isPersistedShop(data.payload) || typeof data.version !== "number") {
    throw new Error("shop_state payload is invalid");
  }
  return { version: data.version, payload: data.payload };
}

export async function loadShop(): Promise<PersistedShop> {
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

export async function saveShopAction(session: AuthSession, action: Action, today: string): Promise<PersistedShop> {
  const client = supabaseAdmin();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let row = await readRow(client);
    if (!row) {
      await loadShop();
      row = await readRow(client);
      if (!row) throw new Error("shop_state missing");
    }
    const next = applyShopAction(row.payload, session, action, today);
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
    if (data && isPersistedShop(data.payload)) return data.payload;
  }
  throw new Error("shop_state version conflict");
}

export function authenticate(data: PersistedShop, username: string, password: string): AuthSession | null {
  return verifyLogin(data.employees, username, password);
}

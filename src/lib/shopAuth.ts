import { sanitizePassword } from "@/lib/passwords";
import { hashPassword, verifyPassword } from "@/lib/passwordHash";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type AuthRow = {
  owner_hash: string;
  staff_hashes: Record<string, string>;
};

function staffMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

export async function readAuth(): Promise<AuthRow | null> {
  const client = supabaseAdmin();
  const { data, error } = await client.from("shop_auth").select("owner_hash, staff_hashes").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || typeof data.owner_hash !== "string" || !data.owner_hash) return null;
  return { owner_hash: data.owner_hash, staff_hashes: staffMap(data.staff_hashes) };
}

export async function setOwnerPassword(
  current: string,
  next: string,
): Promise<"ok" | "wrong-current" | "too-short" | "missing"> {
  const sanitized = sanitizePassword(next);
  if (!sanitized) return "too-short";
  const row = await readAuth();
  if (!row) return "missing";
  if (!(await verifyPassword(current, row.owner_hash))) return "wrong-current";
  const owner_hash = await hashPassword(sanitized);
  const { error } = await supabaseAdmin()
    .from("shop_auth")
    .update({ owner_hash, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  return "ok";
}

export async function setStaffPassword(employeeId: string, password: string): Promise<"ok" | "too-short"> {
  const sanitized = sanitizePassword(password);
  if (!sanitized) return "too-short";
  const row = await readAuth();
  if (!row) throw new Error("shop_auth missing");
  const staff_hashes = { ...row.staff_hashes, [employeeId]: await hashPassword(sanitized) };
  const { error } = await supabaseAdmin()
    .from("shop_auth")
    .update({ staff_hashes, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  return "ok";
}

export async function removeStaffPassword(employeeId: string) {
  const row = await readAuth();
  if (!row || !(employeeId in row.staff_hashes)) return;
  const staff_hashes = { ...row.staff_hashes };
  delete staff_hashes[employeeId];
  const { error } = await supabaseAdmin()
    .from("shop_auth")
    .update({ staff_hashes, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw new Error(error.message);
}

export async function ownerPasswordMatches(password: string): Promise<boolean> {
  const row = await readAuth();
  if (!row) return false;
  return verifyPassword(password, row.owner_hash);
}

export async function staffPasswordMatches(employeeId: string, password: string): Promise<boolean> {
  const row = await readAuth();
  const hash = row?.staff_hashes[employeeId];
  if (!hash) return false;
  return verifyPassword(password, hash);
}

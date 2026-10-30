import { hashPassword } from "@/lib/passwordHash";
import { MIN_PASSWORD_LENGTH, sanitizePassword } from "@/lib/passwords";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type OwnerSetupResult = { ok: true; hash: string } | { ok: false; reason: "too-short" | "mismatch" };

// Checks the two typed passwords and returns the stored hash for the owner.
export async function ownerHashFor(password: string, confirm: string): Promise<OwnerSetupResult> {
  const sanitized = sanitizePassword(password);
  if (!sanitized) return { ok: false, reason: "too-short" };
  if (sanitized !== confirm.trim()) return { ok: false, reason: "mismatch" };
  return { ok: true, hash: await hashPassword(sanitized) };
}

// SQL to paste into the Supabase SQL editor. Keeps the staff passwords.
export function ownerSetupSql(hash: string): string {
  if (!/^scrypt\$[A-Za-z0-9+/=$]+$/.test(hash)) throw new Error("unexpected hash format");
  return [
    "insert into public.shop_auth (id, owner_hash)",
    `values (1, '${hash}')`,
    "on conflict (id) do update",
    "set owner_hash = excluded.owner_hash, updated_at = now();",
  ].join("\n");
}

// Saves the owner hash straight to Supabase. Keeps the staff passwords.
export async function saveOwnerHash(hash: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("shop_auth")
    .upsert({ id: 1, owner_hash: hash, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export { MIN_PASSWORD_LENGTH };

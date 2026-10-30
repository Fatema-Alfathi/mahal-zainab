import { test } from "node:test";
import assert from "node:assert/strict";
import { ownerHashFor, ownerSetupSql } from "@/lib/ownerSetup";
import { verifyPassword } from "@/lib/passwordHash";

test("owner setup refuses short or mismatched passwords", async () => {
  assert.deepEqual(await ownerHashFor("abc", "abc"), { ok: false, reason: "too-short" });
  assert.deepEqual(await ownerHashFor("secret12", "secret13"), { ok: false, reason: "mismatch" });
});

test("owner setup hash verifies and goes into upsert SQL", async () => {
  const result = await ownerHashFor("  secret12 ", "secret12");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(await verifyPassword("secret12", result.hash), true);
  const sql = ownerSetupSql(result.hash);
  assert.match(sql, /insert into public\.shop_auth/);
  assert.match(sql, /on conflict \(id\) do update/);
  assert.ok(sql.includes(result.hash));
  assert.doesNotMatch(sql, /staff_hashes/);
});

test("owner setup SQL rejects anything that is not a hash", () => {
  assert.throws(() => ownerSetupSql("x'); drop table shop_auth; --"));
});

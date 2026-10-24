import { createHmac } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { applyShopAction, visibleShop } from "@/lib/shopStore";
import { blankShop } from "@/lib/blankShop";
import { isLocked, recordFailure, resetLoginThrottle } from "@/lib/loginThrottle";
import { openSession, passwordFingerprint, sealSession } from "@/lib/sessionToken";
import { MIN_PASSWORD_LENGTH, sanitizePassword } from "@/lib/passwords";
import type { AuthSession } from "@/lib/auth";
import type { ShopSnapshot } from "@/lib/shopBackup";
import type { Dress, Employee } from "@/types";

process.env.SESSION_SECRET = "test-secret-at-least-16-chars";

const owner: AuthSession = { role: "owner", name: "المالكة", employeeId: "" };
const staff: AuthSession = { role: "employee", name: "سارة", employeeId: "e1" };
const TODAY = "2026-10-24";

function sampleShop(): ShopSnapshot {
  const shop = blankShop();
  shop.employees = [
    {
      id: "e1",
      number: "1",
      name: "سارة",
      phone: "0500000000",
      jobTitle: "",
      salary: 4000,
      startDate: "2026-01-01",
      active: true,
      notes: "ملاحظة خاصة",
    } as Employee,
  ];
  shop.customers = [{ id: "c1", name: "عميلة", phone: "0511111111" } as ShopSnapshot["customers"][number]];
  shop.dresses = [
    {
      id: "d1",
      name: "فستان",
      purchaseDate: "2026-01-01",
      purchasePrice: 9000,
      shippingCost: 300,
      customsCost: 200,
      totalMaintenanceCost: 150,
      rentalPricePerDay: 500,
      insuranceAmount: 1000,
    } as Dress,
  ];
  shop.governmentRecords = [{ id: "g1" } as ShopSnapshot["governmentRecords"][number]];
  shop.fixedExpenses = [{ id: "f1" } as ShopSnapshot["fixedExpenses"][number]];
  shop.variableExpenses = [{ id: "v1" } as ShopSnapshot["variableExpenses"][number]];
  return shop;
}

test("staff cannot replace the whole shop", () => {
  const shop = sampleShop();
  const wipe = { ...shop, customers: [], dresses: [], bookings: [] };
  const out = applyShopAction(shop, staff, { type: "hydrate-shop", snapshot: wipe }, TODAY);
  assert.equal(out.customers.length, 1);
  assert.equal(out.dresses.length, 1);
});

test("owner can still restore the shop from a file", () => {
  const shop = sampleShop();
  const restored = { ...shop, customers: [] };
  const out = applyShopAction(shop, owner, { type: "hydrate-shop", snapshot: restored }, TODAY);
  assert.equal(out.customers.length, 0);
});

test("staff do not receive owner-only data", () => {
  const out = visibleShop(staff, sampleShop());
  assert.deepEqual(out.governmentRecords, []);
  assert.deepEqual(out.fixedExpenses, []);
  assert.deepEqual(out.variableExpenses, []);
  assert.equal(out.dresses[0].purchasePrice, 0);
  assert.equal(out.dresses[0].shippingCost, 0);
  assert.equal(out.dresses[0].customsCost, 0);
  assert.equal(out.dresses[0].purchaseDate, "");
  assert.equal(out.dresses[0].totalMaintenanceCost, 0);
  assert.equal(out.employees[0].salary, 0);
  assert.equal(out.employees[0].phone, "");
  assert.equal(out.employees[0].notes, "");
  // What staff need for their work stays.
  assert.equal(out.customers.length, 1);
  assert.equal(out.dresses[0].rentalPricePerDay, 500);
  assert.equal(out.employees[0].name, "سارة");
});

test("owner receives everything", () => {
  const shop = sampleShop();
  assert.equal(visibleShop(owner, shop), shop);
});

test("too many wrong logins lock the address", () => {
  resetLoginThrottle();
  const now = 1_000_000;
  for (let i = 0; i < 9; i += 1) recordFailure("1.2.3.4", now);
  assert.equal(isLocked("1.2.3.4", now), false);
  recordFailure("1.2.3.4", now);
  assert.equal(isLocked("1.2.3.4", now), true);
  assert.equal(isLocked("5.6.7.8", now), false);
  assert.equal(isLocked("1.2.3.4", now + 16 * 60 * 1000), false);
});

test("session cookie carries the password fingerprint", () => {
  const pw = passwordFingerprint("scrypt$hash-one");
  const opened = openSession(sealSession(owner, pw));
  assert.ok(opened);
  assert.equal(opened.pw, pw);
  assert.notEqual(opened.pw, passwordFingerprint("scrypt$hash-two"));
});

test("tampered or old-style cookies are refused", () => {
  const token = sealSession(owner, passwordFingerprint("x"));
  const [body] = token.split(".");
  assert.equal(openSession(`${body}.bad`), null);
  const oldStyle = Buffer.from(JSON.stringify({ ...owner, exp: Date.now() + 60_000 })).toString("base64url");
  const signature = createHmac("sha256", process.env.SESSION_SECRET!).update(oldStyle).digest("base64url");
  assert.equal(openSession(`${oldStyle}.${signature}`), null);
});

test("new passwords must be at least 6 characters", () => {
  assert.equal(MIN_PASSWORD_LENGTH, 6);
  assert.equal(sanitizePassword("12345"), null);
  assert.equal(sanitizePassword("123456"), "123456");
});

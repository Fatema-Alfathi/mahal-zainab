import assert from "node:assert/strict";
import { sealSession, openSession } from "../src/lib/sessionToken";
import { applyShopAction, plausibleShopToday, seedShop } from "../src/lib/shopStore";
import { todayIso } from "../src/lib/format";

process.env.SESSION_SECRET = "test-session-secret-16";

const owner = { role: "owner" as const, name: "المالكة", employeeId: "" };
const token = sealSession(owner);
assert.deepEqual(openSession(token), owner);
assert.equal(openSession(`${token}x`), null);

const seeded = seedShop();
const saved = applyShopAction(
  seeded,
  owner,
  {
    type: "add-customer",
    draft: { number: "C-TEST", name: "اختبار", phone: "96890000000", eventDate: "", notes: "" },
  },
  todayIso(),
);
assert.equal(saved.customers[0]?.name, "اختبار");
assert.equal(saved.customers.length, seeded.customers.length + 1);

const blocked = applyShopAction(seeded, owner, { type: "replace-data", data: { ...seeded, customers: [] } }, todayIso());
assert.equal(blocked.customers.length, seeded.customers.length);
assert.equal(plausibleShopToday(todayIso()), true);
assert.equal(plausibleShopToday("1999-01-01"), false);

console.log("shop store checks passed");

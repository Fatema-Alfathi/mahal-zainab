import { test } from "node:test";
import assert from "node:assert/strict";
import { ownerHistory } from "@/lib/ownerSnapshot";

test("no highest or lowest month when every month has the same income", () => {
  const history = ownerHistory([], [], [], "2026-10-30");
  assert.ok(history.months.length >= 1);
  assert.equal(history.highestIncomeMonth, null);
  assert.equal(history.lowestIncomeMonth, null);
  assert.equal(history.highestIncomeYear, null);
});

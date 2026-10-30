import { test } from "node:test";
import assert from "node:assert/strict";
import { codeFor, suggestCode } from "@/lib/codes";

test("new codes use the YAL prefix", () => {
  assert.equal(codeFor("INV", 7), "YAL-INV-007");
  assert.equal(suggestCode("C", []), "YAL-C-001");
});

test("numbering carries on after older ZNB codes", () => {
  const existing = ["ZNB-INV-001", "ZNB-INV-002", "ZNB-INV-003"];
  assert.equal(suggestCode("INV", existing), "YAL-INV-004");
});

test("a number used under either prefix is not reused", () => {
  const existing = ["ZNB-C-001", "YAL-C-002", "znb-c-003 "];
  assert.equal(suggestCode("C", existing), "YAL-C-004");
});

test("gaps are filled, and a start number is respected", () => {
  assert.equal(suggestCode("E", ["ZNB-E-001", "ZNB-E-003"]), "YAL-E-002");
  assert.equal(suggestCode("NEW", ["ZNB-NEW-005"], 5), "YAL-NEW-006");
});

test("other kinds do not block each other", () => {
  assert.equal(suggestCode("INV", ["ZNB-C-001"]), "YAL-INV-001");
});

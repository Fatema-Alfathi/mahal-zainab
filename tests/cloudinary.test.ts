import { test } from "node:test";
import assert from "node:assert/strict";
import { cloudinaryConfig, signCloudinaryParams, uploadToCloudinary } from "@/lib/cloudinary";

const config = { mode: "signed" as const, cloudName: "demo-shop", apiKey: "123456", apiSecret: "abcd" };

test("signature matches Cloudinary's documented example", () => {
  const signature = signCloudinaryParams(
    { eager: "w_400,h_300,c_pad|w_260,h_200,c_crop", public_id: "sample_image", timestamp: "1315060510" },
    "abcd",
  );
  assert.equal(signature, "bfd09f95f331f558cbd1320e67aa8d488770583e");
});

test("upload sends a signed request and returns secure_url", async () => {
  let seenUrl = "";
  let seenForm: FormData | null = null;
  const fakeFetch = (async (url: string, init: RequestInit) => {
    seenUrl = url;
    seenForm = init.body as FormData;
    return new Response(JSON.stringify({ secure_url: "https://res.cloudinary.com/demo-shop/image/upload/v1/yal/dresses/a.jpg" }), { status: 200 });
  }) as unknown as typeof fetch;
  const url = await uploadToCloudinary(new Uint8Array([0xff, 0xd8, 0xff]), "image/jpeg", config, fakeFetch, () => 1_700_000_000_000);
  assert.equal(url, "https://res.cloudinary.com/demo-shop/image/upload/v1/yal/dresses/a.jpg");
  assert.equal(seenUrl, "https://api.cloudinary.com/v1_1/demo-shop/image/upload");
  const form = seenForm as unknown as FormData;
  assert.equal(form.get("api_key"), "123456");
  assert.equal(form.get("timestamp"), "1700000000");
  assert.equal(form.get("folder"), "yal/dresses");
  assert.equal(form.get("signature"), signCloudinaryParams({ folder: "yal/dresses", timestamp: "1700000000" }, "abcd"));
  assert.equal(form.get("api_secret"), null, "secret must never be sent");
});

test("upload fails clearly when Cloudinary refuses", async () => {
  const fakeFetch = (async () =>
    new Response(JSON.stringify({ error: { message: "Invalid Signature" } }), { status: 401 })) as unknown as typeof fetch;
  await assert.rejects(uploadToCloudinary(new Uint8Array([1]), "image/jpeg", config, fakeFetch), /Invalid Signature/);
});

test("upload rejects a response without a Cloudinary https link", async () => {
  const fakeFetch = (async () =>
    new Response(JSON.stringify({ secure_url: "http://evil.example/a.jpg" }), { status: 200 })) as unknown as typeof fetch;
  await assert.rejects(uploadToCloudinary(new Uint8Array([1]), "image/jpeg", config, fakeFetch), /secure_url/);
});

test("unsigned preset upload sends the preset and no key or signature", async () => {
  let seenForm: FormData | null = null;
  const fakeFetch = (async (_url: string, init: RequestInit) => {
    seenForm = init.body as FormData;
    return new Response(JSON.stringify({ secure_url: "https://res.cloudinary.com/evmbwqjn/image/upload/v1/yal/dresses/b.jpg" }), { status: 200 });
  }) as unknown as typeof fetch;
  const url = await uploadToCloudinary(
    new Uint8Array([0xff, 0xd8, 0xff]),
    "image/jpeg",
    { mode: "unsigned", cloudName: "evmbwqjn", uploadPreset: "ql9xxgqr" },
    fakeFetch,
  );
  assert.equal(url, "https://res.cloudinary.com/evmbwqjn/image/upload/v1/yal/dresses/b.jpg");
  const form = seenForm as unknown as FormData;
  assert.equal(form.get("upload_preset"), "ql9xxgqr");
  assert.equal(form.get("api_key"), null);
  assert.equal(form.get("signature"), null);
});

test("config picks signed keys first, then the unsigned preset", () => {
  const keys = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "CLOUDINARY_UPLOAD_PRESET"];
  const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  try {
    for (const k of keys) delete process.env[k];
    assert.equal(cloudinaryConfig(), null);
    process.env.CLOUDINARY_CLOUD_NAME = "evmbwqjn";
    assert.equal(cloudinaryConfig(), null);
    process.env.CLOUDINARY_UPLOAD_PRESET = "ql9xxgqr";
    assert.deepEqual(cloudinaryConfig(), { mode: "unsigned", cloudName: "evmbwqjn", uploadPreset: "ql9xxgqr" });
    process.env.CLOUDINARY_API_KEY = "k";
    process.env.CLOUDINARY_API_SECRET = "s";
    assert.equal(cloudinaryConfig()?.mode, "signed");
  } finally {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
});

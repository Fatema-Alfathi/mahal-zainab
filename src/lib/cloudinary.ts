import { createHash } from "crypto";

// Server-only. The API secret must never reach the browser, so these
// variables have no NEXT_PUBLIC_ prefix and are read only in API routes.
export type CloudinaryConfig = { cloudName: string; apiKey: string; apiSecret: string };

const FOLDER = "yal/dresses";

export function cloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim() ?? "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() ?? "";
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

// Cloudinary signature: params sorted by name, joined as a=1&b=2,
// with the API secret appended, hashed with SHA-1.
export function signCloudinaryParams(params: Record<string, string>, apiSecret: string): string {
  const joined = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(joined + apiSecret).digest("hex");
}

// Uploads one image and returns its secure_url (https://res.cloudinary.com/...).
export async function uploadToCloudinary(
  bytes: Uint8Array,
  mime: string,
  config: CloudinaryConfig,
  fetchImpl: typeof fetch = fetch,
  now: () => number = Date.now,
): Promise<string> {
  const params = { folder: FOLDER, timestamp: String(Math.floor(now() / 1000)) };
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(bytes)], { type: mime }));
  form.append("api_key", config.apiKey);
  form.append("folder", params.folder);
  form.append("timestamp", params.timestamp);
  form.append("signature", signCloudinaryParams(params, config.apiSecret));

  const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`;
  const response = await fetchImpl(url, { method: "POST", body: form });
  const payload = (await response.json().catch(() => null)) as
    | { secure_url?: unknown; error?: { message?: unknown } }
    | null;
  if (!response.ok) {
    const message = typeof payload?.error?.message === "string" ? payload.error.message : `status ${response.status}`;
    throw new Error(`cloudinary: ${message}`);
  }
  const secureUrl = payload?.secure_url;
  if (typeof secureUrl !== "string" || !secureUrl.startsWith("https://res.cloudinary.com/")) {
    throw new Error("cloudinary: missing secure_url");
  }
  return secureUrl;
}

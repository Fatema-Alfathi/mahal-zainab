import { NextResponse } from "next/server";
import { clearAuthCookie, readAuthSession } from "@/lib/sessionCookie";
import { loadShop, sessionAllows } from "@/lib/shopStore";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const BUCKET = "dress-photos";
const MAX_BYTES = 2 * 1024 * 1024;

function imageType(bytes: Uint8Array): { mime: string; ext: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" };
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });
  }
  const session = await readAuthSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const shop = await loadShop();
    if (!sessionAllows(session, shop)) {
      await clearAuthCookie();
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "too_big" }, { status: 400 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = imageType(bytes);
    if (!kind) return NextResponse.json({ error: "unsupported_type" }, { status: 400 });

    const path = `dresses/${crypto.randomUUID()}.${kind.ext}`;
    const client = supabaseAdmin();
    const { error } = await client.storage.from(BUCKET).upload(path, Buffer.from(bytes), {
      contentType: kind.mime,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      console.error("photo upload failed", error.message);
      return NextResponse.json({ error: "upload_failed" }, { status: 500 });
    }
    const { data } = client.storage.from(BUCKET).getPublicUrl(path);
    if (!data.publicUrl.startsWith("https://")) {
      return NextResponse.json({ error: "upload_failed" }, { status: 500 });
    }
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error("photo upload failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}

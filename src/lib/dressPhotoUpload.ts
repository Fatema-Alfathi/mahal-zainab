const MAX_EDGE = 1600;
const MAX_BYTES = 1_800_000;

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export async function compressDressPhoto(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("type");
  }
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("fail");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await canvasBlob(canvas, 0.82);
    if (!blob) throw new Error("fail");
    if (blob.size <= MAX_BYTES) return blob;
    const smaller = await canvasBlob(canvas, 0.62);
    if (!smaller || smaller.size > MAX_BYTES) throw new Error("too-big");
    return smaller;
  } finally {
    bitmap.close();
  }
}

export async function uploadDressPhoto(file: File): Promise<string> {
  const blob = await compressDressPhoto(file);
  const body = new FormData();
  body.append("file", blob, "dress.jpg");
  const response = await fetch("/api/photos/", { method: "POST", body });
  const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (response.status === 401) throw new Error("auth");
  if (payload?.error === "too_big") throw new Error("too-big");
  if (payload?.error === "unsupported_type") throw new Error("type");
  if (!response.ok || !payload?.url || !/^https:\/\//i.test(payload.url)) throw new Error("fail");
  return payload.url;
}

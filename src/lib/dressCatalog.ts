import { DRESS_PRESENTATION } from "@/data/mockData";
import { DRESS_CATEGORY_LABELS } from "@/lib/labels";
import {
  DRESS_CATEGORIES,
  DRESS_SIZES,
  type Dress,
  type DressCatalogDraft,
  type DressCategory,
  type DressMeasurements,
  type DressSize,
} from "@/types";

export function isDressSize(value: string): value is DressSize {
  return (DRESS_SIZES as readonly string[]).includes(value);
}

export function isDressCategory(value: string): value is DressCategory {
  return (DRESS_CATEGORIES as readonly string[]).includes(value);
}

export function categoryLabel(category: DressCategory): string {
  return DRESS_CATEGORY_LABELS[category];
}

function optionalMeasure(value: number | undefined): number | undefined {
  if (!Number.isFinite(value) || value === undefined || value <= 0) return undefined;
  return value;
}

export function normalizeMeasurements(input: DressMeasurements): DressMeasurements {
  return {
    bust: optionalMeasure(input.bust),
    waist: optionalMeasure(input.waist),
    hips: optionalMeasure(input.hips),
    length: optionalMeasure(input.length),
  };
}

export function sizeLabel(size: DressSize): string {
  return `مقاس ${size}`;
}

export function measurementLine(measurements: DressMeasurements): string {
  const parts = [
    measurements.bust ? `صدر ${measurements.bust}` : "",
    measurements.waist ? `خصر ${measurements.waist}` : "",
    measurements.hips ? `أرداف ${measurements.hips}` : "",
    measurements.length ? `طول ${measurements.length}` : "",
  ].filter(Boolean);
  return parts.length ? `${parts.join(" · ")} سم` : "";
}

export function dressDisplay(dress: Dress) {
  const extra = DRESS_PRESENTATION[dress.id];
  return {
    designer: extra?.designer ?? "محل زينب",
    silhouette: dress.silhouette || extra?.silhouette || "",
    palette: extra?.palette ?? "from-rose-100 via-amber-50 to-pink-100",
    images: dress.images.length > 0 ? dress.images : extra?.images ?? [],
  };
}

export function sanitizeImageUrls(urls: string[]): string[] {
  return urls
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//i.test(url))
    .slice(0, 6);
}

export function isBarcodeTaken(dresses: Dress[], barcode: string, excludeId?: string): boolean {
  const key = barcode.trim().toUpperCase();
  if (!key) return false;
  return dresses.some(
    (item) => item.id !== excludeId && item.barcode.trim().toUpperCase() === key,
  );
}

export function suggestBarcode(dresses: Dress[]): string {
  const used = new Set(dresses.map((item) => item.barcode.trim().toUpperCase()));
  for (let index = dresses.length + 1; index < dresses.length + 1000; index += 1) {
    const candidate = `ZNB-NEW-${String(index).padStart(3, "0")}`;
    if (!used.has(candidate)) return candidate;
  }
  return `ZNB-NEW-${Date.now().toString().slice(-6)}`;
}

export function normalizeDressDraft(draft: DressCatalogDraft): DressCatalogDraft | null {
  const name = draft.name.trim();
  const barcode = draft.barcode.trim();
  const rentalPricePerDay = Number(draft.rentalPricePerDay);
  const purchasePrice = Number(draft.purchasePrice);
  if (!name || !barcode) return null;
  if (!Number.isFinite(rentalPricePerDay) || rentalPricePerDay <= 0) return null;
  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) return null;
  return {
    name,
    barcode,
    silhouette: draft.silhouette.trim() || "فستان سهرة",
    size: isDressSize(draft.size) ? draft.size : "M",
    category: isDressCategory(draft.category) ? draft.category : "evening",
    measurements: normalizeMeasurements(draft.measurements),
    images: sanitizeImageUrls(draft.images),
    rentalPricePerDay,
    purchasePrice,
  };
}

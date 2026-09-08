import { DRESS_PRESENTATION } from "@/data/mockData";
import { formatDate } from "@/lib/format";
import { DRESS_CATEGORY_LABELS, joinArabic, piecesLabel } from "@/lib/labels";
import {
  DRESS_CATEGORIES,
  DRESS_COLORS,
  DRESS_SIZES,
  type Booking,
  type Dress,
  type DressCatalogDraft,
  type DressCategory,
  type DressColor,
  type DressMeasurements,
  type DressSize,
  type DressStatus,
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

export function isDressColor(value: string): value is DressColor {
  return (DRESS_COLORS as readonly string[]).includes(value);
}

export function siblingDresses(dresses: Dress[], dress: Dress): Dress[] {
  return dresses.filter((item) => item.styleId === dress.styleId && item.id !== dress.id);
}

export function styleFamily(dresses: Dress[], dress: Dress): Dress[] {
  if (!dress.styleId) return [dress];
  return dresses.filter((item) => item.styleId === dress.styleId);
}

export function styleFamilySummary(dresses: Dress[], dress: Dress) {
  const family = styleFamily(dresses, dress);
  const sizes = [...new Set(family.map((item) => item.size))];
  const colors = [...new Set(family.map((item) => item.color))];
  const sameSize = sizes.length <= 1;
  const sameColor = colors.length <= 1;
  return {
    count: family.length,
    siblings: family.filter((item) => item.id !== dress.id),
    countLabel: piecesLabel(family.length),
    sizeLine: sameSize
      ? `نفس المقاس (${sizes[0] ?? dress.size})`
      : `مختلف (${joinArabic(sizes)})`,
    colorLine: sameColor
      ? `نفس اللون (${colors[0] ?? dress.color})`
      : `مختلف (${joinArabic(colors)})`,
    sameSize,
    sameColor,
  };
}

export function isSameVariantTaken(
  dresses: Dress[],
  draft: Pick<Dress, "styleId" | "color" | "size">,
  excludeId?: string,
): boolean {
  if (!draft.styleId.trim()) return false;
  return dresses.some(
    (item) =>
      item.id !== excludeId &&
      item.styleId === draft.styleId &&
      item.color === draft.color &&
      item.size === draft.size,
  );
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

export function matchesDressQuery(dress: Dress, query: string): boolean {
  const key = query.trim().toLowerCase();
  if (!key) return true;
  const compact = key.replace(/\s+/g, "");
  const name = dress.name.toLowerCase();
  const barcode = dress.barcode.toLowerCase().replace(/\s+/g, "");
  const description = dress.description.toLowerCase();
  return (
    name.includes(key) ||
    name.replace(/\s+/g, "").includes(compact) ||
    barcode.includes(compact) ||
    description.includes(key)
  );
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
    palette: extra?.palette ?? "from-rose-100 via-amber-50 to-rose-200",
    images: dress.images.length > 0 ? dress.images : extra?.images ?? [],
  };
}

export function sanitizeImageUrls(urls: string[]): string[] {
  return urls
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//i.test(url))
    .slice(0, 6);
}

export function padImageSlots(images: string[], slots = 4): string[] {
  const next = [...images];
  while (next.length < slots) next.push("");
  return next.slice(0, slots);
}

function nonNegativeMoney(value: number): number | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return amount;
}

function normalizeIsoDate(value: string): string {
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : "";
}

export function dressNeedsCleaning(dress: Dress): boolean {
  return dress.status === "maintenance";
}

export function dressNeedsAlteration(dress: Dress, bookings: Booking[]): boolean {
  if (dress.needsAlteration) return true;
  return bookings.some(
    (booking) => booking.dressId === dress.id && booking.status === "active" && booking.needsAlterations,
  );
}

export function dressActiveBookings(bookings: Booking[], dressId: string): Booking[] {
  return bookings
    .filter((booking) => booking.dressId === dressId && booking.status === "active")
    .sort((left, right) => left.startDate.localeCompare(right.startDate));
}

export function bookingDateLine(booking: Pick<Booking, "startDate" | "endDate">): string {
  if (booking.startDate === booking.endDate) return formatDate(booking.startDate);
  return `من ${formatDate(booking.startDate)} إلى ${formatDate(booking.endDate)}`;
}

export function statusAfterCare(current: DressStatus, needsCleaning: boolean): DressStatus {
  if (current === "reserved" || current === "rented") return current;
  return needsCleaning ? "maintenance" : "available";
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
  const purchasePrice = nonNegativeMoney(draft.purchasePrice);
  const shippingCost = nonNegativeMoney(draft.shippingCost);
  const customsCost = nonNegativeMoney(draft.customsCost);
  const insuranceAmount = nonNegativeMoney(draft.insuranceAmount);
  if (!name || !barcode) return null;
  if (!Number.isFinite(rentalPricePerDay) || rentalPricePerDay <= 0) return null;
  if (purchasePrice === null || shippingCost === null || customsCost === null || insuranceAmount === null) {
    return null;
  }
  return {
    name,
    barcode,
    description: draft.description.trim(),
    silhouette: draft.silhouette.trim() || "فستان سهرة",
    size: isDressSize(draft.size) ? draft.size : "M",
    category: isDressCategory(draft.category) ? draft.category : "evening",
    color: isDressColor(draft.color) ? draft.color : "أبيض",
    styleId: draft.styleId.trim(),
    measurements: normalizeMeasurements(draft.measurements),
    images: sanitizeImageUrls(draft.images),
    purchaseDate: normalizeIsoDate(draft.purchaseDate),
    rentalPricePerDay,
    purchasePrice,
    shippingCost,
    customsCost,
    insuranceAmount,
    needsCleaning: Boolean(draft.needsCleaning),
    needsAlteration: Boolean(draft.needsAlteration),
  };
}

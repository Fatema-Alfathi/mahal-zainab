export function formatSignedCurrency(amount: number): string {
  return amount < 0 ? `−${formatCurrency(Math.abs(amount))}` : formatCurrency(amount);
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 1000) / 1000;
  const hasBaisa = Math.round(rounded * 1000) % 1000 !== 0;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasBaisa ? 3 : 0,
    maximumFractionDigits: 3,
  }).format(rounded);
  return `\u202A${formatted}\u202C ر.ع.`;
}

export function formatCurrencyPrecise(amount: number): string {
  return formatCurrency(amount);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}٪`;
}

const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const WEEKDAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS_SHORT_AR = ["ينا", "فبر", "مار", "أبر", "ماي", "يون", "يول", "أغس", "سبت", "أكت", "نوف", "ديس"];

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return `${day} ${MONTHS_AR[month - 1]} ${year}`;
}

export function formatDateLong(isoDate: string): string {
  const date = parseIso(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return `${WEEKDAYS_AR[date.getDay()]} ${formatDate(isoDate)}`;
}

export function monthNameShortAr(iso: string): string {
  const month = Number(iso.slice(5, 7));
  return MONTHS_SHORT_AR[(month || 1) - 1] ?? iso;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function shiftIso(iso: string, days: number): string {
  const date = parseIso(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function startOfWeekIso(iso: string): string {
  const date = parseIso(iso);
  const sinceSaturday = (date.getDay() + 1) % 7;
  date.setDate(date.getDate() - sinceSaturday);
  return toIsoDate(date);
}

export function startOfMonthIso(iso: string): string {
  const date = parseIso(iso);
  date.setDate(1);
  return toIsoDate(date);
}

export function endOfMonthIso(iso: string): string {
  const date = parseIso(iso);
  date.setMonth(date.getMonth() + 1, 0);
  return toIsoDate(date);
}

export function startOfYearIso(iso: string): string {
  const date = parseIso(iso);
  date.setMonth(0, 1);
  return toIsoDate(date);
}

export function shiftMonthsIso(iso: string, months: number): string {
  const date = parseIso(iso);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toIsoDate(date);
}

export function daysInMonth(iso: string): number {
  const date = parseIso(iso);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function daysInclusive(start: string, end: string): number {
  const from = parseIso(start);
  const to = parseIso(end);
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1);
}

export function isIsoInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function monthNameAr(iso: string): string {
  const month = Number(iso.slice(5, 7));
  return MONTHS_AR[(month || 1) - 1] ?? iso;
}

export function monthYearLabel(iso: string): string {
  return `${monthNameAr(iso)} ${iso.slice(0, 4)}`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

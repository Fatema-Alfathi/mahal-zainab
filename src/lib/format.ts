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

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return `${day} ${MONTHS_AR[month - 1]} ${year}`;
}

export function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

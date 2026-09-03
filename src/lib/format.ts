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

export function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("ar-OM", {
    month: "long",
    day: "numeric",
    year: "numeric",
    numberingSystem: "latn",
  });
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

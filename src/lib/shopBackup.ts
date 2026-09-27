import { t } from "@/i18n/t";
import { endOfMonthIso, formatCurrency, formatDate, formatSignedCurrency, monthYearLabel, startOfMonthIso, todayIso } from "@/lib/format";
import { bookingStatusLabel } from "@/lib/labels";
import {
  bookingsInRange,
  expensesInRange,
  incomeInRange,
  profitInRange,
  variableExpensesInRange,
} from "@/lib/ownerSnapshot";
import type {
  Booking,
  Customer,
  Dress,
  Employee,
  EmployeeDiscountPolicy,
  FixedExpense,
  GovernmentRecord,
  VariableExpense,
} from "@/types";

export const SHOP_DATA_KEY = "yal-shop-data";
export const BACKUP_VERSION = 1;

export type ShopSnapshot = {
  dresses: Dress[];
  customers: Customer[];
  employees: Employee[];
  governmentRecords: GovernmentRecord[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  bookings: Booking[];
  discountPolicy: EmployeeDiscountPolicy;
};

export type ShopBackupFile = ShopSnapshot & {
  version: number;
  exportedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function snapshotFromState(state: ShopSnapshot): ShopSnapshot {
  return {
    dresses: state.dresses,
    customers: state.customers,
    employees: state.employees,
    governmentRecords: state.governmentRecords,
    fixedExpenses: state.fixedExpenses,
    variableExpenses: state.variableExpenses,
    bookings: state.bookings,
    discountPolicy: state.discountPolicy,
  };
}

export function parseShopBackup(raw: unknown): ShopSnapshot | null {
  if (!isRecord(raw)) return null;
  if (!isArray(raw.dresses) || !isArray(raw.customers) || !isArray(raw.bookings)) return null;
  if (!isArray(raw.employees) || !isArray(raw.governmentRecords)) return null;
  if (!isArray(raw.fixedExpenses) || !isArray(raw.variableExpenses)) return null;
  if (!isRecord(raw.discountPolicy)) return null;
  const bookings = (raw.bookings as Booking[]).map((booking) => ({
    ...booking,
    payments: Array.isArray(booking.payments) ? booking.payments : [],
  }));
  return {
    dresses: raw.dresses as Dress[],
    customers: raw.customers as Customer[],
    employees: raw.employees as Employee[],
    governmentRecords: raw.governmentRecords as GovernmentRecord[],
    fixedExpenses: raw.fixedExpenses as FixedExpense[],
    variableExpenses: raw.variableExpenses as VariableExpense[],
    bookings,
    discountPolicy: raw.discountPolicy as unknown as EmployeeDiscountPolicy,
  };
}

export function readStoredShop(): ShopSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHOP_DATA_KEY);
    if (!raw) return null;
    return parseShopBackup(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeStoredShop(snapshot: ShopSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHOP_DATA_KEY, JSON.stringify(snapshot));
}

export function downloadTextFile(filename: string, text: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob(["\uFEFF", text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function backupFilename(today = todayIso()): string {
  return `yal-backup-${today}.json`;
}

export function monthReportFilename(monthKey: string): string {
  return `yal-report-${monthKey}.txt`;
}

export function buildBackupJson(snapshot: ShopSnapshot): string {
  const file: ShopBackupFile = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    ...snapshotFromState(snapshot),
  };
  return JSON.stringify(file, null, 2);
}

function monthRange(monthKey: string) {
  const start = startOfMonthIso(`${monthKey}-01`);
  return { start, end: endOfMonthIso(start) };
}

export function buildMonthReportText(
  monthKey: string,
  snapshot: ShopSnapshot,
): string {
  const range = monthRange(monthKey);
  const monthBookings = snapshot.bookings
    .filter((booking) => booking.status !== "cancelled" && booking.startDate >= range.start && booking.startDate <= range.end)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const monthExpenses = snapshot.variableExpenses
    .filter((expense) => expense.date >= range.start && expense.date <= range.end)
    .sort((a, b) => a.date.localeCompare(b.date));
  const income = incomeInRange(snapshot.bookings, range);
  const expenses = expensesInRange(snapshot.fixedExpenses, snapshot.variableExpenses, range);
  const profit = profitInRange(snapshot.bookings, snapshot.fixedExpenses, snapshot.variableExpenses, range);
  const count = bookingsInRange(snapshot.bookings, range);
  const variableTotal = variableExpensesInRange(snapshot.variableExpenses, range);
  const remaining = monthBookings.reduce((sum, booking) => sum + booking.remainingAmount, 0);

  const lines = [
    t("files.reportTitle", { month: monthYearLabel(range.start) }),
    t("invoice.brand"),
    "",
    `${t("files.income")}: ${formatCurrency(income)}`,
    `${t("files.expenses")}: ${formatCurrency(expenses)}`,
    `${t("files.variable")}: ${formatCurrency(variableTotal)}`,
    `${t("files.profit")}: ${formatSignedCurrency(profit)}`,
    `${t("files.bookings")}: ${count}`,
    `${t("files.remaining")}: ${formatCurrency(remaining)}`,
    "",
    t("files.bookingHead"),
  ];

  if (monthBookings.length === 0) {
    lines.push(t("files.noBookings"));
  } else {
    for (const booking of monthBookings) {
      const dress = snapshot.dresses.find((item) => item.id === booking.dressId);
      lines.push(
        [
          booking.invoiceNumber,
          booking.customerName,
          dress?.name ?? booking.dressId,
          formatDate(booking.pickupDate || booking.startDate),
          formatDate(booking.returnDate || booking.endDate),
          formatCurrency(booking.totalRevenueGenerated),
          formatCurrency(booking.depositPaid),
          formatCurrency(booking.remainingAmount),
          bookingStatusLabel(booking.status),
        ].join(" · "),
      );
    }
  }

  lines.push("", t("files.variableHead"));
  if (monthExpenses.length === 0) {
    lines.push(t("files.noVariable"));
  } else {
    for (const expense of monthExpenses) {
      lines.push(`${formatDate(expense.date)} · ${expense.description || expense.category} · ${formatCurrency(expense.amount)}`);
    }
  }

  lines.push("", t("files.fixedHead"));
  for (const expense of snapshot.fixedExpenses) {
    lines.push(`${expense.name} · ${formatCurrency(expense.amount)}`);
  }

  return lines.join("\n");
}

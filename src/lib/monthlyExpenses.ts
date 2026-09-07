import { roundMoney } from "@/lib/finance";
import { SALARY_EXPENSE_ID } from "@/lib/employees";
import type { FixedExpense } from "@/types";

export const STANDARD_MONTHLY_EXPENSES = [
  { id: "fixed-rent", name: "الإيجار" },
  { id: SALARY_EXPENSE_ID, name: "الرواتب" },
  { id: "fixed-electricity", name: "الكهرباء" },
  { id: "fixed-internet", name: "الإنترنت" },
  { id: "fixed-ads", name: "الإعلانات" },
  { id: "fixed-photos", name: "جلسات التصوير" },
  { id: "fixed-cleaning", name: "تنظيف الفساتين" },
  { id: "fixed-repair", name: "تصليح وتعديل الفساتين" },
  { id: "fixed-purchases", name: "المشتريات" },
  { id: "fixed-travel", name: "السفر" },
  { id: "fixed-exhibitions", name: "المعارض" },
  { id: "fixed-hospitality", name: "الضيافة" },
  { id: "fixed-other", name: "مصروفات أخرى" },
] as const;

const STANDARD_IDS = new Set<string>(STANDARD_MONTHLY_EXPENSES.map((item) => item.id));

export function isStandardMonthlyExpense(id: string): boolean {
  return STANDARD_IDS.has(id);
}

export function isSalaryExpense(id: string): boolean {
  return id === SALARY_EXPENSE_ID;
}

export function normalizeExpenseAmount(value: number): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  return roundMoney(value);
}

export function sortMonthlyExpenses(expenses: FixedExpense[]): FixedExpense[] {
  const order = new Map<string, number>(STANDARD_MONTHLY_EXPENSES.map((item, index) => [item.id, index]));
  return [...expenses].sort((a, b) => {
    const left = order.get(a.id) ?? STANDARD_MONTHLY_EXPENSES.length;
    const right = order.get(b.id) ?? STANDARD_MONTHLY_EXPENSES.length;
    if (left !== right) return left - right;
    return a.name.localeCompare(b.name, "ar");
  });
}

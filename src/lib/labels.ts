import type { ExpenseFrequency, VariableExpenseCategory } from "@/types";

export const CATEGORY_LABELS: Record<VariableExpenseCategory, string> = {
  "Marketing Campaign": "حملة تسويقية",
  "Dry Cleaning": "تنظيف جاف",
  "Dress Repair": "إصلاح فستان",
  "Utility Bills": "فواتير خدمات",
  Other: "أخرى",
};

export const FREQUENCY_LABELS: Record<ExpenseFrequency, string> = {
  monthly: "شهري",
};

export function daysLabel(days: number): string {
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومان";
  if (days >= 3 && days <= 10) return `${days} أيام`;
  return `${days} يومًا`;
}

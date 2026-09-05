import type {
  AuthorizedDiscountType,
  DiscountType,
  EmployeeDiscountPolicy,
  ExpenseFrequency,
  VariableExpenseCategory,
} from "@/types";

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

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  none: "بدون خصم",
  percent: "نسبة مئوية",
  amount: "مبلغ ثابت",
};

export function daysLabel(days: number): string {
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومان";
  if (days >= 3 && days <= 10) return `${days} أيام`;
  return `${days} يومًا`;
}

export function discountLabel(type: DiscountType, value: number): string {
  if (type === "percent" && value > 0) return `خصم ${value}٪`;
  if (type === "amount" && value > 0) return "خصم بمبلغ ثابت";
  return "بدون خصم";
}

export function authorizedDiscountLabel(type: AuthorizedDiscountType, value: number): string {
  if (type === "percent") return `خصم ${value}٪`;
  return "خصم بمبلغ معتمد من المالك";
}

export function employeeDiscountPolicySummary(policy: EmployeeDiscountPolicy): string {
  if (!policy.enabled) return "الموظفات يحجزن بالسعر الكامل، بدون خصم.";
  if (policy.type === "percent") {
    return `الموظفات يقدرن يطبقن خصم ${policy.value}٪ فقط.`;
  }
  return "الموظفات يقدرن يطبقن خصم بمبلغ ثابت حددتيه أنتِ فقط.";
}

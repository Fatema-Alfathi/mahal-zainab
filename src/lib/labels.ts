import { t } from "@/i18n/t";
import type {
  AuthorizedDiscountType,
  BookingStatus,
  DiscountType,
  DressCategory,
  DressColor,
  DressStatus,
  EmployeeDiscountPolicy,
  ExpenseFrequency,
  VariableExpenseCategory,
} from "@/types";

export function categoryExpenseLabel(category: VariableExpenseCategory): string {
  return t(`expense.${category}`);
}

export const CATEGORY_LABELS: Record<VariableExpenseCategory, string> = {
  get "Marketing Campaign"() {
    return t("expense.Marketing Campaign");
  },
  get "Dry Cleaning"() {
    return t("expense.Dry Cleaning");
  },
  get "Dress Repair"() {
    return t("expense.Dress Repair");
  },
  get "Utility Bills"() {
    return t("expense.Utility Bills");
  },
  get Other() {
    return t("expense.Other");
  },
};

export function dressCategoryLabel(category: DressCategory): string {
  return t(`cat.${category}`);
}

export const DRESS_CATEGORY_LABELS = new Proxy({} as Record<DressCategory, string>, {
  get(_target, category: string) {
    return t(`cat.${category}`);
  },
});

export function colorLabel(color: string): string {
  return t(`color.${color}`);
}

export function dressStatusLabel(status: DressStatus): string {
  return t(`status.${status}`);
}

export function bookingStatusLabel(status: BookingStatus): string {
  return t(`booking.${status}`);
}

export function jobTitleLabel(title: string): string {
  const key = `job.${title}`;
  const translated = t(key);
  return translated === key ? title : translated;
}

export function monthlyExpenseLabel(id: string, fallback: string): string {
  const key = `expenseId.${id}`;
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export const FREQUENCY_LABELS: Record<ExpenseFrequency, string> = {
  get monthly() {
    return t("freq.monthly");
  },
};

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  get none() {
    return t("discount.none");
  },
  get percent() {
    return t("discount.percent");
  },
  get amount() {
    return t("discount.amount");
  },
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  get active() {
    return t("booking.active");
  },
  get completed() {
    return t("booking.completed");
  },
  get cancelled() {
    return t("booking.cancelled");
  },
};

export function daysLabel(days: number): string {
  if (days === 1) return t("days.one");
  if (days === 2) return t("days.two");
  if (days >= 3 && days <= 10) return t("days.few", { n: days });
  return t("days.many", { n: days });
}

export function piecesLabel(count: number): string {
  if (count === 1) return t("pieces.one");
  if (count === 2) return t("pieces.two");
  if (count >= 3 && count <= 10) return t("pieces.few", { n: count });
  return t("pieces.many", { n: count });
}

export function comparisonLabel(change: number): string {
  if (Math.abs(change) < 0.1) return t("compare.same");
  if (change > 0) return t("compare.up", { n: change });
  return t("compare.down", { n: Math.abs(change) });
}

export function joinArabic(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return t("join.and", { a: items[0], b: items[1] });
  const comma = t("list.comma");
  return t("join.and", { a: items.slice(0, -1).join(comma), b: items[items.length - 1] });
}

export function discountLabel(type: DiscountType, value: number): string {
  if (type === "percent" && value > 0) return t("disc.percentOff", { value });
  if (type === "amount" && value > 0) return t("disc.fixedAmount");
  return t("discount.none");
}

export function authorizedDiscountLabel(type: AuthorizedDiscountType, value: number): string {
  if (type === "percent") return t("disc.percentOff", { value });
  return t("disc.ownerAmount");
}

export function employeeDiscountPolicySummary(policy: EmployeeDiscountPolicy): string {
  if (!policy.enabled) return t("disc.off");
  if (policy.type === "percent") return t("disc.percentPolicy", { value: policy.value });
  return t("disc.amountPolicy");
}

export type { DressColor };

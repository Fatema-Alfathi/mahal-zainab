import { STANDARD_MONTHLY_EXPENSES } from "@/lib/monthlyExpenses";
import type { ShopSnapshot } from "@/lib/shopBackup";

export function blankShop(): ShopSnapshot {
  return {
    dresses: [],
    customers: [],
    employees: [],
    governmentRecords: [],
    fixedExpenses: STANDARD_MONTHLY_EXPENSES.map((item) => ({
      id: item.id,
      name: item.name,
      amount: 0,
      frequency: "monthly",
    })),
    variableExpenses: [],
    bookings: [],
    discountPolicy: { enabled: false, type: "percent", value: 10 },
  };
}

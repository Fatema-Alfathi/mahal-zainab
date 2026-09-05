import {
  DRY_CLEANING_FEE,
  type Booking,
  type DiscountType,
  type Dress,
  type FixedExpense,
  type VariableExpense,
} from "@/types";

export function roundMoney(amount: number): number {
  return Math.round(amount * 1000) / 1000;
}

export function rentalDayCount(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, diff);
}

export function calculateBookingSubtotal(
  rentalPricePerDay: number,
  startDate: string,
  endDate: string,
): number {
  return roundMoney(rentalPricePerDay * rentalDayCount(startDate, endDate));
}

export function applyBookingDiscount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: number,
): { discountAmount: number; total: number } {
  const value = Number.isFinite(discountValue) ? Math.max(0, discountValue) : 0;
  let discountAmount = 0;
  if (discountType === "percent") {
    discountAmount = roundMoney(subtotal * (Math.min(100, value) / 100));
  } else if (discountType === "amount") {
    discountAmount = roundMoney(Math.min(subtotal, value));
  }
  return {
    discountAmount,
    total: roundMoney(Math.max(0, subtotal - discountAmount)),
  };
}

export function calculateBookingRevenue(
  rentalPricePerDay: number,
  startDate: string,
  endDate: string,
  discountType: DiscountType = "none",
  discountValue = 0,
): number {
  const subtotal = calculateBookingSubtotal(rentalPricePerDay, startDate, endDate);
  return applyBookingDiscount(subtotal, discountType, discountValue).total;
}

export function grossRevenue(bookings: Booking[]): number {
  return bookings.reduce((sum, booking) => sum + booking.totalRevenueGenerated, 0);
}

export function totalFixedExpenses(fixedExpenses: FixedExpense[]): number {
  return fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function totalVariableExpenses(variableExpenses: VariableExpense[]): number {
  return variableExpenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function totalOperatingExpenses(
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[],
): number {
  return totalFixedExpenses(fixedExpenses) + totalVariableExpenses(variableExpenses);
}

export function netProfit(
  bookings: Booking[],
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[],
): number {
  return grossRevenue(bookings) - totalOperatingExpenses(fixedExpenses, variableExpenses);
}

export function sumByCategory(
  variableExpenses: VariableExpense[],
  category: VariableExpense["category"],
): number {
  return variableExpenses
    .filter((expense) => expense.category === category)
    .reduce((sum, expense) => sum + expense.amount, 0);
}

export function dressRentalRevenue(dressId: string, bookings: Booking[]): number {
  return bookings
    .filter((booking) => booking.dressId === dressId)
    .reduce((sum, booking) => sum + booking.totalRevenueGenerated, 0);
}

export function dressDirectExpenses(dressId: string, variableExpenses: VariableExpense[]): number {
  return variableExpenses
    .filter(
      (expense) =>
        expense.associatedDressId === dressId &&
        (expense.category === "Dry Cleaning" || expense.category === "Dress Repair"),
    )
    .reduce((sum, expense) => sum + expense.amount, 0);
}

export function dressNetProfit(
  dress: Dress,
  bookings: Booking[],
  variableExpenses: VariableExpense[],
): number {
  return (
    dressRentalRevenue(dress.id, bookings) -
    dress.purchasePrice -
    dressDirectExpenses(dress.id, variableExpenses)
  );
}

export function dressRoiPercent(
  dress: Dress,
  bookings: Booking[],
  variableExpenses: VariableExpense[],
): number {
  if (dress.purchasePrice <= 0) return 0;
  return (dressNetProfit(dress, bookings, variableExpenses) / dress.purchasePrice) * 100;
}

export function capitalRecoveryPercent(
  dress: Dress,
  bookings: Booking[],
  variableExpenses: VariableExpense[],
): number {
  const recovered =
    dressRentalRevenue(dress.id, bookings) - dressDirectExpenses(dress.id, variableExpenses);
  if (dress.purchasePrice <= 0) return 0;
  return (recovered / dress.purchasePrice) * 100;
}

export function hasBrokenEven(
  dress: Dress,
  bookings: Booking[],
  variableExpenses: VariableExpense[],
): boolean {
  return dressNetProfit(dress, bookings, variableExpenses) >= 0;
}

export function createDryCleaningExpense(
  dressId: string,
  dressName: string,
  date: string,
): VariableExpense {
  return {
    id: crypto.randomUUID(),
    category: "Dry Cleaning",
    amount: DRY_CLEANING_FEE,
    date,
    description: `تنظيف جاف إلزامي بعد التأجير — ${dressName}`,
    associatedDressId: dressId,
  };
}

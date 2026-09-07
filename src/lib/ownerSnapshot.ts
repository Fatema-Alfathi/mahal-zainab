import { roundMoney } from "@/lib/finance";
import {
  daysInMonth,
  daysInclusive,
  endOfMonthIso,
  isIsoInRange,
  monthNameAr,
  monthYearLabel,
  shiftMonthsIso,
  startOfMonthIso,
  startOfWeekIso,
  startOfYearIso,
  todayIso,
} from "@/lib/format";
import type { Booking, Dress, FixedExpense, VariableExpense } from "@/types";

export type DateRange = { start: string; end: string };

export function incomeInRange(bookings: Booking[], range: DateRange): number {
  return roundMoney(
    bookings
      .filter((booking) => isIsoInRange(booking.startDate, range.start, range.end))
      .reduce((sum, booking) => sum + booking.totalRevenueGenerated, 0),
  );
}

export function bookingsInRange(bookings: Booking[], range: DateRange): number {
  return bookings.filter((booking) => isIsoInRange(booking.startDate, range.start, range.end)).length;
}

export function variableExpensesInRange(expenses: VariableExpense[], range: DateRange): number {
  return roundMoney(
    expenses
      .filter((expense) => isIsoInRange(expense.date, range.start, range.end))
      .reduce((sum, expense) => sum + expense.amount, 0),
  );
}

export function fixedExpensesInRange(fixedExpenses: FixedExpense[], range: DateRange): number {
  const monthly = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  if (monthly <= 0) return 0;
  let total = 0;
  let cursor = startOfMonthIso(range.start);
  const last = startOfMonthIso(range.end);
  while (cursor <= last) {
    const monthStart = cursor;
    const monthEnd = endOfMonthIso(cursor);
    const overlapStart = monthStart > range.start ? monthStart : range.start;
    const overlapEnd = monthEnd < range.end ? monthEnd : range.end;
    if (overlapStart <= overlapEnd) {
      const share = daysInclusive(overlapStart, overlapEnd) / daysInMonth(cursor);
      total += monthly * share;
    }
    cursor = startOfMonthIso(shiftMonthsIso(cursor, 1));
  }
  return roundMoney(total);
}

export function expensesInRange(
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[],
  range: DateRange,
): number {
  return roundMoney(fixedExpensesInRange(fixedExpenses, range) + variableExpensesInRange(variableExpenses, range));
}

export function profitInRange(
  bookings: Booking[],
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[],
  range: DateRange,
): number {
  return roundMoney(incomeInRange(bookings, range) - expensesInRange(fixedExpenses, variableExpenses, range));
}

export function changePercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

export function ownerSnapshot(
  dresses: Dress[],
  bookings: Booking[],
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[],
  today = todayIso(),
) {
  const week: DateRange = { start: startOfWeekIso(today), end: today };
  const month: DateRange = { start: startOfMonthIso(today), end: today };
  const year: DateRange = { start: startOfYearIso(today), end: today };
  const lastMonthSameDay = shiftMonthsIso(today, -1);
  const lastMonth: DateRange = {
    start: startOfMonthIso(lastMonthSameDay),
    end: lastMonthSameDay,
  };

  const thisMonthIncome = incomeInRange(bookings, month);
  const lastMonthIncome = incomeInRange(bookings, lastMonth);
  const thisMonthExpenses = expensesInRange(fixedExpenses, variableExpenses, month);
  const lastMonthExpenses = expensesInRange(fixedExpenses, variableExpenses, lastMonth);
  const thisMonthProfit = roundMoney(thisMonthIncome - thisMonthExpenses);
  const lastMonthProfit = roundMoney(lastMonthIncome - lastMonthExpenses);
  const thisMonthBookings = bookingsInRange(bookings, month);
  const lastMonthBookings = bookingsInRange(bookings, lastMonth);

  return {
    todayIncome: incomeInRange(bookings, { start: today, end: today }),
    weekIncome: incomeInRange(bookings, week),
    monthIncome: thisMonthIncome,
    yearIncome: incomeInRange(bookings, year),
    monthExpenses: thisMonthExpenses,
    monthProfit: thisMonthProfit,
    monthBookings: thisMonthBookings,
    yearBookings: bookingsInRange(bookings, year),
    remainingDue: roundMoney(bookings.reduce((sum, booking) => sum + booking.remainingAmount, 0)),
    depositsPaid: roundMoney(bookings.reduce((sum, booking) => sum + booking.depositPaid, 0)),
    insuranceHeld: roundMoney(
      bookings
        .filter((booking) => !booking.insuranceReturned)
        .reduce((sum, booking) => sum + booking.insurancePaid, 0),
    ),
    availableDresses: dresses.filter((dress) => dress.status === "available").length,
    reservedDresses: dresses.filter((dress) => dress.status === "reserved").length,
    rentedDresses: dresses.filter((dress) => dress.status === "rented").length,
    maintenanceDresses: dresses.filter((dress) => dress.status === "maintenance").length,
    totalDresses: dresses.length,
    thisMonthLabel: monthNameAr(today),
    lastMonthLabel: monthNameAr(lastMonth.start),
    comparison: {
      income: {
        current: thisMonthIncome,
        previous: lastMonthIncome,
        change: changePercent(thisMonthIncome, lastMonthIncome),
      },
      expenses: {
        current: thisMonthExpenses,
        previous: lastMonthExpenses,
        change: changePercent(thisMonthExpenses, lastMonthExpenses),
      },
      profit: {
        current: thisMonthProfit,
        previous: lastMonthProfit,
        change: changePercent(thisMonthProfit, lastMonthProfit),
      },
      bookings: {
        current: thisMonthBookings,
        previous: lastMonthBookings,
        change: changePercent(thisMonthBookings, lastMonthBookings),
      },
    },
  };
}

export type HistoryRow = {
  key: string;
  label: string;
  income: number;
  expenses: number;
  profit: number;
  bookings: number;
};

function earliestIso(bookings: Booking[], expenses: VariableExpense[], today: string): string {
  const dates = [
    ...bookings.flatMap((booking) => [booking.startDate, booking.endDate]),
    ...expenses.map((expense) => expense.date),
    today,
  ].filter(Boolean);
  return dates.reduce((min, date) => (date < min ? date : min), today);
}

function rangeForMonth(monthStart: string): DateRange {
  return { start: monthStart, end: endOfMonthIso(monthStart) };
}

function rowForRange(label: string, key: string, bookings: Booking[], fixed: FixedExpense[], variable: VariableExpense[], range: DateRange): HistoryRow {
  const income = incomeInRange(bookings, range);
  const expenses = expensesInRange(fixed, variable, range);
  return {
    key,
    label,
    income,
    expenses,
    profit: roundMoney(income - expenses),
    bookings: bookingsInRange(bookings, range),
  };
}

function pickExtreme(rows: HistoryRow[], field: keyof Pick<HistoryRow, "income" | "profit" | "expenses" | "bookings">, kind: "max" | "min"): HistoryRow | null {
  if (rows.length === 0) return null;
  return rows.reduce((best, row) => {
    if (kind === "max") return row[field] > best[field] ? row : best;
    return row[field] < best[field] ? row : best;
  });
}

export function ownerHistory(
  bookings: Booking[],
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[],
  today = todayIso(),
) {
  const first = startOfMonthIso(earliestIso(bookings, variableExpenses, today));
  const last = startOfMonthIso(today);
  const months: HistoryRow[] = [];
  let cursor = first;
  while (cursor <= last) {
    months.push(
      rowForRange(
        monthYearLabel(cursor),
        cursor.slice(0, 7),
        bookings,
        fixedExpenses,
        variableExpenses,
        rangeForMonth(cursor),
      ),
    );
    cursor = startOfMonthIso(shiftMonthsIso(cursor, 1));
  }

  const activeMonths = months.filter((row) => row.bookings > 0);
  const yearKeys = [...new Set(months.map((row) => row.key.slice(0, 4)))];
  const years = yearKeys.map((year) => {
    const start = `${year}-01-01`;
    const end = year === today.slice(0, 4) ? endOfMonthIso(today) : `${year}-12-31`;
    return rowForRange(year, year, bookings, fixedExpenses, variableExpenses, { start, end });
  });

  return {
    months,
    years,
    highestIncomeMonth: pickExtreme(months, "income", "max"),
    lowestIncomeMonth: pickExtreme(months, "income", "min"),
    weakestBusyMonth: pickExtreme(activeMonths, "income", "min"),
    highestProfitMonth: pickExtreme(months, "profit", "max"),
    lowestProfitMonth: pickExtreme(months, "profit", "min"),
    highestIncomeYear: pickExtreme(years, "income", "max"),
    lowestIncomeYear: pickExtreme(years, "income", "min"),
    mostBookingsMonth: pickExtreme(months, "bookings", "max"),
  };
}

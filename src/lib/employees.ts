import { roundMoney } from "@/lib/finance";
import { normalizePhone } from "@/lib/customers";
import type { Employee, EmployeeDraft, FixedExpense } from "@/types";

export const SALARY_EXPENSE_ID = "fixed-salaries";
export const SALARY_EXPENSE_NAME = "رواتب الموظفات";

export function suggestEmployeeNumber(employees: Employee[]): string {
  const used = new Set(employees.map((item) => item.number.trim().toUpperCase()));
  for (let index = 1; index < 1000; index += 1) {
    const candidate = `ZNB-E-${String(index).padStart(3, "0")}`;
    if (!used.has(candidate)) return candidate;
  }
  return `ZNB-E-${Date.now().toString().slice(-6)}`;
}

export function isEmployeeNumberTaken(employees: Employee[], number: string, excludeId?: string): boolean {
  const key = number.trim().toUpperCase();
  if (!key) return false;
  return employees.some((item) => item.id !== excludeId && item.number.trim().toUpperCase() === key);
}

export function isEmployeePhoneTaken(employees: Employee[], phone: string, excludeId?: string): boolean {
  const key = normalizePhone(phone);
  if (!key) return false;
  return employees.some((item) => item.id !== excludeId && normalizePhone(item.phone) === key);
}

export function normalizeEmployeeDraft(draft: EmployeeDraft): EmployeeDraft | null {
  const name = draft.name.trim();
  const number = draft.number.trim();
  const phone = normalizePhone(draft.phone);
  const jobTitle = draft.jobTitle.trim();
  const salary = Number(draft.salary);
  if (!name || !number || !phone || !jobTitle) return null;
  if (!Number.isFinite(salary) || salary < 0) return null;
  return {
    number,
    name,
    phone,
    jobTitle,
    salary: roundMoney(salary),
    startDate: draft.startDate,
    active: draft.active,
    notes: draft.notes.trim(),
  };
}

export function activeEmployees(employees: Employee[]): Employee[] {
  return employees.filter((item) => item.active);
}

export function monthlySalaryTotal(employees: Employee[]): number {
  return roundMoney(activeEmployees(employees).reduce((sum, item) => sum + item.salary, 0));
}

export function syncSalaryExpense(fixedExpenses: FixedExpense[], employees: Employee[]): FixedExpense[] {
  const amount = monthlySalaryTotal(employees);
  let found = false;
  const next = fixedExpenses.map((expense) => {
    if (expense.id !== SALARY_EXPENSE_ID) return expense;
    found = true;
    return { ...expense, name: SALARY_EXPENSE_NAME, amount };
  });
  if (found) return next;
  return [
    { id: SALARY_EXPENSE_ID, name: SALARY_EXPENSE_NAME, amount, frequency: "monthly" },
    ...fixedExpenses,
  ];
}

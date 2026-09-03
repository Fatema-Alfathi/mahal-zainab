export type DressStatus = "available" | "rented" | "maintenance";
export type ExpenseFrequency = "monthly";
export type VariableExpenseCategory =
  | "Marketing Campaign"
  | "Dry Cleaning"
  | "Dress Repair"
  | "Utility Bills"
  | "Other";
export type BookingStatus = "active" | "completed";
export type UserRole = "owner" | "employee";
export type Role = UserRole;

export interface Dress {
  id: string;
  name: string;
  purchasePrice: number;
  rentalPricePerDay: number;
  status: DressStatus;
  totalMaintenanceCost: number;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  frequency: ExpenseFrequency;
}

export interface VariableExpense {
  id: string;
  category: VariableExpenseCategory;
  amount: number;
  date: string;
  description: string;
  associatedDressId?: string;
}

export interface Booking {
  id: string;
  dressId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  totalRevenueGenerated: number;
  status: BookingStatus;
}

export interface ShopState {
  role: UserRole;
  dresses: Dress[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  bookings: Booking[];
}

export const VARIABLE_EXPENSE_CATEGORIES: VariableExpenseCategory[] = [
  "Marketing Campaign",
  "Dry Cleaning",
  "Dress Repair",
  "Utility Bills",
  "Other",
];

export const DRY_CLEANING_FEE = 2.5;

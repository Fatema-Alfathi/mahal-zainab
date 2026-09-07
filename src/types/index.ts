export type DressStatus = "available" | "reserved" | "rented" | "maintenance";
export const DRESS_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
export type DressSize = (typeof DRESS_SIZES)[number];
export const DRESS_CATEGORIES = ["wedding", "evening", "soft", "engagement", "henna", "graduation"] as const;
export type DressCategory = (typeof DRESS_CATEGORIES)[number];
export const DRESS_COLORS = [
  "أبيض",
  "عاجي",
  "ذهبي",
  "فضي",
  "وردي",
  "أحمر",
  "أسود",
  "أزرق",
  "أخضر",
  "بنفسجي",
  "شمبانيا",
  "خمري",
] as const;
export type DressColor = (typeof DRESS_COLORS)[number];

export interface DressMeasurements {
  bust?: number;
  waist?: number;
  hips?: number;
  length?: number;
}
export type ExpenseFrequency = "monthly";
export type VariableExpenseCategory =
  | "Marketing Campaign"
  | "Dry Cleaning"
  | "Dress Repair"
  | "Utility Bills"
  | "Other";
export type BookingStatus = "active" | "completed";
export type DiscountType = "none" | "percent" | "amount";
export type AuthorizedDiscountType = Exclude<DiscountType, "none">;
export type UserRole = "owner" | "employee";
export type Role = UserRole;

export interface EmployeeDiscountPolicy {
  enabled: boolean;
  type: AuthorizedDiscountType;
  value: number;
}

export interface Dress {
  id: string;
  name: string;
  barcode: string;
  silhouette: string;
  size: DressSize;
  category: DressCategory;
  color: DressColor;
  styleId: string;
  measurements: DressMeasurements;
  images: string[];
  purchasePrice: number;
  rentalPricePerDay: number;
  insuranceAmount: number;
  status: DressStatus;
  totalMaintenanceCost: number;
}

export type DressCatalogDraft = {
  name: string;
  barcode: string;
  silhouette: string;
  size: DressSize;
  category: DressCategory;
  color: DressColor;
  styleId: string;
  measurements: DressMeasurements;
  images: string[];
  rentalPricePerDay: number;
  purchasePrice: number;
  insuranceAmount: number;
};

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

export interface Customer {
  id: string;
  number: string;
  name: string;
  phone: string;
  eventDate: string;
  notes: string;
}

export type CustomerDraft = {
  number: string;
  name: string;
  phone: string;
  eventDate: string;
  notes: string;
};

export const EMPLOYEE_JOB_TITLES = ["بائعة", "مساعدة", "تعديلات", "استقبال"] as const;
export type EmployeeJobTitle = (typeof EMPLOYEE_JOB_TITLES)[number];

export interface Employee {
  id: string;
  number: string;
  name: string;
  phone: string;
  jobTitle: string;
  salary: number;
  startDate: string;
  active: boolean;
  notes: string;
}

export type EmployeeDraft = {
  number: string;
  name: string;
  phone: string;
  jobTitle: string;
  salary: number;
  startDate: string;
  active: boolean;
  notes: string;
};

export interface Booking {
  id: string;
  dressId: string;
  customerId: string;
  customerName: string;
  bookedAt: string;
  startDate: string;
  endDate: string;
  pickupDate: string;
  returnDate: string;
  needsFitting: boolean;
  needsAlterations: boolean;
  fittingDate: string;
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  totalRevenueGenerated: number;
  depositPaid: number;
  remainingAmount: number;
  insuranceAmount: number;
  insurancePaid: number;
  insuranceReturned: boolean;
  status: BookingStatus;
}

export interface ShopState {
  role: UserRole;
  dresses: Dress[];
  customers: Customer[];
  employees: Employee[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  bookings: Booking[];
  discountPolicy: EmployeeDiscountPolicy;
}

export const FITTING_LEAD_DAYS = 5;

export const VARIABLE_EXPENSE_CATEGORIES: VariableExpenseCategory[] = [
  "Marketing Campaign",
  "Dry Cleaning",
  "Dress Repair",
  "Utility Bills",
  "Other",
];

export const DRY_CLEANING_FEE = 2.5;

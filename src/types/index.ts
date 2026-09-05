export type DressStatus = "available" | "rented" | "maintenance";
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

export interface Booking {
  id: string;
  dressId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  totalRevenueGenerated: number;
  status: BookingStatus;
}

export interface ShopState {
  role: UserRole;
  dresses: Dress[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  bookings: Booking[];
  discountPolicy: EmployeeDiscountPolicy;
}

export const VARIABLE_EXPENSE_CATEGORIES: VariableExpenseCategory[] = [
  "Marketing Campaign",
  "Dry Cleaning",
  "Dress Repair",
  "Utility Bills",
  "Other",
];

export const DRY_CLEANING_FEE = 2.5;

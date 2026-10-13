import type { AuthSession } from "@/lib/auth";
import { blankShop } from "@/lib/blankShop";
import {
  isCustomerNumberTaken,
  matchCustomer,
  normalizeCustomerDraft,
  resolveFitting,
  suggestCustomerNumber,
} from "@/lib/customers";
import { isBarcodeTaken, normalizeDressDraft, statusAfterCare } from "@/lib/dressCatalog";
import {
  employeeLoginNameError,
  isEmployeeNumberTaken,
  isEmployeePhoneTaken,
  normalizeEmployeeDraft,
  syncSalaryExpense,
} from "@/lib/employees";
import { suggestInvoiceNumber } from "@/lib/invoices";
import { isSalaryExpense, isStandardMonthlyExpense, normalizeExpenseAmount } from "@/lib/monthlyExpenses";
import { normalizeGovernmentRecordDraft } from "@/lib/governmentRecords";
import {
  applyBookingDiscount,
  calculateBookingSubtotal,
  createDryCleaningExpense,
  roundMoney,
  settleDeposit,
} from "@/lib/finance";
import { todayIso } from "@/lib/format";
import type { ShopSnapshot } from "@/lib/shopBackup";
import {
  DRY_CLEANING_FEE,
  type CustomerDraft,
  type DiscountType,
  type DressCatalogDraft,
  type EmployeeDiscountPolicy,
  type EmployeeDraft,
  type GovernmentRecordDraft,
  type ShopState,
  type UserRole,
  type VariableExpense,
} from "@/types";

function resolveBookingDiscount(
  role: UserRole,
  policy: EmployeeDiscountPolicy,
  requestedType: DiscountType,
  requestedValue: number,
): { discountType: DiscountType; discountValue: number } {
  if (role === "owner") {
    return { discountType: requestedType, discountValue: requestedValue };
  }
  if (!policy.enabled || requestedType === "none") {
    return { discountType: "none", discountValue: 0 };
  }
  return { discountType: policy.type, discountValue: policy.value };
}

export type Action =
  | { type: "sign-in"; session: AuthSession }
  | { type: "sign-out" }
  | {
      type: "create-booking";
      dressId: string;
      customerId?: string;
      newCustomerId?: string;
      customerNumber?: string;
      customerName: string;
      phone?: string;
      eventDate?: string;
      notes?: string;
      startDate: string;
      endDate: string;
      pickupDate?: string;
      handoverDate?: string;
      returnDate?: string;
      fittingDate?: string;
      discountType: DiscountType;
      discountValue: number;
      depositPaid: number;
      needsAlterations: boolean;
      needsFitting: boolean;
    }
  | { type: "add-customer"; customerId: string; draft: CustomerDraft }
  | { type: "update-customer"; customerId: string; draft: CustomerDraft }
  | { type: "hydrate-employees"; employees: ShopState["employees"] }
  | { type: "add-employee"; employeeId: string; draft: EmployeeDraft }
  | { type: "update-employee"; employeeId: string; draft: EmployeeDraft }
  | { type: "delete-employee"; employeeId: string }
  | { type: "add-government-record"; draft: GovernmentRecordDraft }
  | { type: "update-government-record"; recordId: string; draft: GovernmentRecordDraft }
  | { type: "delete-government-record"; recordId: string }
  | { type: "set-discount-policy"; policy: EmployeeDiscountPolicy }
  | { type: "pickup-dress"; dressId: string }
  | { type: "return-dress"; dressId: string }
  | { type: "cancel-booking"; bookingId: string }
  | { type: "record-payment"; bookingId: string; amount: number }
  | { type: "complete-maintenance"; dressId: string }
  | { type: "add-variable-expense"; expense: Omit<VariableExpense, "id"> }
  | { type: "update-fixed-expense"; expenseId: string; amount: number }
  | { type: "add-fixed-expense"; name: string; amount: number }
  | { type: "delete-fixed-expense"; expenseId: string }
  | { type: "add-dress"; draft: DressCatalogDraft }
  | { type: "update-dress"; dressId: string; draft: DressCatalogDraft }
  | { type: "delete-dress"; dressId: string }
  | { type: "hydrate-shop"; snapshot: ShopSnapshot };

export function shopReducer(state: ShopState, action: Action): ShopState {
  switch (action.type) {
    case "sign-in":
      return {
        ...state,
        signedIn: true,
        role: action.session.role,
        sessionName: action.session.name,
        employeeId: action.session.employeeId,
      };
    case "sign-out":
      return { ...state, signedIn: false, role: "employee", sessionName: "", employeeId: "" };

    case "create-booking": {
      const dress = state.dresses.find((item) => item.id === action.dressId);
      if (!dress || dress.status !== "available") return state;
      const subtotal = calculateBookingSubtotal(
        dress.rentalPricePerDay,
        action.startDate,
        action.endDate,
      );
      const authorized = resolveBookingDiscount(
        state.role,
        state.discountPolicy,
        action.discountType,
        action.discountValue,
      );
      const { discountAmount, total } = applyBookingDiscount(
        subtotal,
        authorized.discountType,
        authorized.discountValue,
      );
      const payment = settleDeposit(total, action.depositPaid);
      const startsLater = action.startDate > todayIso();
      const wantsFitting = action.needsFitting || Boolean(action.fittingDate?.trim());
      const fitting = resolveFitting(action.needsAlterations, wantsFitting, action.pickupDate || action.startDate);
      const selected = action.customerId
        ? state.customers.find((item) => item.id === action.customerId)
        : matchCustomer(state.customers, action.customerName, action.phone);
      const requestedNumber = action.customerNumber?.trim() ?? "";
      if (!selected && requestedNumber && isCustomerNumberTaken(state.customers, requestedNumber)) return state;
      const customer =
        selected ??
        {
          id: action.newCustomerId || crypto.randomUUID(),
          number: requestedNumber || suggestCustomerNumber(state.customers),
          name: action.customerName.trim(),
          phone: (action.phone ?? "").trim(),
          eventDate: action.eventDate ?? "",
          notes: action.notes?.trim() ?? "",
        };
      const customers = selected
        ? state.customers.map((item) =>
            item.id === selected.id
              ? {
                  ...item,
                  name: action.customerName.trim() || item.name,
                  phone: action.phone?.trim() || item.phone,
                  eventDate: action.eventDate || item.eventDate,
                }
              : item,
          )
        : [customer, ...state.customers];
      return {
        ...state,
        customers,
        dresses: state.dresses.map((item) =>
          item.id === action.dressId
            ? {
                ...item,
                status: startsLater ? "reserved" : "rented",
                needsAlteration: item.needsAlteration || fitting.needsAlterations,
              }
            : item,
        ),
        bookings: [
          {
            id: crypto.randomUUID(),
            invoiceNumber: suggestInvoiceNumber(state.bookings),
            dressId: action.dressId,
            customerId: customer.id,
            customerName: customer.name,
            bookedAt: todayIso(),
            startDate: action.startDate,
            endDate: action.endDate,
            pickupDate: action.pickupDate || action.startDate,
            handoverDate: action.handoverDate || (startsLater ? "" : action.startDate),
            eventDate: action.eventDate ?? "",
            returnDate: action.returnDate || action.endDate,
            needsFitting: fitting.needsFitting,
            needsAlterations: fitting.needsAlterations,
            fittingDate: action.fittingDate?.trim() || fitting.fittingDate,
            subtotal,
            discountType: authorized.discountType,
            discountValue: authorized.discountValue,
            discountAmount,
            totalRevenueGenerated: total,
            depositPaid: payment.depositPaid,
            remainingAmount: payment.remainingAmount,
            insuranceAmount: dress.insuranceAmount,
            insurancePaid: dress.insuranceAmount,
            insuranceReturned: false,
            status: "active",
            cancelledAt: "",
            bookedByEmployeeId: state.role === "employee" ? state.employeeId : "",
            payments:
              payment.depositPaid > 0
                ? [{ id: crypto.randomUUID(), paidAt: todayIso(), amount: payment.depositPaid }]
                : [],
          },
          ...state.bookings,
        ],
      };
    }

    case "add-customer": {
      const draft = normalizeCustomerDraft(action.draft);
      if (!draft || isCustomerNumberTaken(state.customers, draft.number)) return state;
      if (matchCustomer(state.customers, draft.name, draft.phone)) return state;
      return {
        ...state,
        customers: [
          {
            id: action.customerId,
            ...draft,
          },
          ...state.customers,
        ],
      };
    }

    case "update-customer": {
      const current = state.customers.find((item) => item.id === action.customerId);
      const draft = normalizeCustomerDraft(action.draft);
      if (!current || !draft || isCustomerNumberTaken(state.customers, draft.number, action.customerId)) return state;
      return {
        ...state,
        customers: state.customers.map((item) => (item.id === action.customerId ? { ...item, ...draft } : item)),
        bookings: state.bookings.map((booking) =>
          booking.customerId === action.customerId ? { ...booking, customerName: draft.name } : booking,
        ),
      };
    }

    case "hydrate-shop": {
      return {
        ...state,
        dresses: action.snapshot.dresses,
        customers: action.snapshot.customers,
        employees: action.snapshot.employees,
        governmentRecords: action.snapshot.governmentRecords,
        fixedExpenses: action.snapshot.fixedExpenses,
        variableExpenses: action.snapshot.variableExpenses,
        bookings: action.snapshot.bookings,
        discountPolicy: action.snapshot.discountPolicy,
      };
    }

    case "hydrate-employees": {
      return {
        ...state,
        employees: action.employees,
        fixedExpenses: syncSalaryExpense(state.fixedExpenses, action.employees),
      };
    }

    case "add-employee": {
      if (state.role !== "owner") return state;
      const draft = normalizeEmployeeDraft(action.draft);
      if (!draft || isEmployeeNumberTaken(state.employees, draft.number)) return state;
      if (isEmployeePhoneTaken(state.employees, draft.phone)) return state;
      if (employeeLoginNameError(state.employees, draft.name)) return state;
      const employees = [{ id: action.employeeId, ...draft }, ...state.employees];
      return {
        ...state,
        employees,
        fixedExpenses: syncSalaryExpense(state.fixedExpenses, employees),
      };
    }

    case "update-employee": {
      if (state.role !== "owner") return state;
      const current = state.employees.find((item) => item.id === action.employeeId);
      const draft = normalizeEmployeeDraft(action.draft);
      if (!current || !draft) return state;
      if (isEmployeeNumberTaken(state.employees, draft.number, action.employeeId)) return state;
      if (isEmployeePhoneTaken(state.employees, draft.phone, action.employeeId)) return state;
      if (employeeLoginNameError(state.employees, draft.name, action.employeeId)) return state;
      const employees = state.employees.map((item) =>
        item.id === action.employeeId ? { ...item, ...draft } : item,
      );
      return {
        ...state,
        employees,
        fixedExpenses: syncSalaryExpense(state.fixedExpenses, employees),
      };
    }

    case "delete-employee": {
      if (state.role !== "owner") return state;
      if (!state.employees.some((item) => item.id === action.employeeId)) return state;
      const employees = state.employees.filter((item) => item.id !== action.employeeId);
      return {
        ...state,
        employees,
        fixedExpenses: syncSalaryExpense(state.fixedExpenses, employees),
      };
    }

    case "add-government-record": {
      if (state.role !== "owner") return state;
      const draft = normalizeGovernmentRecordDraft(action.draft);
      if (!draft) return state;
      return {
        ...state,
        governmentRecords: [{ id: crypto.randomUUID(), ...draft }, ...state.governmentRecords],
      };
    }

    case "update-government-record": {
      if (state.role !== "owner") return state;
      const current = state.governmentRecords.find((item) => item.id === action.recordId);
      const draft = normalizeGovernmentRecordDraft(action.draft);
      if (!current || !draft) return state;
      return {
        ...state,
        governmentRecords: state.governmentRecords.map((item) =>
          item.id === action.recordId ? { ...item, ...draft } : item,
        ),
      };
    }

    case "delete-government-record": {
      if (state.role !== "owner") return state;
      return {
        ...state,
        governmentRecords: state.governmentRecords.filter((item) => item.id !== action.recordId),
      };
    }

    case "pickup-dress": {
      const dress = state.dresses.find((item) => item.id === action.dressId);
      if (!dress || dress.status !== "reserved") return state;
      return {
        ...state,
        dresses: state.dresses.map((item) =>
          item.id === action.dressId ? { ...item, status: "rented" } : item,
        ),
        bookings: state.bookings.map((booking) =>
          booking.dressId === action.dressId && booking.status === "active"
            ? { ...booking, handoverDate: booking.handoverDate || todayIso() }
            : booking,
        ),
      };
    }

    case "record-payment": {
      const booking = state.bookings.find((item) => item.id === action.bookingId);
      const amount = roundMoney(action.amount);
      if (!booking || booking.status !== "active" || amount <= 0 || amount > booking.remainingAmount) return state;
      return {
        ...state,
        bookings: state.bookings.map((item) =>
          item.id === action.bookingId
            ? {
                ...item,
                depositPaid: roundMoney(item.depositPaid + amount),
                remainingAmount: roundMoney(item.remainingAmount - amount),
                payments: [...item.payments, { id: crypto.randomUUID(), paidAt: todayIso(), amount }],
              }
            : item,
        ),
      };
    }

    case "cancel-booking": {
      const booking = state.bookings.find((item) => item.id === action.bookingId);
      if (!booking || booking.status !== "active") return state;
      const dress = state.dresses.find((item) => item.id === booking.dressId);
      const freeDress = dress && (dress.status === "reserved" || dress.status === "rented");
      return {
        ...state,
        bookings: state.bookings.map((item) =>
          item.id === action.bookingId
            ? {
                ...item,
                status: "cancelled",
                cancelledAt: todayIso(),
                remainingAmount: 0,
                insuranceReturned: true,
                totalRevenueGenerated: 0,
              }
            : item,
        ),
        dresses: freeDress
          ? state.dresses.map((item) =>
              item.id === booking.dressId ? { ...item, status: "available", needsAlteration: false } : item,
            )
          : state.dresses,
      };
    }

    case "return-dress": {
      const dress = state.dresses.find((item) => item.id === action.dressId);
      if (!dress || dress.status !== "rented") return state;
      const activeBooking = state.bookings.find(
        (booking) => booking.dressId === action.dressId && booking.status === "active",
      );
      const dryCleaning = createDryCleaningExpense(dress.id, dress.name, todayIso());
      return {
        ...state,
        dresses: state.dresses.map((item) =>
          item.id === action.dressId
            ? {
                ...item,
                status: "maintenance",
                totalMaintenanceCost: item.totalMaintenanceCost + DRY_CLEANING_FEE,
              }
            : item,
        ),
        bookings: state.bookings.map((booking) =>
          booking.id === activeBooking?.id
            ? { ...booking, status: "completed", remainingAmount: 0, insuranceReturned: true }
            : booking,
        ),
        variableExpenses: [dryCleaning, ...state.variableExpenses],
      };
    }

    case "set-discount-policy": {
      if (state.role !== "owner") return state;
      const value = Number.isFinite(action.policy.value) ? Math.max(0, action.policy.value) : 0;
      const capped = action.policy.type === "percent" ? Math.min(100, value) : value;
      return {
        ...state,
        discountPolicy: {
          enabled: action.policy.enabled && capped > 0,
          type: action.policy.type,
          value: capped,
        },
      };
    }

    case "complete-maintenance":
      return {
        ...state,
        dresses: state.dresses.map((item) =>
          item.id === action.dressId && item.status === "maintenance"
            ? { ...item, status: "available" }
            : item,
        ),
      };

    case "add-dress": {
      const draft = normalizeDressDraft(action.draft);
      if (!draft || isBarcodeTaken(state.dresses, draft.barcode)) return state;
      return {
        ...state,
        dresses: [
          {
            id: crypto.randomUUID(),
            name: draft.name,
            barcode: draft.barcode,
            silhouette: draft.silhouette,
            size: draft.size,
            category: draft.category,
            color: draft.color,
            styleId: draft.styleId || crypto.randomUUID(),
            measurements: draft.measurements,
            images: draft.images,
            rentalPricePerDay: draft.rentalPricePerDay,
            insuranceAmount: draft.insuranceAmount,
            description: draft.description,
            purchaseDate: state.role === "owner" ? draft.purchaseDate : "",
            purchasePrice: state.role === "owner" ? draft.purchasePrice : 0,
            shippingCost: state.role === "owner" ? draft.shippingCost : 0,
            customsCost: state.role === "owner" ? draft.customsCost : 0,
            status: statusAfterCare("available", draft.needsCleaning),
            needsAlteration: draft.needsAlteration,
            totalMaintenanceCost: 0,
          },
          ...state.dresses,
        ],
      };
    }

    case "update-dress": {
      const current = state.dresses.find((item) => item.id === action.dressId);
      if (!current) return state;
      const draft = normalizeDressDraft(action.draft);
      if (!draft || isBarcodeTaken(state.dresses, draft.barcode, action.dressId)) return state;
      return {
        ...state,
        dresses: state.dresses.map((item) =>
          item.id === action.dressId
            ? {
                ...item,
                name: draft.name,
                barcode: draft.barcode,
                silhouette: draft.silhouette,
                size: draft.size,
                category: draft.category,
                color: draft.color,
                styleId: draft.styleId || item.styleId,
                measurements: draft.measurements,
                description: draft.description,
                images: draft.images,
                rentalPricePerDay: draft.rentalPricePerDay,
                insuranceAmount: draft.insuranceAmount,
                purchaseDate: state.role === "owner" ? draft.purchaseDate : item.purchaseDate,
                purchasePrice: state.role === "owner" ? draft.purchasePrice : item.purchasePrice,
                shippingCost: state.role === "owner" ? draft.shippingCost : item.shippingCost,
                customsCost: state.role === "owner" ? draft.customsCost : item.customsCost,
                status: statusAfterCare(item.status, draft.needsCleaning),
                needsAlteration: draft.needsAlteration,
              }
            : item,
        ),
      };
    }

    case "delete-dress": {
      const dress = state.dresses.find((item) => item.id === action.dressId);
      if (!dress || dress.status === "rented" || dress.status === "reserved") return state;
      return {
        ...state,
        dresses: state.dresses.filter((item) => item.id !== action.dressId),
      };
    }

    case "add-variable-expense": {
      const expense: VariableExpense = { ...action.expense, id: crypto.randomUUID() };
      const isDirectDressCost =
        Boolean(expense.associatedDressId) &&
        (expense.category === "Dry Cleaning" || expense.category === "Dress Repair");
      return {
        ...state,
        variableExpenses: [expense, ...state.variableExpenses],
        dresses: isDirectDressCost
          ? state.dresses.map((item) =>
              item.id === expense.associatedDressId
                ? { ...item, totalMaintenanceCost: item.totalMaintenanceCost + expense.amount }
                : item,
            )
          : state.dresses,
      };
    }

    case "update-fixed-expense": {
      if (state.role !== "owner") return state;
      const current = state.fixedExpenses.find((item) => item.id === action.expenseId);
      const amount = normalizeExpenseAmount(action.amount);
      if (!current || amount === null || isSalaryExpense(action.expenseId)) return state;
      return {
        ...state,
        fixedExpenses: state.fixedExpenses.map((item) =>
          item.id === action.expenseId ? { ...item, amount } : item,
        ),
      };
    }

    case "add-fixed-expense": {
      if (state.role !== "owner") return state;
      const name = action.name.trim();
      const amount = normalizeExpenseAmount(action.amount);
      if (!name || amount === null) return state;
      if (state.fixedExpenses.some((item) => item.name === name)) {
        return {
          ...state,
          fixedExpenses: state.fixedExpenses.map((item) =>
            item.name === name ? { ...item, amount: roundMoney(item.amount + amount) } : item,
          ),
        };
      }
      return {
        ...state,
        fixedExpenses: [
          ...state.fixedExpenses,
          { id: crypto.randomUUID(), name, amount, frequency: "monthly" },
        ],
      };
    }

    case "delete-fixed-expense": {
      if (state.role !== "owner") return state;
      if (isStandardMonthlyExpense(action.expenseId)) return state;
      return {
        ...state,
        fixedExpenses: state.fixedExpenses.filter((item) => item.id !== action.expenseId),
      };
    }

    default:
      return state;
  }
}

export const initialState: ShopState = {
  role: "employee",
  signedIn: false,
  sessionName: "",
  employeeId: "",
  ...blankShop(),
};

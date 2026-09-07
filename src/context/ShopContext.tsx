"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  INITIAL_DRESSES,
  INITIAL_DISCOUNT_POLICY,
  INITIAL_EMPLOYEES,
  INITIAL_FIXED_EXPENSES,
  INITIAL_VARIABLE_EXPENSES,
} from "@/data/mockData";
import {
  isCustomerNumberTaken,
  matchCustomer,
  normalizeCustomerDraft,
  resolveFitting,
  suggestCustomerNumber,
} from "@/lib/customers";
import { isBarcodeTaken, normalizeDressDraft } from "@/lib/dressCatalog";
import {
  isEmployeeNumberTaken,
  isEmployeePhoneTaken,
  normalizeEmployeeDraft,
  syncSalaryExpense,
} from "@/lib/employees";
import {
  applyBookingDiscount,
  calculateBookingSubtotal,
  createDryCleaningExpense,
  settleDeposit,
} from "@/lib/finance";
import { todayIso } from "@/lib/format";
import {
  DRY_CLEANING_FEE,
  type CustomerDraft,
  type DiscountType,
  type DressCatalogDraft,
  type EmployeeDiscountPolicy,
  type EmployeeDraft,
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

type Action =
  | { type: "set-role"; role: UserRole }
  | {
      type: "create-booking";
      dressId: string;
      customerId?: string;
      customerName: string;
      phone?: string;
      eventDate?: string;
      startDate: string;
      endDate: string;
      discountType: DiscountType;
      discountValue: number;
      depositPaid: number;
      needsAlterations: boolean;
      needsFitting: boolean;
    }
  | { type: "add-customer"; draft: CustomerDraft }
  | { type: "update-customer"; customerId: string; draft: CustomerDraft }
  | { type: "add-employee"; draft: EmployeeDraft }
  | { type: "update-employee"; employeeId: string; draft: EmployeeDraft }
  | { type: "set-discount-policy"; policy: EmployeeDiscountPolicy }
  | { type: "pickup-dress"; dressId: string }
  | { type: "return-dress"; dressId: string }
  | { type: "complete-maintenance"; dressId: string }
  | { type: "add-variable-expense"; expense: Omit<VariableExpense, "id"> }
  | { type: "add-dress"; draft: DressCatalogDraft }
  | { type: "update-dress"; dressId: string; draft: DressCatalogDraft }
  | { type: "delete-dress"; dressId: string };

function shopReducer(state: ShopState, action: Action): ShopState {
  switch (action.type) {
    case "set-role":
      return { ...state, role: action.role };

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
      const fitting = resolveFitting(action.needsAlterations, action.needsFitting, action.startDate);
      const selected = action.customerId
        ? state.customers.find((item) => item.id === action.customerId)
        : matchCustomer(state.customers, action.customerName, action.phone);
      const customer =
        selected ??
        {
          id: crypto.randomUUID(),
          number: suggestCustomerNumber(state.customers),
          name: action.customerName.trim(),
          phone: (action.phone ?? "").trim(),
          eventDate: action.eventDate ?? "",
          notes: "",
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
          item.id === action.dressId ? { ...item, status: startsLater ? "reserved" : "rented" } : item,
        ),
        bookings: [
          {
            id: crypto.randomUUID(),
            dressId: action.dressId,
            customerId: customer.id,
            customerName: customer.name,
            bookedAt: todayIso(),
            startDate: action.startDate,
            endDate: action.endDate,
            pickupDate: action.startDate,
            returnDate: action.endDate,
            needsFitting: fitting.needsFitting,
            needsAlterations: fitting.needsAlterations,
            fittingDate: fitting.fittingDate,
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
            id: crypto.randomUUID(),
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

    case "add-employee": {
      if (state.role !== "owner") return state;
      const draft = normalizeEmployeeDraft(action.draft);
      if (!draft || isEmployeeNumberTaken(state.employees, draft.number)) return state;
      if (isEmployeePhoneTaken(state.employees, draft.phone)) return state;
      const employees = [{ id: crypto.randomUUID(), ...draft }, ...state.employees];
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
      const employees = state.employees.map((item) =>
        item.id === action.employeeId ? { ...item, ...draft } : item,
      );
      return {
        ...state,
        employees,
        fixedExpenses: syncSalaryExpense(state.fixedExpenses, employees),
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
            purchasePrice: state.role === "owner" ? draft.purchasePrice : 0,
            status: "available",
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
                images: draft.images,
                rentalPricePerDay: draft.rentalPricePerDay,
                insuranceAmount: draft.insuranceAmount,
                purchasePrice: state.role === "owner" ? draft.purchasePrice : item.purchasePrice,
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

    default:
      return state;
  }
}

const initialState: ShopState = {
  role: "owner",
  dresses: INITIAL_DRESSES,
  customers: INITIAL_CUSTOMERS,
  employees: INITIAL_EMPLOYEES,
  fixedExpenses: INITIAL_FIXED_EXPENSES,
  variableExpenses: INITIAL_VARIABLE_EXPENSES,
  bookings: INITIAL_BOOKINGS,
  discountPolicy: INITIAL_DISCOUNT_POLICY,
};

interface ShopContextValue extends ShopState {
  isOwner: boolean;
  setRole: (role: UserRole) => void;
  createBooking: (input: {
    dressId: string;
    customerId?: string;
    customerName: string;
    phone?: string;
    eventDate?: string;
    startDate: string;
    endDate: string;
    discountType: DiscountType;
    discountValue: number;
    depositPaid: number;
    needsAlterations: boolean;
    needsFitting: boolean;
  }) => void;
  addCustomer: (draft: CustomerDraft) => boolean;
  updateCustomer: (customerId: string, draft: CustomerDraft) => boolean;
  addEmployee: (draft: EmployeeDraft) => boolean;
  updateEmployee: (employeeId: string, draft: EmployeeDraft) => boolean;
  setDiscountPolicy: (policy: EmployeeDiscountPolicy) => void;
  pickupDress: (dressId: string) => void;
  returnDress: (dressId: string) => void;
  completeMaintenance: (dressId: string) => void;
  addVariableExpense: (expense: Omit<VariableExpense, "id">) => void;
  addDress: (draft: DressCatalogDraft) => boolean;
  updateDress: (dressId: string, draft: DressCatalogDraft) => boolean;
  deleteDress: (dressId: string) => boolean;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shopReducer, initialState);

  const setRole = useCallback((role: UserRole) => {
    dispatch({ type: "set-role", role });
  }, []);

  const createBooking = useCallback(
    (input: {
      dressId: string;
      customerId?: string;
      customerName: string;
      phone?: string;
      eventDate?: string;
      startDate: string;
      endDate: string;
      discountType: DiscountType;
      discountValue: number;
      depositPaid: number;
      needsAlterations: boolean;
      needsFitting: boolean;
    }) => {
      dispatch({ type: "create-booking", ...input });
    },
    [],
  );

  const addCustomer = useCallback(
    (draft: CustomerDraft) => {
      const normalized = normalizeCustomerDraft(draft);
      if (!normalized || isCustomerNumberTaken(state.customers, normalized.number)) return false;
      if (matchCustomer(state.customers, normalized.name, normalized.phone)) return false;
      dispatch({ type: "add-customer", draft: normalized });
      return true;
    },
    [state.customers],
  );

  const updateCustomer = useCallback(
    (customerId: string, draft: CustomerDraft) => {
      const current = state.customers.find((item) => item.id === customerId);
      const normalized = normalizeCustomerDraft(draft);
      if (!current || !normalized || isCustomerNumberTaken(state.customers, normalized.number, customerId)) return false;
      dispatch({ type: "update-customer", customerId, draft: normalized });
      return true;
    },
    [state.customers],
  );

  const addEmployee = useCallback(
    (draft: EmployeeDraft) => {
      if (state.role !== "owner") return false;
      const normalized = normalizeEmployeeDraft(draft);
      if (!normalized || isEmployeeNumberTaken(state.employees, normalized.number)) return false;
      if (isEmployeePhoneTaken(state.employees, normalized.phone)) return false;
      dispatch({ type: "add-employee", draft: normalized });
      return true;
    },
    [state.employees, state.role],
  );

  const updateEmployee = useCallback(
    (employeeId: string, draft: EmployeeDraft) => {
      if (state.role !== "owner") return false;
      const current = state.employees.find((item) => item.id === employeeId);
      const normalized = normalizeEmployeeDraft(draft);
      if (!current || !normalized) return false;
      if (isEmployeeNumberTaken(state.employees, normalized.number, employeeId)) return false;
      if (isEmployeePhoneTaken(state.employees, normalized.phone, employeeId)) return false;
      dispatch({ type: "update-employee", employeeId, draft: normalized });
      return true;
    },
    [state.employees, state.role],
  );

  const setDiscountPolicy = useCallback((policy: EmployeeDiscountPolicy) => {
    dispatch({ type: "set-discount-policy", policy });
  }, []);

  const pickupDress = useCallback((dressId: string) => {
    dispatch({ type: "pickup-dress", dressId });
  }, []);

  const returnDress = useCallback((dressId: string) => {
    dispatch({ type: "return-dress", dressId });
  }, []);

  const completeMaintenance = useCallback((dressId: string) => {
    dispatch({ type: "complete-maintenance", dressId });
  }, []);

  const addVariableExpense = useCallback((expense: Omit<VariableExpense, "id">) => {
    dispatch({ type: "add-variable-expense", expense });
  }, []);

  const addDress = useCallback(
    (draft: DressCatalogDraft) => {
      const normalized = normalizeDressDraft(draft);
      if (!normalized || isBarcodeTaken(state.dresses, normalized.barcode)) return false;
      dispatch({ type: "add-dress", draft: normalized });
      return true;
    },
    [state.dresses],
  );

  const updateDress = useCallback(
    (dressId: string, draft: DressCatalogDraft) => {
      const current = state.dresses.find((item) => item.id === dressId);
      if (!current) return false;
      const normalized = normalizeDressDraft(draft);
      if (!normalized || isBarcodeTaken(state.dresses, normalized.barcode, dressId)) return false;
      dispatch({ type: "update-dress", dressId, draft: normalized });
      return true;
    },
    [state.dresses],
  );

  const deleteDress = useCallback(
    (dressId: string) => {
      const dress = state.dresses.find((item) => item.id === dressId);
      if (!dress || dress.status === "rented" || dress.status === "reserved") return false;
      dispatch({ type: "delete-dress", dressId });
      return true;
    },
    [state.dresses],
  );

  const value = useMemo<ShopContextValue>(
    () => ({
      ...state,
      isOwner: state.role === "owner",
      setRole,
      createBooking,
      addCustomer,
      updateCustomer,
      addEmployee,
      updateEmployee,
      setDiscountPolicy,
      pickupDress,
      returnDress,
      completeMaintenance,
      addVariableExpense,
      addDress,
      updateDress,
      deleteDress,
    }),
    [
      state,
      setRole,
      createBooking,
      addCustomer,
      updateCustomer,
      addEmployee,
      updateEmployee,
      setDiscountPolicy,
      pickupDress,
      returnDress,
      completeMaintenance,
      addVariableExpense,
      addDress,
      updateDress,
      deleteDress,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within ShopProvider");
  }
  return context;
}

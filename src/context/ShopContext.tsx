"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { clearSession, readSession, verifyLogin, writeSession, type AuthSession } from "@/lib/auth";
import {
  defaultPasswordStore,
  ownerPassword,
  readPasswords,
  removeStaffPasswordInStore,
  sanitizePassword,
  setOwnerPasswordInStore,
  setStaffPasswordInStore,
  staffPassword,
  writePasswords,
  type PasswordStore,
} from "@/lib/passwords";
import {
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  INITIAL_DRESSES,
  INITIAL_DISCOUNT_POLICY,
  INITIAL_EMPLOYEES,
  INITIAL_FIXED_EXPENSES,
  INITIAL_GOVERNMENT_RECORDS,
  INITIAL_VARIABLE_EXPENSES,
} from "@/data/mockData";
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
  readStoredEmployees,
  suggestEmployeeNumber,
  syncSalaryExpense,
  writeStoredEmployees,
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

type Action =
  | { type: "sign-in"; session: AuthSession }
  | { type: "sign-out" }
  | {
      type: "create-booking";
      dressId: string;
      customerId?: string;
      customerName: string;
      phone?: string;
      eventDate?: string;
      startDate: string;
      endDate: string;
      pickupDate?: string;
      handoverDate?: string;
      returnDate?: string;
      discountType: DiscountType;
      discountValue: number;
      depositPaid: number;
      needsAlterations: boolean;
      needsFitting: boolean;
    }
  | { type: "add-customer"; draft: CustomerDraft }
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
  | { type: "complete-maintenance"; dressId: string }
  | { type: "add-variable-expense"; expense: Omit<VariableExpense, "id"> }
  | { type: "update-fixed-expense"; expenseId: string; amount: number }
  | { type: "add-fixed-expense"; name: string; amount: number }
  | { type: "delete-fixed-expense"; expenseId: string }
  | { type: "add-dress"; draft: DressCatalogDraft }
  | { type: "update-dress"; dressId: string; draft: DressCatalogDraft }
  | { type: "delete-dress"; dressId: string };

function shopReducer(state: ShopState, action: Action): ShopState {
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
            cancelledAt: "",
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

const initialState: ShopState = {
  role: "employee",
  signedIn: false,
  sessionName: "",
  employeeId: "",
  dresses: INITIAL_DRESSES,
  customers: INITIAL_CUSTOMERS,
  employees: INITIAL_EMPLOYEES,
  governmentRecords: INITIAL_GOVERNMENT_RECORDS,
  fixedExpenses: INITIAL_FIXED_EXPENSES,
  variableExpenses: INITIAL_VARIABLE_EXPENSES,
  bookings: INITIAL_BOOKINGS,
  discountPolicy: INITIAL_DISCOUNT_POLICY,
};

interface ShopContextValue extends ShopState {
  authReady: boolean;
  isOwner: boolean;
  signIn: (username: string, password: string) => boolean;
  signOut: () => void;
  createBooking: (input: {
    dressId: string;
    customerId?: string;
    customerName: string;
    phone?: string;
    eventDate?: string;
    startDate: string;
    endDate: string;
    pickupDate?: string;
    handoverDate?: string;
    returnDate?: string;
    discountType: DiscountType;
    discountValue: number;
    depositPaid: number;
    needsAlterations: boolean;
    needsFitting: boolean;
  }) => void;
  addCustomer: (draft: CustomerDraft) => boolean;
  updateCustomer: (customerId: string, draft: CustomerDraft) => boolean;
  addEmployee: (draft: EmployeeDraft, password?: string) => string | false;
  updateEmployee: (employeeId: string, draft: EmployeeDraft) => boolean;
  deleteEmployee: (employeeId: string) => boolean;
  addStaffAccount: (
    name: string,
    password: string,
  ) => "ok" | "forbidden" | "name-required" | "owner-name" | "name-taken" | "too-short";
  renameEmployee: (
    employeeId: string,
    name: string,
  ) => "ok" | "forbidden" | "name-required" | "owner-name" | "name-taken";
  ownerLoginPassword: string;
  staffLoginPassword: (employeeId: string) => string;
  changeOwnerPassword: (current: string, next: string) => "ok" | "forbidden" | "wrong-current" | "too-short";
  changeStaffPassword: (employeeId: string, next: string) => "ok" | "forbidden" | "too-short";
  addGovernmentRecord: (draft: GovernmentRecordDraft) => boolean;
  updateGovernmentRecord: (recordId: string, draft: GovernmentRecordDraft) => boolean;
  deleteGovernmentRecord: (recordId: string) => boolean;
  setDiscountPolicy: (policy: EmployeeDiscountPolicy) => void;
  pickupDress: (dressId: string) => void;
  returnDress: (dressId: string) => void;
  cancelBooking: (bookingId: string) => void;
  completeMaintenance: (dressId: string) => void;
  addVariableExpense: (expense: Omit<VariableExpense, "id">) => void;
  updateFixedExpense: (expenseId: string, amount: number) => boolean;
  addFixedExpense: (name: string, amount: number) => boolean;
  deleteFixedExpense: (expenseId: string) => boolean;
  addDress: (draft: DressCatalogDraft) => boolean;
  updateDress: (dressId: string, draft: DressCatalogDraft) => boolean;
  deleteDress: (dressId: string) => boolean;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shopReducer, initialState);
  const [authReady, setAuthReady] = useState(false);
  const [rosterReady, setRosterReady] = useState(false);
  const [passwords, setPasswords] = useState<PasswordStore>(defaultPasswordStore);

  useEffect(() => {
    setPasswords(readPasswords());
    const storedEmployees = readStoredEmployees();
    if (storedEmployees) dispatch({ type: "hydrate-employees", employees: storedEmployees });
    const roster = storedEmployees ?? initialState.employees;
    const saved = readSession();
    if (saved?.role === "owner") {
      dispatch({ type: "sign-in", session: saved });
    } else if (saved?.role === "employee") {
      const employee = roster.find((item) => item.id === saved.employeeId && item.active);
      if (employee) {
        dispatch({ type: "sign-in", session: { role: "employee", name: employee.name, employeeId: employee.id } });
      } else {
        clearSession();
      }
    }
    setRosterReady(true);
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!rosterReady) return;
    writeStoredEmployees(state.employees);
  }, [rosterReady, state.employees]);

  const signIn = useCallback((username: string, password: string) => {
    const session = verifyLogin(state.employees, username, password, passwords);
    if (!session) return false;
    writeSession(session);
    dispatch({ type: "sign-in", session });
    return true;
  }, [passwords, state.employees]);

  const changeOwnerPassword = useCallback(
    (current: string, next: string) => {
      if (state.role !== "owner" || !state.signedIn) return "forbidden";
      const result = setOwnerPasswordInStore(passwords, current, next);
      if (result === "wrong-current" || result === "too-short") return result;
      writePasswords(result);
      setPasswords(result);
      return "ok";
    },
    [passwords, state.role, state.signedIn],
  );

  const changeStaffPassword = useCallback(
    (employeeId: string, next: string) => {
      if (state.role !== "owner" || !state.signedIn) return "forbidden";
      if (!state.employees.some((item) => item.id === employeeId)) return "forbidden";
      const result = setStaffPasswordInStore(passwords, employeeId, next);
      if (result === "too-short") return result;
      writePasswords(result);
      setPasswords(result);
      return "ok";
    },
    [passwords, state.employees, state.role, state.signedIn],
  );

  const signOut = useCallback(() => {
    clearSession();
    dispatch({ type: "sign-out" });
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
      pickupDate?: string;
      handoverDate?: string;
      returnDate?: string;
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
    (draft: EmployeeDraft, password?: string) => {
      if (state.role !== "owner") return false;
      const normalized = normalizeEmployeeDraft(draft);
      if (!normalized || isEmployeeNumberTaken(state.employees, normalized.number)) return false;
      if (isEmployeePhoneTaken(state.employees, normalized.phone)) return false;
      if (employeeLoginNameError(state.employees, normalized.name)) return false;
      const employeeId = crypto.randomUUID();
      if (password !== undefined) {
        const nextPasswords = setStaffPasswordInStore(passwords, employeeId, password);
        if (nextPasswords === "too-short") return false;
        writePasswords(nextPasswords);
        setPasswords(nextPasswords);
      }
      dispatch({ type: "add-employee", employeeId, draft: normalized });
      return employeeId;
    },
    [passwords, state.employees, state.role],
  );

  const updateEmployee = useCallback(
    (employeeId: string, draft: EmployeeDraft) => {
      if (state.role !== "owner") return false;
      const current = state.employees.find((item) => item.id === employeeId);
      const normalized = normalizeEmployeeDraft(draft);
      if (!current || !normalized) return false;
      if (isEmployeeNumberTaken(state.employees, normalized.number, employeeId)) return false;
      if (isEmployeePhoneTaken(state.employees, normalized.phone, employeeId)) return false;
      if (employeeLoginNameError(state.employees, normalized.name, employeeId)) return false;
      dispatch({ type: "update-employee", employeeId, draft: normalized });
      return true;
    },
    [state.employees, state.role],
  );

  const addStaffAccount = useCallback(
    (name: string, password: string): "ok" | "forbidden" | "name-required" | "owner-name" | "name-taken" | "too-short" => {
      if (state.role !== "owner" || !state.signedIn) return "forbidden";
      const nameError = employeeLoginNameError(state.employees, name);
      if (nameError) return nameError;
      const sanitized = sanitizePassword(password);
      if (!sanitized) return "too-short";
      const employeeId = crypto.randomUUID();
      const nextPasswords = setStaffPasswordInStore(passwords, employeeId, sanitized);
      if (nextPasswords === "too-short") return "too-short";
      dispatch({
        type: "add-employee",
        employeeId,
        draft: {
          number: suggestEmployeeNumber(state.employees),
          name: name.trim(),
          phone: "",
          jobTitle: "بائعة",
          salary: 0,
          startDate: todayIso(),
          active: true,
          notes: "",
        },
      });
      writePasswords(nextPasswords);
      setPasswords(nextPasswords);
      return "ok";
    },
    [passwords, state.employees, state.role, state.signedIn],
  );

  const renameEmployee = useCallback(
    (employeeId: string, name: string): "ok" | "forbidden" | "name-required" | "owner-name" | "name-taken" => {
      if (state.role !== "owner" || !state.signedIn) return "forbidden";
      const current = state.employees.find((item) => item.id === employeeId);
      if (!current) return "forbidden";
      const nameError = employeeLoginNameError(state.employees, name, employeeId);
      if (nameError) return nameError;
      const nextName = name.trim();
      if (nextName === current.name) return "ok";
      dispatch({
        type: "update-employee",
        employeeId,
        draft: { ...current, name: nextName },
      });
      return "ok";
    },
    [state.employees, state.role, state.signedIn],
  );

  const deleteEmployee = useCallback(
    (employeeId: string) => {
      if (state.role !== "owner" || !state.signedIn) return false;
      if (!state.employees.some((item) => item.id === employeeId)) return false;
      const nextPasswords = removeStaffPasswordInStore(passwords, employeeId);
      if (nextPasswords !== passwords) {
        writePasswords(nextPasswords);
        setPasswords(nextPasswords);
      }
      dispatch({ type: "delete-employee", employeeId });
      return true;
    },
    [passwords, state.employees, state.role, state.signedIn],
  );

  const addGovernmentRecord = useCallback(
    (draft: GovernmentRecordDraft) => {
      if (state.role !== "owner") return false;
      const normalized = normalizeGovernmentRecordDraft(draft);
      if (!normalized) return false;
      dispatch({ type: "add-government-record", draft: normalized });
      return true;
    },
    [state.role],
  );

  const updateGovernmentRecord = useCallback(
    (recordId: string, draft: GovernmentRecordDraft) => {
      if (state.role !== "owner") return false;
      const current = state.governmentRecords.find((item) => item.id === recordId);
      const normalized = normalizeGovernmentRecordDraft(draft);
      if (!current || !normalized) return false;
      dispatch({ type: "update-government-record", recordId, draft: normalized });
      return true;
    },
    [state.governmentRecords, state.role],
  );

  const deleteGovernmentRecord = useCallback(
    (recordId: string) => {
      if (state.role !== "owner") return false;
      if (!state.governmentRecords.some((item) => item.id === recordId)) return false;
      dispatch({ type: "delete-government-record", recordId });
      return true;
    },
    [state.governmentRecords, state.role],
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

  const cancelBooking = useCallback((bookingId: string) => {
    dispatch({ type: "cancel-booking", bookingId });
  }, []);

  const completeMaintenance = useCallback((dressId: string) => {
    dispatch({ type: "complete-maintenance", dressId });
  }, []);

  const addVariableExpense = useCallback((expense: Omit<VariableExpense, "id">) => {
    dispatch({ type: "add-variable-expense", expense });
  }, []);

  const updateFixedExpense = useCallback(
    (expenseId: string, amount: number) => {
      if (state.role !== "owner" || isSalaryExpense(expenseId)) return false;
      if (normalizeExpenseAmount(amount) === null) return false;
      if (!state.fixedExpenses.some((item) => item.id === expenseId)) return false;
      dispatch({ type: "update-fixed-expense", expenseId, amount });
      return true;
    },
    [state.fixedExpenses, state.role],
  );

  const addFixedExpense = useCallback(
    (name: string, amount: number) => {
      if (state.role !== "owner") return false;
      if (!name.trim() || normalizeExpenseAmount(amount) === null) return false;
      dispatch({ type: "add-fixed-expense", name, amount });
      return true;
    },
    [state.role],
  );

  const deleteFixedExpense = useCallback(
    (expenseId: string) => {
      if (state.role !== "owner" || isStandardMonthlyExpense(expenseId)) return false;
      dispatch({ type: "delete-fixed-expense", expenseId });
      return true;
    },
    [state.role],
  );

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

  const staffLoginPassword = useCallback(
    (employeeId: string) => staffPassword(passwords, employeeId),
    [passwords],
  );

  const value = useMemo<ShopContextValue>(
    () => ({
      ...state,
      authReady,
      isOwner: state.role === "owner" && state.signedIn,
      signIn,
      signOut,
      createBooking,
      addCustomer,
      updateCustomer,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addStaffAccount,
      renameEmployee,
      ownerLoginPassword: ownerPassword(passwords),
      staffLoginPassword,
      changeOwnerPassword,
      changeStaffPassword,
      addGovernmentRecord,
      updateGovernmentRecord,
      deleteGovernmentRecord,
      setDiscountPolicy,
      pickupDress,
      returnDress,
      cancelBooking,
      completeMaintenance,
      addVariableExpense,
      updateFixedExpense,
      addFixedExpense,
      deleteFixedExpense,
      addDress,
      updateDress,
      deleteDress,
    }),
    [
      state,
      authReady,
      signIn,
      signOut,
      createBooking,
      addCustomer,
      updateCustomer,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addStaffAccount,
      renameEmployee,
      passwords,
      staffLoginPassword,
      changeOwnerPassword,
      changeStaffPassword,
      addGovernmentRecord,
      updateGovernmentRecord,
      deleteGovernmentRecord,
      setDiscountPolicy,
      pickupDress,
      returnDress,
      cancelBooking,
      completeMaintenance,
      addVariableExpense,
      updateFixedExpense,
      addFixedExpense,
      deleteFixedExpense,
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

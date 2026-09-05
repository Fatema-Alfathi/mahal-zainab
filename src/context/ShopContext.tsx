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
  INITIAL_DRESSES,
  INITIAL_DISCOUNT_POLICY,
  INITIAL_FIXED_EXPENSES,
  INITIAL_VARIABLE_EXPENSES,
} from "@/data/mockData";
import { isBarcodeTaken, normalizeDressDraft } from "@/lib/dressCatalog";
import { applyBookingDiscount, calculateBookingSubtotal, createDryCleaningExpense } from "@/lib/finance";
import { todayIso } from "@/lib/format";
import {
  DRY_CLEANING_FEE,
  type DiscountType,
  type DressCatalogDraft,
  type EmployeeDiscountPolicy,
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
      customerName: string;
      startDate: string;
      endDate: string;
      discountType: DiscountType;
      discountValue: number;
    }
  | { type: "set-discount-policy"; policy: EmployeeDiscountPolicy }
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
      return {
        ...state,
        dresses: state.dresses.map((item) =>
          item.id === action.dressId ? { ...item, status: "rented" } : item,
        ),
        bookings: [
          {
            id: crypto.randomUUID(),
            dressId: action.dressId,
            customerName: action.customerName,
            startDate: action.startDate,
            endDate: action.endDate,
            subtotal,
            discountType: authorized.discountType,
            discountValue: authorized.discountValue,
            discountAmount,
            totalRevenueGenerated: total,
            status: "active",
          },
          ...state.bookings,
        ],
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
          booking.id === activeBooking?.id ? { ...booking, status: "completed" } : booking,
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
                purchasePrice: state.role === "owner" ? draft.purchasePrice : item.purchasePrice,
              }
            : item,
        ),
      };
    }

    case "delete-dress": {
      const dress = state.dresses.find((item) => item.id === action.dressId);
      if (!dress || dress.status === "rented") return state;
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
    customerName: string;
    startDate: string;
    endDate: string;
    discountType: DiscountType;
    discountValue: number;
  }) => void;
  setDiscountPolicy: (policy: EmployeeDiscountPolicy) => void;
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
      customerName: string;
      startDate: string;
      endDate: string;
      discountType: DiscountType;
      discountValue: number;
    }) => {
      dispatch({ type: "create-booking", ...input });
    },
    [],
  );

  const setDiscountPolicy = useCallback((policy: EmployeeDiscountPolicy) => {
    dispatch({ type: "set-discount-policy", policy });
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
      if (!dress || dress.status === "rented") return false;
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
      setDiscountPolicy,
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
      setDiscountPolicy,
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

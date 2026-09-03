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
  INITIAL_FIXED_EXPENSES,
  INITIAL_VARIABLE_EXPENSES,
} from "@/data/mockData";
import { calculateBookingRevenue, createDryCleaningExpense } from "@/lib/finance";
import { todayIso } from "@/lib/format";
import { DRY_CLEANING_FEE, type ShopState, type UserRole, type VariableExpense } from "@/types";

type Action =
  | { type: "set-role"; role: UserRole }
  | {
      type: "create-booking";
      dressId: string;
      customerName: string;
      startDate: string;
      endDate: string;
    }
  | { type: "return-dress"; dressId: string }
  | { type: "complete-maintenance"; dressId: string }
  | { type: "add-variable-expense"; expense: Omit<VariableExpense, "id"> };

function shopReducer(state: ShopState, action: Action): ShopState {
  switch (action.type) {
    case "set-role":
      return { ...state, role: action.role };

    case "create-booking": {
      const dress = state.dresses.find((item) => item.id === action.dressId);
      if (!dress || dress.status !== "available") return state;
      const revenue = calculateBookingRevenue(
        dress.rentalPricePerDay,
        action.startDate,
        action.endDate,
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
            totalRevenueGenerated: revenue,
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

    case "complete-maintenance":
      return {
        ...state,
        dresses: state.dresses.map((item) =>
          item.id === action.dressId && item.status === "maintenance"
            ? { ...item, status: "available" }
            : item,
        ),
      };

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
};

interface ShopContextValue extends ShopState {
  isOwner: boolean;
  setRole: (role: UserRole) => void;
  createBooking: (input: {
    dressId: string;
    customerName: string;
    startDate: string;
    endDate: string;
  }) => void;
  returnDress: (dressId: string) => void;
  completeMaintenance: (dressId: string) => void;
  addVariableExpense: (expense: Omit<VariableExpense, "id">) => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shopReducer, initialState);

  const setRole = useCallback((role: UserRole) => {
    dispatch({ type: "set-role", role });
  }, []);

  const createBooking = useCallback(
    (input: { dressId: string; customerName: string; startDate: string; endDate: string }) => {
      dispatch({ type: "create-booking", ...input });
    },
    [],
  );

  const returnDress = useCallback((dressId: string) => {
    dispatch({ type: "return-dress", dressId });
  }, []);

  const completeMaintenance = useCallback((dressId: string) => {
    dispatch({ type: "complete-maintenance", dressId });
  }, []);

  const addVariableExpense = useCallback((expense: Omit<VariableExpense, "id">) => {
    dispatch({ type: "add-variable-expense", expense });
  }, []);

  const value = useMemo<ShopContextValue>(
    () => ({
      ...state,
      isOwner: state.role === "owner",
      setRole,
      createBooking,
      returnDress,
      completeMaintenance,
      addVariableExpense,
    }),
    [state, setRole, createBooking, returnDress, completeMaintenance, addVariableExpense],
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

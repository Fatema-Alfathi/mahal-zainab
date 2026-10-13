"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { clearSession, readSession, verifyLogin, writeSession, type AuthSession } from "@/lib/auth";
import { isCustomerNumberTaken, matchCustomer, normalizeCustomerDraft } from "@/lib/customers";
import { isBarcodeTaken, normalizeDressDraft } from "@/lib/dressCatalog";
import { isEmployeeNumberTaken, isEmployeePhoneTaken, normalizeEmployeeDraft } from "@/lib/employees";
import { isSalaryExpense, isStandardMonthlyExpense, normalizeExpenseAmount } from "@/lib/monthlyExpenses";
import { normalizeGovernmentRecordDraft } from "@/lib/governmentRecords";
import { todayIso } from "@/lib/format";
import { initialState, shopReducer, type Action } from "@/lib/shopReducer";
import type {
  CustomerDraft,
  DiscountType,
  DressCatalogDraft,
  EmployeeDiscountPolicy,
  EmployeeDraft,
  GovernmentRecordDraft,
  PersistedShop,
  ShopState,
  VariableExpense,
} from "@/types";


interface ShopContextValue extends ShopState {
  authReady: boolean;
  loadError: boolean;
  syncError: boolean;
  isOwner: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
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
  addEmployee: (draft: EmployeeDraft) => boolean;
  updateEmployee: (employeeId: string, draft: EmployeeDraft) => boolean;
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
  const [loadError, setLoadError] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const backendRef = useRef<"unknown" | "local" | "supabase">("unknown");
  const saveSeq = useRef(0);

  const commit = useCallback((action: Action) => {
    dispatch(action);
    if (backendRef.current !== "supabase") return;
    const id = ++saveSeq.current;
    setSyncError(false);
    void (async () => {
      try {
        const res = await fetch("/api/shop/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, today: todayIso() }),
        });
        if (id !== saveSeq.current) return;
        if (!res.ok) {
          setSyncError(true);
          const fresh = await fetch("/api/shop/");
          if (fresh.ok && id === saveSeq.current) {
            const body = (await fresh.json()) as { data: PersistedShop };
            dispatch({ type: "replace-data", data: body.data });
          }
          return;
        }
        const body = (await res.json()) as { data: PersistedShop };
        if (id !== saveSeq.current) return;
        dispatch({ type: "replace-data", data: body.data });
      } catch {
        if (id === saveSeq.current) setSyncError(true);
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        const probe = await fetch("/api/auth/session/");
        if (cancelled) return;
        if (probe.status === 503) {
          backendRef.current = "local";
          const saved = readSession();
          if (saved?.role === "owner") {
            dispatch({ type: "sign-in", session: saved });
          } else if (saved?.role === "employee") {
            const employee = initialState.employees.find((item) => item.id === saved.employeeId && item.active);
            if (employee) {
              dispatch({
                type: "sign-in",
                session: { role: "employee", name: employee.name, employeeId: employee.id },
              });
            } else {
              clearSession();
            }
          }
          setAuthReady(true);
          return;
        }
        if (!probe.ok) throw new Error("session");
        backendRef.current = "supabase";
        clearSession();
        const sessionBody = (await probe.json()) as { session: AuthSession | null };
        if (sessionBody.session) {
          const shop = await fetch("/api/shop/");
          if (!shop.ok) throw new Error("shop");
          const shopBody = (await shop.json()) as { data: PersistedShop };
          dispatch({ type: "replace-data", data: shopBody.data });
          dispatch({ type: "sign-in", session: sessionBody.session });
        }
        if (!cancelled) setAuthReady(true);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setAuthReady(true);
        }
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    if (backendRef.current === "supabase") {
      const res = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.status >= 500) {
        setLoadError(true);
        return false;
      }
      if (!res.ok) return false;
      const body = (await res.json()) as { session: AuthSession; data: PersistedShop };
      dispatch({ type: "replace-data", data: body.data });
      dispatch({ type: "sign-in", session: body.session });
      return true;
    }
    const session = verifyLogin(state.employees, username, password);
    if (!session) return false;
    writeSession(session);
    dispatch({ type: "sign-in", session });
    return true;
  }, [state.employees]);

  const signOut = useCallback(() => {
    if (backendRef.current === "supabase") {
      void fetch("/api/auth/logout/", { method: "POST" });
    }
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
      commit({ type: "create-booking", ...input });
    },
    [commit],
  );

  const addCustomer = useCallback(
    (draft: CustomerDraft) => {
      const normalized = normalizeCustomerDraft(draft);
      if (!normalized || isCustomerNumberTaken(state.customers, normalized.number)) return false;
      if (matchCustomer(state.customers, normalized.name, normalized.phone)) return false;
      commit({ type: "add-customer", draft: normalized });
      return true;
    },
    [state.customers, commit],
  );

  const updateCustomer = useCallback(
    (customerId: string, draft: CustomerDraft) => {
      const current = state.customers.find((item) => item.id === customerId);
      const normalized = normalizeCustomerDraft(draft);
      if (!current || !normalized || isCustomerNumberTaken(state.customers, normalized.number, customerId)) return false;
      commit({ type: "update-customer", customerId, draft: normalized });
      return true;
    },
    [state.customers, commit],
  );

  const addEmployee = useCallback(
    (draft: EmployeeDraft) => {
      if (state.role !== "owner") return false;
      const normalized = normalizeEmployeeDraft(draft);
      if (!normalized || isEmployeeNumberTaken(state.employees, normalized.number)) return false;
      if (isEmployeePhoneTaken(state.employees, normalized.phone)) return false;
      commit({ type: "add-employee", draft: normalized });
      return true;
    },
    [state.employees, state.role, commit],
  );

  const updateEmployee = useCallback(
    (employeeId: string, draft: EmployeeDraft) => {
      if (state.role !== "owner") return false;
      const current = state.employees.find((item) => item.id === employeeId);
      const normalized = normalizeEmployeeDraft(draft);
      if (!current || !normalized) return false;
      if (isEmployeeNumberTaken(state.employees, normalized.number, employeeId)) return false;
      if (isEmployeePhoneTaken(state.employees, normalized.phone, employeeId)) return false;
      commit({ type: "update-employee", employeeId, draft: normalized });
      return true;
    },
    [state.employees, state.role, commit],
  );

  const addGovernmentRecord = useCallback(
    (draft: GovernmentRecordDraft) => {
      if (state.role !== "owner") return false;
      const normalized = normalizeGovernmentRecordDraft(draft);
      if (!normalized) return false;
      commit({ type: "add-government-record", draft: normalized });
      return true;
    },
    [state.role, commit],
  );

  const updateGovernmentRecord = useCallback(
    (recordId: string, draft: GovernmentRecordDraft) => {
      if (state.role !== "owner") return false;
      const current = state.governmentRecords.find((item) => item.id === recordId);
      const normalized = normalizeGovernmentRecordDraft(draft);
      if (!current || !normalized) return false;
      commit({ type: "update-government-record", recordId, draft: normalized });
      return true;
    },
    [state.governmentRecords, state.role, commit],
  );

  const deleteGovernmentRecord = useCallback(
    (recordId: string) => {
      if (state.role !== "owner") return false;
      if (!state.governmentRecords.some((item) => item.id === recordId)) return false;
      commit({ type: "delete-government-record", recordId });
      return true;
    },
    [state.governmentRecords, state.role, commit],
  );

  const setDiscountPolicy = useCallback((policy: EmployeeDiscountPolicy) => {
    commit({ type: "set-discount-policy", policy });
  }, [commit]);

  const pickupDress = useCallback((dressId: string) => {
    commit({ type: "pickup-dress", dressId });
  }, [commit]);

  const returnDress = useCallback((dressId: string) => {
    commit({ type: "return-dress", dressId });
  }, [commit]);

  const cancelBooking = useCallback((bookingId: string) => {
    commit({ type: "cancel-booking", bookingId });
  }, [commit]);

  const completeMaintenance = useCallback((dressId: string) => {
    commit({ type: "complete-maintenance", dressId });
  }, [commit]);

  const addVariableExpense = useCallback((expense: Omit<VariableExpense, "id">) => {
    commit({ type: "add-variable-expense", expense });
  }, [commit]);

  const updateFixedExpense = useCallback(
    (expenseId: string, amount: number) => {
      if (state.role !== "owner" || isSalaryExpense(expenseId)) return false;
      if (normalizeExpenseAmount(amount) === null) return false;
      if (!state.fixedExpenses.some((item) => item.id === expenseId)) return false;
      commit({ type: "update-fixed-expense", expenseId, amount });
      return true;
    },
    [state.fixedExpenses, state.role, commit],
  );

  const addFixedExpense = useCallback(
    (name: string, amount: number) => {
      if (state.role !== "owner") return false;
      if (!name.trim() || normalizeExpenseAmount(amount) === null) return false;
      commit({ type: "add-fixed-expense", name, amount });
      return true;
    },
    [state.role, commit],
  );

  const deleteFixedExpense = useCallback(
    (expenseId: string) => {
      if (state.role !== "owner" || isStandardMonthlyExpense(expenseId)) return false;
      commit({ type: "delete-fixed-expense", expenseId });
      return true;
    },
    [state.role, commit],
  );

  const addDress = useCallback(
    (draft: DressCatalogDraft) => {
      const normalized = normalizeDressDraft(draft);
      if (!normalized || isBarcodeTaken(state.dresses, normalized.barcode)) return false;
      commit({ type: "add-dress", draft: normalized });
      return true;
    },
    [state.dresses, commit],
  );

  const updateDress = useCallback(
    (dressId: string, draft: DressCatalogDraft) => {
      const current = state.dresses.find((item) => item.id === dressId);
      if (!current) return false;
      const normalized = normalizeDressDraft(draft);
      if (!normalized || isBarcodeTaken(state.dresses, normalized.barcode, dressId)) return false;
      commit({ type: "update-dress", dressId, draft: normalized });
      return true;
    },
    [state.dresses, commit],
  );

  const deleteDress = useCallback(
    (dressId: string) => {
      const dress = state.dresses.find((item) => item.id === dressId);
      if (!dress || dress.status === "rented" || dress.status === "reserved") return false;
      commit({ type: "delete-dress", dressId });
      return true;
    },
    [state.dresses, commit],
  );

  const value = useMemo<ShopContextValue>(
    () => ({
      ...state,
      authReady,
      loadError,
      syncError,
      isOwner: state.role === "owner" && state.signedIn,
      signIn,
      signOut,
      createBooking,
      addCustomer,
      updateCustomer,
      addEmployee,
      updateEmployee,
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
      loadError,
      syncError,
      signIn,
      signOut,
      createBooking,
      addCustomer,
      updateCustomer,
      addEmployee,
      updateEmployee,
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

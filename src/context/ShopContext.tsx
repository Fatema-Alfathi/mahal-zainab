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
import { parseShopBackup, readStoredShop, snapshotFromState, writeStoredShop, type ShopSnapshot } from "@/lib/shopBackup";
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
import { initialState, shopReducer, type Action } from "@/lib/shopReducer";
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
  }) => void;
  addCustomer: (draft: CustomerDraft) => string | false;
  updateCustomer: (customerId: string, draft: CustomerDraft) => boolean;
  addEmployee: (draft: EmployeeDraft, password?: string) => Promise<string | false>;
  updateEmployee: (employeeId: string, draft: EmployeeDraft) => boolean;
  deleteEmployee: (employeeId: string) => boolean;
  addStaffAccount: (
    name: string,
    password: string,
  ) => Promise<"ok" | "forbidden" | "name-required" | "owner-name" | "name-taken" | "too-short">;
  renameEmployee: (
    employeeId: string,
    name: string,
  ) => "ok" | "forbidden" | "name-required" | "owner-name" | "name-taken";
  ownerLoginPassword: string;
  staffLoginPassword: (employeeId: string) => string;
  changeOwnerPassword: (current: string, next: string) => Promise<"ok" | "forbidden" | "wrong-current" | "too-short">;
  changeStaffPassword: (employeeId: string, next: string) => Promise<"ok" | "forbidden" | "too-short">;
  addGovernmentRecord: (draft: GovernmentRecordDraft) => boolean;
  updateGovernmentRecord: (recordId: string, draft: GovernmentRecordDraft) => boolean;
  deleteGovernmentRecord: (recordId: string) => boolean;
  setDiscountPolicy: (policy: EmployeeDiscountPolicy) => void;
  pickupDress: (dressId: string) => void;
  returnDress: (dressId: string) => void;
  cancelBooking: (bookingId: string) => void;
  recordPayment: (bookingId: string, amount: number) => boolean;
  completeMaintenance: (dressId: string) => void;
  addVariableExpense: (expense: Omit<VariableExpense, "id">) => void;
  updateFixedExpense: (expenseId: string, amount: number) => boolean;
  addFixedExpense: (name: string, amount: number) => boolean;
  deleteFixedExpense: (expenseId: string) => boolean;
  addDress: (draft: DressCatalogDraft) => boolean;
  updateDress: (dressId: string, draft: DressCatalogDraft) => boolean;
  deleteDress: (dressId: string) => boolean;
  restoreShop: (raw: unknown) => boolean;
  restoreDailyBackup: (date: string) => Promise<boolean>;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shopReducer, initialState);
  const [authReady, setAuthReady] = useState(false);
  const [rosterReady, setRosterReady] = useState(false);
  const [shopReady, setShopReady] = useState(false);
  const [passwords, setPasswords] = useState<PasswordStore>(defaultPasswordStore);
  const [loadError, setLoadError] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const backendRef = useRef<"unknown" | "local" | "supabase">("unknown");
  const saveSeq = useRef(0);

  const persist = useCallback(async (action: Action) => {
    dispatch(action);
    if (backendRef.current !== "supabase") return true;
    const id = ++saveSeq.current;
    setSyncError(false);
    try {
      const res = await fetch("/api/shop/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, today: todayIso() }),
      });
      if (id !== saveSeq.current) return res.ok;
      if (!res.ok) {
        setSyncError(true);
        const fresh = await fetch("/api/shop/");
        if (fresh.ok && id === saveSeq.current) {
          const body = (await fresh.json()) as { data: ShopSnapshot };
          dispatch({ type: "hydrate-shop", snapshot: body.data });
        }
        return false;
      }
      const body = (await res.json()) as { data: ShopSnapshot };
      if (id === saveSeq.current) dispatch({ type: "hydrate-shop", snapshot: body.data });
      return true;
    } catch {
      if (id === saveSeq.current) setSyncError(true);
      return false;
    }
  }, []);

  const commit = useCallback(
    (action: Action) => {
      void persist(action);
    },
    [persist],
  );

  const saveStaffPassword = useCallback(async (employeeId: string, password: string) => {
    if (backendRef.current !== "supabase") {
      const result = setStaffPasswordInStore(passwords, employeeId, password);
      if (result === "too-short") return "too-short" as const;
      writePasswords(result);
      setPasswords(result);
      return "ok" as const;
    }
    const res = await fetch("/api/auth/staff-password/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, password }),
    });
    if (res.status === 400) return "too-short" as const;
    if (!res.ok) return "forbidden" as const;
    return "ok" as const;
  }, [passwords]);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setPasswords(readPasswords());
      try {
        const probe = await fetch("/api/auth/session/");
        if (cancelled) return;
        if (probe.status === 503) {
          backendRef.current = "local";
          const storedShop = readStoredShop();
          if (storedShop) dispatch({ type: "hydrate-shop", snapshot: storedShop });
          const storedEmployees = readStoredEmployees();
          if (storedEmployees) dispatch({ type: "hydrate-employees", employees: storedEmployees });
          const roster = storedEmployees ?? storedShop?.employees ?? initialState.employees;
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
          setShopReady(true);
          setAuthReady(true);
          return;
        }
        if (!probe.ok) throw new Error("session");
        backendRef.current = "supabase";
        clearSession();
        const sessionBody = (await probe.json()) as {
          session: AuthSession | null;
          staff?: Array<{ id: string; name: string }>;
        };
        if (sessionBody.staff?.length) {
          dispatch({
            type: "hydrate-employees",
            employees: sessionBody.staff.map((item) => ({
              id: item.id,
              number: "",
              name: item.name,
              phone: "",
              jobTitle: "",
              salary: 0,
              startDate: "",
              active: true,
              notes: "",
            })),
          });
        }
        if (sessionBody.session) {
          const shop = await fetch("/api/shop/");
          if (!shop.ok) throw new Error("shop");
          const shopBody = (await shop.json()) as { data: ShopSnapshot };
          dispatch({ type: "hydrate-shop", snapshot: shopBody.data });
          dispatch({ type: "sign-in", session: sessionBody.session });
        }
        if (!cancelled) {
          setRosterReady(true);
          setShopReady(true);
          setAuthReady(true);
        }
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

  useEffect(() => {
    if (!rosterReady) return;
    writeStoredEmployees(state.employees);
  }, [rosterReady, state.employees]);

  useEffect(() => {
    if (!shopReady) return;
    writeStoredShop(snapshotFromState(state));
  }, [
    shopReady,
    state.dresses,
    state.customers,
    state.employees,
    state.governmentRecords,
    state.fixedExpenses,
    state.variableExpenses,
    state.bookings,
    state.discountPolicy,
  ]);

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
      const body = (await res.json()) as { session: AuthSession; data: ShopSnapshot };
      dispatch({ type: "hydrate-shop", snapshot: body.data });
      dispatch({ type: "sign-in", session: body.session });
      return true;
    }
    const session = verifyLogin(state.employees, username, password, passwords);
    if (!session) return false;
    writeSession(session);
    dispatch({ type: "sign-in", session });
    return true;
  }, [passwords, state.employees]);

  const changeOwnerPassword = useCallback(
    async (current: string, next: string) => {
      if (state.role !== "owner" || !state.signedIn) return "forbidden" as const;
      if (backendRef.current === "supabase") {
        const res = await fetch("/api/auth/password/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current, next }),
        });
        if (res.ok) return "ok" as const;
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        if (body?.error === "wrong-current") return "wrong-current" as const;
        if (body?.error === "too-short") return "too-short" as const;
        return "forbidden" as const;
      }
      const result = setOwnerPasswordInStore(passwords, current, next);
      if (result === "wrong-current" || result === "too-short") return result;
      writePasswords(result);
      setPasswords(result);
      return "ok" as const;
    },
    [passwords, state.role, state.signedIn],
  );

  const changeStaffPassword = useCallback(
    async (employeeId: string, next: string) => {
      if (state.role !== "owner" || !state.signedIn) return "forbidden" as const;
      if (!state.employees.some((item) => item.id === employeeId)) return "forbidden" as const;
      return saveStaffPassword(employeeId, next);
    },
    [saveStaffPassword, state.employees, state.role, state.signedIn],
  );

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
      const customerId = crypto.randomUUID();
      commit({ type: "add-customer", customerId, draft: normalized });
      return customerId;
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
    async (draft: EmployeeDraft, password?: string) => {
      if (state.role !== "owner") return false;
      const normalized = normalizeEmployeeDraft(draft);
      if (!normalized || isEmployeeNumberTaken(state.employees, normalized.number)) return false;
      if (isEmployeePhoneTaken(state.employees, normalized.phone)) return false;
      if (employeeLoginNameError(state.employees, normalized.name)) return false;
      const employeeId = crypto.randomUUID();
      if (password !== undefined && password.trim() && sanitizePassword(password) === null) return false;
      const saved = await persist({ type: "add-employee", employeeId, draft: normalized });
      if (!saved) return false;
      if (password !== undefined && password.trim()) {
        const result = await saveStaffPassword(employeeId, password);
        if (result !== "ok") return false;
      }
      return employeeId;
    },
    [persist, saveStaffPassword, state.employees, state.role],
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
      commit({ type: "update-employee", employeeId, draft: normalized });
      return true;
    },
    [state.employees, state.role, commit],
  );

  const addStaffAccount = useCallback(
    async (name: string, password: string) => {
      if (state.role !== "owner" || !state.signedIn) return "forbidden" as const;
      const nameError = employeeLoginNameError(state.employees, name);
      if (nameError) return nameError;
      if (!sanitizePassword(password)) return "too-short" as const;
      const employeeId = crypto.randomUUID();
      const saved = await persist({
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
      if (!saved) return "forbidden" as const;
      const result = await saveStaffPassword(employeeId, password);
      if (result === "too-short") return "too-short" as const;
      if (result !== "ok") return "forbidden" as const;
      return "ok" as const;
    },
    [persist, saveStaffPassword, state.employees, state.role, state.signedIn],
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
      commit({
        type: "update-employee",
        employeeId,
        draft: { ...current, name: nextName },
      });
      return "ok";
    },
    [commit, state.employees, state.role, state.signedIn],
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
      commit({ type: "delete-employee", employeeId });
      return true;
    },
    [passwords, state.employees, state.role, state.signedIn, commit],
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

  const recordPayment = useCallback(
    (bookingId: string, amount: number) => {
      const booking = state.bookings.find((item) => item.id === bookingId);
      const next = roundMoney(amount);
      if (!booking || booking.status !== "active" || next <= 0 || next > booking.remainingAmount) return false;
      commit({ type: "record-payment", bookingId, amount: next });
      return true;
    },
    [state.bookings, commit],
  );

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

  const restoreShop = useCallback(
    (raw: unknown) => {
      if (state.role !== "owner" || !state.signedIn) return false;
      const snapshot = parseShopBackup(raw);
      if (!snapshot) return false;
      commit({ type: "hydrate-shop", snapshot });
      writeStoredEmployees(snapshot.employees);
      writeStoredShop(snapshot);
      return true;
    },
    [state.role, state.signedIn, commit],
  );

  const restoreDailyBackup = useCallback(
    async (date: string) => {
      if (state.role !== "owner" || !state.signedIn || backendRef.current !== "supabase") return false;
      const res = await fetch("/api/shop/backups/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, today: todayIso() }),
      });
      if (!res.ok) return false;
      const body = (await res.json()) as { data: ShopSnapshot };
      dispatch({ type: "hydrate-shop", snapshot: body.data });
      writeStoredEmployees(body.data.employees);
      writeStoredShop(body.data);
      return true;
    },
    [state.role, state.signedIn],
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

  const staffLoginPassword = useCallback(
    (employeeId: string) => staffPassword(passwords, employeeId),
    [passwords],
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
      recordPayment,
      completeMaintenance,
      addVariableExpense,
      updateFixedExpense,
      addFixedExpense,
      deleteFixedExpense,
      addDress,
      updateDress,
      deleteDress,
      restoreShop,
      restoreDailyBackup,
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
      recordPayment,
      completeMaintenance,
      addVariableExpense,
      updateFixedExpense,
      addFixedExpense,
      deleteFixedExpense,
      addDress,
      updateDress,
      deleteDress,
      restoreShop,
      restoreDailyBackup,
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

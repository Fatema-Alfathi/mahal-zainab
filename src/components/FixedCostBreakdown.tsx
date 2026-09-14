"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Camera,
  Coffee,
  Megaphone,
  MoreHorizontal,
  Plane,
  Plus,
  Scissors,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { SALARY_EXPENSE_ID } from "@/lib/employees";
import { totalFixedExpenses } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { monthlyExpenseLabel } from "@/lib/labels";
import { isSalaryExpense, isStandardMonthlyExpense, sortMonthlyExpenses } from "@/lib/monthlyExpenses";

const ICONS: Record<string, typeof Building2> = {
  "fixed-rent": Building2,
  [SALARY_EXPENSE_ID]: Users,
  "fixed-electricity": Zap,
  "fixed-internet": Wifi,
  "fixed-ads": Megaphone,
  "fixed-photos": Camera,
  "fixed-cleaning": Sparkles,
  "fixed-repair": Scissors,
  "fixed-purchases": ShoppingBag,
  "fixed-travel": Plane,
  "fixed-exhibitions": Store,
  "fixed-hospitality": Coffee,
  "fixed-other": MoreHorizontal,
};

export function FixedCostBreakdown() {
  const { fixedExpenses, addFixedExpense, updateFixedExpense, deleteFixedExpense } = useShop();
  const { t } = useLanguage();
  const [adding, setAdding] = useState(false);
  const rows = useMemo(() => sortMonthlyExpenses(fixedExpenses), [fixedExpenses]);
  const total = totalFixedExpenses(fixedExpenses);

  return (
    <section className="shop-card rounded-3xl p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-rose-400">{t("fixed.kicker")}</p>
          <h3 className="mt-1 text-2xl font-medium text-rose-900">{t("fixed.title")}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">{t("fixed.lead")}</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((value) => !value)}
          className="shop-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("fixed.add")}
        </button>
      </div>

      {adding ? (
        <AddMonthlyExpenseForm
          onSubmit={(name, amount) => {
            if (!addFixedExpense(name, amount)) return false;
            setAdding(false);
            return true;
          }}
          onCancel={() => setAdding(false)}
        />
      ) : null}

      <ul className="space-y-2">
        {rows.map((expense) => {
          const Icon = ICONS[expense.id] ?? MoreHorizontal;
          const salary = isSalaryExpense(expense.id);
          const label = monthlyExpenseLabel(expense.id, expense.name);
          return (
            <li key={expense.id} className="flex items-center gap-3 rounded-2xl bg-rose-50/80 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-400">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-rose-900">{label}</p>
                {salary ? (
                  <p className="mt-0.5 text-xs text-rose-400">{t("fixed.fromStaff")}</p>
                ) : null}
              </div>
              {salary ? (
                <p className="shrink-0 tabular-nums text-sm text-rose-800">{formatCurrency(expense.amount)}</p>
              ) : (
                <AmountField
                  name={label}
                  amount={expense.amount}
                  onSave={(amount) => updateFixedExpense(expense.id, amount)}
                />
              )}
              {!isStandardMonthlyExpense(expense.id) ? (
                <button
                  type="button"
                  onClick={() => deleteFixedExpense(expense.id)}
                  className="rounded-full p-1.5 text-rose-300 hover:bg-white hover:text-rose-600"
                  aria-label={t("fixed.deleteAria", { name: label })}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-center justify-between border-t border-rose-100 pt-4">
        <span className="text-sm text-rose-400">{t("fixed.total")}</span>
        <span className="text-xl tabular-nums text-rose-900">{formatCurrency(total)}</span>
      </div>
    </section>
  );
}

function AmountField({
  name,
  amount,
  onSave,
}: {
  name: string;
  amount: number;
  onSave: (amount: number) => void;
}) {
  const { t } = useLanguage();
  const [value, setValue] = useState(String(amount));

  useEffect(() => {
    setValue(String(amount));
  }, [amount]);

  return (
    <label className="flex shrink-0 items-center gap-2 text-sm text-rose-700">
      <input
        type="number"
        min="0"
        step="0.1"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => {
          const parsed = Number(value);
          if (!Number.isFinite(parsed) || parsed < 0) {
            setValue(String(amount));
            return;
          }
          onSave(parsed);
          setValue(String(parsed));
        }}
        className="w-24 rounded-xl border-0 bg-white px-2 py-1.5 text-left tabular-nums text-rose-900 outline-none ring-rose-200 focus:ring-2"
        aria-label={t("fixed.amountAria", { name })}
      />
      <span className="text-xs text-rose-400">{t("currency")}</span>
    </label>
  );
}

function AddMonthlyExpenseForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string, amount: number) => boolean;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = Number(amount);
    if (!name.trim()) {
      setError("fixed.nameRequired");
      return;
    }
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("fixed.amountMin");
      return;
    }
    if (!onSubmit(name.trim(), parsed)) {
      setError("fixed.saveFail");
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 grid gap-3 rounded-2xl bg-rose-50/80 p-4 sm:grid-cols-[1fr_8rem_auto]">
      <label className="block text-sm sm:col-span-1">
        <span className="mb-1 block text-rose-700">{t("fixed.name")}</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900 outline-none ring-rose-200 focus:ring-2"
          placeholder={t("fixed.namePh")}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-rose-700">{t("fixed.amount")}</span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900 outline-none ring-rose-200 focus:ring-2"
          placeholder="20"
        />
      </label>
      <div className="flex items-end gap-2">
        <button type="submit" className="shop-btn rounded-2xl px-4 py-2.5 text-sm">
          {t("save")}
        </button>
        <button type="button" onClick={onCancel} className="rounded-2xl px-3 py-2.5 text-sm text-rose-400 hover:bg-white">
          {t("cancel")}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-700 sm:col-span-3">{t(error)}</p> : null}
    </form>
  );
}

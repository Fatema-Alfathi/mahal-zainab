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
import { cn, formatCurrency } from "@/lib/format";
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

const fieldClass =
  "w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-2.5 text-[var(--foreground)] outline-none transition focus:border-[var(--salla-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]";

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
          <p className="text-sm text-[var(--salla-muted)]">{t("fixed.kicker")}</p>
          <h3 className="mt-1 text-2xl font-medium text-[var(--foreground)]">{t("fixed.title")}</h3>
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

      <div className="p-5 sm:p-6">
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
            const Icon = ICONS[expense.name] ?? MoreHorizontal;
            const salary = isSalaryExpense(expense.id);
            return (
              <li
                key={expense.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/40 px-3 py-3 sm:px-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--salla-primary)_10%,transparent)] text-[var(--salla-primary)]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">{expense.name}</p>
                  {salary ? (
                    <p className="mt-0.5 text-xs text-[var(--salla-muted)]">من ملفات الموظفات</p>
                  ) : null}
                </div>
                {salary ? (
                  <p className="shrink-0 tabular-nums text-sm font-semibold text-[var(--salla-primary)]">
                    {formatCurrency(expense.amount)}
                  </p>
                ) : (
                  <AmountField
                    name={expense.name}
                    amount={expense.amount}
                    onSave={(amount) => updateFixedExpense(expense.id, amount)}
                  />
                )}
                {!isStandardMonthlyExpense(expense.id) ? (
                  <button
                    type="button"
                    onClick={() => deleteFixedExpense(expense.id)}
                    className="rounded-lg p-2 text-[var(--salla-muted)] hover:bg-[color-mix(in_srgb,var(--salla-danger)_12%,transparent)] hover:text-[var(--salla-danger)]"
                    aria-label={`حذف ${expense.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-[color-mix(in_srgb,var(--salla-primary)_6%,var(--salla-surface))] px-4 py-3">
          <span className="text-sm text-[var(--salla-muted)]">إجمالي المصاريف الشهرية</span>
          <span className="text-xl font-semibold tabular-nums text-[var(--salla-primary)]">{formatCurrency(total)}</span>
        </div>
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
    <label className="flex shrink-0 items-center gap-2 text-sm">
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
        className="w-24 rounded-xl border-0 bg-white px-2 py-1.5 text-left tabular-nums text-[var(--foreground)] outline-none ring-[var(--salla-border)] focus:ring-2"
        aria-label={t("fixed.amountAria", { name })}
      />
      <span className="text-xs text-[var(--salla-muted)]">{t("currency")}</span>
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
    <form onSubmit={handleSubmit} className="mb-4 grid gap-3 rounded-2xl bg-[var(--salla-soft)]/80 p-4 sm:grid-cols-[1fr_8rem_auto]">
      <label className="block text-sm sm:col-span-1">
        <span className="mb-1 block text-[var(--foreground)]">{t("fixed.name")}</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-[var(--foreground)] outline-none ring-[var(--salla-border)] focus:ring-2"
          placeholder={t("fixed.namePh")}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-[var(--foreground)]">{t("fixed.amount")}</span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className={fieldClass}
          placeholder="20"
        />
      </label>
      <div className="flex items-end gap-2">
        <button type="submit" className="shop-btn rounded-2xl px-4 py-2.5 text-sm">
          {t("save")}
        </button>
        <button type="button" onClick={onCancel} className="rounded-2xl px-3 py-2.5 text-sm text-[var(--salla-muted)] hover:bg-white">
          {t("cancel")}
        </button>
      </div>
      {error ? <p className="text-sm text-[var(--foreground)] sm:col-span-3">{t(error)}</p> : null}
    </form>
  );
}

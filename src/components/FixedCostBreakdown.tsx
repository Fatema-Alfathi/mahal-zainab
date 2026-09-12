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
import { totalFixedExpenses } from "@/lib/finance";
import { cn, formatCurrency } from "@/lib/format";
import { isSalaryExpense, isStandardMonthlyExpense, sortMonthlyExpenses } from "@/lib/monthlyExpenses";

const ICONS: Record<string, typeof Building2> = {
  الإيجار: Building2,
  الرواتب: Users,
  الكهرباء: Zap,
  الإنترنت: Wifi,
  الإعلانات: Megaphone,
  "جلسات التصوير": Camera,
  "تنظيف الفساتين": Sparkles,
  "تصليح وتعديل الفساتين": Scissors,
  المشتريات: ShoppingBag,
  السفر: Plane,
  المعارض: Store,
  الضيافة: Coffee,
  "مصروفات أخرى": MoreHorizontal,
};

const fieldClass =
  "w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-2.5 text-[var(--foreground)] outline-none transition focus:border-[var(--salla-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]";

export function FixedCostBreakdown() {
  const { fixedExpenses, addFixedExpense, updateFixedExpense, deleteFixedExpense } = useShop();
  const [adding, setAdding] = useState(false);
  const rows = useMemo(() => sortMonthlyExpenses(fixedExpenses), [fixedExpenses]);
  const total = totalFixedExpenses(fixedExpenses);

  return (
    <section className="dash-panel overflow-hidden rounded-2xl">
      <div className="border-b border-[var(--salla-border)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--salla-primary)]">كل شهر</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)] sm:text-2xl">المصاريف الشهرية</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--salla-muted)]">
              الإيجار والرواتب والكهرباء وباقي مصاريف المحل. غيّري المبلغ أو أضيفي مصروف جديد.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdding((value) => !value)}
            className="shop-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            <Plus className="h-4 w-4" aria-hidden />
            إضافة مصروف
          </button>
        </div>
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
        className="w-24 rounded-lg border border-[var(--salla-border)] bg-[var(--salla-surface)] px-2 py-1.5 text-left tabular-nums text-[var(--foreground)] outline-none focus:border-[var(--salla-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
        aria-label={`مبلغ ${name}`}
      />
      <span className="text-xs text-[var(--salla-muted)]">ر.ع.</span>
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
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = Number(amount);
    if (!name.trim()) {
      setError("اكتبي اسم المصروف.");
      return;
    }
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("أدخلي مبلغ صفر أو أكثر.");
      return;
    }
    if (!onSubmit(name.trim(), parsed)) {
      setError("تعذر حفظ المصروف.");
      return;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 grid gap-3 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/50 p-4 sm:grid-cols-[1fr_8rem_auto]"
    >
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-[var(--foreground)]">اسم المصروف</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={fieldClass}
          placeholder="مثل: صيانة المكيف"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-[var(--foreground)]">المبلغ (ر.ع.)</span>
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
        <button type="submit" className="shop-btn rounded-xl px-4 py-2.5 text-sm font-medium">
          حفظ
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-3 py-2.5 text-sm text-[var(--salla-muted)] hover:bg-[var(--salla-surface)]"
        >
          إلغاء
        </button>
      </div>
      {error ? <p className={cn("text-sm text-[var(--salla-danger)] sm:col-span-3")}>{error}</p> : null}
    </form>
  );
}

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
import { formatCurrency } from "@/lib/format";
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

export function FixedCostBreakdown() {
  const { fixedExpenses, addFixedExpense, updateFixedExpense, deleteFixedExpense } = useShop();
  const [adding, setAdding] = useState(false);
  const rows = useMemo(() => sortMonthlyExpenses(fixedExpenses), [fixedExpenses]);
  const total = totalFixedExpenses(fixedExpenses);

  return (
    <section className="shop-card rounded-2xl p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-rose-400">كل شهر</p>
          <h3 className="mt-1 text-2xl font-medium text-rose-900">المصاريف الشهرية</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">
            الإيجار والرواتب والكهرباء وباقي مصاريف المحل. غيّري المبلغ أو أضيفي مصروف جديد، والإجمالي يظهر تحت.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((value) => !value)}
          className="shop-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" aria-hidden />
          إضافة مصروف
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
          const Icon = ICONS[expense.name] ?? MoreHorizontal;
          const salary = isSalaryExpense(expense.id);
          return (
            <li key={expense.id} className="flex items-center gap-3 rounded-2xl bg-rose-50/80 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-400">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-rose-900">{expense.name}</p>
                {salary ? (
                  <p className="mt-0.5 text-xs text-rose-400">من ملفات الموظفات</p>
                ) : null}
              </div>
              {salary ? (
                <p className="shrink-0 tabular-nums text-sm text-rose-800">{formatCurrency(expense.amount)}</p>
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
                  className="rounded-full p-1.5 text-rose-300 hover:bg-white hover:text-rose-600"
                  aria-label={`حذف ${expense.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-center justify-between border-t border-rose-100 pt-4">
        <span className="text-sm text-rose-400">إجمالي المصاريف</span>
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
        aria-label={`مبلغ ${name}`}
      />
      <span className="text-xs text-rose-400">ر.ع.</span>
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
    <form onSubmit={handleSubmit} className="mb-4 grid gap-3 rounded-2xl bg-rose-50/80 p-4 sm:grid-cols-[1fr_8rem_auto]">
      <label className="block text-sm sm:col-span-1">
        <span className="mb-1 block text-rose-700">اسم المصروف</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900 outline-none ring-rose-200 focus:ring-2"
          placeholder="مثل: صيانة المكيف"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-rose-700">المبلغ (ر.ع.)</span>
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
          حفظ
        </button>
        <button type="button" onClick={onCancel} className="rounded-2xl px-3 py-2.5 text-sm text-rose-400 hover:bg-white">
          إلغاء
        </button>
      </div>
      {error ? <p className="text-sm text-rose-700 sm:col-span-3">{error}</p> : null}
    </form>
  );
}

"use client";

import { FormEvent, useMemo, useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { formatCurrency, formatDate, todayIso } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/labels";
import { VARIABLE_EXPENSE_CATEGORIES, type VariableExpenseCategory } from "@/types";

export function VariableExpenseLog() {
  const { variableExpenses, dresses, addVariableExpense } = useShop();
  const [open, setOpen] = useState(false);
  const rows = useMemo(
    () => [...variableExpenses].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [variableExpenses],
  );

  return (
    <section className="rounded-3xl bg-white/80 p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-stone-400">مصروفات متغيرة</p>
          <h3 className="mt-1 text-2xl font-medium text-stone-800">التسويق والمصروفات</h3>
          <p className="mt-2 text-sm leading-7 text-stone-500">
            الحملات وفواتير الخدمات والتنظيف الجاف والإصلاحات.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-800 px-4 py-2.5 text-sm text-white hover:bg-stone-700"
        >
          <Plus className="h-4 w-4" aria-hidden />
          إضافة مصروف جديد
        </button>
      </div>
      {open ? (
        <AddExpenseForm
          dresses={dresses}
          onSubmit={(expense) => {
            addVariableExpense(expense);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      ) : null}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-start text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs text-stone-500">
              <th className="pb-2 font-medium">التاريخ</th>
              <th className="pb-2 font-medium">الفئة</th>
              <th className="pb-2 font-medium">الوصف</th>
              <th className="pb-2 font-medium">الفستان المرتبط</th>
              <th className="pb-2 text-end font-medium">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((expense) => {
              const dress = dresses.find((item) => item.id === expense.associatedDressId);
              return (
                <tr key={expense.id} className="border-b border-stone-100 last:border-0">
                  <td className="py-3 tabular-nums text-stone-600">{formatDate(expense.date)}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-[#f3f1ee] px-2.5 py-1 text-xs text-stone-600">
                      {CATEGORY_LABELS[expense.category]}
                    </span>
                  </td>
                  <td className="py-3 text-stone-800">{expense.description}</td>
                  <td className="py-3 text-stone-500">{dress?.name ?? "—"}</td>
                  <td className="py-3 text-end tabular-nums text-stone-800">
                    {formatCurrency(expense.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AddExpenseForm({
  dresses,
  onSubmit,
  onCancel,
}: {
  dresses: { id: string; name: string }[];
  onSubmit: (expense: {
    category: VariableExpenseCategory;
    amount: number;
    date: string;
    description: string;
    associatedDressId?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState<VariableExpenseCategory>("Marketing Campaign");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [description, setDescription] = useState("");
  const [associatedDressId, setAssociatedDressId] = useState("");
  const [error, setError] = useState("");
  const showDressLink = category === "Dry Cleaning" || category === "Dress Repair";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = Number(amount);
    if (!description.trim()) {
      setError("الوصف مطلوب.");
      return;
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("أدخل مبلغاً صحيحاً أكبر من صفر.");
      return;
    }
    onSubmit({
      category,
      amount: parsed,
      date,
      description: description.trim(),
      associatedDressId: associatedDressId || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 grid gap-3 rounded-2xl bg-[#f3f1ee]/80 p-4 md:grid-cols-2">
      <label className="block text-sm">
        <span className="mb-1 block text-stone-600">الفئة</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as VariableExpenseCategory)}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-800"
        >
          {VARIABLE_EXPENSE_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {CATEGORY_LABELS[item]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-stone-600">المبلغ</span>
        <input
          type="number"
          min="0"
          step="0.001"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-800"
          placeholder="55"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-stone-600">التاريخ</span>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-800"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-stone-600">الوصف</span>
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-800"
          placeholder="إعلانات إنستغرام لرمضان"
        />
      </label>
      {showDressLink ? (
        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block text-stone-600">الفستان المرتبط (اختياري)</span>
          <select
            value={associatedDressId}
            onChange={(event) => setAssociatedDressId(event.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-800"
          >
            <option value="">مصروف عام غير مرتبط بفستان</option>
            {dresses.map((dress) => (
              <option key={dress.id} value={dress.id}>
                {dress.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {error ? <p className="text-sm text-rose-700 md:col-span-2">{error}</p> : null}
      <div className="flex gap-2 md:col-span-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-2xl bg-teal-800 px-4 py-2 text-sm text-white hover:bg-teal-700"
        >
          <Megaphone className="h-4 w-4" aria-hidden />
          حفظ المصروف
        </button>
        <button type="button" onClick={onCancel} className="rounded-2xl px-4 py-2 text-sm text-stone-600 hover:bg-white">
          إلغاء
        </button>
      </div>
    </form>
  );
}

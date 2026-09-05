"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { formatCurrency, formatDate, todayIso } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/labels";
import { VARIABLE_EXPENSE_CATEGORIES, type VariableExpenseCategory } from "@/types";

export function VariableExpenseLog() {
  const { variableExpenses, dresses, addVariableExpense } = useShop();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const rows = useMemo(
    () => [...variableExpenses].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [variableExpenses],
  );
  const visible = showAll ? rows : rows.slice(0, 5);

  return (
    <section className="shop-card rounded-3xl p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-rose-400">مصروفات ثانية</p>
          <h3 className="mt-1 text-2xl font-medium text-rose-900">تنظيف وإعلانات</h3>
          <p className="mt-2 text-sm leading-7 text-rose-600/80">أضيفي أي مبلغ طلع من الصندوق غير الإيجار والرواتب.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="shop-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" aria-hidden />
          إضافة مصروف
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
      <ul className="space-y-2">
        {visible.map((expense) => {
          const dress = dresses.find((item) => item.id === expense.associatedDressId);
          return (
            <li key={expense.id} className="rounded-2xl bg-rose-50/80 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-rose-900">{expense.description}</p>
                  <p className="mt-1 text-xs text-rose-400">
                    {CATEGORY_LABELS[expense.category]} · {formatDate(expense.date)}
                    {dress ? ` · ${dress.name}` : ""}
                  </p>
                </div>
                <p className="shrink-0 tabular-nums text-sm text-rose-800">{formatCurrency(expense.amount)}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {rows.length > 5 ? (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="mt-3 text-sm text-rose-400 hover:text-rose-700"
        >
          {showAll ? "عرض آخر المصروفات فقط" : `عرض الكل (${rows.length})`}
        </button>
      ) : null}
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
      setError("اكتبي وصفاً قصيراً.");
      return;
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("أدخلي مبلغاً أكبر من صفر.");
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
    <form onSubmit={handleSubmit} className="mb-4 grid gap-3 rounded-2xl bg-rose-50/80 p-4">
      <label className="block text-sm">
        <span className="mb-1 block text-rose-700">النوع</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as VariableExpenseCategory)}
          className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900"
        >
          {VARIABLE_EXPENSE_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {CATEGORY_LABELS[item]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-rose-700">المبلغ (ر.ع.)</span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900"
          placeholder="55"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-rose-700">التاريخ</span>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-rose-700">الوصف</span>
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900"
          placeholder="إعلان إنستغرام"
        />
      </label>
      {showDressLink ? (
        <label className="block text-sm">
          <span className="mb-1 block text-rose-700">مرتبط بأي فستان؟ (اختياري)</span>
          <select
            value={associatedDressId}
            onChange={(event) => setAssociatedDressId(event.target.value)}
            className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900"
          >
            <option value="">مصروف عام</option>
            {dresses.map((dress) => (
              <option key={dress.id} value={dress.id}>
                {dress.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" className="shop-btn rounded-2xl px-4 py-2 text-sm">
          حفظ
        </button>
        <button type="button" onClick={onCancel} className="rounded-2xl px-4 py-2 text-sm text-rose-400 hover:bg-white">
          إلغاء
        </button>
      </div>
    </form>
  );
}

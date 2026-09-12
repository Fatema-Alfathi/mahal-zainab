"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { formatCurrency, formatDate, todayIso } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/labels";
import { VARIABLE_EXPENSE_CATEGORIES, type VariableExpenseCategory } from "@/types";

const fieldClass =
  "w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-2.5 text-[var(--foreground)] outline-none transition focus:border-[var(--salla-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]";

export function VariableExpenseLog() {
  const { variableExpenses, dresses, addVariableExpense } = useShop();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const rows = useMemo(
    () => [...variableExpenses].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [variableExpenses],
  );
  const visible = showAll ? rows : rows.slice(0, 5);
  const totalVisible = visible.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="dash-panel overflow-hidden rounded-2xl">
      <div className="border-b border-[var(--salla-border)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--salla-primary)]">بتاريخ اليوم</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)] sm:text-2xl">مصروف ليوم معيّن</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--salla-muted)]">
              إذا طلع مبلغ يوم معيّن مثل تنظيف فستان بعد التأجير، اكتبيه هنا.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="shop-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            <Plus className="h-4 w-4" aria-hidden />
            إضافة مصروف
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
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

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--salla-border)] px-4 py-10 text-center text-sm text-[var(--salla-muted)]">
            ما في مصروفات يومية مسجّلة بعد.
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((expense) => {
              const dress = dresses.find((item) => item.id === expense.associatedDressId);
              return (
                <li
                  key={expense.id}
                  className="flex items-start gap-3 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/40 px-3 py-3 sm:px-4"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--salla-primary)_10%,transparent)] text-[var(--salla-primary)]">
                    <Receipt className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)]">{expense.description}</p>
                    <p className="mt-1 text-xs text-[var(--salla-muted)]">
                      {CATEGORY_LABELS[expense.category]} · {formatDate(expense.date)}
                      {dress ? ` · ${dress.name}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 tabular-nums text-sm font-semibold text-[var(--salla-primary)]">
                    {formatCurrency(expense.amount)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {rows.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[var(--salla-muted)]">
              مجموع المعروض:{" "}
              <span className="font-semibold tabular-nums text-[var(--foreground)]">{formatCurrency(totalVisible)}</span>
            </p>
            {rows.length > 5 ? (
              <button
                type="button"
                onClick={() => setShowAll((value) => !value)}
                className="text-sm font-medium text-[var(--salla-primary)] hover:underline"
              >
                {showAll ? "عرض آخر المصروفات فقط" : `عرض الكل (${rows.length})`}
              </button>
            ) : null}
          </div>
        ) : null}
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
    <form
      onSubmit={handleSubmit}
      className="mb-4 grid gap-3 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/50 p-4"
    >
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-[var(--foreground)]">النوع</span>
        <select value={category} onChange={(event) => setCategory(event.target.value as VariableExpenseCategory)} className={fieldClass}>
          {VARIABLE_EXPENSE_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {CATEGORY_LABELS[item]}
            </option>
          ))}
        </select>
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
          placeholder="55"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-[var(--foreground)]">التاريخ</span>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={fieldClass} />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-[var(--foreground)]">الوصف</span>
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={fieldClass}
          placeholder="إعلان إنستغرام"
        />
      </label>
      {showDressLink ? (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[var(--foreground)]">مرتبط بأي فستان؟ (اختياري)</span>
          <select value={associatedDressId} onChange={(event) => setAssociatedDressId(event.target.value)} className={fieldClass}>
            <option value="">مصروف عام</option>
            {dresses.map((dress) => (
              <option key={dress.id} value={dress.id}>
                {dress.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {error ? <p className="text-sm text-[var(--salla-danger)]">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" className="shop-btn rounded-xl px-4 py-2.5 text-sm font-medium">
          حفظ
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2.5 text-sm text-[var(--salla-muted)] hover:bg-[var(--salla-surface)]"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatCurrency, formatDate, todayIso } from "@/lib/format";
import { categoryExpenseLabel } from "@/lib/labels";
import { VARIABLE_EXPENSE_CATEGORIES, type VariableExpenseCategory } from "@/types";

export function VariableExpenseLog() {
  const { variableExpenses, dresses, addVariableExpense } = useShop();
  const { t } = useLanguage();
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
          <p className="text-sm text-rose-400">{t("var.kicker")}</p>
          <h3 className="mt-1 text-2xl font-medium text-rose-900">{t("var.title")}</h3>
          <p className="mt-2 text-sm leading-7 text-rose-600/80">{t("var.lead")}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="shop-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("var.add")}
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
      {rows.length === 0 ? (
        <p className="text-sm text-rose-400">{t("var.empty")}</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((expense) => {
            const dress = dresses.find((item) => item.id === expense.associatedDressId);
            return (
              <li key={expense.id} className="rounded-2xl bg-rose-50/80 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-rose-900">{expense.description}</p>
                    <p className="mt-1 text-xs text-rose-400">
                      {categoryExpenseLabel(expense.category)} · {formatDate(expense.date)}
                      {dress ? ` · ${dress.name}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 tabular-nums text-sm text-rose-800">{formatCurrency(expense.amount)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {rows.length > 5 ? (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="mt-3 text-sm text-rose-400 hover:text-rose-700"
        >
          {showAll ? t("var.showRecent") : t("var.showAll", { n: rows.length })}
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
  const { t } = useLanguage();
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
      setError("var.descRequired");
      return;
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("var.amountMin");
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
        <span className="mb-1 block text-rose-700">{t("var.type")}</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as VariableExpenseCategory)}
          className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900"
        >
          {VARIABLE_EXPENSE_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {categoryExpenseLabel(item)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-rose-700">{t("var.amount")}</span>
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
        <span className="mb-1 block text-rose-700">{t("var.date")}</span>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-rose-700">{t("var.desc")}</span>
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900"
          placeholder={t("var.descPh")}
        />
      </label>
      {showDressLink ? (
        <label className="block text-sm">
          <span className="mb-1 block text-rose-700">{t("var.dress")}</span>
          <select
            value={associatedDressId}
            onChange={(event) => setAssociatedDressId(event.target.value)}
            className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900"
          >
            <option value="">{t("var.noDress")}</option>
            {dresses.map((dress) => (
              <option key={dress.id} value={dress.id}>
                {dress.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {error ? <p className="text-sm text-rose-700">{t(error)}</p> : null}
      <div className="flex gap-2">
        <button type="submit" className="shop-btn rounded-2xl px-4 py-2 text-sm">
          {t("var.save")}
        </button>
        <button type="button" onClick={onCancel} className="rounded-2xl px-4 py-2 text-sm text-rose-400 hover:bg-white">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

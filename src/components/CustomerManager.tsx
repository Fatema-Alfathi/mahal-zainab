"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  Phone,
  Pencil,
  Plus,
  Search,
  StickyNote,
  UserRound,
  X,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { customerBookings, isCustomerNumberTaken, suggestCustomerNumber } from "@/lib/customers";
import { cn, formatCurrency, formatDate, formatSignedCurrency } from "@/lib/format";
import type { Customer, CustomerDraft } from "@/types";

export function CustomerManager() {
  const { customers, bookings, dresses, addCustomer, updateCustomer } = useShop();
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<{ mode: "add" } | { mode: "edit"; customer: Customer } | null>(null);
  const [openId, setOpenId] = useState<string | null>(customers[0]?.id ?? null);
  const [notice, setNotice] = useState("");

  const visible = useMemo(() => {
    const key = query.trim();
    return customers.filter((customer) => {
      if (!key) return true;
      return [customer.name, customer.number, customer.phone].some((field) => field.includes(key));
    });
  }, [customers, query]);

  const selected = customers.find((customer) => customer.id === openId) ?? null;
  const history = selected ? customerBookings(bookings, selected.id) : [];

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--salla-primary)]">ملفات العرايس</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            إدارة العميلات
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--salla-muted)]">
            كل عروس لها رقم وملف: الهاتف، تاريخ المناسبة، الملاحظات، وسجل حجوزاتها مع العربون والتأمين والبروفة.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNotice("");
            setEditor({ mode: "add" });
          }}
          className="shop-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
        >
          <Plus className="h-4 w-4" aria-hidden />
          عميلة جديدة
        </button>
      </div>

      {notice ? (
        <p className="rounded-xl border border-[color-mix(in_srgb,var(--salla-success)_30%,var(--salla-border))] bg-[color-mix(in_srgb,var(--salla-success)_10%,transparent)] px-4 py-2.5 text-sm text-[var(--salla-success)]">
          {notice}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        {/* List */}
        <aside className="dash-panel flex max-h-[40rem] flex-col overflow-hidden rounded-2xl xl:max-h-[calc(100vh-14rem)]">
          <div className="border-b border-[var(--salla-border)] p-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--salla-muted)]"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحثي بالاسم أو الرقم أو الهاتف"
                className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 py-2.5 pe-3 ps-10 text-sm outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
              />
            </div>
            <p className="mt-2 text-xs text-[var(--salla-muted)]">
              {visible.length} من {customers.length} عميلة
            </p>
          </div>

          <ul className="flex-1 space-y-1 overflow-y-auto p-2">
            {visible.length === 0 ? (
              <li className="px-3 py-10 text-center text-sm text-[var(--salla-muted)]">ما في عميلة بهالبحث.</li>
            ) : null}
            {visible.map((customer) => {
              const count = customerBookings(bookings, customer.id).length;
              const active = customer.id === selected?.id;
              return (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(customer.id)}
                    className={cn(
                      "w-full rounded-xl px-3 py-3 text-right transition",
                      active
                        ? "bg-[var(--salla-primary)] text-white shadow-sm dark:text-[#200000]"
                        : "hover:bg-[var(--salla-soft)]",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                          active
                            ? "bg-white/20 text-white dark:bg-black/10 dark:text-[#200000]"
                            : "bg-[var(--salla-soft)] text-[var(--salla-primary)]",
                        )}
                      >
                        {initials(customer.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{customer.name}</p>
                        <p
                          className={cn(
                            "mt-0.5 truncate text-xs",
                            active ? "text-white/80 dark:text-[#200000]/70" : "text-[var(--salla-muted)]",
                          )}
                        >
                          {customer.number} · {customer.phone}
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-[11px]",
                            active ? "text-white/70 dark:text-[#200000]/60" : "text-[var(--salla-muted)]",
                          )}
                        >
                          {count} حجز
                        </p>
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Detail */}
        {selected ? (
          <article className="dash-panel overflow-hidden rounded-2xl">
            <div className="border-b border-[var(--salla-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--salla-primary)_7%,var(--salla-surface)),var(--salla-surface)_60%)] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--salla-primary)_12%,transparent)] text-lg font-semibold text-[var(--salla-primary)]">
                    {initials(selected.name)}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-[var(--salla-muted)]">رقم العميلة {selected.number}</p>
                    <h2 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{selected.name}</h2>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <InfoPill icon={Phone}>{selected.phone}</InfoPill>
                      {selected.eventDate ? (
                        <InfoPill icon={CalendarDays}>{formatDate(selected.eventDate)}</InfoPill>
                      ) : null}
                      <InfoPill icon={UserRound}>{history.length} حجز</InfoPill>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotice("");
                    setEditor({ mode: "edit", customer: selected });
                  }}
                  className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--salla-soft)]"
                >
                  <Pencil className="h-3.5 w-3.5 text-[var(--salla-primary)]" aria-hidden />
                  تعديل الملف
                </button>
              </div>

              {selected.notes ? (
                <div className="mt-4 flex gap-2 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)]/80 px-3 py-2.5 text-sm text-[var(--foreground)]">
                  <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-[var(--salla-muted)]" aria-hidden />
                  <p className="leading-6">{selected.notes}</p>
                </div>
              ) : null}
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--foreground)]">سجل الحجوزات</h3>
                  <p className="mt-0.5 text-xs text-[var(--salla-muted)]">العربون والتأمين والمواعيد</p>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--salla-border)] px-4 py-10 text-center text-sm text-[var(--salla-muted)]">
                  ما في حجوزات بهالملف بعد.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--salla-border)]">
                  <table className="w-full min-w-[52rem] text-sm">
                    <thead>
                      <tr className="bg-[var(--salla-soft)]/80 text-right text-xs text-[var(--salla-muted)]">
                        <th className="px-3 py-3 font-medium">الفستان</th>
                        <th className="px-3 py-3 font-medium">تاريخ الحجز</th>
                        <th className="px-3 py-3 font-medium">السعر</th>
                        <th className="px-3 py-3 font-medium">العربون</th>
                        <th className="px-3 py-3 font-medium">التأمين</th>
                        <th className="px-3 py-3 font-medium">المتبقي</th>
                        <th className="px-3 py-3 font-medium">الاستلام</th>
                        <th className="px-3 py-3 font-medium">الإرجاع</th>
                        <th className="px-3 py-3 font-medium">بروفة / تعديل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((booking) => {
                        const dress = dresses.find((item) => item.id === booking.dressId);
                        return (
                          <tr
                            key={booking.id}
                            className="border-t border-[var(--salla-border)] align-top transition hover:bg-[var(--salla-soft)]/40"
                          >
                            <td className="px-3 py-3 font-medium text-[var(--foreground)]">
                              {dress?.name ?? booking.dressId}
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--salla-muted)]">
                              {formatDate(booking.bookedAt)}
                            </td>
                            <td className="px-3 py-3 tabular-nums font-semibold text-[var(--salla-primary)]">
                              {formatCurrency(booking.totalRevenueGenerated)}
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">
                              {formatCurrency(booking.depositPaid)}
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">
                              {formatCurrency(booking.insurancePaid)}
                              <span className="mt-0.5 block text-[11px] text-[var(--salla-muted)]">
                                {booking.insuranceReturned ? "رُجِع للعميلة" : "عند المحل"}
                              </span>
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">
                              {formatSignedCurrency(booking.remainingAmount)}
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--salla-muted)]">
                              {formatDate(booking.pickupDate)}
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--salla-muted)]">
                              {formatDate(booking.returnDate)}
                            </td>
                            <td className="px-3 py-3 text-[var(--foreground)]">
                              {booking.needsAlterations ? (
                                <p>تعديلات + بروفة</p>
                              ) : booking.needsFitting ? (
                                <p>بروفة فقط</p>
                              ) : (
                                <p className="text-[var(--salla-muted)]">بدون بروفة</p>
                              )}
                              {booking.fittingDate ? (
                                <p className="mt-0.5 text-[11px] text-[var(--salla-muted)]">
                                  موعد البروفة {formatDate(booking.fittingDate)}
                                </p>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </article>
        ) : (
          <div className="dash-panel flex items-center justify-center rounded-2xl px-4 py-16 text-sm text-[var(--salla-muted)]">
            اختاري عميلة من القائمة.
          </div>
        )}
      </div>

      {editor ? (
        <CustomerFormDialog
          title={editor.mode === "add" ? "عميلة جديدة" : `تعديل ${editor.customer.name}`}
          initialDraft={
            editor.mode === "add"
              ? { number: suggestCustomerNumber(customers), name: "", phone: "", eventDate: "", notes: "" }
              : {
                  number: editor.customer.number,
                  name: editor.customer.name,
                  phone: editor.customer.phone,
                  eventDate: editor.customer.eventDate,
                  notes: editor.customer.notes,
                }
          }
          excludeId={editor.mode === "edit" ? editor.customer.id : undefined}
          onClose={() => setEditor(null)}
          onSave={(draft) => {
            const ok =
              editor.mode === "add" ? addCustomer(draft) : updateCustomer(editor.customer.id, draft);
            if (!ok) return false;
            setNotice(editor.mode === "add" ? "تم فتح ملف العميلة." : "تم حفظ ملف العميلة.");
            return true;
          }}
        />
      ) : null}
    </section>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 1);
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`;
}

function InfoPill({ icon: Icon, children }: { icon: typeof Phone; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--salla-border)] bg-[var(--salla-surface)] px-2.5 py-1 text-[var(--foreground)]">
      <Icon className="h-3.5 w-3.5 text-[var(--salla-primary)]" aria-hidden />
      {children}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-[var(--foreground)]">{label}</span>
      {children}
    </label>
  );
}

const fieldClass =
  "w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none transition focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]";

function CustomerFormDialog({
  title,
  initialDraft,
  excludeId,
  onClose,
  onSave,
}: {
  title: string;
  initialDraft: CustomerDraft;
  excludeId?: string;
  onClose: () => void;
  onSave: (draft: CustomerDraft) => boolean;
}) {
  const { customers } = useShop();
  const [draft, setDraft] = useState<CustomerDraft>(initialDraft);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError("اسم العميلة مطلوب.");
      return;
    }
    if (!draft.number.trim()) {
      setError("رقم العميلة مطلوب.");
      return;
    }
    if (isCustomerNumberTaken(customers, draft.number, excludeId)) {
      setError("هذا الرقم مستخدم لعميلة ثانية.");
      return;
    }
    if (!draft.phone.trim()) {
      setError("رقم الهاتف مطلوب.");
      return;
    }
    if (!onSave(draft)) {
      setError("تعذر الحفظ. راجعي الاسم أو الهاتف، يمكن الملف موجود.");
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق النموذج" onClick={onClose} />
      <div className="dash-panel relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[var(--salla-primary)]">ملف العميلة</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--salla-muted)] hover:bg-[var(--salla-soft)]"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Field label="رقم العميلة">
            <input
              value={draft.number}
              onChange={(event) => setDraft((current) => ({ ...current, number: event.target.value }))}
              className={fieldClass}
            />
          </Field>
          <Field label="الاسم">
            <input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              className={fieldClass}
            />
          </Field>
          <Field label="رقم الهاتف">
            <input
              value={draft.phone}
              onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
              className={fieldClass}
              placeholder="9xxxxxxx"
            />
          </Field>
          <Field label="تاريخ المناسبة">
            <input
              type="date"
              value={draft.eventDate}
              onChange={(event) => setDraft((current) => ({ ...current, eventDate: event.target.value }))}
              className={fieldClass}
            />
          </Field>
          <Field label="ملاحظات">
            <textarea
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
              rows={3}
              className={fieldClass}
            />
          </Field>
          {error ? <p className="text-sm text-[var(--salla-danger)]">{error}</p> : null}
          <button type="submit" className="shop-btn w-full rounded-xl py-2.5 text-sm font-medium">
            حفظ الملف
          </button>
        </form>
      </div>
    </div>
  );
}

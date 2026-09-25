"use client";

import { FormEvent, useMemo, useState } from "react";
import { Ban, CalendarDays, Pencil, Phone, Plus, Search, StickyNote, UserRound, X } from "lucide-react";
import { BookingDateList } from "@/components/BookingDateList";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { bookingWeddingDate, cancelledBookings, customerBookings, isCustomerNumberTaken, suggestCustomerNumber } from "@/lib/customers";
import { cn, formatCurrency, formatDate, formatDateOrDash, formatSignedCurrency } from "@/lib/format";
import { bookingStatusLabel } from "@/lib/labels";
import type { Booking, Customer, CustomerDraft } from "@/types";

export function CustomerManager() {
  const { customers, bookings, dresses, addCustomer, updateCustomer, cancelBooking } = useShop();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<{ mode: "add" } | { mode: "edit"; customer: Customer } | null>(null);
  const [openId, setOpenId] = useState<string | null>(customers[0]?.id ?? null);
  const [notice, setNotice] = useState("");
  const [pendingCancel, setPendingCancel] = useState<Booking | null>(null);

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
          <p className="text-sm text-[var(--salla-muted)]">{t("customers.kicker")}</p>
          <h1 className="mt-1 font-serif text-3xl text-[var(--foreground)]">{t("customers.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">{t("customers.lead")}</p>
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
          {t("customers.add")}
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
                  <h3 className="text-base font-semibold text-[var(--foreground)]">{t("customers.history")}</h3>
                  <p className="mt-0.5 text-xs text-[var(--salla-muted)]">{t("customers.historyLead")}</p>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--salla-border)] px-4 py-10 text-center text-sm text-[var(--salla-muted)]">
                  ما في حجوزات بهالملف بعد.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--salla-border)]">
                  <table className="w-full min-w-[68rem] text-sm">
                    <thead>
                      <tr className="bg-[var(--salla-soft)]/80 text-right text-xs text-[var(--salla-muted)]">
                        <th className="px-3 py-3 font-medium">{t("customers.invoice")}</th>
                        <th className="px-3 py-3 font-medium">{t("customers.dress")}</th>
                        <th className="px-3 py-3 font-medium">{t("customers.bookedAt")}</th>
                        <th className="px-3 py-3 font-medium">{t("customers.fittingDay")}</th>
                        <th className="px-3 py-3 font-medium">{t("customers.pickup")}</th>
                        <th className="px-3 py-3 font-medium">{t("customers.wedding")}</th>
                        <th className="px-3 py-3 font-medium">{t("customers.handover")}</th>
                        <th className="px-3 py-3 font-medium">{t("customers.return")}</th>
                        <th className="px-3 py-3 font-medium">{t("customers.price")}</th>
                        <th className="px-3 py-3 font-medium">{t("customers.deposit")}</th>
                        <th className="px-3 py-3 font-medium">{t("customers.insurance")}</th>
                        <th className="px-3 py-3 font-medium">{t("customers.remaining")}</th>
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
                            <td className="px-3 py-3 font-medium tabular-nums text-[var(--salla-primary)]">
                              {booking.invoiceNumber}
                            </td>
                            <td className="px-3 py-3 font-medium text-[var(--foreground)]">
                              {dress?.name ?? booking.dressId}
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--salla-muted)]">
                              {formatDateOrDash(booking.bookedAt)}
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--salla-muted)]">
                              {formatDateOrDash(booking.fittingDate)}
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--salla-muted)]">
                              {formatDateOrDash(booking.pickupDate)}
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--salla-muted)]">
                              {formatDateOrDash(booking.eventDate)}
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--salla-muted)]">
                              {formatDateOrDash(booking.handoverDate)}
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--salla-muted)]">
                              {formatDateOrDash(booking.returnDate)}
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
                                {booking.insuranceReturned ? t("customers.insuranceBack") : t("customers.insuranceShop")}
                              </span>
                            </td>
                            <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">
                              {formatSignedCurrency(booking.remainingAmount)}
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
          <p className="dash-panel rounded-3xl px-4 py-10 text-center text-sm text-[var(--salla-muted)]">{t("customers.pick")}</p>
        )}
      </div>

      {editor ? (
        <CustomerFormDialog
          title={editor.mode === "add" ? t("customers.add") : t("customers.editTitle", { name: editor.customer.name })}
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
            setNotice(editor.mode === "add" ? "customers.savedAdd" : "customers.savedEdit");
            return true;
          }}
        />
      ) : null}

      {pendingCancel ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
          <button type="button" className="absolute inset-0 cursor-default" aria-label={t("cancel")} onClick={() => setPendingCancel(null)} />
          <div className="shop-card relative w-full max-w-md rounded-3xl p-6">
            <h3 className="text-xl text-rose-900">{t("customers.cancelTitle", { name: pendingCancel.customerName })}</h3>
            <p className="mt-2 text-sm leading-6 text-rose-600">{t("customers.cancelBody")}</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setPendingCancel(null)} className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-800">
                {t("floor.undo")}
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelBooking(pendingCancel.id);
                  setPendingCancel(null);
                  setNotice("customers.cancelledOk");
                }}
                className="shop-btn-red rounded-2xl px-4 py-2 text-sm"
              >
                {t("floor.confirmCancel")}
              </button>
            </div>
          </div>
        </div>
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
  const { t } = useLanguage();
  const [draft, setDraft] = useState<CustomerDraft>(initialDraft);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError("customers.nameRequired");
      return;
    }
    if (!draft.number.trim()) {
      setError("customers.numberRequired");
      return;
    }
    if (isCustomerNumberTaken(customers, draft.number, excludeId)) {
      setError("customers.numberTaken");
      return;
    }
    if (!draft.phone.trim()) {
      setError("customers.phoneRequired");
      return;
    }
    if (!onSave(draft)) {
      setError("customers.saveFail");
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
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--foreground)]">{t("customers.fieldName")}</span>
            <input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--foreground)]">{t("customers.fieldPhone")}</span>
            <input
              value={draft.phone}
              onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
              className={fieldClass}
              placeholder="9xxxxxxx"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--foreground)]">{t("customers.fieldWedding")}</span>
            <input
              type="date"
              value={draft.eventDate}
              onChange={(event) => setDraft((current) => ({ ...current, eventDate: event.target.value }))}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--foreground)]">{t("customers.fieldNotes")}</span>
            <textarea
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
              rows={3}
              className={fieldClass}
            />
          </label>
          {error ? <p className="text-sm text-[var(--foreground)]">{t(error)}</p> : null}
          <button type="submit" className="shop-btn w-full rounded-2xl py-2.5 text-sm">
            {t("customers.saveFile")}
          </button>
        </form>
      </div>
    </div>
  );
}

function DateChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-rose-50 px-3 py-2">
      <dt className="text-[11px] text-rose-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium tabular-nums text-rose-900">{value}</dd>
    </div>
  );
}

function CancelledBookingsPanel({
  bookings,
  dresses,
}: {
  bookings: Booking[];
  dresses: { id: string; name: string }[];
}) {
  const { t } = useLanguage();
  const rows = cancelledBookings(bookings);
  return (
    <section className="dash-panel rounded-3xl p-5" aria-label={t("customers.cancelledTitle")}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-rose-400">{t("customers.cancelledKicker")}</p>
          <h2 className="mt-1 text-lg text-rose-900">{t("customers.cancelledTitle")}</h2>
          <p className="mt-1 text-xs text-rose-400">{t("customers.cancelledLead")}</p>
        </div>
        <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">{rows.length}</span>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{t("customers.cancelledEmpty")}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((booking) => {
            const dress = dresses.find((item) => item.id === booking.dressId);
            return (
              <li key={booking.id} className="shop-tint-red rounded-2xl px-4 py-3">
                <p className="text-sm font-medium text-rose-900">
                  {booking.invoiceNumber} · {booking.customerName} · {dress?.name ?? booking.dressId}
                </p>
                <BookingDateList booking={booking} />
                <p className="mt-1 text-xs text-rose-500">{t("customers.cancelledOn", { date: formatDateOrDash(booking.cancelledAt) })}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

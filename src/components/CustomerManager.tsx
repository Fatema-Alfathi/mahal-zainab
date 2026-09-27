"use client";

import { FormEvent, useMemo, useState } from "react";
import { Ban, CalendarDays, Pencil, Phone, Plus, Search, StickyNote, UserRound, X } from "lucide-react";
import { BookingDateList } from "@/components/BookingDateList";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { bookingWeddingDate, cancelledBookings, customerBookings, isCustomerNumberTaken, matchCustomer, suggestCustomerNumber } from "@/lib/customers";
import { cn, formatCurrency, formatDate, formatDateOrDash, formatSignedCurrency } from "@/lib/format";
import { bookingStatusLabel } from "@/lib/labels";
import type { Booking, Customer, CustomerDraft } from "@/types";

type NewCustomerBooking = {
  dressId: string;
  pickupDate: string;
  returnDate: string;
  fittingDate: string;
};

export function CustomerManager() {
  const { customers, bookings, dresses, addCustomer, updateCustomer, createBooking, cancelBooking } = useShop();
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
                        <th className="px-3 py-3 font-medium">{t("customers.status")}</th>
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
                        <th className="px-3 py-3 font-medium" />
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
                              {dress?.barcode ? (
                                <span className="mt-0.5 block text-[11px] font-normal tabular-nums text-[var(--salla-muted)]">
                                  {dress.barcode}
                                </span>
                              ) : null}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                                  booking.status === "cancelled"
                                    ? "bg-red-600 text-white"
                                    : booking.status === "completed"
                                      ? "bg-emerald-600 text-white"
                                      : "bg-[var(--salla-soft)] text-[var(--salla-primary)]",
                                )}
                              >
                                {bookingStatusLabel(booking.status)}
                              </span>
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
                            <td className="px-3 py-3">
                              {booking.status === "active" ? (
                                <button
                                  type="button"
                                  onClick={() => setPendingCancel(booking)}
                                  className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                                >
                                  <Ban className="h-3.5 w-3.5" aria-hidden />
                                  {t("customers.cancelBooking")}
                                </button>
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
          <p className="dash-panel rounded-3xl px-4 py-10 text-center text-sm text-[var(--salla-muted)]">{t("customers.pick")}</p>
        )}
      </div>

      <CancelledBookingsPanel bookings={bookings} dresses={dresses} />

      {editor ? (
        <CustomerFormDialog
          title={editor.mode === "add" ? t("customers.add") : t("customers.editTitle", { name: editor.customer.name })}
          mode={editor.mode}
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
          onSave={(draft, booking) => {
            if (editor.mode === "edit") {
              if (!updateCustomer(editor.customer.id, draft)) return false;
              setNotice(t("customers.savedEdit"));
              return true;
            }
            if (booking) {
              const dress = dresses.find((item) => item.id === booking.dressId);
              if (!dress || dress.status !== "available") return false;
              const customerId = crypto.randomUUID();
              createBooking({
                dressId: dress.id,
                newCustomerId: customerId,
                customerNumber: draft.number,
                customerName: draft.name,
                phone: draft.phone,
                eventDate: draft.eventDate,
                notes: draft.notes,
                startDate: booking.pickupDate,
                endDate: booking.returnDate,
                pickupDate: booking.pickupDate,
                returnDate: booking.returnDate,
                fittingDate: booking.fittingDate,
                discountType: "none",
                discountValue: 0,
                depositPaid: 0,
                needsAlterations: false,
                needsFitting: Boolean(booking.fittingDate),
              });
              setOpenId(customerId);
              setNotice(t("customers.savedAddBooking"));
              return true;
            }
            const customerId = addCustomer(draft);
            if (!customerId) return false;
            setOpenId(customerId);
            setNotice(t("customers.savedAdd"));
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
                  setNotice(t("customers.cancelledOk"));
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
  mode,
  initialDraft,
  excludeId,
  onClose,
  onSave,
}: {
  title: string;
  mode: "add" | "edit";
  initialDraft: CustomerDraft;
  excludeId?: string;
  onClose: () => void;
  onSave: (draft: CustomerDraft, booking?: NewCustomerBooking) => boolean;
}) {
  const { customers, dresses } = useShop();
  const { t } = useLanguage();
  const [draft, setDraft] = useState<CustomerDraft>(initialDraft);
  const [dressId, setDressId] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [fittingDate, setFittingDate] = useState("");
  const [error, setError] = useState("");
  const availableDresses = useMemo(
    () => dresses.filter((item) => item.status === "available").sort((a, b) => a.name.localeCompare(b.name, "ar")),
    [dresses],
  );

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
    if (mode === "add" && matchCustomer(customers, draft.name, draft.phone)) {
      setError("customers.saveFail");
      return;
    }
    let booking: NewCustomerBooking | undefined;
    if (mode === "add") {
      if (availableDresses.length === 0) {
        setError("customers.noAvailableDresses");
        return;
      }
      if (!dressId) {
        setError("customers.dressRequired");
        return;
      }
      if (!pickupDate) {
        setError("customers.pickupRequired");
        return;
      }
      if (!returnDate) {
        setError("customers.returnRequired");
        return;
      }
      if (returnDate < pickupDate) {
        setError("book.endAfterStart");
        return;
      }
      booking = { dressId, pickupDate, returnDate, fittingDate };
    }
    if (!onSave(draft, booking)) {
      setError("customers.saveFail");
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label={t("customers.closeForm")} onClick={onClose} />
      <div className="dash-panel relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[var(--salla-primary)]">ملف العميلة</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--salla-muted)] hover:bg-[var(--salla-soft)]"
            aria-label={t("close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Field label={t("customers.fieldNumber")}>
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
          {mode === "add" ? (
            <fieldset className="space-y-3.5 rounded-2xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/40 p-3.5">
              <legend className="px-1 text-sm font-medium text-[var(--foreground)]">{t("customers.bookingTitle")}</legend>
              <p className="text-xs leading-6 text-[var(--salla-muted)]">{t("customers.bookingLead")}</p>
              {availableDresses.length === 0 ? (
                <p className="text-sm text-[var(--salla-muted)]">{t("customers.noAvailableDresses")}</p>
              ) : (
                <label className="block text-sm">
                  <span className="mb-1 block text-[var(--foreground)]">{t("customers.fieldDress")}</span>
                  <select
                    value={dressId}
                    onChange={(event) => {
                      const nextId = event.target.value;
                      const next = availableDresses.find((item) => item.id === nextId);
                      setDressId(nextId);
                      setDressCode(next?.barcode ?? "");
                    }}
                    required
                    className={fieldClass}
                  >
                    <option value="">{t("customers.dressNone")}</option>
                    {availableDresses.map((dress) => (
                      <option key={dress.id} value={dress.id}>
                        {dress.name} · {dress.barcode}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="block text-sm">
                <span className="mb-1 block text-[var(--foreground)]">{t("customers.fieldCode")}</span>
                <input
                  value={dressCode}
                  onChange={(event) => {
                    const code = event.target.value;
                    setDressCode(code);
                    const match = availableDresses.find(
                      (item) => item.barcode.trim().toUpperCase() === code.trim().toUpperCase(),
                    );
                    setDressId(match?.id ?? "");
                  }}
                  className={fieldClass}
                  placeholder="YAL-001"
                />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-[var(--foreground)]">{t("customers.pickup")}</span>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(event) => setPickupDate(event.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-[var(--foreground)]">{t("customers.return")}</span>
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(event) => setReturnDate(event.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>
              <label className="block text-sm">
                <span className="mb-1 block text-[var(--foreground)]">{t("customers.fittingOptional")}</span>
                <input
                  type="date"
                  value={fittingDate}
                  onChange={(event) => setFittingDate(event.target.value)}
                  className={fieldClass}
                />
              </label>
            </fieldset>
          ) : null}
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--foreground)]">{t("customers.fieldNotes")}</span>
            <textarea
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
              rows={3}
              className={fieldClass}
            />
          </label>
          {error ? <p className="text-sm text-[var(--salla-danger)]">{t(error)}</p> : null}
          <button type="submit" className="shop-btn w-full rounded-2xl py-2.5 text-sm">
            {t("customers.saveFile")}
          </button>
        </form>
      </div>
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
          <p className="text-xs font-medium text-[var(--salla-muted)]">{t("customers.cancelledKicker")}</p>
          <h2 className="mt-1 text-lg text-[var(--foreground)]">{t("customers.cancelledTitle")}</h2>
          <p className="mt-1 text-xs text-[var(--salla-muted)]">{t("customers.cancelledLead")}</p>
        </div>
        <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">{rows.length}</span>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-[var(--salla-soft)] px-4 py-3 text-sm text-[var(--salla-muted)]">
          {t("customers.cancelledEmpty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((booking) => {
            const dress = dresses.find((item) => item.id === booking.dressId);
            return (
              <li key={booking.id} className="shop-tint-red rounded-2xl px-4 py-3">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {booking.invoiceNumber} · {booking.customerName} · {dress?.name ?? booking.dressId}
                </p>
                <BookingDateList booking={booking} />
                <p className="mt-1 text-xs text-[var(--salla-muted)]">
                  {t("customers.cancelledOn", { date: formatDateOrDash(booking.cancelledAt) })}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

"use client";

import { FormEvent, useMemo, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { customerBookings, isCustomerNumberTaken, suggestCustomerNumber } from "@/lib/customers";
import { formatCurrency, formatDate, formatSignedCurrency } from "@/lib/format";
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
          <p className="text-sm text-rose-400">ملفات العرايس</p>
          <h1 className="mt-1 font-serif text-3xl text-rose-900">إدارة العميلات</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">
            كل عروس لها رقم وملف: الهاتف، تاريخ المناسبة، الملاحظات، وسجل حجوزاتها مع العربون والتأمين والبروفة.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNotice("");
            setEditor({ mode: "add" });
          }}
          className="shop-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" aria-hidden />
          عميلة جديدة
        </button>
      </div>

      {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}

      <div className="grid gap-5 xl:grid-cols-[20rem_1fr]">
        <div className="dash-panel rounded-2xl p-4">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحثي بالاسم أو الرقم أو الهاتف"
            className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 text-sm outline-none ring-rose-200 focus:ring-2"
          />
          <ul className="mt-3 max-h-[32rem] space-y-1 overflow-y-auto">
            {visible.length === 0 ? (
              <li className="px-2 py-6 text-center text-sm text-rose-300">ما في عميلة بهالبحث.</li>
            ) : null}
            {visible.map((customer) => {
              const count = customerBookings(bookings, customer.id).length;
              const active = customer.id === selected?.id;
              return (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(customer.id)}
                    className={`w-full rounded-2xl px-3 py-2.5 text-right ${active ? "shop-btn" : "hover:bg-rose-50"}`}
                  >
                    <p className="text-sm">{customer.name}</p>
                    <p className={`mt-0.5 text-xs ${active ? "text-white/80" : "text-rose-400"}`}>
                      {customer.number} · {customer.phone} · {count} حجز
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {selected ? (
          <article className="dash-panel rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs text-rose-400">رقم العميلة {selected.number}</p>
                <h2 className="mt-1 text-2xl text-rose-900">{selected.name}</h2>
                <p className="mt-2 text-sm leading-7 text-rose-600">
                  الهاتف: {selected.phone}
                  {selected.eventDate ? ` · المناسبة: ${formatDate(selected.eventDate)}` : ""}
                </p>
                {selected.notes ? <p className="mt-2 text-sm leading-7 text-rose-500">{selected.notes}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setNotice("");
                  setEditor({ mode: "edit", customer: selected });
                }}
                className="shop-soft inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm text-rose-700"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                تعديل الملف
              </button>
            </div>

            <h3 className="mt-6 text-sm text-rose-400">سجل الحجوزات</h3>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-rose-300">ما في حجوزات بهالملف بعد.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[48rem] text-sm">
                  <thead>
                    <tr className="text-right text-rose-400">
                      <th className="pb-2 font-medium">الفستان</th>
                      <th className="pb-2 font-medium">تاريخ الحجز</th>
                      <th className="pb-2 font-medium">السعر</th>
                      <th className="pb-2 font-medium">العربون</th>
                      <th className="pb-2 font-medium">التأمين</th>
                      <th className="pb-2 font-medium">المتبقي</th>
                      <th className="pb-2 font-medium">الاستلام</th>
                      <th className="pb-2 font-medium">الإرجاع</th>
                      <th className="pb-2 font-medium">بروفة / تعديل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((booking) => {
                      const dress = dresses.find((item) => item.id === booking.dressId);
                      return (
                        <tr key={booking.id} className="border-t border-rose-50 align-top">
                          <td className="py-3 text-rose-900">{dress?.name ?? booking.dressId}</td>
                          <td className="py-3 tabular-nums text-rose-700">{formatDate(booking.bookedAt)}</td>
                          <td className="py-3 tabular-nums text-rose-900">{formatCurrency(booking.totalRevenueGenerated)}</td>
                          <td className="py-3 tabular-nums text-rose-700">{formatCurrency(booking.depositPaid)}</td>
                          <td className="py-3 tabular-nums text-rose-700">
                            {formatCurrency(booking.insurancePaid)}
                            <span className="mt-0.5 block text-xs text-rose-400">
                              {booking.insuranceReturned ? "رُجِع للعميلة" : "عند المحل"}
                            </span>
                          </td>
                          <td className="py-3 tabular-nums text-rose-700">{formatSignedCurrency(booking.remainingAmount)}</td>
                          <td className="py-3 tabular-nums text-rose-700">{formatDate(booking.pickupDate)}</td>
                          <td className="py-3 tabular-nums text-rose-700">{formatDate(booking.returnDate)}</td>
                          <td className="py-3 text-rose-700">
                            {booking.needsAlterations ? (
                              <p>تعديلات + بروفة</p>
                            ) : booking.needsFitting ? (
                              <p>بروفة فقط</p>
                            ) : (
                              <p>بدون بروفة</p>
                            )}
                            {booking.fittingDate ? (
                              <p className="mt-0.5 text-xs text-rose-400">موعد البروفة {formatDate(booking.fittingDate)}</p>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ) : (
          <p className="dash-panel rounded-2xl px-4 py-10 text-center text-sm text-rose-300">اختاري عميلة من القائمة.</p>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق النموذج" onClick={onClose} />
      <div className="shop-card relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-2xl text-rose-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">رقم العميلة</span>
            <input
              value={draft.number}
              onChange={(event) => setDraft((current) => ({ ...current, number: event.target.value }))}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">الاسم</span>
            <input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">رقم الهاتف</span>
            <input
              value={draft.phone}
              onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
              placeholder="9xxxxxxx"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">تاريخ المناسبة</span>
            <input
              type="date"
              value={draft.eventDate}
              onChange={(event) => setDraft((current) => ({ ...current, eventDate: event.target.value }))}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">ملاحظات</span>
            <textarea
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
            />
          </label>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <button type="submit" className="shop-btn w-full rounded-2xl py-2.5 text-sm">
            حفظ الملف
          </button>
        </form>
      </div>
    </div>
  );
}

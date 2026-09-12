"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Pencil, Plus, Trash2, X } from "lucide-react";
import { DressCalendarPanel } from "@/components/DressBookingCalendar";
import { DressGallery } from "@/components/DressGallery";
import { DressPhoto } from "@/components/DressPhoto";
import { CategoryFilter, type CategoryFilterValue } from "@/components/CategoryFilter";
import { CategoryPicker } from "@/components/CategoryPicker";
import { ColorFilter, type ColorFilterValue } from "@/components/ColorFilter";
import { ColorPicker } from "@/components/ColorPicker";
import { DressVariants } from "@/components/DressVariants";
import { SizeFilter, type SizeFilterValue } from "@/components/SizeFilter";
import { SizePicker } from "@/components/SizePicker";
import { useShop } from "@/context/ShopContext";
import {
  bookingDateLine,
  categoryLabel,
  dressActiveBookings,
  dressDisplay,
  dressNeedsAlteration,
  dressNeedsCleaning,
  isBarcodeTaken,
  isSameVariantTaken,
  matchesDressQuery,
  measurementLine,
  padImageSlots,
  sizeLabel,
  suggestBarcode,
} from "@/lib/dressCatalog";
import {
  dressAcquisitionCost,
  dressCleaningCost,
  dressRentalRevenue,
  dressRepairCost,
} from "@/lib/finance";
import { cn, formatCurrency, formatDate } from "@/lib/format";
import type { Dress, DressCatalogDraft, DressStatus } from "@/types";

const STATUS_STYLES: Record<DressStatus, string> = {
  available: "bg-[color-mix(in_srgb,var(--salla-success)_14%,transparent)] text-[var(--salla-success)]",
  reserved: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
  rented: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  maintenance: "bg-[color-mix(in_srgb,var(--salla-danger)_14%,transparent)] text-[var(--salla-danger)]",
};

const STATUS_LABELS: Record<DressStatus, string> = {
  available: "متاح",
  reserved: "محجوز",
  rented: "عند العميلة",
  maintenance: "يحتاج تنظيف",
};

const EMPTY_DRAFT: DressCatalogDraft = {
  name: "",
  barcode: "",
  description: "",
  silhouette: "",
  size: "M",
  category: "evening",
  color: "أبيض",
  styleId: "",
  measurements: {},
  images: ["", "", "", ""],
  purchaseDate: "",
  rentalPricePerDay: 20,
  purchasePrice: 0,
  shippingCost: 0,
  customsCost: 0,
  insuranceAmount: 20,
  needsCleaning: false,
  needsAlteration: false,
};

function draftFromDress(dress: Dress): DressCatalogDraft {
  return {
    name: dress.name,
    barcode: dress.barcode,
    description: dress.description,
    silhouette: dress.silhouette,
    size: dress.size,
    category: dress.category,
    color: dress.color,
    styleId: dress.styleId,
    measurements: dress.measurements,
    images: padImageSlots(dress.images),
    purchaseDate: dress.purchaseDate,
    rentalPricePerDay: dress.rentalPricePerDay,
    purchasePrice: dress.purchasePrice,
    shippingCost: dress.shippingCost,
    customsCost: dress.customsCost,
    insuranceAmount: dress.insuranceAmount,
    needsCleaning: dressNeedsCleaning(dress),
    needsAlteration: dress.needsAlteration,
  };
}

export function DressManager() {
  const { dresses, bookings, variableExpenses, isOwner, addDress, updateDress, deleteDress } = useShop();
  const [editor, setEditor] = useState<{ mode: "add" } | { mode: "edit"; dress: Dress } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Dress | null>(null);
  const [notice, setNotice] = useState("");
  const [sizeFilter, setSizeFilter] = useState<SizeFilterValue>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>("all");
  const [colorFilter, setColorFilter] = useState<ColorFilterValue>("all");
  const [query, setQuery] = useState("");
  const visibleDresses = dresses.filter((dress) => {
    const sizeOk = sizeFilter === "all" || dress.size === sizeFilter;
    const categoryOk = categoryFilter === "all" || dress.category === categoryFilter;
    const colorOk = colorFilter === "all" || dress.color === colorFilter;
    return sizeOk && categoryOk && colorOk && matchesDressQuery(dress, query);
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--salla-primary)]">المخزون</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            إدارة الفساتين
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--salla-muted)]">
            ملف كل فستان: الكود، الاسم، الوصف، الصور، المقاس، تكاليف الشراء، الإيجار، والإيرادات.
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
          إضافة فستان جديد
        </button>
      </div>

      {notice ? (
        <p className="rounded-xl border border-[color-mix(in_srgb,var(--salla-success)_30%,var(--salla-border))] bg-[color-mix(in_srgb,var(--salla-success)_10%,transparent)] px-4 py-2.5 text-sm text-[var(--salla-success)]">
          {notice}
        </p>
      ) : null}

      <div className="dash-panel space-y-4 rounded-2xl p-4 sm:p-5">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحثي بالاسم أو كود الفستان"
            className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-4 py-2.5 text-sm outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
            aria-label="البحث عن فستان بالاسم أو الكود"
          />
        </div>
        {query.trim() && visibleDresses[0] ? (
          <p className="text-sm text-[var(--salla-primary)]">تقويم {visibleDresses[0].name} من البحث</p>
        ) : null}
        <div className="grid gap-4 border-t border-[var(--salla-border)] pt-4 lg:grid-cols-3">
          <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
          <ColorFilter value={colorFilter} onChange={setColorFilter} />
          <SizeFilter value={sizeFilter} onChange={setSizeFilter} />
        </div>
        <p className="border-t border-[var(--salla-border)] pt-3 text-xs text-[var(--salla-muted)]">
          يظهر {visibleDresses.length} من {dresses.length} فستان
        </p>
      </div>

      {query.trim() && visibleDresses[0] ? (
        <div>
          <DressCalendarPanel key={visibleDresses[0].id} dress={visibleDresses[0]} bookings={bookings} />
        </div>
      ) : null}

      <div className="space-y-4">
        {visibleDresses.length === 0 ? (
          <div className="dash-panel rounded-2xl px-4 py-12 text-center text-sm text-[var(--salla-muted)]">
            ما في فساتين بهالبحث أو بهالتصنيف أو اللون أو المقاس حالياً.
          </div>
        ) : null}
        {visibleDresses.map((dress) => {
          const display = dressDisplay(dress);
          const windows = dressActiveBookings(bookings, dress.id);
          const needsAlteration = dressNeedsAlteration(dress, bookings);
          const revenue = dressRentalRevenue(dress.id, bookings);
          const cleaning = dressCleaningCost(dress.id, variableExpenses);
          const repair = dressRepairCost(dress.id, variableExpenses);
          const landed = dressAcquisitionCost(dress);
          return (
            <article key={dress.id} className="dash-panel overflow-hidden rounded-2xl">
              <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
                <DressGallery
                  images={display.images}
                  alt={dress.name}
                  fallbackClassName={display.palette}
                  heightClass="h-56 lg:h-full min-h-56"
                  className="lg:min-h-full"
                />
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[var(--salla-muted)]" dir="ltr">
                        {dress.barcode}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">{dress.name}</h2>
                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[dress.status])}>
                          {STATUS_LABELS[dress.status]}
                        </span>
                        {needsAlteration ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
                            يحتاج تعديل
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-[var(--salla-muted)]">
                        {categoryLabel(dress.category)} · {dress.color} · {sizeLabel(dress.size)}
                        {display.silhouette ? ` · ${display.silhouette}` : ""}
                      </p>
                      {dress.description ? (
                        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{dress.description}</p>
                      ) : null}
                      {measurementLine(dress.measurements) ? (
                        <p className="mt-1 text-xs leading-5 text-[var(--salla-muted)]">
                          {measurementLine(dress.measurements)}
                        </p>
                      ) : null}
                      <div className="mt-3">
                        <DressVariants dress={dress} dresses={dresses} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/calendar/?dress=${dress.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--salla-soft)]"
                      >
                        <CalendarDays className="h-3.5 w-3.5 text-[var(--salla-primary)]" aria-hidden />
                        التقويم
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setNotice("");
                          setEditor({ mode: "edit", dress });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--salla-soft)]"
                      >
                        <Pencil className="h-3.5 w-3.5 text-[var(--salla-primary)]" aria-hidden />
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (dress.status === "rented" || dress.status === "reserved") {
                            setNotice("لا يمكن حذف فستان محجوز أو عند العميلة.");
                            return;
                          }
                          setPendingDelete(dress);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[color-mix(in_srgb,var(--salla-danger)_25%,var(--salla-border))] bg-[color-mix(in_srgb,var(--salla-danger)_8%,transparent)] px-3 py-2 text-sm font-medium text-[var(--salla-danger)] hover:bg-[color-mix(in_srgb,var(--salla-danger)_14%,transparent)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        حذف
                      </button>
                    </div>
                  </div>

                  {windows.length > 0 ? (
                    <div className="space-y-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200">
                      {windows.map((booking) => (
                        <p key={booking.id}>
                          {dress.status === "rented" ? "عند العميلة" : "محجوز"} {bookingDateLine(booking)}
                          {booking.customerName ? ` — ${booking.customerName}` : ""}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <Fact label="سعر التأجير / اليوم" value={formatCurrency(dress.rentalPricePerDay)} tone="primary" />
                    {isOwner ? (
                      <>
                        <Fact label="إجمالي الإيرادات" value={formatCurrency(revenue)} tone="success" />
                        <Fact label="تكلفة التنظيف" value={formatCurrency(cleaning)} tone="warn" />
                        <Fact label="تكلفة التصليح" value={formatCurrency(repair)} tone="danger" />
                        <Fact
                          label="تاريخ الشراء"
                          value={dress.purchaseDate ? formatDate(dress.purchaseDate) : "غير مسجّل"}
                          tone="muted"
                        />
                        <Fact label="تكلفة الشراء" value={formatCurrency(dress.purchasePrice)} tone="muted" />
                        <Fact label="الشحن" value={formatCurrency(dress.shippingCost)} tone="muted" />
                        <Fact label="الجمارك" value={formatCurrency(dress.customsCost)} tone="muted" />
                        <Fact label="إجمالي تكلفة الفستان" value={formatCurrency(landed)} tone="primary" />
                        <Fact label="التأمين" value={formatCurrency(dress.insuranceAmount)} tone="warn" />
                      </>
                    ) : (
                      <Fact label="التأمين" value={formatCurrency(dress.insuranceAmount)} tone="warn" />
                    )}
                  </dl>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {editor ? (
        <DressFormDialog
          title={editor.mode === "add" ? "إضافة فستان جديد" : `تعديل ${editor.dress.name}`}
          initialDraft={
            editor.mode === "add"
              ? { ...EMPTY_DRAFT, barcode: suggestBarcode(dresses), images: padImageSlots([]) }
              : draftFromDress(editor.dress)
          }
          excludeId={editor.mode === "edit" ? editor.dress.id : undefined}
          onClose={() => setEditor(null)}
          onSave={(draft) => {
            const ok =
              editor.mode === "add" ? addDress(draft) : updateDress(editor.dress.id, draft);
            if (!ok) return false;
            setNotice(editor.mode === "add" ? "تمت إضافة الفستان إلى المخزون." : "تم حفظ تعديلات الفستان.");
            return true;
          }}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDeleteDialog
          dress={pendingDelete}
          onClose={() => setPendingDelete(null)}
          onConfirm={() => {
            const ok = deleteDress(pendingDelete.id);
            setPendingDelete(null);
            setNotice(ok ? "تم حذف الفستان من المخزون." : "تعذر حذف الفستان.");
          }}
        />
      ) : null}
    </section>
  );
}

function DressFormDialog({
  title,
  initialDraft,
  excludeId,
  onClose,
  onSave,
}: {
  title: string;
  initialDraft: DressCatalogDraft;
  excludeId?: string;
  onClose: () => void;
  onSave: (draft: DressCatalogDraft) => boolean;
}) {
  const { dresses, isOwner } = useShop();
  const [draft, setDraft] = useState<DressCatalogDraft>(initialDraft);
  const [error, setError] = useState("");
  const preview = useMemo(() => draft.images.find((url) => /^https?:\/\//i.test(url.trim())), [draft.images]);
  const editing = dresses.find((item) => item.id === excludeId);
  const cleaningLocked = editing?.status === "reserved" || editing?.status === "rented";

  function updateImage(index: number, value: string) {
    setDraft((current) => {
      const images = [...current.images];
      images[index] = value;
      return { ...current, images };
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError("اسم الفستان مطلوب.");
      return;
    }
    if (!draft.barcode.trim()) {
      setError("كود الفستان مطلوب.");
      return;
    }
    if (isBarcodeTaken(dresses, draft.barcode, excludeId)) {
      setError("هذا الكود مستخدم لفستان آخر.");
      return;
    }
    if (isSameVariantTaken(dresses, draft, excludeId)) {
      setError("نفس هذا الفستان موجود أصلاً بنفس اللون والمقاس.");
      return;
    }
    const rental = Number(draft.rentalPricePerDay);
    if (!Number.isFinite(rental) || rental <= 0) {
      setError("أدخلي إيجار يوم أكبر من صفر.");
      return;
    }
    const insurance = Number(draft.insuranceAmount);
    if (!Number.isFinite(insurance) || insurance < 0) {
      setError("تأمين الفستان صفر أو أكثر.");
      return;
    }
    if (isOwner) {
      const purchase = Number(draft.purchasePrice);
      if (!Number.isFinite(purchase) || purchase < 0) {
        setError("تكلفة الشراء صفر أو أكثر.");
        return;
      }
      const shipping = Number(draft.shippingCost);
      if (!Number.isFinite(shipping) || shipping < 0) {
        setError("تكاليف الشحن صفر أو أكثر.");
        return;
      }
      const customs = Number(draft.customsCost);
      if (!Number.isFinite(customs) || customs < 0) {
        setError("الجمارك صفر أو أكثر.");
        return;
      }
    }
    if (!onSave(draft)) {
      setError("تعذر حفظ الفستان. راجعي البيانات وحاولي مرة أخرى.");
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق النموذج" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dress-form-title"
        className="dash-panel relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--salla-muted)]">كتالوج المحل</p>
            <h3 id="dress-form-title" className="mt-1 text-xl font-semibold text-[var(--foreground)]">
              {title}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[var(--salla-muted)] hover:bg-[var(--salla-soft)]" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>

        {preview ? (
          <div className="mb-4 h-40 overflow-hidden rounded-xl">
            <DressPhoto src={preview} alt={draft.name || "معاينة الفستان"} fallbackClassName="from-rose-100 to-amber-100" />
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[var(--foreground)]">اسم الفستان</span>
            <input
              type="text"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[var(--foreground)]">كود الفستان</span>
            <input
              type="text"
              value={draft.barcode}
              onChange={(event) => setDraft((current) => ({ ...current, barcode: event.target.value }))}
              className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[var(--foreground)]">وصف الفستان</span>
            <textarea
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              rows={3}
              placeholder="القصة، القماش، وملاحظات العناية أو التعديل"
              className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[var(--foreground)]">القصة أو الشكل</span>
            <input
              type="text"
              value={draft.silhouette}
              onChange={(event) => setDraft((current) => ({ ...current, silhouette: event.target.value }))}
              placeholder="مثل: قصة A أو فستان كرة"
              className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
            />
          </label>
          <CategoryPicker
            value={draft.category}
            onChange={(category) => setDraft((current) => ({ ...current, category }))}
          />
          <ColorPicker
            value={draft.color}
            onChange={(color) => setDraft((current) => ({ ...current, color }))}
          />
          <SizePicker
            value={draft.size}
            onChange={(size) => setDraft((current) => ({ ...current, size }))}
          />
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[var(--foreground)]">هل هذا نفس فستان موجود بلون أو مقاس ثاني؟</span>
            <select
              value={draft.styleId}
              onChange={(event) => {
                const styleId = event.target.value;
                if (!styleId) {
                  setDraft((current) => ({ ...current, styleId: "" }));
                  return;
                }
                const source = dresses.find((item) => item.styleId === styleId && item.id !== excludeId);
                if (!source) {
                  setDraft((current) => ({ ...current, styleId }));
                  return;
                }
                setDraft((current) => ({
                  ...current,
                  name: source.name,
                  description: source.description,
                  silhouette: source.silhouette,
                  category: source.category,
                  styleId: source.styleId,
                  rentalPricePerDay: source.rentalPricePerDay,
                  purchaseDate: source.purchaseDate,
                  purchasePrice: source.purchasePrice,
                  shippingCost: source.shippingCost,
                  customsCost: source.customsCost,
                  insuranceAmount: source.insuranceAmount,
                  images: padImageSlots(source.images.length > 0 ? source.images : current.images),
                }));
              }}
              className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 text-[var(--foreground)]"
            >
              <option value="">لا، قطعة جديدة مستقلة</option>
              {dresses
                .filter((item, index, list) => {
                  if (item.id === excludeId) return false;
                  return list.findIndex((other) => other.styleId === item.styleId && other.id !== excludeId) === index;
                })
                .map((item) => (
                  <option key={item.styleId} value={item.styleId}>
                    نعم، نفس {item.name}
                  </option>
                ))}
            </select>
          </label>
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--foreground)]">القياسات بالسنتيمتر (اختياري)</p>
            <div className="grid grid-cols-2 gap-3">
              <MeasureInput
                label="الصدر"
                value={draft.measurements.bust}
                onChange={(bust) => setDraft((current) => ({ ...current, measurements: { ...current.measurements, bust } }))}
              />
              <MeasureInput
                label="الخصر"
                value={draft.measurements.waist}
                onChange={(waist) => setDraft((current) => ({ ...current, measurements: { ...current.measurements, waist } }))}
              />
              <MeasureInput
                label="الأرداف"
                value={draft.measurements.hips}
                onChange={(hips) => setDraft((current) => ({ ...current, measurements: { ...current.measurements, hips } }))}
              />
              <MeasureInput
                label="الطول"
                value={draft.measurements.length}
                onChange={(length) => setDraft((current) => ({ ...current, measurements: { ...current.measurements, length } }))}
              />
            </div>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[var(--foreground)]">سعر التأجير لليوم (ر.ع.)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={draft.rentalPricePerDay}
              onChange={(event) =>
                setDraft((current) => ({ ...current, rentalPricePerDay: Number(event.target.value) }))
              }
              className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[var(--foreground)]">تأمين الفستان (ر.ع.)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={draft.insuranceAmount}
              onChange={(event) =>
                setDraft((current) => ({ ...current, insuranceAmount: Number(event.target.value) }))
              }
              className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
            />
            <span className="mt-1 block text-xs text-[var(--salla-muted)]">
              يُحصَل من العميلة عند الحجز ويُرجَع لها إذا رجّعت الفستان سليم. مو من فلوس الإيجار.
            </span>
          </label>
          {isOwner ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1.5 block font-medium text-[var(--foreground)]">تاريخ شراء الفستان</span>
                <input
                  type="date"
                  value={draft.purchaseDate}
                  onChange={(event) => setDraft((current) => ({ ...current, purchaseDate: event.target.value }))}
                  className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-[var(--foreground)]">تكلفة الشراء (ر.ع.)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={draft.purchasePrice}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, purchasePrice: Number(event.target.value) }))
                  }
                  className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-[var(--foreground)]">تكاليف الشحن (ر.ع.)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={draft.shippingCost}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, shippingCost: Number(event.target.value) }))
                  }
                  className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-[var(--foreground)]">الجمارك (ر.ع.)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={draft.customsCost}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, customsCost: Number(event.target.value) }))
                  }
                  className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
                />
              </label>
            </div>
          ) : null}
          <div className="space-y-2 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/50 px-3 py-3">
            <p className="text-sm text-[var(--foreground)]">حالة الفستان</p>
            <label className="flex items-start gap-2 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={draft.needsCleaning}
                disabled={cleaningLocked}
                onChange={(event) => setDraft((current) => ({ ...current, needsCleaning: event.target.checked }))}
                className="mt-0.5"
              />
              <span>
                يحتاج تنظيف
                {cleaningLocked ? (
                  <span className="mt-0.5 block text-xs text-[var(--salla-muted)]">التنظيف يُسجَّل بعد إرجاع الفستان.</span>
                ) : null}
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={draft.needsAlteration}
                onChange={(event) => setDraft((current) => ({ ...current, needsAlteration: event.target.checked }))}
                className="mt-0.5"
              />
              يحتاج تعديل
            </label>
          </div>
          {[0, 1, 2, 3].map((index) => (
            <label key={index} className="block text-sm">
              <span className="mb-1.5 block font-medium text-[var(--foreground)]">رابط الصورة {index + 1}</span>
              <input
                type="url"
                value={draft.images[index] ?? ""}
                onChange={(event) => updateImage(index, event.target.value)}
                placeholder="https://"
                className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
                dir="ltr"
              />
            </label>
          ))}
          {error ? <p className="text-sm text-[var(--foreground)]">{error}</p> : null}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-[var(--salla-muted)] hover:bg-[var(--salla-soft)]">
              إلغاء
            </button>
            <button type="submit" className="shop-btn rounded-xl px-4 py-2 text-sm">
              حفظ الفستان
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "success" | "danger" | "warn" | "muted";
}) {
  return (
    <div className="rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/50 px-3 py-2.5">
      <dt className="text-[11px] font-medium text-[var(--salla-muted)]">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-sm font-semibold tabular-nums text-[var(--foreground)]",
          tone === "primary" && "text-[var(--salla-primary)]",
          tone === "success" && "text-[var(--salla-success)]",
          tone === "danger" && "text-[var(--salla-danger)]",
          tone === "warn" && "text-amber-700 dark:text-amber-300",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function ConfirmDeleteDialog({
  dress,
  onClose,
  onConfirm,
}: {
  dress: Dress;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق تأكيد الحذف" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dress-title"
        className="dash-panel relative w-full max-w-md rounded-2xl p-6"
      >
        <h3 id="delete-dress-title" className="text-xl font-semibold text-[var(--foreground)]">
          حذف {dress.name}؟
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--salla-muted)]">
          سيختفي الفستان من المخزون ولوحة المحل. لا يمكن التراجع عن هذا الإجراء في هذه الجلسة.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-[var(--salla-muted)] hover:bg-[var(--salla-soft)]"
          >
            إلغاء
          </button>
          <button type="button" onClick={onConfirm} className="shop-btn-red rounded-xl px-4 py-2 text-sm font-medium">
            نعم، احذفي الفستان
          </button>
        </div>
      </div>
    </div>
  );
}

function MeasureInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-[var(--foreground)]">{label}</span>
      <input
        type="number"
        min="0"
        step="1"
        value={value ?? ""}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === "" ? undefined : Number(next));
        }}
        className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
      />
    </label>
  );
}

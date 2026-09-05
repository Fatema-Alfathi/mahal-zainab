"use client";

import { FormEvent, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { DressPhoto } from "@/components/DressPhoto";
import { CategoryFilter, type CategoryFilterValue } from "@/components/CategoryFilter";
import { CategoryPicker } from "@/components/CategoryPicker";
import { SizeFilter, type SizeFilterValue } from "@/components/SizeFilter";
import { SizePicker } from "@/components/SizePicker";
import { useShop } from "@/context/ShopContext";
import { categoryLabel, dressDisplay, isBarcodeTaken, measurementLine, sizeLabel, suggestBarcode } from "@/lib/dressCatalog";
import { cn, formatCurrency } from "@/lib/format";
import type { Dress, DressCatalogDraft, DressStatus } from "@/types";

const STATUS_STYLES: Record<DressStatus, string> = {
  available: "bg-emerald-100 text-emerald-800",
  rented: "bg-amber-100 text-amber-800",
  maintenance: "bg-violet-100 text-violet-800",
};

const STATUS_LABELS: Record<DressStatus, string> = {
  available: "متاح",
  rented: "مؤجَّر",
  maintenance: "صيانة",
};

const EMPTY_DRAFT: DressCatalogDraft = {
  name: "",
  barcode: "",
  silhouette: "",
  size: "M",
  category: "evening",
  measurements: {},
  images: ["", "", ""],
  rentalPricePerDay: 20,
  purchasePrice: 0,
};

function draftFromDress(dress: Dress): DressCatalogDraft {
  const images = [...dress.images];
  while (images.length < 3) images.push("");
  return {
    name: dress.name,
    barcode: dress.barcode,
    silhouette: dress.silhouette,
    size: dress.size,
    category: dress.category,
    measurements: dress.measurements,
    images: images.slice(0, 3),
    rentalPricePerDay: dress.rentalPricePerDay,
    purchasePrice: dress.purchasePrice,
  };
}

export function DressManager() {
  const { dresses, isOwner, addDress, updateDress, deleteDress } = useShop();
  const [editor, setEditor] = useState<{ mode: "add" } | { mode: "edit"; dress: Dress } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Dress | null>(null);
  const [notice, setNotice] = useState("");
  const [sizeFilter, setSizeFilter] = useState<SizeFilterValue>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>("all");
  const visibleDresses = dresses.filter((dress) => {
    const sizeOk = sizeFilter === "all" || dress.size === sizeFilter;
    const categoryOk = categoryFilter === "all" || dress.category === categoryFilter;
    return sizeOk && categoryOk;
  });

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-rose-400">المخزون</p>
          <h1 className="mt-1 text-3xl font-medium text-rose-900">إدارة الفساتين</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">
            أضيفي فستاناً جديداً، عدّلي الاسم والباركود والصور والأسعار، أو احذفي فستاناً غير مؤجَّر.
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
          إضافة فستان جديد
        </button>
      </div>

      {notice ? <p className="mb-4 text-sm text-emerald-600">{notice}</p> : null}

      <div className="mb-5 space-y-3">
        <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
        <SizeFilter value={sizeFilter} onChange={setSizeFilter} />
      </div>

      <div className="space-y-3">
        {visibleDresses.length === 0 ? (
          <p className="shop-card rounded-3xl px-4 py-8 text-center text-sm text-rose-400">ما في فساتين بهالتصنيف أو المقاس حالياً.</p>
        ) : null}
        {visibleDresses.map((dress) => {
          const display = dressDisplay(dress);
          return (
            <article key={dress.id} className="shop-card rounded-3xl p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-28 w-full overflow-hidden rounded-2xl sm:h-24 sm:w-20">
                  <DressPhoto
                    src={display.images[0]}
                    alt={dress.name}
                    fallbackClassName={display.palette}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg text-rose-900">{dress.name}</h2>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs", STATUS_STYLES[dress.status])}>
                      {STATUS_LABELS[dress.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-rose-400">
                    {categoryLabel(dress.category)} · {sizeLabel(dress.size)} · {display.silhouette || "بدون قصة"} · {dress.barcode}
                  </p>
                  {measurementLine(dress.measurements) ? (
                    <p className="mt-1 text-xs leading-6 text-rose-400">{measurementLine(dress.measurements)}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-rose-700">
                    إيجار اليوم{" "}
                    <span className="tabular-nums text-rose-900">{formatCurrency(dress.rentalPricePerDay)}</span>
                    {isOwner ? (
                      <>
                        {" "}
                        · سعر الشراء{" "}
                        <span className="tabular-nums text-rose-900">{formatCurrency(dress.purchasePrice)}</span>
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNotice("");
                      setEditor({ mode: "edit", dress });
                    }}
                    className="shop-soft inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (dress.status === "rented") {
                        setNotice("لا يمكن حذف فستان مؤجَّر. سجّلي الإرجاع أولاً.");
                        return;
                      }
                      setPendingDelete(dress);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    حذف
                  </button>
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
              ? { ...EMPTY_DRAFT, barcode: suggestBarcode(dresses), images: ["", "", ""] }
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
      setError("الباركود مطلوب.");
      return;
    }
    if (isBarcodeTaken(dresses, draft.barcode, excludeId)) {
      setError("هذا الباركود مستخدم لفستان آخر.");
      return;
    }
    const rental = Number(draft.rentalPricePerDay);
    if (!Number.isFinite(rental) || rental <= 0) {
      setError("أدخلي إيجار يوم أكبر من صفر.");
      return;
    }
    if (isOwner) {
      const purchase = Number(draft.purchasePrice);
      if (!Number.isFinite(purchase) || purchase < 0) {
        setError("سعر الشراء يجب أن يكون صفراً أو أكثر.");
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق النموذج" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dress-form-title"
        className="shop-card relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-rose-400">كتالوج المحل</p>
            <h3 id="dress-form-title" className="mt-1 text-2xl text-rose-900">
              {title}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>

        {preview ? (
          <div className="mb-4 h-40 overflow-hidden rounded-2xl">
            <DressPhoto src={preview} alt={draft.name || "معاينة الفستان"} fallbackClassName="from-rose-100 to-amber-100" />
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">اسم الفستان</span>
            <input
              type="text"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">الباركود</span>
            <input
              type="text"
              value={draft.barcode}
              onChange={(event) => setDraft((current) => ({ ...current, barcode: event.target.value }))}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">القصة أو الشكل</span>
            <input
              type="text"
              value={draft.silhouette}
              onChange={(event) => setDraft((current) => ({ ...current, silhouette: event.target.value }))}
              placeholder="مثل: قصة A أو فستان كرة"
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
            />
          </label>
          <CategoryPicker
            value={draft.category}
            onChange={(category) => setDraft((current) => ({ ...current, category }))}
          />
          <SizePicker
            value={draft.size}
            onChange={(size) => setDraft((current) => ({ ...current, size }))}
          />
          <div>
            <p className="mb-2 text-sm text-rose-700">القياسات بالسنتيمتر (اختياري)</p>
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
            <span className="mb-1 block text-rose-700">إيجار اليوم (ر.ع.)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={draft.rentalPricePerDay}
              onChange={(event) =>
                setDraft((current) => ({ ...current, rentalPricePerDay: Number(event.target.value) }))
              }
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
            />
          </label>
          {isOwner ? (
            <label className="block text-sm">
              <span className="mb-1 block text-rose-700">سعر الشراء (ر.ع.)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={draft.purchasePrice}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, purchasePrice: Number(event.target.value) }))
                }
                className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
              />
            </label>
          ) : null}
          {[0, 1, 2].map((index) => (
            <label key={index} className="block text-sm">
              <span className="mb-1 block text-rose-700">رابط الصورة {index + 1}</span>
              <input
                type="url"
                value={draft.images[index] ?? ""}
                onChange={(event) => updateImage(index, event.target.value)}
                placeholder="https://"
                className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
                dir="ltr"
              />
            </label>
          ))}
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-2xl px-4 py-2 text-sm text-rose-400 hover:bg-rose-50">
              إلغاء
            </button>
            <button type="submit" className="shop-btn rounded-2xl px-4 py-2 text-sm">
              حفظ الفستان
            </button>
          </div>
        </form>
      </div>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rose-950/30 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق تأكيد الحذف" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="delete-dress-title" className="shop-card relative w-full max-w-md rounded-3xl p-6">
        <h3 id="delete-dress-title" className="text-xl text-rose-900">
          حذف {dress.name}؟
        </h3>
        <p className="mt-2 text-sm leading-7 text-rose-500">
          سيختفي الفستان من المخزون ولوحة المحل. لا يمكن التراجع عن هذا الإجراء في هذه الجلسة.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-2xl px-4 py-2 text-sm text-rose-400 hover:bg-rose-50">
            إلغاء
          </button>
          <button type="button" onClick={onConfirm} className="rounded-2xl bg-rose-700 px-4 py-2 text-sm text-white hover:bg-rose-600">
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
      <span className="mb-1 block text-rose-700">{label}</span>
      <input
        type="number"
        min="0"
        step="1"
        value={value ?? ""}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === "" ? undefined : Number(next));
        }}
        className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
      />
    </label>
  );
}

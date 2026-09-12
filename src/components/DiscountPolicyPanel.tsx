"use client";

import { useShop } from "@/context/ShopContext";
import { cn, formatCurrency } from "@/lib/format";
import { employeeDiscountPolicySummary } from "@/lib/labels";
import type { AuthorizedDiscountType } from "@/types";

const PERCENT_PRESETS = [5, 10, 15, 20];

export function DiscountPolicyPanel() {
  const { discountPolicy, setDiscountPolicy } = useShop();

  function update(next: Partial<typeof discountPolicy>) {
    setDiscountPolicy({ ...discountPolicy, ...next });
  }

  return (
    <section className="dash-panel overflow-hidden rounded-2xl">
      <div className="border-b border-[var(--salla-border)] px-5 py-5 sm:px-6">
        <p className="text-sm font-medium text-[var(--salla-primary)]">قرارك أنتِ</p>
        <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)] sm:text-2xl">خصم الموظفات</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--salla-muted)]">
          اختاري يسمحون يعطون خصم ولا لا. إذا سمحتِ، الرقم ثابت وما يقدرون يغيّرونه.
        </p>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => update({ enabled: true })}
            className={cn(
              "rounded-xl border px-4 py-4 text-start text-sm transition",
              discountPolicy.enabled
                ? "border-[var(--salla-primary)] bg-[var(--salla-primary)] text-white shadow-sm dark:text-[#1d1e20]"
                : "border-[var(--salla-border)] bg-[var(--salla-soft)]/50 text-[var(--foreground)] hover:bg-[var(--salla-soft)]",
            )}
          >
            <span className="block text-base font-semibold">مسموح</span>
            <span
              className={cn(
                "mt-1 block text-xs",
                discountPolicy.enabled ? "text-white/80 dark:text-[#1d1e20]/70" : "text-[var(--salla-muted)]",
              )}
            >
              يعطون الخصم اللي حددتيه فقط
            </span>
          </button>
          <button
            type="button"
            onClick={() => update({ enabled: false })}
            className={cn(
              "rounded-xl border px-4 py-4 text-start text-sm transition",
              !discountPolicy.enabled
                ? "border-[var(--salla-secondary)] bg-[var(--salla-secondary)] text-[var(--salla-secondary-text)] shadow-sm"
                : "border-[var(--salla-border)] bg-[var(--salla-soft)]/50 text-[var(--foreground)] hover:bg-[var(--salla-soft)]",
            )}
          >
            <span className="block text-base font-semibold">ممنوع</span>
            <span
              className={cn(
                "mt-1 block text-xs",
                !discountPolicy.enabled ? "opacity-80" : "text-[var(--salla-muted)]",
              )}
            >
              الحجز بالسعر الكامل
            </span>
          </button>
        </div>

        {discountPolicy.enabled ? (
          <div className="space-y-4 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/40 p-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-[var(--foreground)]">شكل الخصم</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["percent", "amount"] as AuthorizedDiscountType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      update({
                        type,
                        value: type === "percent" && discountPolicy.value > 100 ? 10 : discountPolicy.value,
                      })
                    }
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition",
                      discountPolicy.type === type
                        ? "bg-[var(--salla-primary)] text-white dark:text-[#1d1e20]"
                        : "bg-[var(--salla-surface)] text-[var(--foreground)] ring-1 ring-[var(--salla-border)] hover:bg-[var(--salla-soft)]",
                    )}
                  >
                    {type === "percent" ? "نسبة ٪" : "مبلغ ر.ع."}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block text-sm">
              <span className="mb-2 block font-medium text-[var(--foreground)]">
                {discountPolicy.type === "percent" ? "كم النسبة؟" : "كم المبلغ؟"}
              </span>
              {discountPolicy.type === "percent" ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {PERCENT_PRESETS.map((percent) => (
                    <button
                      key={percent}
                      type="button"
                      onClick={() => update({ value: percent })}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                        discountPolicy.value === percent
                          ? "bg-[var(--salla-primary)] text-white dark:text-[#1d1e20]"
                          : "bg-[var(--salla-surface)] text-[var(--foreground)] ring-1 ring-[var(--salla-border)]",
                      )}
                    >
                      {percent}٪
                    </button>
                  ))}
                </div>
              ) : null}
              <input
                type="number"
                min="0"
                max={discountPolicy.type === "percent" ? 100 : undefined}
                step={discountPolicy.type === "percent" ? 1 : 0.1}
                value={discountPolicy.value || ""}
                onChange={(event) => update({ value: Number(event.target.value) })}
                className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--salla-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
                placeholder={discountPolicy.type === "percent" ? "10" : "5"}
              />
            </label>
          </div>
        ) : null}

        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          {employeeDiscountPolicySummary(discountPolicy)}
          {discountPolicy.enabled && discountPolicy.type === "amount" && discountPolicy.value > 0
            ? ` القيمة: ${formatCurrency(discountPolicy.value)}.`
            : null}
        </p>
      </div>
    </section>
  );
}

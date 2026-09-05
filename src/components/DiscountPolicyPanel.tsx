"use client";

import { useShop } from "@/context/ShopContext";
import { formatCurrency } from "@/lib/format";
import { employeeDiscountPolicySummary } from "@/lib/labels";
import type { AuthorizedDiscountType } from "@/types";

const PERCENT_PRESETS = [5, 10, 15, 20];

export function DiscountPolicyPanel() {
  const { discountPolicy, setDiscountPolicy } = useShop();

  function update(next: Partial<typeof discountPolicy>) {
    setDiscountPolicy({ ...discountPolicy, ...next });
  }

  return (
    <section className="shop-card rounded-3xl p-6">
      <div className="mb-5">
        <p className="text-sm text-rose-400">قرارك أنتِ</p>
        <h3 className="mt-1 text-2xl font-medium text-rose-900">خصم الموظفات</h3>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">
          اختاري يسمحون يعطون خصم ولا لا. إذا سمحتِ، الرقم ثابت وما يقدرون يغيّرونه.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => update({ enabled: true })}
          className={
            discountPolicy.enabled
              ? "shop-btn rounded-2xl px-4 py-4 text-start text-sm"
              : "rounded-2xl bg-rose-50 px-4 py-4 text-start text-sm text-rose-600 hover:bg-rose-100"
          }
        >
          <span className="block text-base font-medium">مسموح</span>
          <span className={discountPolicy.enabled ? "text-white/80" : "text-rose-300"}>يعطون الخصم اللي حددتيه فقط</span>
        </button>
        <button
          type="button"
          onClick={() => update({ enabled: false })}
          className={
            !discountPolicy.enabled
              ? "shop-btn-gold rounded-2xl px-4 py-4 text-start text-sm"
              : "rounded-2xl bg-rose-50 px-4 py-4 text-start text-sm text-rose-600 hover:bg-rose-100"
          }
        >
          <span className="block text-base font-medium">ممنوع</span>
          <span className={!discountPolicy.enabled ? "text-amber-800/70" : "text-rose-300"}>الحجز بالسعر الكامل</span>
        </button>
      </div>

      {discountPolicy.enabled ? (
        <div className="mt-5 space-y-4 rounded-2xl bg-rose-50/80 p-4">
          <fieldset>
            <legend className="mb-2 text-sm text-rose-700">شكل الخصم</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["percent", "amount"] as AuthorizedDiscountType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    update({ type, value: type === "percent" && discountPolicy.value > 100 ? 10 : discountPolicy.value })
                  }
                  className={
                    discountPolicy.type === type
                      ? "shop-btn rounded-xl px-3 py-2 text-sm"
                      : "rounded-xl bg-white px-3 py-2 text-sm text-rose-500 hover:bg-rose-50"
                  }
                >
                  {type === "percent" ? "نسبة ٪" : "مبلغ ر.ع."}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm">
            <span className="mb-2 block text-rose-700">
              {discountPolicy.type === "percent" ? "كم النسبة؟" : "كم المبلغ؟"}
            </span>
            {discountPolicy.type === "percent" ? (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {PERCENT_PRESETS.map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    onClick={() => update({ value: percent })}
                    className={
                      discountPolicy.value === percent
                        ? "shop-btn rounded-full px-3 py-1 text-xs"
                        : "rounded-full bg-white px-3 py-1 text-xs text-rose-700 hover:bg-rose-50"
                    }
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
              className="w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-rose-900 outline-none ring-rose-200 focus:ring-2"
              placeholder={discountPolicy.type === "percent" ? "10" : "5"}
            />
          </label>
        </div>
      ) : null}

      <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800">
        {employeeDiscountPolicySummary(discountPolicy)}
        {discountPolicy.enabled && discountPolicy.type === "amount" && discountPolicy.value > 0
          ? ` القيمة: ${formatCurrency(discountPolicy.value)}.`
          : null}
      </p>
    </section>
  );
}

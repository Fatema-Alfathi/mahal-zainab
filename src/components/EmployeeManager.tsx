"use client";

import { FormEvent, useMemo, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { DiscountPolicyPanel } from "@/components/DiscountPolicyPanel";
import { useShop } from "@/context/ShopContext";
import {
  activeEmployees,
  isEmployeeNumberTaken,
  isEmployeePhoneTaken,
  monthlySalaryTotal,
  suggestEmployeeNumber,
} from "@/lib/employees";
import { formatCurrency, formatDate } from "@/lib/format";
import { EMPLOYEE_JOB_TITLES, type Employee, type EmployeeDraft } from "@/types";

export function EmployeeManager() {
  const { employees, addEmployee, updateEmployee } = useShop();
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<{ mode: "add" } | { mode: "edit"; employee: Employee } | null>(null);
  const [openId, setOpenId] = useState<string | null>(employees[0]?.id ?? null);
  const [notice, setNotice] = useState("");

  const visible = useMemo(() => {
    const key = query.trim();
    return employees.filter((employee) => {
      if (!key) return true;
      return [employee.name, employee.number, employee.phone, employee.jobTitle].some((field) => field.includes(key));
    });
  }, [employees, query]);

  const selected = employees.find((employee) => employee.id === openId) ?? null;
  const working = activeEmployees(employees);
  const salaryTotal = monthlySalaryTotal(employees);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-rose-400">فريق المحل</p>
          <h1 className="mt-1 font-serif text-3xl text-rose-900">الموظفات</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-600/80">
            ملف لكل موظفة: المهمة، الراتب، الهاتف، وتاريخ الالتحاق. مجموع رواتب العاملات يدخل في حسابات الشهر.
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
          موظفة جديدة
        </button>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="dash-panel rounded-2xl p-4">
          <dt className="text-xs text-rose-400">عاملات الآن</dt>
          <dd className="mt-1 text-2xl tabular-nums text-rose-900">{working.length}</dd>
        </div>
        <div className="dash-panel rounded-2xl p-4">
          <dt className="text-xs text-rose-400">كل الملفات</dt>
          <dd className="mt-1 text-2xl tabular-nums text-rose-900">{employees.length}</dd>
        </div>
        <div className="dash-panel rounded-2xl p-4">
          <dt className="text-xs text-rose-400">رواتب الشهر</dt>
          <dd className="mt-1 text-2xl tabular-nums text-rose-900">{formatCurrency(salaryTotal)}</dd>
        </div>
      </dl>

      {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}

      <div className="grid gap-5 xl:grid-cols-[20rem_1fr]">
        <div className="dash-panel rounded-2xl p-4">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحثي بالاسم أو المهمة أو الهاتف"
            className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 text-sm outline-none ring-rose-200 focus:ring-2"
          />
          <ul className="mt-3 max-h-[32rem] space-y-1 overflow-y-auto">
            {visible.length === 0 ? (
              <li className="px-2 py-6 text-center text-sm text-rose-300">ما في موظفة بهالبحث.</li>
            ) : null}
            {visible.map((employee) => {
              const active = employee.id === selected?.id;
              return (
                <li key={employee.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(employee.id)}
                    className={`w-full rounded-2xl px-3 py-2.5 text-right ${active ? "shop-btn" : "hover:bg-rose-50"}`}
                  >
                    <p className="text-sm">{employee.name}</p>
                    <p className={`mt-0.5 text-xs ${active ? "text-white/80" : "text-rose-400"}`}>
                      {employee.jobTitle} · {formatCurrency(employee.salary)}
                      {employee.active ? "" : " · تركت العمل"}
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
                <p className="text-xs text-rose-400">رقم الموظفة {selected.number}</p>
                <h2 className="mt-1 text-2xl text-rose-900">{selected.name}</h2>
                <p className="mt-2 text-sm leading-7 text-rose-600">
                  {selected.jobTitle} · الهاتف: {selected.phone}
                  {selected.startDate ? ` · التحقت ${formatDate(selected.startDate)}` : ""}
                </p>
                <p className="mt-2 text-sm text-rose-800">
                  راتب الشهر{" "}
                  <span className="tabular-nums text-rose-900">{formatCurrency(selected.salary)}</span>
                  <span className={`ms-2 text-xs ${selected.active ? "text-emerald-600" : "text-rose-400"}`}>
                    {selected.active ? "تعمل الآن" : "تركت العمل"}
                  </span>
                </p>
                {selected.notes ? <p className="mt-2 text-sm leading-7 text-rose-500">{selected.notes}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setNotice("");
                  setEditor({ mode: "edit", employee: selected });
                }}
                className="shop-soft inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm text-rose-700"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                تعديل الملف
              </button>
            </div>
          </article>
        ) : (
          <p className="dash-panel rounded-2xl px-4 py-10 text-center text-sm text-rose-300">اختاري موظفة من القائمة.</p>
        )}
      </div>

      <DiscountPolicyPanel />

      {editor ? (
        <EmployeeFormDialog
          title={editor.mode === "add" ? "موظفة جديدة" : `تعديل ${editor.employee.name}`}
          initialDraft={
            editor.mode === "add"
              ? {
                  number: suggestEmployeeNumber(employees),
                  name: "",
                  phone: "",
                  jobTitle: "بائعة",
                  salary: 150,
                  startDate: "",
                  active: true,
                  notes: "",
                }
              : {
                  number: editor.employee.number,
                  name: editor.employee.name,
                  phone: editor.employee.phone,
                  jobTitle: editor.employee.jobTitle,
                  salary: editor.employee.salary,
                  startDate: editor.employee.startDate,
                  active: editor.employee.active,
                  notes: editor.employee.notes,
                }
          }
          excludeId={editor.mode === "edit" ? editor.employee.id : undefined}
          onClose={() => setEditor(null)}
          onSave={(draft) => {
            const ok =
              editor.mode === "add" ? addEmployee(draft) : updateEmployee(editor.employee.id, draft);
            if (!ok) return false;
            setNotice(editor.mode === "add" ? "تم فتح ملف الموظفة." : "تم حفظ ملف الموظفة.");
            return true;
          }}
        />
      ) : null}
    </section>
  );
}

function EmployeeFormDialog({
  title,
  initialDraft,
  excludeId,
  onClose,
  onSave,
}: {
  title: string;
  initialDraft: EmployeeDraft;
  excludeId?: string;
  onClose: () => void;
  onSave: (draft: EmployeeDraft) => boolean;
}) {
  const { employees } = useShop();
  const [draft, setDraft] = useState<EmployeeDraft>(initialDraft);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError("اسم الموظفة مطلوب.");
      return;
    }
    if (!draft.number.trim()) {
      setError("رقم الموظفة مطلوب.");
      return;
    }
    if (isEmployeeNumberTaken(employees, draft.number, excludeId)) {
      setError("هذا الرقم مستخدم لموظفة ثانية.");
      return;
    }
    if (!draft.phone.trim()) {
      setError("رقم الهاتف مطلوب.");
      return;
    }
    if (isEmployeePhoneTaken(employees, draft.phone, excludeId)) {
      setError("هذا الهاتف مستخدم لموظفة ثانية.");
      return;
    }
    if (!draft.jobTitle.trim()) {
      setError("مهمة الموظفة مطلوبة.");
      return;
    }
    const salary = Number(draft.salary);
    if (!Number.isFinite(salary) || salary < 0) {
      setError("راتب الشهر صفر أو أكثر.");
      return;
    }
    if (!onSave(draft)) {
      setError("تعذر الحفظ. راجعي الرقم أو الهاتف.");
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
            <span className="mb-1 block text-rose-700">رقم الموظفة</span>
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
          <div>
            <p className="mb-2 text-sm text-rose-700">المهمة</p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {EMPLOYEE_JOB_TITLES.map((titleOption) => (
                <button
                  key={titleOption}
                  type="button"
                  onClick={() => setDraft((current) => ({ ...current, jobTitle: titleOption }))}
                  className={
                    draft.jobTitle === titleOption
                      ? "shop-btn rounded-full px-3 py-1 text-xs"
                      : "rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700 hover:bg-rose-100"
                  }
                >
                  {titleOption}
                </button>
              ))}
            </div>
            <input
              value={draft.jobTitle}
              onChange={(event) => setDraft((current) => ({ ...current, jobTitle: event.target.value }))}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
              placeholder="أو اكتبي مهمة ثانية"
            />
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">راتب الشهر (ر.ع.)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={draft.salary}
              onChange={(event) => setDraft((current) => ({ ...current, salary: Number(event.target.value) }))}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">تاريخ الالتحاق</span>
            <input
              type="date"
              value={draft.startDate}
              onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))}
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2"
            />
          </label>
          <label className="flex items-start gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))}
              className="mt-1 h-4 w-4 accent-rose-500"
            />
            <span>
              <span className="block font-medium">تعمل الآن</span>
              <span className="mt-1 block text-rose-400">إذا تركت العمل، راتبها ما يدخل في مجموع الشهر.</span>
            </span>
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

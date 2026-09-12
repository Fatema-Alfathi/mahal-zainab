"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Briefcase,
  CalendarDays,
  Pencil,
  Phone,
  Plus,
  Search,
  StickyNote,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { DiscountPolicyPanel } from "@/components/DiscountPolicyPanel";
import { useShop } from "@/context/ShopContext";
import {
  activeEmployees,
  isEmployeeNumberTaken,
  isEmployeePhoneTaken,
  monthlySalaryTotal,
  suggestEmployeeNumber,
} from "@/lib/employees";
import { cn, formatCurrency, formatDate } from "@/lib/format";
import { EMPLOYEE_JOB_TITLES, type Employee, type EmployeeDraft } from "@/types";

const fieldClass =
  "w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none transition focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]";

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
          <p className="text-sm font-medium text-[var(--salla-primary)]">فريق المحل</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">الموظفات</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--salla-muted)]">
            ملف لكل موظفة: المهمة، الراتب، الهاتف، وتاريخ الالتحاق. مجموع رواتب العاملات يدخل في حسابات الشهر.
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
          موظفة جديدة
        </button>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <StatCard label="عاملات الآن" value={String(working.length)} icon={UserRound} tone="success" />
        <StatCard label="كل الملفات" value={String(employees.length)} icon={Users} tone="primary" />
        <StatCard label="رواتب الشهر" value={formatCurrency(salaryTotal)} icon={Wallet} tone="primary" />
      </dl>

      {notice ? (
        <p className="rounded-xl border border-[color-mix(in_srgb,var(--salla-success)_30%,var(--salla-border))] bg-[color-mix(in_srgb,var(--salla-success)_10%,transparent)] px-4 py-2.5 text-sm text-[var(--salla-success)]">
          {notice}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="dash-panel flex max-h-[40rem] flex-col overflow-hidden rounded-2xl xl:max-h-[calc(100vh-16rem)]">
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
                placeholder="ابحثي بالاسم أو المهمة أو الهاتف"
                className="w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 py-2.5 pe-3 ps-10 text-sm outline-none focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]"
              />
            </div>
            <p className="mt-2 text-xs text-[var(--salla-muted)]">
              {visible.length} من {employees.length} موظفة
            </p>
          </div>

          <ul className="flex-1 space-y-1 overflow-y-auto p-2">
            {visible.length === 0 ? (
              <li className="px-3 py-10 text-center text-sm text-[var(--salla-muted)]">ما في موظفة بهالبحث.</li>
            ) : null}
            {visible.map((employee) => {
              const active = employee.id === selected?.id;
              return (
                <li key={employee.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(employee.id)}
                    className={cn(
                      "w-full rounded-xl px-3 py-3 text-right transition",
                      active
                        ? "bg-[var(--salla-primary)] text-white shadow-sm dark:text-[#1d1e20]"
                        : "hover:bg-[var(--salla-soft)]",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                          active
                            ? "bg-white/20 text-white dark:bg-black/10 dark:text-[#1d1e20]"
                            : "bg-[var(--salla-soft)] text-[var(--salla-primary)]",
                        )}
                      >
                        {initials(employee.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{employee.name}</p>
                        <p
                          className={cn(
                            "mt-0.5 truncate text-xs",
                            active ? "text-white/80 dark:text-[#1d1e20]/70" : "text-[var(--salla-muted)]",
                          )}
                        >
                          {employee.jobTitle} · {formatCurrency(employee.salary)}
                        </p>
                        {!employee.active ? (
                          <p
                            className={cn(
                              "mt-1 text-[11px]",
                              active ? "text-white/70 dark:text-[#1d1e20]/60" : "text-[var(--salla-danger)]",
                            )}
                          >
                            تركت العمل
                          </p>
                        ) : null}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {selected ? (
          <article className="dash-panel overflow-hidden rounded-2xl">
            <div className="border-b border-[var(--salla-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--salla-primary)_7%,var(--salla-surface)),var(--salla-surface)_60%)] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--salla-primary)_12%,transparent)] text-lg font-semibold text-[var(--salla-primary)]">
                    {initials(selected.name)}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-[var(--salla-muted)]">رقم الموظفة {selected.number}</p>
                    <h2 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{selected.name}</h2>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <InfoPill icon={Briefcase}>{selected.jobTitle}</InfoPill>
                      <InfoPill icon={Phone}>{selected.phone}</InfoPill>
                      {selected.startDate ? (
                        <InfoPill icon={CalendarDays}>التحقت {formatDate(selected.startDate)}</InfoPill>
                      ) : null}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotice("");
                    setEditor({ mode: "edit", employee: selected });
                  }}
                  className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--salla-soft)]"
                >
                  <Pencil className="h-3.5 w-3.5 text-[var(--salla-primary)]" aria-hidden />
                  تعديل الملف
                </button>
              </div>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
              <div className="rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/40 px-4 py-3">
                <p className="text-xs text-[var(--salla-muted)]">راتب الشهر</p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--salla-primary)]">
                  {formatCurrency(selected.salary)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/40 px-4 py-3">
                <p className="text-xs text-[var(--salla-muted)]">الحالة</p>
                <p
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    selected.active ? "text-[var(--salla-success)]" : "text-[var(--salla-danger)]",
                  )}
                >
                  {selected.active ? "تعمل الآن" : "تركت العمل"}
                </p>
              </div>
              {selected.notes ? (
                <div className="flex gap-2 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/40 px-4 py-3 sm:col-span-2">
                  <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-[var(--salla-muted)]" aria-hidden />
                  <p className="text-sm leading-6 text-[var(--foreground)]">{selected.notes}</p>
                </div>
              ) : null}
            </div>
          </article>
        ) : (
          <div className="dash-panel flex items-center justify-center rounded-2xl px-4 py-16 text-sm text-[var(--salla-muted)]">
            اختاري موظفة من القائمة.
          </div>
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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 1);
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  tone: "success" | "primary";
}) {
  return (
    <div className="dash-panel rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <dt className="text-xs font-medium text-[var(--salla-muted)]">{label}</dt>
          <dd
            className={cn(
              "mt-2 text-2xl font-semibold tabular-nums tracking-tight",
              tone === "success" ? "text-[var(--salla-success)]" : "text-[var(--salla-primary)]",
            )}
          >
            {value}
          </dd>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            tone === "success"
              ? "bg-[color-mix(in_srgb,var(--salla-success)_14%,transparent)] text-[var(--salla-success)]"
              : "bg-[color-mix(in_srgb,var(--salla-primary)_12%,transparent)] text-[var(--salla-primary)]",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon: Icon, children }: { icon: typeof Phone; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--salla-border)] bg-[var(--salla-surface)] px-2.5 py-1 text-[var(--foreground)]">
      <Icon className="h-3.5 w-3.5 text-[var(--salla-primary)]" aria-hidden />
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-[var(--foreground)]">{label}</span>
      {children}
    </label>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق النموذج" onClick={onClose} />
      <div className="dash-panel relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[var(--salla-primary)]">ملف الموظفة</p>
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
          <Field label="رقم الموظفة">
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
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--foreground)]">المهمة</p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {EMPLOYEE_JOB_TITLES.map((titleOption) => (
                <button
                  key={titleOption}
                  type="button"
                  onClick={() => setDraft((current) => ({ ...current, jobTitle: titleOption }))}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                    draft.jobTitle === titleOption
                      ? "bg-[var(--salla-primary)] text-white dark:text-[#1d1e20]"
                      : "bg-[var(--salla-soft)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--salla-primary)_10%,var(--salla-soft))]",
                  )}
                >
                  {titleOption}
                </button>
              ))}
            </div>
            <input
              value={draft.jobTitle}
              onChange={(event) => setDraft((current) => ({ ...current, jobTitle: event.target.value }))}
              className={fieldClass}
              placeholder="أو اكتبي مهمة ثانية"
            />
          </div>
          <Field label="راتب الشهر (ر.ع.)">
            <input
              type="number"
              min="0"
              step="0.1"
              value={draft.salary}
              onChange={(event) => setDraft((current) => ({ ...current, salary: Number(event.target.value) }))}
              className={fieldClass}
            />
          </Field>
          <Field label="تاريخ الالتحاق">
            <input
              type="date"
              value={draft.startDate}
              onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))}
              className={fieldClass}
            />
          </Field>
          <label className="flex items-start gap-3 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/50 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))}
              className="mt-1 h-4 w-4 accent-[var(--salla-primary)]"
            />
            <span>
              <span className="block font-medium text-[var(--foreground)]">تعمل الآن</span>
              <span className="mt-1 block text-[var(--salla-muted)]">إذا تركت العمل، راتبها ما يدخل في مجموع الشهر.</span>
            </span>
          </label>
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

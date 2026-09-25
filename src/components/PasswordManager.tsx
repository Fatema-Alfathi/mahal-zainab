"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Eye, EyeOff, KeyRound, Plus } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwords";

const fieldClass =
  "w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 pe-11 outline-none transition focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]";

const nameFieldClass =
  "w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/70 px-3 py-2.5 outline-none transition focus:border-[var(--salla-primary)] focus:bg-[var(--salla-surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]";

export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  hint?: string;
}) {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[var(--foreground)]">{label}</span>
      <span className="relative block">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className={fieldClass}
        />
        <button
          type="button"
          onClick={() => setShow((open) => !open)}
          className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--salla-muted)] hover:bg-[var(--salla-bg)] hover:text-[var(--salla-primary)]"
          aria-label={show ? t("login.hidePassword") : t("login.showPassword")}
          aria-pressed={show}
        >
          {show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </span>
      {hint ? <span className="mt-1 block text-xs text-[var(--salla-muted)]">{hint}</span> : null}
    </label>
  );
}

function Message({ children, tone }: { children: ReactNode; tone: "ok" | "err" }) {
  return (
    <p
      className={
        tone === "ok"
          ? "text-sm text-[var(--salla-success)]"
          : "text-sm text-[var(--salla-danger)]"
      }
    >
      {children}
    </p>
  );
}

function loginNameMessage(
  t: (key: string, vars?: Record<string, string>) => string,
  error: "name-required" | "owner-name" | "name-taken",
) {
  if (error === "owner-name") return t("pass.ownerName");
  if (error === "name-taken") return t("pass.nameTaken");
  return t("pass.nameRequired");
}

export function PasswordManager() {
  const {
    employees,
    ownerLoginPassword,
    staffLoginPassword,
    changeOwnerPassword,
    changeStaffPassword,
    addStaffAccount,
    renameEmployee,
  } = useShop();
  const { t } = useLanguage();
  const [ownerCurrent, setOwnerCurrent] = useState("");
  const [ownerNext, setOwnerNext] = useState("");
  const [ownerConfirm, setOwnerConfirm] = useState("");
  const [ownerMessage, setOwnerMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addMessage, setAddMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [staffDrafts, setStaffDrafts] = useState<Record<string, string>>({});
  const [staffMessage, setStaffMessage] = useState<{ id: string; tone: "ok" | "err"; text: string } | null>(null);

  const staff = useMemo(
    () => [...employees].sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name, "ar")),
    [employees],
  );

  function saveOwner() {
    if (ownerNext.trim() !== ownerConfirm.trim()) {
      setOwnerMessage({ tone: "err", text: t("pass.mismatch") });
      return;
    }
    const result = changeOwnerPassword(ownerCurrent, ownerNext);
    if (result === "ok") {
      setOwnerCurrent("");
      setOwnerNext("");
      setOwnerConfirm("");
      setOwnerMessage({ tone: "ok", text: t("pass.ownerOk") });
      return;
    }
    if (result === "wrong-current") {
      setOwnerMessage({ tone: "err", text: t("pass.wrongCurrent") });
      return;
    }
    setOwnerMessage({ tone: "err", text: t("pass.tooShort", { n: String(MIN_PASSWORD_LENGTH) }) });
  }

  function addStaff() {
    const result = addStaffAccount(newName, newPassword);
    if (result === "ok") {
      const name = newName.trim();
      setNewName("");
      setNewPassword("");
      setAddMessage({ tone: "ok", text: t("pass.staffAdded", { name }) });
      return;
    }
    if (result === "too-short") {
      setAddMessage({ tone: "err", text: t("pass.tooShort", { n: String(MIN_PASSWORD_LENGTH) }) });
      return;
    }
    if (result === "forbidden") {
      setAddMessage({ tone: "err", text: t("staff.saveFail") });
      return;
    }
    setAddMessage({ tone: "err", text: loginNameMessage(t, result) });
  }

  function saveStaff(employeeId: string, fallbackName: string) {
    const nextName = (nameDrafts[employeeId] ?? fallbackName).trim();
    const nameResult = renameEmployee(employeeId, nextName);
    if (nameResult !== "ok") {
      setStaffMessage({
        id: employeeId,
        tone: "err",
        text: nameResult === "forbidden" ? t("staff.saveFail") : loginNameMessage(t, nameResult),
      });
      return;
    }

    const nextPassword = staffDrafts[employeeId] ?? "";
    if (nextPassword.trim()) {
      const passwordResult = changeStaffPassword(employeeId, nextPassword);
      if (passwordResult !== "ok") {
        setStaffMessage({
          id: employeeId,
          tone: "err",
          text: t("pass.tooShort", { n: String(MIN_PASSWORD_LENGTH) }),
        });
        return;
      }
    }

    setNameDrafts((current) => {
      const next = { ...current };
      delete next[employeeId];
      return next;
    });
    setStaffDrafts((current) => ({ ...current, [employeeId]: "" }));
    setStaffMessage({ id: employeeId, tone: "ok", text: t("pass.staffOk", { name: nextName || fallbackName }) });
  }

  return (
    <section className="dash-panel overflow-hidden rounded-2xl">
      <div className="border-b border-[var(--salla-border)] px-5 py-5 sm:px-6">
        <p className="text-sm font-medium text-[var(--salla-primary)]">{t("pass.kicker")}</p>
        <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)] sm:text-2xl">{t("pass.title")}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--salla-muted)]">{t("pass.lead")}</p>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="space-y-4 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/40 p-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[var(--salla-primary)]" aria-hidden />
            <h4 className="text-base font-semibold text-[var(--foreground)]">{t("pass.owner")}</h4>
          </div>
          <p className="text-xs text-[var(--salla-muted)]">
            {t("pass.ownerHint")} {t("pass.currentValue")} {ownerLoginPassword}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <PasswordField
              label={t("pass.current")}
              value={ownerCurrent}
              onChange={(value) => {
                setOwnerCurrent(value);
                setOwnerMessage(null);
              }}
              autoComplete="current-password"
            />
            <PasswordField
              label={t("pass.next")}
              value={ownerNext}
              onChange={(value) => {
                setOwnerNext(value);
                setOwnerMessage(null);
              }}
              autoComplete="new-password"
            />
            <PasswordField
              label={t("pass.confirm")}
              value={ownerConfirm}
              onChange={(value) => {
                setOwnerConfirm(value);
                setOwnerMessage(null);
              }}
              autoComplete="new-password"
            />
          </div>
          {ownerMessage ? <Message tone={ownerMessage.tone}>{ownerMessage.text}</Message> : null}
          <button
            type="button"
            onClick={saveOwner}
            className="rounded-xl bg-[var(--salla-primary)] px-4 py-2.5 text-sm font-medium text-white dark:text-[#200000]"
          >
            {t("pass.saveOwner")}
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="text-base font-semibold text-[var(--foreground)]">{t("pass.staff")}</h4>
          <p className="text-xs text-[var(--salla-muted)]">{t("pass.staffHint")}</p>

          <div className="space-y-3 rounded-xl border border-dashed border-[var(--salla-border)] bg-[var(--salla-soft)]/40 p-4">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-[var(--salla-primary)]" aria-hidden />
              <h5 className="text-sm font-semibold text-[var(--foreground)]">{t("pass.addStaff")}</h5>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-[var(--foreground)]">{t("pass.addName")}</span>
                <input
                  value={newName}
                  onChange={(event) => {
                    setNewName(event.target.value);
                    setAddMessage(null);
                  }}
                  className={nameFieldClass}
                  autoComplete="off"
                />
              </label>
              <PasswordField
                label={t("pass.addPassword")}
                value={newPassword}
                onChange={(value) => {
                  setNewPassword(value);
                  setAddMessage(null);
                }}
                autoComplete="new-password"
              />
            </div>
            {addMessage ? <Message tone={addMessage.tone}>{addMessage.text}</Message> : null}
            <button
              type="button"
              onClick={addStaff}
              className="shop-btn rounded-xl px-4 py-2.5 text-sm font-medium"
            >
              {t("pass.addSave")}
            </button>
          </div>

          {staff.length === 0 ? (
            <p className="text-sm text-[var(--salla-muted)]">{t("pass.noStaff")}</p>
          ) : (
            <ul className="space-y-3">
              {staff.map((employee) => (
                <li
                  key={employee.id}
                  className="rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)]/40 p-4"
                >
                  <p className="mb-3 text-xs text-[var(--salla-muted)]">
                    {employee.active ? t("staff.active") : t("staff.inactive")} · {t("pass.currentValue")}{" "}
                    {staffLoginPassword(employee.id)}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="mb-1 block text-[var(--foreground)]">{t("pass.staffName")}</span>
                      <input
                        value={nameDrafts[employee.id] ?? employee.name}
                        onChange={(event) => {
                          setNameDrafts((current) => ({ ...current, [employee.id]: event.target.value }));
                          setStaffMessage(null);
                        }}
                        className={nameFieldClass}
                        autoComplete="off"
                      />
                    </label>
                    <PasswordField
                      label={t("pass.next")}
                      value={staffDrafts[employee.id] ?? ""}
                      onChange={(value) => {
                        setStaffDrafts((current) => ({ ...current, [employee.id]: value }));
                        setStaffMessage(null);
                      }}
                      autoComplete="new-password"
                      hint={t("pass.passwordKeep")}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => saveStaff(employee.id, employee.name)}
                    className="mt-3 rounded-xl border border-[var(--salla-border)] bg-[var(--salla-surface)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:border-[var(--salla-primary)]"
                  >
                    {t("pass.saveStaff")}
                  </button>
                  {staffMessage?.id === employee.id ? (
                    <div className="mt-2">
                      <Message tone={staffMessage.tone}>{staffMessage.text}</Message>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

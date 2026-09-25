"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import { activeEmployees } from "@/lib/employees";

const OWNER_LOGIN = "مالك";

const fieldClass =
  "w-full rounded-xl border border-[var(--salla-border)] bg-[var(--salla-soft)] px-3 py-2.5 text-[var(--foreground)] outline-none transition focus:border-[var(--salla-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--salla-primary)_20%,transparent)]";

export function LoginScreen() {
  const { signIn, employees } = useShop();
  const { t } = useLanguage();
  const router = useRouter();
  const [username, setUsername] = useState(OWNER_LOGIN);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const staff = useMemo(
    () => activeEmployees(employees).sort((a, b) => a.name.localeCompare(b.name, "ar")),
    [employees],
  );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const ok = signIn(username, password);
    if (!ok) {
      setError(true);
      return;
    }
    router.replace("/");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--salla-bg)] px-5 py-12">
      <section
        className="dash-panel w-full max-w-md rounded-2xl p-6 sm:p-8"
        aria-label={t("login.aria")}
      >
        <div className="mb-4 flex justify-center">
          <LanguageToggle tone="card" />
        </div>
        <div className="flex flex-col items-center text-center">
          <BrandLogo size="md" />
          <h1 className="mt-4 text-3xl font-semibold text-[var(--salla-primary)]">{t("brand")}</h1>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-[var(--foreground)]">{t("login.user")}</span>
              <select
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError(false);
                }}
                aria-label={t("login.userAria")}
                className={fieldClass}
              >
                <option value={OWNER_LOGIN}>{t("login.ownerOption")}</option>
                {staff.map((employee) => (
                  <option key={employee.id} value={employee.name}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[var(--foreground)]">{t("login.password")}</span>
              <span className="relative block">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(false);
                  }}
                  autoComplete="current-password"
                  className={`${fieldClass} pe-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((open) => !open)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--salla-muted)] hover:bg-[var(--salla-bg)] hover:text-[var(--salla-primary)]"
                  aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                </button>
              </span>
            </label>
          </div>
          {error ? (
            <p
              className="rounded-xl border border-[color-mix(in_srgb,var(--salla-danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--salla-danger)_10%,transparent)] px-3 py-2 text-sm text-[var(--salla-danger)]"
              role="alert"
            >
              {t("login.error")}
            </p>
          ) : null}
          <button type="submit" className="shop-btn w-full rounded-xl px-4 py-3 text-sm">
            {t("login.submit")}
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-6 text-[var(--salla-muted)]">
          {t("login.hintOwner")}
          <br />
          {t("login.hintStaff")}
        </p>
      </section>
    </div>
  );
}

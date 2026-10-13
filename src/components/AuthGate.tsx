"use client";

import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { LoginScreen } from "@/components/LoginScreen";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";

export function AuthGate({ children }: { children: ReactNode }) {
  const { authReady, signedIn, loadError, syncError } = useShop();
  const { t } = useLanguage();

  if (!authReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--salla-bg)] px-5" aria-busy="true">
        <BrandLogo size="lg" />
        <span className="sr-only">{t("loading")}</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[var(--salla-bg)] px-5 py-12">
        <p className="max-w-md text-center text-sm leading-7 text-red-800" role="alert">
          {t("load.error")}
        </p>
      </div>
    );
  }

  if (!signedIn) return <LoginScreen />;
  return (
    <>
      {syncError ? (
        <p className="bg-red-50 px-4 py-2 text-center text-sm text-red-800" role="alert">
          {t("sync.error")}
        </p>
      ) : null}
      {children}
    </>
  );
}

"use client";

import type { ReactNode } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { useShop } from "@/context/ShopContext";
import { useLanguage } from "@/i18n/LanguageProvider";

export function AuthGate({ children }: { children: ReactNode }) {
  const { authReady, signedIn } = useShop();
  const { t } = useLanguage();

  if (!authReady) {
    return (
      <div className="flex min-h-full items-center justify-center px-5 py-12">
        <p className="text-sm text-rose-400">{t("loading")}</p>
      </div>
    );
  }

  if (!signedIn) return <LoginScreen />;
  return children;
}

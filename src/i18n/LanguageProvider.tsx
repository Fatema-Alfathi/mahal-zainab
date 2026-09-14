"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getLocale, localeDir, readStoredLocale, setCurrentLocale, storeLocale, type Locale } from "@/i18n/locale";
import { translate } from "@/i18n/t";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

type LanguageContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  t: Translate;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    const saved = readStoredLocale();
    setCurrentLocale(saved);
    setLocaleState(saved);
  }, []);

  useEffect(() => {
    setCurrentLocale(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDir(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setCurrentLocale(next);
    storeLocale(next);
    setLocaleState(next);
  }, []);

  const t = useCallback<Translate>((key, vars) => translate(locale, key, vars), [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, dir: localeDir(locale), setLocale, t }),
    [locale, setLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    const locale = getLocale();
    return {
      locale,
      dir: localeDir(locale),
      setLocale: () => undefined,
      t: (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    };
  }
  return context;
}

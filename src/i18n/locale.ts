export type Locale = "ar" | "en";

export const LOCALE_KEY = "yal-locale";

let current: Locale = "ar";

export function getLocale(): Locale {
  return current;
}

export function setCurrentLocale(locale: Locale) {
  current = locale;
}

export function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "ar";
  return window.localStorage.getItem(LOCALE_KEY) === "en" ? "en" : "ar";
}

export function storeLocale(locale: Locale) {
  window.localStorage.setItem(LOCALE_KEY, locale);
}

export function localeDir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

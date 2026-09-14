import { getLocale, type Locale } from "@/i18n/locale";
import { ar } from "@/i18n/ar";
import { en } from "@/i18n/en";

const tables: Record<Locale, Record<string, string>> = { ar, en };

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let text = tables[locale][key] ?? tables.ar[key] ?? key;
  if (!vars) return text;
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  return translate(getLocale(), key, vars);
}

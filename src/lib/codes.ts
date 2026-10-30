// Shop codes: invoices, customers, staff and new dress barcodes.
// New codes use YAL. Older data may still hold ZNB codes, so their numbers
// count as taken and the sequence carries on from them.
export const CODE_PREFIX = "YAL";
const LEGACY_PREFIXES = ["ZNB"];

export type CodeKind = "INV" | "C" | "E" | "NEW";

export function codeFor(kind: CodeKind, index: number): string {
  return `${CODE_PREFIX}-${kind}-${String(index).padStart(3, "0")}`;
}

function usedNumbers(kind: CodeKind, existing: string[]): Set<number> {
  const prefixes = [CODE_PREFIX, ...LEGACY_PREFIXES].join("|");
  const pattern = new RegExp(`^(?:${prefixes})-${kind}-(\\d+)$`);
  const used = new Set<number>();
  for (const code of existing) {
    const match = pattern.exec(code.trim().toUpperCase());
    if (match) used.add(Number(match[1]));
  }
  return used;
}

// The first free number from `start`, under the new prefix or any older one.
export function suggestCode(kind: CodeKind, existing: string[], start = 1, limit = 10000): string {
  const used = usedNumbers(kind, existing);
  const taken = new Set(existing.map((code) => code.trim().toUpperCase()));
  for (let index = start; index < start + limit; index += 1) {
    const candidate = codeFor(kind, index);
    if (!used.has(index) && !taken.has(candidate)) return candidate;
  }
  return `${CODE_PREFIX}-${kind}-${Date.now().toString().slice(-6)}`;
}

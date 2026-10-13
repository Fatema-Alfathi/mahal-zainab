import type { SupabaseClient } from "@supabase/supabase-js";
import { assignInvoiceNumbers } from "@/lib/invoices";
import { parseShopBackup, type ShopSnapshot } from "@/lib/shopBackup";
import type { Booking } from "@/types";

const KEEP_DAYS = 90;

export type ShopBackupSummary = {
  date: string;
  dresses: number;
  customers: number;
  bookings: number;
};

function normalize(value: unknown): ShopSnapshot | null {
  const parsed = parseShopBackup(value);
  if (!parsed) return null;
  return {
    ...parsed,
    bookings: assignInvoiceNumbers(
      parsed.bookings.map((booking) => ({
        ...booking,
        invoiceNumber: booking.invoiceNumber ?? "",
        bookedByEmployeeId: booking.bookedByEmployeeId ?? "",
        payments: Array.isArray(booking.payments) ? booking.payments : [],
      })) as Booking[],
    ),
  };
}

function shiftIso(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isBackupDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function keepDailyBackup(
  client: SupabaseClient,
  today: string,
  version: number,
  payload: ShopSnapshot,
) {
  const inserted = await client.from("shop_backups").insert({
    backup_date: today,
    version,
    payload,
  });
  if (inserted.error && inserted.error.code !== "23505") throw new Error(inserted.error.message);
  const removed = await client.from("shop_backups").delete().lt("backup_date", shiftIso(today, -KEEP_DAYS));
  if (removed.error) throw new Error(removed.error.message);
}

export async function listDailyBackups(client: SupabaseClient): Promise<ShopBackupSummary[]> {
  const { data, error } = await client
    .from("shop_backups")
    .select("backup_date, payload")
    .order("backup_date", { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return (data ?? []).flatMap((row) => {
    const date = typeof row.backup_date === "string" ? row.backup_date.slice(0, 10) : "";
    const snapshot = normalize(row.payload);
    if (!date || !snapshot) return [];
    return [
      {
        date,
        dresses: snapshot.dresses.length,
        customers: snapshot.customers.length,
        bookings: snapshot.bookings.length,
      },
    ];
  });
}

export async function readDailyBackup(client: SupabaseClient, date: string): Promise<ShopSnapshot | null> {
  if (!isBackupDate(date)) return null;
  const { data, error } = await client.from("shop_backups").select("payload").eq("backup_date", date).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return normalize(data.payload);
}

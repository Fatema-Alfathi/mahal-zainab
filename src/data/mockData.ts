import type { Booking, Dress, FixedExpense, VariableExpense } from "@/types";

export const INITIAL_DRESSES: Dress[] = [
  {
    id: "dress-aurora",
    name: "فستان أورورا الحريري",
    purchasePrice: 95,
    rentalPricePerDay: 18,
    status: "available",
    totalMaintenanceCost: 7.5,
  },
  {
    id: "dress-celeste",
    name: "فستان سيليست العاجي المطرز",
    purchasePrice: 140,
    rentalPricePerDay: 25,
    status: "rented",
    totalMaintenanceCost: 5,
  },
  {
    id: "dress-noor",
    name: "فستان نور اللؤلؤي",
    purchasePrice: 220,
    rentalPricePerDay: 35,
    status: "available",
    totalMaintenanceCost: 13,
  },
  {
    id: "dress-zahra",
    name: "فستان زهرة الشمبانيا",
    purchasePrice: 110,
    rentalPricePerDay: 20,
    status: "maintenance",
    totalMaintenanceCost: 5,
  },
  {
    id: "dress-layla",
    name: "فستان ليلى المخملي",
    purchasePrice: 165,
    rentalPricePerDay: 28,
    status: "available",
    totalMaintenanceCost: 2.5,
  },
  {
    id: "dress-sultana",
    name: "فستان سلطانة الكريستال",
    purchasePrice: 280,
    rentalPricePerDay: 42,
    status: "rented",
    totalMaintenanceCost: 14.5,
  },
];

export const INITIAL_FIXED_EXPENSES: FixedExpense[] = [
  { id: "fixed-rent", name: "إيجار المحل", amount: 280, frequency: "monthly" },
  { id: "fixed-salaries", name: "رواتب الموظفين", amount: 450, frequency: "monthly" },
  { id: "fixed-software", name: "اشتراكات البرامج", amount: 12, frequency: "monthly" },
];

export const INITIAL_VARIABLE_EXPENSES: VariableExpense[] = [
  { id: "var-mkt-ramadan", category: "Marketing Campaign", amount: 55, date: "2026-03-01", description: "إعلانات إنستغرام لرمضان" },
  { id: "var-mkt-snapchat", category: "Marketing Campaign", amount: 80, date: "2026-04-10", description: "مؤثرة على سناب شات" },
  { id: "var-mkt-eid", category: "Marketing Campaign", amount: 45, date: "2026-05-28", description: "إطلاق مجموعة العيد" },
  { id: "var-util-q1", category: "Utility Bills", amount: 22, date: "2026-03-31", description: "كهرباء وماء الربع الأول" },
  { id: "var-util-summer", category: "Utility Bills", amount: 28, date: "2026-07-31", description: "ارتفاع فاتورة التكييف صيفاً" },
  { id: "var-dc-aurora-1", category: "Dry Cleaning", amount: 2.5, date: "2026-03-15", description: "تنظيف جاف بعد التأجير", associatedDressId: "dress-aurora" },
  { id: "var-dc-celeste-1", category: "Dry Cleaning", amount: 2.5, date: "2026-03-25", description: "تنظيف جاف بعد التأجير", associatedDressId: "dress-celeste" },
  { id: "var-dc-noor-1", category: "Dry Cleaning", amount: 2.5, date: "2026-04-04", description: "تنظيف جاف بعد التأجير", associatedDressId: "dress-noor" },
  { id: "var-dc-zahra-1", category: "Dry Cleaning", amount: 2.5, date: "2026-04-22", description: "تنظيف جاف بعد التأجير", associatedDressId: "dress-zahra" },
  { id: "var-dc-layla-1", category: "Dry Cleaning", amount: 2.5, date: "2026-05-11", description: "تنظيف جاف بعد التأجير", associatedDressId: "dress-layla" },
  { id: "var-dc-sultana-1", category: "Dry Cleaning", amount: 2.5, date: "2026-05-24", description: "تنظيف جاف بعد التأجير", associatedDressId: "dress-sultana" },
  { id: "var-dc-aurora-2", category: "Dry Cleaning", amount: 2.5, date: "2026-06-13", description: "تنظيف جاف بعد التأجير", associatedDressId: "dress-aurora" },
  { id: "var-dc-celeste-2", category: "Dry Cleaning", amount: 2.5, date: "2026-07-01", description: "تنظيف جاف بعد التأجير", associatedDressId: "dress-celeste" },
  { id: "var-dc-zahra-2", category: "Dry Cleaning", amount: 2.5, date: "2026-09-01", description: "تنظيف جاف بعد التأجير", associatedDressId: "dress-zahra" },
  { id: "var-dc-aurora-3", category: "Dry Cleaning", amount: 2.5, date: "2026-08-04", description: "تنظيف جاف بعد التأجير", associatedDressId: "dress-aurora" },
  { id: "var-dc-noor-2", category: "Dry Cleaning", amount: 2.5, date: "2026-08-18", description: "تنظيف جاف بعد التأجير", associatedDressId: "dress-noor" },
  { id: "var-repair-sultana", category: "Dress Repair", amount: 12, date: "2026-05-26", description: "إعادة تثبيت خرز الكريستال بعد تأجير العيد", associatedDressId: "dress-sultana" },
  { id: "var-repair-noor", category: "Dress Repair", amount: 8, date: "2026-08-19", description: "إصلاح الذيل وإعادة خياطة اللؤلؤ", associatedDressId: "dress-noor" },
];

export const INITIAL_BOOKINGS: Booking[] = [
  { id: "book-1", dressId: "dress-aurora", customerName: "عائشة رحمن", startDate: "2026-03-12", endDate: "2026-03-15", totalRevenueGenerated: 54, status: "completed" },
  { id: "book-2", dressId: "dress-celeste", customerName: "فاطمة الحسن", startDate: "2026-03-20", endDate: "2026-03-25", totalRevenueGenerated: 125, status: "completed" },
  { id: "book-3", dressId: "dress-noor", customerName: "مريم خليل", startDate: "2026-04-02", endDate: "2026-04-04", totalRevenueGenerated: 70, status: "completed" },
  { id: "book-4", dressId: "dress-zahra", customerName: "هناء عبدالله", startDate: "2026-04-18", endDate: "2026-04-22", totalRevenueGenerated: 80, status: "completed" },
  { id: "book-5", dressId: "dress-layla", customerName: "لينا عثمان", startDate: "2026-05-08", endDate: "2026-05-11", totalRevenueGenerated: 84, status: "completed" },
  { id: "book-6", dressId: "dress-sultana", customerName: "نور الأمين", startDate: "2026-05-22", endDate: "2026-05-24", totalRevenueGenerated: 84, status: "completed" },
  { id: "book-7", dressId: "dress-aurora", customerName: "سارة إبراهيم", startDate: "2026-06-10", endDate: "2026-06-13", totalRevenueGenerated: 54, status: "completed" },
  { id: "book-8", dressId: "dress-celeste", customerName: "ياسمين فاروق", startDate: "2026-06-28", endDate: "2026-07-01", totalRevenueGenerated: 75, status: "completed" },
  { id: "book-9", dressId: "dress-zahra", customerName: "أميرة صالح", startDate: "2026-08-29", endDate: "2026-09-01", totalRevenueGenerated: 60, status: "completed" },
  { id: "book-10", dressId: "dress-aurora", customerName: "دينا كريم", startDate: "2026-08-01", endDate: "2026-08-04", totalRevenueGenerated: 54, status: "completed" },
  { id: "book-11", dressId: "dress-noor", customerName: "لين قريشي", startDate: "2026-08-14", endDate: "2026-08-18", totalRevenueGenerated: 140, status: "completed" },
  { id: "book-12", dressId: "dress-celeste", customerName: "ليلى حداد", startDate: "2026-09-01", endDate: "2026-09-05", totalRevenueGenerated: 100, status: "active" },
  { id: "book-13", dressId: "dress-sultana", customerName: "رانيا محمود", startDate: "2026-09-02", endDate: "2026-09-06", totalRevenueGenerated: 168, status: "active" },
];

export const DRESS_PRESENTATION: Record<string, { designer: string; silhouette: string; palette: string }> = {
  "dress-aurora": { designer: "محل زينب", silhouette: "فستان كرة", palette: "from-[#efeae4] via-[#f7f3ef] to-[#eadfd8]" },
  "dress-celeste": { designer: "محل زينب", silhouette: "قصة A مطرّزة", palette: "from-[#eee8e2] via-[#f6f1ec] to-[#e7ddd6]" },
  "dress-noor": { designer: "محل زينب", silhouette: "كوتور لؤلؤي", palette: "from-[#ebe4dc] via-[#f4efe9] to-[#e6d8d2]" },
  "dress-zahra": { designer: "محل زينب", silhouette: "قصة A شمبانيا", palette: "from-[#f0ece6] via-[#f7f3ee] to-[#e9e0d4]" },
  "dress-layla": { designer: "محل زينب", silhouette: "عمود سهرة", palette: "from-[#e6e4e1] via-[#f2efeb] to-[#ddd8d4]" },
  "dress-sultana": { designer: "محل زينب", silhouette: "حورية البحر", palette: "from-[#eadfd8] via-[#f3eee9] to-[#e4d9d1]" },
};

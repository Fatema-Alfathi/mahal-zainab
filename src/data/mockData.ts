import type { Booking, Dress, EmployeeDiscountPolicy, FixedExpense, VariableExpense } from "@/types";

export const INITIAL_DISCOUNT_POLICY: EmployeeDiscountPolicy = {
  enabled: false,
  type: "percent",
  value: 10,
};

const DRESS_CATALOG = [
  {
    id: "dress-aurora",
    name: "فستان أورورا الحريري",
    barcode: "ZNB-AUR-001",
    size: "S",
    measurements: { bust: 88, waist: 68, hips: 94, length: 148 },
    purchasePrice: 95,
    rentalPricePerDay: 18,
    status: "available",
    totalMaintenanceCost: 7.5,
  },
  {
    id: "dress-celeste",
    name: "فستان سيليست العاجي المطرز",
    barcode: "ZNB-CEL-002",
    size: "M",
    measurements: { bust: 92, waist: 72, hips: 98, length: 150 },
    purchasePrice: 140,
    rentalPricePerDay: 25,
    status: "rented",
    totalMaintenanceCost: 5,
  },
  {
    id: "dress-noor",
    name: "فستان نور اللؤلؤي",
    barcode: "ZNB-NOR-003",
    size: "L",
    measurements: { bust: 96, waist: 76, hips: 102, length: 152 },
    purchasePrice: 220,
    rentalPricePerDay: 35,
    status: "available",
    totalMaintenanceCost: 13,
  },
  {
    id: "dress-zahra",
    name: "فستان زهرة الشمبانيا",
    barcode: "ZNB-ZHR-004",
    size: "XS",
    measurements: { bust: 84, waist: 64, hips: 90, length: 145 },
    purchasePrice: 110,
    rentalPricePerDay: 20,
    status: "maintenance",
    totalMaintenanceCost: 5,
  },
  {
    id: "dress-layla",
    name: "فستان ليلى المخملي",
    barcode: "ZNB-LYL-005",
    size: "XL",
    measurements: { bust: 100, waist: 80, hips: 106, length: 154 },
    purchasePrice: 165,
    rentalPricePerDay: 28,
    status: "available",
    totalMaintenanceCost: 2.5,
  },
  {
    id: "dress-sultana",
    name: "فستان سلطانة الكريستال",
    barcode: "ZNB-SUL-006",
    size: "M",
    measurements: { bust: 92, waist: 72, hips: 98, length: 155 },
    purchasePrice: 280,
    rentalPricePerDay: 42,
    status: "rented",
    totalMaintenanceCost: 14.5,
  },
] as const;

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

function booking(
  id: string,
  dressId: string,
  customerName: string,
  startDate: string,
  endDate: string,
  total: number,
  status: Booking["status"],
  discount?: { type: Booking["discountType"]; value: number; amount: number; subtotal: number },
): Booking {
  return {
    id,
    dressId,
    customerName,
    startDate,
    endDate,
    subtotal: discount?.subtotal ?? total,
    discountType: discount?.type ?? "none",
    discountValue: discount?.value ?? 0,
    discountAmount: discount?.amount ?? 0,
    totalRevenueGenerated: total,
    status,
  };
}

export const INITIAL_BOOKINGS: Booking[] = [
  booking("book-1", "dress-aurora", "عائشة رحمن", "2026-03-12", "2026-03-15", 54, "completed"),
  booking("book-2", "dress-celeste", "فاطمة الحسن", "2026-03-20", "2026-03-25", 125, "completed"),
  booking("book-3", "dress-noor", "مريم خليل", "2026-04-02", "2026-04-04", 70, "completed"),
  booking("book-4", "dress-zahra", "هناء عبدالله", "2026-04-18", "2026-04-22", 80, "completed"),
  booking("book-5", "dress-layla", "لينا عثمان", "2026-05-08", "2026-05-11", 84, "completed"),
  booking("book-6", "dress-sultana", "نور الأمين", "2026-05-22", "2026-05-24", 84, "completed"),
  booking("book-7", "dress-aurora", "سارة إبراهيم", "2026-06-10", "2026-06-13", 54, "completed"),
  booking("book-8", "dress-celeste", "ياسمين فاروق", "2026-06-28", "2026-07-01", 75, "completed"),
  booking("book-9", "dress-zahra", "أميرة صالح", "2026-08-29", "2026-09-01", 60, "completed"),
  booking("book-10", "dress-aurora", "دينا كريم", "2026-08-01", "2026-08-04", 54, "completed"),
  booking("book-11", "dress-noor", "لين قريشي", "2026-08-14", "2026-08-18", 140, "completed"),
  booking("book-12", "dress-celeste", "ليلى حداد", "2026-09-01", "2026-09-05", 100, "active"),
  booking("book-13", "dress-sultana", "رانيا محمود", "2026-09-02", "2026-09-06", 168, "active"),
];

export const DRESS_PRESENTATION: Record<
  string,
  { designer: string; silhouette: string; palette: string; images: string[] }
> = {
  "dress-aurora": {
    designer: "محل زينب",
    silhouette: "فستان كرة",
    palette: "from-rose-200 via-pink-100 to-amber-100",
    images: [
      "https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=900",
      "https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=900",
      "https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=900",
    ],
  },
  "dress-celeste": {
    designer: "محل زينب",
    silhouette: "قصة A مطرّزة",
    palette: "from-amber-100 via-yellow-50 to-rose-100",
    images: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&h=1100&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&h=1100&q=80",
      "https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=900",
    ],
  },
  "dress-noor": {
    designer: "محل زينب",
    silhouette: "كوتور لؤلؤي",
    palette: "from-violet-100 via-fuchsia-50 to-rose-100",
    images: [
      "https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=900",
      "https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=900",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&h=1100&q=80",
    ],
  },
  "dress-zahra": {
    designer: "محل زينب",
    silhouette: "قصة A شمبانيا",
    palette: "from-orange-100 via-amber-50 to-rose-100",
    images: [
      "https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=900",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&h=1100&q=80",
      "https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=900",
    ],
  },
  "dress-layla": {
    designer: "محل زينب",
    silhouette: "عمود سهرة",
    palette: "from-fuchsia-100 via-rose-50 to-violet-100",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&h=1100&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&h=1100&q=80",
      "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=900&h=1100&q=80",
    ],
  },
  "dress-sultana": {
    designer: "محل زينب",
    silhouette: "حورية البحر",
    palette: "from-yellow-100 via-amber-100 to-rose-200",
    images: [
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=900&h=1100&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&h=1100&q=80",
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&h=1100&q=80",
    ],
  },
};

export const INITIAL_DRESSES: Dress[] = DRESS_CATALOG.map((dress) => ({
  ...dress,
  silhouette: DRESS_PRESENTATION[dress.id].silhouette,
  images: DRESS_PRESENTATION[dress.id].images,
}));

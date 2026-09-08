import { fittingDateForPickup } from "@/lib/customers";
import type { Booking, Customer, Dress, Employee, EmployeeDiscountPolicy, FixedExpense, VariableExpense } from "@/types";

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
    category: "soft",
    color: "عاجي",
    styleId: "style-aurora",
    measurements: { bust: 88, waist: 68, hips: 94, length: 148 },
    purchasePrice: 95,
    rentalPricePerDay: 18,
    insuranceAmount: 20,
    status: "available",
    totalMaintenanceCost: 7.5,
  },
  {
    id: "dress-celeste",
    name: "فستان سيليست العاجي المطرز",
    barcode: "ZNB-CEL-002",
    size: "M",
    category: "engagement",
    color: "عاجي",
    styleId: "style-celeste",
    measurements: { bust: 92, waist: 72, hips: 98, length: 150 },
    purchasePrice: 140,
    rentalPricePerDay: 25,
    insuranceAmount: 30,
    status: "rented",
    totalMaintenanceCost: 5,
  },
  {
    id: "dress-noor",
    name: "فستان نور اللؤلؤي",
    barcode: "ZNB-NOR-003",
    size: "L",
    category: "wedding",
    color: "أبيض",
    styleId: "style-noor",
    measurements: { bust: 96, waist: 76, hips: 102, length: 152 },
    purchasePrice: 220,
    rentalPricePerDay: 35,
    insuranceAmount: 45,
    status: "available",
    totalMaintenanceCost: 13,
  },
  {
    id: "dress-zahra",
    name: "فستان زهرة الشمبانيا",
    barcode: "ZNB-ZHR-004",
    size: "XS",
    category: "soft",
    color: "شمبانيا",
    styleId: "style-zahra",
    measurements: { bust: 84, waist: 64, hips: 90, length: 145 },
    purchasePrice: 110,
    rentalPricePerDay: 20,
    insuranceAmount: 20,
    status: "maintenance",
    totalMaintenanceCost: 5,
  },
  {
    id: "dress-layla",
    name: "فستان ليلى المخملي",
    barcode: "ZNB-LYL-005",
    size: "XL",
    category: "evening",
    color: "خمري",
    styleId: "style-layla",
    measurements: { bust: 100, waist: 80, hips: 106, length: 154 },
    purchasePrice: 165,
    rentalPricePerDay: 28,
    insuranceAmount: 35,
    status: "reserved",
    totalMaintenanceCost: 2.5,
  },
  {
    id: "dress-sultana",
    name: "فستان سلطانة الكريستال",
    barcode: "ZNB-SUL-006",
    size: "M",
    category: "wedding",
    color: "ذهبي",
    styleId: "style-sultana",
    measurements: { bust: 92, waist: 72, hips: 98, length: 155 },
    purchasePrice: 280,
    rentalPricePerDay: 42,
    insuranceAmount: 55,
    status: "rented",
    totalMaintenanceCost: 14.5,
  },
  {
    id: "dress-aurora-blush",
    name: "فستان أورورا الحريري",
    barcode: "ZNB-AUR-007",
    size: "M",
    category: "soft",
    color: "وردي",
    styleId: "style-aurora",
    measurements: { bust: 92, waist: 72, hips: 98, length: 148 },
    purchasePrice: 95,
    rentalPricePerDay: 18,
    insuranceAmount: 20,
    status: "available",
    totalMaintenanceCost: 0,
  },
  {
    id: "dress-noor-gold",
    name: "فستان نور اللؤلؤي",
    barcode: "ZNB-NOR-008",
    size: "M",
    category: "wedding",
    color: "ذهبي",
    styleId: "style-noor",
    measurements: { bust: 92, waist: 72, hips: 98, length: 152 },
    purchasePrice: 220,
    rentalPricePerDay: 35,
    insuranceAmount: 45,
    status: "available",
    totalMaintenanceCost: 0,
  },
] as const;

const DRESS_FILES: Record<
  string,
  { description: string; purchaseDate: string; shippingCost: number; customsCost: number; needsAlteration: boolean }
> = {
  "dress-aurora": {
    description: "فستان حريري ناعم بلون عاجي، مناسب للسهرات الهادئة والملكة.",
    purchaseDate: "2024-08-12",
    shippingCost: 8,
    customsCost: 4,
    needsAlteration: false,
  },
  "dress-celeste": {
    description: "فستان مطرّز باللون العاجي، قصة A تناسب الخطوبة والمناسبات الرسمية.",
    purchaseDate: "2024-09-03",
    shippingCost: 12,
    customsCost: 6,
    needsAlteration: false,
  },
  "dress-noor": {
    description: "فستان زفاف لؤلؤي بذيل واضح، يحتاج عناية بعد كل تأجير.",
    purchaseDate: "2024-06-20",
    shippingCost: 18,
    customsCost: 12,
    needsAlteration: false,
  },
  "dress-zahra": {
    description: "فستان شمبانيا خفيف بقصة A، مناسب للسهرات الناعمة.",
    purchaseDate: "2025-01-15",
    shippingCost: 7,
    customsCost: 3,
    needsAlteration: false,
  },
  "dress-layla": {
    description: "فستان سهرة مخملي خمري، قصة عمود تبرز القوام.",
    purchaseDate: "2024-11-02",
    shippingCost: 10,
    customsCost: 5,
    needsAlteration: true,
  },
  "dress-sultana": {
    description: "فستان زفاف كريستال ذهبي بقصة حورية البحر.",
    purchaseDate: "2024-05-10",
    shippingCost: 22,
    customsCost: 15,
    needsAlteration: true,
  },
  "dress-aurora-blush": {
    description: "نفس قصة أورورا بلون وردي، قطعة ثانية للمقاس المتوسط.",
    purchaseDate: "2025-03-01",
    shippingCost: 8,
    customsCost: 4,
    needsAlteration: false,
  },
  "dress-noor-gold": {
    description: "نفس قصة نور بلون ذهبي، مناسب للزفاف والملكة.",
    purchaseDate: "2025-04-18",
    shippingCost: 18,
    customsCost: 12,
    needsAlteration: false,
  },
};

const DRESS_INSURANCE: Record<string, number> = Object.fromEntries(
  DRESS_CATALOG.map((dress) => [dress.id, dress.insuranceAmount]),
);

export const INITIAL_FIXED_EXPENSES: FixedExpense[] = [
  { id: "fixed-rent", name: "الإيجار", amount: 280, frequency: "monthly" },
  { id: "fixed-salaries", name: "الرواتب", amount: 450, frequency: "monthly" },
  { id: "fixed-electricity", name: "الكهرباء", amount: 25, frequency: "monthly" },
  { id: "fixed-internet", name: "الإنترنت", amount: 15, frequency: "monthly" },
  { id: "fixed-ads", name: "الإعلانات", amount: 40, frequency: "monthly" },
  { id: "fixed-photos", name: "جلسات التصوير", amount: 0, frequency: "monthly" },
  { id: "fixed-cleaning", name: "تنظيف الفساتين", amount: 0, frequency: "monthly" },
  { id: "fixed-repair", name: "تصليح وتعديل الفساتين", amount: 0, frequency: "monthly" },
  { id: "fixed-purchases", name: "المشتريات", amount: 20, frequency: "monthly" },
  { id: "fixed-travel", name: "السفر", amount: 0, frequency: "monthly" },
  { id: "fixed-exhibitions", name: "المعارض", amount: 0, frequency: "monthly" },
  { id: "fixed-hospitality", name: "الضيافة", amount: 10, frequency: "monthly" },
  { id: "fixed-other", name: "مصروفات أخرى", amount: 0, frequency: "monthly" },
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
  { id: "var-mkt-2025-eid", category: "Marketing Campaign", amount: 35, date: "2025-10-12", description: "إعلانات عيد الفطر السابق" },
  { id: "var-util-2025-q4", category: "Utility Bills", amount: 18, date: "2025-12-20", description: "كهرباء وماء الربع الأخير" },
  { id: "var-dc-2025-noor", category: "Dry Cleaning", amount: 2.5, date: "2025-11-18", description: "تنظيف جاف بعد التأجير", associatedDressId: "dress-noor" },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: "cust-mona", number: "ZNB-C-001", name: "منى الكندي", phone: "99120011", eventDate: "2025-10-12", notes: "عروس هادئة، تحب القصّة الناعمة." },
  { id: "cust-asma", number: "ZNB-C-002", name: "أسماء البلوشي", phone: "99120022", eventDate: "2025-11-18", notes: "طلبت لؤلؤ ولون أبيض واضح." },
  { id: "cust-ruqaya", number: "ZNB-C-003", name: "رقية الزدجالي", phone: "99120033", eventDate: "2025-11-24", notes: "" },
  { id: "cust-kholoud", number: "ZNB-C-004", name: "خلود الحارثي", phone: "99120044", eventDate: "2025-12-07", notes: "سهرة عائلة." },
  { id: "cust-iman", number: "ZNB-C-005", name: "إيمان الشقصي", phone: "99120055", eventDate: "2025-12-23", notes: "" },
  { id: "cust-aisha", number: "ZNB-C-006", name: "عائشة رحمن", phone: "99210011", eventDate: "2026-08-04", notes: "زبونة ترجع للمحل. تحب أورورا." },
  { id: "cust-fatima", number: "ZNB-C-007", name: "فاطمة الحسن", phone: "99210022", eventDate: "2026-07-01", notes: "خطوبة ثم مناسبة ثانية." },
  { id: "cust-maryam", number: "ZNB-C-008", name: "مريم خليل", phone: "99210033", eventDate: "2026-08-18", notes: "فستان زفاف يحتاج تعديلات ذيل." },
  { id: "cust-hana", number: "ZNB-C-009", name: "هناء عبدالله", phone: "99210044", eventDate: "2026-04-22", notes: "" },
  { id: "cust-lina", number: "ZNB-C-010", name: "لينا عثمان", phone: "99210055", eventDate: "2026-05-11", notes: "" },
  { id: "cust-noor", number: "ZNB-C-011", name: "نور الأمين", phone: "99210066", eventDate: "2026-05-24", notes: "تفضل الذهبي." },
  { id: "cust-sara", number: "ZNB-C-012", name: "سارة إبراهيم", phone: "99310011", eventDate: "2026-06-13", notes: "" },
  { id: "cust-amira", number: "ZNB-C-013", name: "أميرة صالح", phone: "99310022", eventDate: "2026-09-01", notes: "" },
  { id: "cust-leen", number: "ZNB-C-014", name: "لين قريشي", phone: "99310033", eventDate: "2026-08-18", notes: "" },
  { id: "cust-layla", number: "ZNB-C-015", name: "ليلى حداد", phone: "99410011", eventDate: "2026-09-05", notes: "المتبقي لم يُحصَّل بعد." },
  { id: "cust-rania", number: "ZNB-C-016", name: "رانيا محمود", phone: "99410022", eventDate: "2026-09-06", notes: "تحتاج بروفة وتعديل خصر." },
  { id: "cust-hind", number: "ZNB-C-017", name: "هند سالم", phone: "99410033", eventDate: "2026-09-08", notes: "حجز يوم واحد." },
  { id: "cust-jawaher", number: "ZNB-C-018", name: "جواهر ناصر", phone: "99410044", eventDate: "2026-09-20", notes: "الفستان محجوز ولم يُسلَّم بعد." },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "emp-maryam",
    number: "ZNB-E-001",
    name: "مريم العلوي",
    phone: "99130011",
    jobTitle: "بائعة",
    salary: 180,
    startDate: "2024-09-01",
    active: true,
    notes: "مسؤولة الصالة واستقبال العميلات.",
  },
  {
    id: "emp-hind",
    number: "ZNB-E-002",
    name: "هند البلوشي",
    phone: "99130022",
    jobTitle: "مساعدة",
    salary: 150,
    startDate: "2025-01-15",
    active: true,
    notes: "تحجز المواعيد وتتابع العربون والتأمين.",
  },
  {
    id: "emp-suad",
    number: "ZNB-E-003",
    name: "سعاد الحارثي",
    phone: "99130033",
    jobTitle: "تعديلات",
    salary: 120,
    startDate: "2025-06-01",
    active: true,
    notes: "خياطة وتعديلات الفساتين قبل الاستلام.",
  },
];

const CUSTOMER_BY_NAME = Object.fromEntries(INITIAL_CUSTOMERS.map((item) => [item.name, item]));

function booking(
  id: string,
  dressId: string,
  customerName: string,
  startDate: string,
  endDate: string,
  total: number,
  status: Booking["status"],
  extra?: {
    depositPaid?: number;
    remainingAmount?: number;
    discount?: { type: Booking["discountType"]; value: number; amount: number; subtotal: number };
    needsAlterations?: boolean;
    needsFitting?: boolean;
    bookedAt?: string;
  },
): Booking {
  const customer = CUSTOMER_BY_NAME[customerName];
  const depositPaid = extra?.depositPaid ?? Math.round(total * 0.4 * 1000) / 1000;
  const remainingAmount =
    extra?.remainingAmount ?? (status === "completed" ? 0 : Math.max(0, Math.round((total - depositPaid) * 1000) / 1000));
  const needsAlterations = extra?.needsAlterations ?? false;
  const needsFitting = needsAlterations || (extra?.needsFitting ?? false);
  return {
    id,
    dressId,
    customerId: customer?.id ?? "",
    customerName,
    bookedAt: extra?.bookedAt ?? startDate,
    startDate,
    endDate,
    pickupDate: startDate,
    returnDate: endDate,
    needsFitting,
    needsAlterations,
    fittingDate: needsFitting ? fittingDateForPickup(startDate) : "",
    subtotal: extra?.discount?.subtotal ?? total,
    discountType: extra?.discount?.type ?? "none",
    discountValue: extra?.discount?.value ?? 0,
    discountAmount: extra?.discount?.amount ?? 0,
    totalRevenueGenerated: total,
    depositPaid,
    remainingAmount: status === "completed" ? 0 : remainingAmount,
    insuranceAmount: DRESS_INSURANCE[dressId] ?? 20,
    insurancePaid: DRESS_INSURANCE[dressId] ?? 20,
    insuranceReturned: status === "completed",
    status,
  };
}

export const INITIAL_BOOKINGS: Booking[] = [
  booking("book-2025-1", "dress-aurora", "منى الكندي", "2025-10-10", "2025-10-12", 54, "completed"),
  booking("book-2025-2", "dress-noor", "أسماء البلوشي", "2025-11-15", "2025-11-18", 140, "completed"),
  booking("book-2025-3", "dress-sultana", "رقية الزدجالي", "2025-11-22", "2025-11-24", 84, "completed"),
  booking("book-2025-4", "dress-layla", "خلود الحارثي", "2025-12-05", "2025-12-07", 56, "completed"),
  booking("book-2025-5", "dress-celeste", "إيمان الشقصي", "2025-12-20", "2025-12-23", 100, "completed"),
  booking("book-1", "dress-aurora", "عائشة رحمن", "2026-03-12", "2026-03-15", 54, "completed", {
    needsFitting: true,
    bookedAt: "2026-03-05",
  }),
  booking("book-2", "dress-celeste", "فاطمة الحسن", "2026-03-20", "2026-03-25", 125, "completed", {
    bookedAt: "2026-03-12",
  }),
  booking("book-3", "dress-noor", "مريم خليل", "2026-04-02", "2026-04-04", 70, "completed", {
    needsAlterations: true,
    bookedAt: "2026-03-20",
  }),
  booking("book-4", "dress-zahra", "هناء عبدالله", "2026-04-18", "2026-04-22", 80, "completed"),
  booking("book-5", "dress-layla", "لينا عثمان", "2026-05-08", "2026-05-11", 84, "completed"),
  booking("book-6", "dress-sultana", "نور الأمين", "2026-05-22", "2026-05-24", 84, "completed", {
    needsFitting: true,
  }),
  booking("book-7", "dress-aurora", "سارة إبراهيم", "2026-06-10", "2026-06-13", 54, "completed"),
  booking("book-8", "dress-celeste", "فاطمة الحسن", "2026-06-28", "2026-07-01", 75, "completed", {
    bookedAt: "2026-06-18",
  }),
  booking("book-9", "dress-zahra", "أميرة صالح", "2026-08-29", "2026-09-01", 60, "completed"),
  booking("book-10", "dress-aurora", "عائشة رحمن", "2026-08-01", "2026-08-04", 54, "completed", {
    needsFitting: true,
    bookedAt: "2026-07-20",
  }),
  booking("book-11", "dress-noor", "مريم خليل", "2026-08-14", "2026-08-18", 140, "completed", {
    needsAlterations: true,
    bookedAt: "2026-08-01",
  }),
  booking("book-12", "dress-celeste", "ليلى حداد", "2026-09-01", "2026-09-05", 100, "active", {
    depositPaid: 40,
    remainingAmount: 60,
    needsFitting: true,
    bookedAt: "2026-08-22",
  }),
  booking("book-13", "dress-sultana", "رانيا محمود", "2026-09-02", "2026-09-06", 168, "active", {
    depositPaid: 70,
    remainingAmount: 98,
    needsAlterations: true,
    bookedAt: "2026-08-20",
  }),
  booking("book-14", "dress-aurora", "هند سالم", "2026-09-08", "2026-09-08", 18, "completed", {
    depositPaid: 18,
    remainingAmount: 0,
  }),
  booking("book-15", "dress-layla", "جواهر ناصر", "2026-09-18", "2026-09-20", 56, "active", {
    depositPaid: 20,
    remainingAmount: 36,
    needsAlterations: true,
    bookedAt: "2026-09-04",
  }),
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
  "dress-aurora-blush": {
    designer: "محل زينب",
    silhouette: "فستان كرة",
    palette: "from-rose-200 via-pink-100 to-fuchsia-100",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&h=1100&q=80",
      "https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=900",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&h=1100&q=80",
    ],
  },
  "dress-noor-gold": {
    designer: "محل زينب",
    silhouette: "كوتور لؤلؤي",
    palette: "from-yellow-100 via-amber-50 to-rose-100",
    images: [
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=900&h=1100&q=80",
      "https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=900",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&h=1100&q=80",
    ],
  },
};

export const INITIAL_DRESSES: Dress[] = DRESS_CATALOG.map((dress) => ({
  ...dress,
  ...DRESS_FILES[dress.id],
  silhouette: DRESS_PRESENTATION[dress.id].silhouette,
  images: DRESS_PRESENTATION[dress.id].images,
}));

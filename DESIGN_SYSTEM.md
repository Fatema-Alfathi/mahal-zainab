# نظام التصميم — محل زينب / YAL (أسلوب سلة داشبورد)

مرجع للهوية البصرية الحالية بعد إعادة التصميم بأسلوب لوحة تحكم [سلة](https://docs.salla.dev/embedded-sdk/design-guidelines).

**الخلاصة:** خلفية رمادية فاتحة `#f8f8f8`، بطاقات بيضاء بحد ناعم وظل خفيف، شريط جانبي RTL + شريط علوي، لون أساسي تيل `#004d5b` وتمييز نعناع `#73fcd7`، خط Thmanyah Sans، واجهة عربية RTL.

---

## 1. الهوية

| العنصر | القيمة |
|--------|--------|
| الاسم | محل زينب / YAL |
| الشعار | `public/yal-logo.jpg` |
| الهيكل | `AppShell` — sidebar + topbar |
| themeColor | `#004d5b` |

الشعار: `rounded-xl` + `ring-1 ring-slate-200` (بدون إطار ذهبي).

---

## 2. الألوان (سلة)

| التوكن | Hex | الاستخدام |
|--------|-----|-----------|
| `--salla-primary` | `#004d5b` | أزرار، روابط نشطة، عناوين مميزة |
| `--salla-primary-hover` | `#003d48` | hover للزر الأساسي |
| `--salla-secondary` | `#73fcd7` | تمييز / حالة نشطة في السايدبار |
| `--salla-success` | `#00b259` | نجاح / متاح |
| `--salla-danger` | `#f5434a` | خطر / حذف |
| `--salla-bg` | `#f8f8f8` | خلفية مساحة العمل |
| `--salla-surface` | `#ffffff` | بطاقات وأسطح |
| `--salla-border` | `#e5e7eb` | حدود ناعمة |
| `--foreground` | `#1a1a1a` | نص أساسي |

مقياس `rose-*` في `@theme` مُعاد توجيهه إلى رمادي/تيل محايد حتى تبقى الأصناف القديمة متناسقة مع النظام الجديد. يُفضَّل في الكود الجديد استخدام `slate-*` و`var(--salla-primary)`.

### حالات التشغيل

| الحالة | أسلوب |
|--------|--------|
| متاح | `bg-emerald-600` / success |
| محجوز | `bg-sky-600` |
| عند العميلة | `bg-yellow-400 text-yellow-950` |
| يحتاج تنظيف | `bg-red-600` / danger |

---

## 3. الخطوط

**Thmanyah Sans** عبر `--font-thmanyah` (أوزان 300–900).  
`--font-sans` و `--font-serif` يشيران لنفس العائلة. `.font-serif` للعناوين العرضية فقط.

---

## 4. أصناف `shop-*` / `dash-*`

| الصنف | السلوك |
|-------|--------|
| `.shop-card` / `.dash-panel` | أبيض + حد رمادي + ظل ناعم |
| `.dash-hero` | نفس البطاقة البيضاء (بدون خلفية داكنة) |
| `.shop-soft` | `#f1f5f9` |
| `.shop-btn` | تيل primary |
| `.shop-btn-gold` | نعناع secondary (اسم تاريخي) |
| `.shop-btn-green/red/yellow/blue` | أزرار الحالة |
| `.shop-tint-*` | خلفيات KPI ملونة بحد خفيف بدون ظل صلب |
| `.shell-nav-active` | خلفية نعناع شفافة + نص primary |
| `.shell-nav-idle` | رمادي مع hover فاتح |

**لا تستخدم** ظل offset ذهبي ثقيل — النظام يعتمد `shadow-sm` وحدود `#e5e7eb`.

---

## 5. الهيكل (AppShell)

```
[ Sidebar RTL ] [ Topbar: عنوان + RoleSwitcher ]
                [ Main max-w-7xl ]
```

- سطح المكتب: سايدبار ثابت `w-64`
- الموبايل: زر قائمة + drawer
- الملف: [`src/components/AppShell.tsx`](src/components/AppShell.tsx)

الصفحات تلف المحتوى بـ `<AppShell active="…">`.

---

## 6. أنماط سريعة

| الدور | أسلوب |
|-------|--------|
| بطاقة | `shop-card` أو `dash-panel` + `rounded-2xl` |
| زر أساسي | `shop-btn rounded-2xl` |
| تمييز | `shop-btn-gold` (نعناع) |
| عنوان | `text-slate-900` أو `text-rose-900` (مُعاد توجيهه) |
| تلميح | `text-slate-500` |
| حقل إدخال | `rounded-2xl bg-rose-50 ring-rose-200 focus:ring-2` |
| فلتر غير نشط | `bg-white ring-1 ring-slate-200 rounded-full` |

---

## 7. ملفات أساسية

| ملف | دور |
|-----|-----|
| `src/app/globals.css` | توكنات وأصناف النظام |
| `src/components/AppShell.tsx` | الهيكل |
| `src/components/RoleSwitcher.tsx` | تبديل الدور |
| `src/components/BrandLogo.tsx` | الشعار |
| `src/fonts/thmanyahsans-*.otf` | الخط |
| `DESIGN_SYSTEM.md` | هذا الملف |

---

## 8. قواعد البناء

1. خلفية الصفحة دائماً `#f8f8f8` — بدون نقش أو تدرجات زخرفية.
2. البطاقات بيضاء بحد ناعم — بدون ظل ذهبي صلب.
3. Primary = تيل سلة؛ Secondary = نعناع.
4. RTL أولاً؛ LTR للباركود والتواريخ فقط.
5. خط واحد: Thmanyah Sans.
6. كل صفحة داخل `AppShell`.

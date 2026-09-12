# نظام التصميم — محل زينب / YAL

مرجع للهوية البصرية المستخرجة من شعار `yal-logo.jpg` (بورغندي + شامبانيا ذهبي) مع هيكل لوحة تحكم (sidebar + topbar).

**الخلاصة:** خلفية عاجية دافئة `#faf6f2`، بطاقات كريمية بحد ناعم، شريط جانبي RTL + شريط علوي، لون أساسي بورغندي `#6e1024` وتمييز ذهبي `#d4b896`، خط Thmanyah Sans، واجهة عربية RTL.

---

## 1. الهوية

| العنصر | القيمة |
|--------|--------|
| الاسم | محل زينب / YAL |
| الشعار | `public/yal-logo.jpg` |
| الهيكل | `AppShell` — sidebar + topbar |
| themeColor | `#6e1024` |

الشعار: `rounded-xl` + `ring-1 ring-[#d4b896]`.

---

## 2. الألوان (هوية الشعار)

| التوكن | Hex | الاستخدام |
|--------|-----|-----------|
| `--salla-primary` | `#6e1024` | أزرار، روابط نشطة، عناوين مميزة |
| `--salla-primary-hover` | `#540d1c` | hover للزر الأساسي |
| `--salla-secondary` | `#d4b896` | تمييز ذهبي / شامبانيا |
| `--salla-success` | `#1f7a4d` | نجاح / متاح |
| `--salla-danger` | `#c0392b` | خطر / حذف |
| `--salla-bg` | `#faf6f2` | خلفية مساحة العمل |
| `--salla-surface` | `#fffbf8` | بطاقات وأسطح |
| `--salla-border` | `#e6d9ce` | حدود ناعمة |
| `--foreground` | `#2a0c12` | نص أساسي |

الوضع الداكن: خلفية `#200000`، سطح `#2e0a0a`، أساسي شامبانيا `#e5d5c0`.

مقياس `rose-*` / `pink-*` في `@theme` مُعاد توجيهه إلى بورغندي/ذهبي حتى تبقى الأصناف القديمة متناسقة. يُفضَّل في الكود الجديد استخدام `var(--salla-*)`.

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
| `.shop-card` / `.dash-panel` | كريمي + حد ذهبي دافئ + ظل ناعم |
| `.dash-hero` | نفس البطاقة (بدون خلفية داكنة) |
| `.shop-soft` | `#f3ebe3` |
| `.shop-btn` | بورغندي primary |
| `.shop-btn-gold` | شامبانيا secondary |
| `.shop-btn-green/red/yellow/blue` | أزرار الحالة |
| `.shop-tint-*` | خلفيات KPI ملونة بحد خفيف بدون ظل صلب |
| `.shell-nav-active` | خلفية primary + نص أبيض (داكن: نص `#200000`) |
| `.shell-nav-idle` | سطح مع حد وحد hover بورغندي |

**لا تستخدم** ظل offset ثقيل — النظام يعتمد `shadow-sm` وحدود `#e6d9ce`.

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
| تمييز | `shop-btn-gold` |
| عنوان | `text-[var(--foreground)]` أو `text-[var(--salla-primary)]` |
| تلميح | `text-[var(--salla-muted)]` |
| حقل إدخال | حدود `--salla-border` + focus على primary |
| فلتر غير نشط | `bg-[var(--salla-soft)]` + حد ناعم |

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

1. خلفية الصفحة دائماً `#faf6f2` — بدون نقش أو تدرجات زخرفية.
2. البطاقات كريمية بحد ناعم — بدون ظل ثقيل.
3. Primary = بورغندي الشعار؛ Secondary = شامبانيا ذهبي.
4. RTL أولاً؛ LTR للباركود والتواريخ فقط.
5. خط واحد: Thmanyah Sans.
6. كل صفحة داخل `AppShell`.

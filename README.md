# بوتيك YAL

نظام إدارة محل زينب لتأجير فساتين الزفاف والسهرات. الفساتين، الحجوزات، الزبائن، والموظفات تُحفظ في Supabase عندما تُضبط مفاتيح السيرفر. بدون المفاتيح يبقى التشغيل المحلي على البيانات التجريبية في المتصفح.

الموقع المنشور: https://yal-boutique.vercel.app/

## التشغيل محلياً

```bash
npm install
npm run dev
```

ثم افتحي الرابط الذي يظهر في الطرفية.

دخول المالكة: اسم المستخدم `yal` وكلمة المرور `yal`.
دخول الموظفة: اسمها أو رقمها وكلمة المرور `1234`.

## ربط Supabase

1. من لوحة Supabase افتحي SQL Editor والصقي محتوى `supabase/migrations/20261013103000_shop_state.sql` ثم نفّذيه. الجدول `shop_state` مقفل بـ Row Level Security، وما فيه سياسة للزوار. مفتاح السر فقط يقدر يقرأ ويكتب، بعد ما السيرفر يتأكد من جلسة الموظفة.
2. انسخي رابط المشروع ومفتاح السر (`sb_secret_...`) من Settings → API Keys.
3. ضعي هذه المتغيرات على Vercel (Environment Variables)، بدون بادئة `NEXT_PUBLIC_`:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
SESSION_SECRET=سلسلة-عشوائية-16-حرفاً-على-الأقل
```

مثال الأسماء موجود في `.env.example`.
4. أعيدي نشر الموقع على Vercel. النشر لازم يكون تطبيق Next.js على السيرفر، مو تصدير ثابت. لا تضبطي `GITHUB_PAGES=true` على Vercel، لأن التصدير الثابت ما يشغّل مسارات الحفظ.

أول دخول بعد الربط ينسخ بيانات البوتيك التجريبية إلى الصف الوحيد في `shop_state`. بعدين أي حجز أو تعديل ينحفظ في نفس الصف، ويظهر لكل الأجهزة.

## Run locally

```bash
npm install
npm run dev
```

Owner login is username `yal` and password `yal`. Staff use their name or number and password `1234`.

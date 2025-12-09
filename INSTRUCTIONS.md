# تعليمات إعداد تطبيق Munasbate

## الخطوة 1: إعداد قاعدة البيانات في Supabase

1. اذهب إلى لوحة تحكم Supabase الخاصة بك: https://nolyprppeofqocgdyzrd.supabase.co
2. من القائمة الجانبية، اختر **SQL Editor**
3. انسخ محتوى ملف `DATABASE_SETUP_COMPLETE.sql` بالكامل
4. الصق المحتوى في SQL Editor واضغط **Run**
5. انتظر حتى تظهر رسالة النجاح

## الخطوة 2: إضافة متغيرات البيئة

في لوحة تحكم v0، اذهب إلى **Vars** وأضف المتغيرين التاليين:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://nolyprppeofqocgdyzrd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbHlwcnBwZW9mcW9jZ2R5enJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODU3ODAsImV4cCI6MjA3OTE2MTc4MH0.DbvzsoDmor4TI_0etZB_oyZMKgbsyL-gORJUVgyZ8XA
\`\`\`

## الخطوة 3: اختبار التطبيق

1. أعد تحميل التطبيق
2. جرب الخيارات الثلاثة:
   - **تسجيل الدخول**: استخدم أحد حسابات خدمة العملاء (1111111 - 5555555)
   - **إنشاء حساب**: سيتم إنشاء معرف من 7 أرقام تلقائياً
   - **تصفح كزائر**: تصفح بدون حساب

## حسابات خدمة العملاء للاختبار

| المعرف | الرمز السري | الوصف |
|--------|------------|-------|
| 1111111 | Mnsb@Zf24Sh | خدمة الزفات والشيلات |
| 2222222 | Mnsb#Pk78Bq | خدمة الباقات والعروض |
| 3333333 | Mnsb!Cd91Th | خدمة الدعوات والتهنئات |
| 4444444 | Mnsb$Sv33Gn | الخدمات العامة |
| 5555555 | Mnsb?Sp55In | الاستفسارات والدعم |

## ملاحظات مهمة

- زر "تصفح كزائر" موجود في الصفحة الرئيسية
- الزوار يمكنهم تصفح جميع الخدمات لكن بدون تفاعل
- نظام التسجيل يستخدم معرف 7 أرقام مع رمز PIN
- جميع الجداول محمية بـ RLS لكن مفتوحة للاختبار

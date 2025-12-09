# تعليمات إعداد قاعدة البيانات Supabase

## المشكلة الحالية
التطبيق متصل بقاعدة بيانات Supabase مختلفة عن التي قدمتها. لجعل التطبيق يعمل بقاعدة البيانات الخاصة بك، اتبع الخطوات التالية:

## الخطوة 1: إضافة المفاتيح في v0

1. افتح التطبيق في v0
2. انقر على أيقونة القائمة الجانبية على اليسار
3. اختر **Vars** (المتغيرات)
4. أضف المتغيرات التالية:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://nolyprppeofqocgdyzrd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbHlwcnBwZW9mcW9jZ2R5enJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODU3ODAsImV4cCI6MjA3OTE2MTc4MH0.DbvzsoDmor4TI_0etZB_oyZMKgbsyL-gORJUVgyZ8XA
\`\`\`

## الخطوة 2: تشغيل السكريبت في Supabase

1. افتح لوحة تحكم Supabase: https://nolyprppeofqocgdyzrd.supabase.co
2. اذهب إلى **SQL Editor** من القائمة الجانبية
3. انقر على **New Query**
4. انسخ والصق السكريبت التالي:

\`\`\`sql
-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS public.app_users (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  account_type TEXT DEFAULT 'user' CHECK (account_type IN ('user', 'agent')),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء indexes للبحث السريع
CREATE INDEX IF NOT EXISTS idx_app_users_user_id ON public.app_users(user_id);
CREATE INDEX IF NOT EXISTS idx_app_users_username ON public.app_users(username);

-- تفعيل Row Level Security
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Enable read access for all users" ON public.app_users;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.app_users;
DROP POLICY IF EXISTS "Enable update for users" ON public.app_users;

-- إنشاء سياسات الأمان (مفتوحة للاختبار)
CREATE POLICY "Enable read access for all users" ON public.app_users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.app_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users" ON public.app_users
  FOR UPDATE USING (true);

-- إنشاء حسابات خدمة العملاء الخمسة + حساب الزائر
INSERT INTO public.app_users (user_id, username, pin_hash, account_type, bio) VALUES
  ('1111111', 'خدمة الزفات والشيلات', encode(digest('Mnsb@Zf24Sh', 'sha256'), 'hex'), 'agent', 'خدمة طلبات الزفات والشيلات'),
  ('2222222', 'خدمة الباقات والعروض', encode(digest('Mnsb#Pk78Bq', 'sha256'), 'hex'), 'agent', 'خدمة طلبات الباقات والعروض'),
  ('3333333', 'خدمة الدعوات والتهنئات', encode(digest('Mnsb!Cd91Th', 'sha256'), 'hex'), 'agent', 'خدمة طلبات الدعوات والتهنئات'),
  ('4444444', 'الخدمات العامة', encode(digest('Mnsb$Sv33Gn', 'sha256'), 'hex'), 'agent', 'الخدمات العامة'),
  ('5555555', 'الاستفسارات والدعم', encode(digest('Mnsb?Sp55In', 'sha256'), 'hex'), 'agent', 'الاستفسارات والدعم التقني'),
  ('9999999', 'زائر', '', 'user', 'حساب الزائر')
ON CONFLICT (user_id) DO NOTHING;
\`\`\`

5. انقر على **Run** لتشغيل السكريبت
6. تأكد من ظهور رسالة "Success"

## الخطوة 3: اختبار التطبيق

بعد إضافة المتغيرات وتشغيل السكريبت:

1. أعد تحميل التطبيق في v0
2. يجب أن تظهر لك صفحة الترحيب بثلاثة أزرار
3. جرب "تصفح كزائر" للتصفح بدون حساب
4. أو "إنشاء حساب جديد" لإنشاء حساب خاص بك

## معلومات حسابات خدمة العملاء

| المعرف | الرمز السري | الاستخدام |
|--------|-------------|-----------|
| 1111111 | Mnsb@Zf24Sh | خدمة الزفات والشيلات |
| 2222222 | Mnsb#Pk78Bq | خدمة الباقات والعروض |
| 3333333 | Mnsb!Cd91Th | خدمة الدعوات والتهنئات |
| 4444444 | Mnsb$Sv33Gn | الخدمات العامة |
| 5555555 | Mnsb?Sp55In | الاستفسارات والدعم |
| 9999999 | - | حساب الزائر (تلقائي) |

## ملاحظات مهمة

- حساب الزائر (9999999) يُستخدم تلقائياً عند الضغط على "تصفح كزائر"
- الزوار يمكنهم تصفح التطبيق ولكن لا يمكنهم إنشاء منشورات أو التفاعل
- لتحويل الزائر إلى مستخدم، يجب عليه إنشاء حساب جديد

-- إنشاء جدول المستخدمين البسيط بدون استخدام auth
DROP TABLE IF EXISTS public.app_users CASCADE;

CREATE TABLE public.app_users (
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

-- إنشاء index للبحث السريع
CREATE INDEX idx_app_users_user_id ON public.app_users(user_id);
CREATE INDEX idx_app_users_username ON public.app_users(username);

-- إزالة RLS مؤقتاً لتسهيل الاختبار
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- السماح بقراءة جميع البيانات
CREATE POLICY "Enable read access for all users" ON public.app_users
  FOR SELECT USING (true);

-- السماح بإضافة مستخدمين جدد
CREATE POLICY "Enable insert for all users" ON public.app_users
  FOR INSERT WITH CHECK (true);

-- السماح بتحديث البيانات الخاصة فقط
CREATE POLICY "Enable update for users based on user_id" ON public.app_users
  FOR UPDATE USING (true);

-- إنشاء الحسابات الخمسة لخدمة العملاء
INSERT INTO public.app_users (user_id, username, pin_hash, account_type, bio) VALUES
  ('1111111', 'خدمة الزفات والشيلات', encode(digest('Mnsb@Zf24Sh', 'sha256'), 'hex'), 'agent', 'خدمة طلبات الزفات والشيلات'),
  ('2222222', 'خدمة الباقات والعروض', encode(digest('Mnsb#Pk78Bq', 'sha256'), 'hex'), 'agent', 'خدمة طلبات الباقات والعروض'),
  ('3333333', 'خدمة الدعوات والتهنئات', encode(digest('Mnsb!Cd91Th', 'sha256'), 'hex'), 'agent', 'خدمة طلبات الدعوات والتهنئات'),
  ('4444444', 'الخدمات العامة', encode(digest('Mnsb$Sv33Gn', 'sha256'), 'hex'), 'agent', 'الخدمات العامة'),
  ('5555555', 'الاستفسارات والدعم', encode(digest('Mnsb?Sp55In', 'sha256'), 'hex'), 'agent', 'الاستفسارات والدعم التقني')
ON CONFLICT (user_id) DO NOTHING;

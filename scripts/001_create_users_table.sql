-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id TEXT UNIQUE NOT NULL, -- معرف 7 أرقام
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  account_type TEXT DEFAULT 'user' CHECK (account_type IN ('user', 'agent')),
  is_private BOOLEAN DEFAULT false,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تمكين RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة الملفات العامة
CREATE POLICY "users_select_public"
  ON public.users FOR SELECT
  USING (true);

-- السماح للمستخدم بتحديث بياناته فقط
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- السماح بإدراج بيانات المستخدم الجديد
CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS users_user_id_idx ON public.users(user_id);
CREATE INDEX IF NOT EXISTS users_display_name_idx ON public.users(display_name);

-- سكريبت نهائي لإنشاء جدول خدمات المستخدمين
-- شغل هذا السكريبت في Supabase SQL Editor

-- حذف الجدول القديم إذا وجد
DROP TABLE IF EXISTS public.user_service_content CASCADE;
DROP TABLE IF EXISTS public.user_service_likes CASCADE;
DROP TABLE IF EXISTS public.user_service_comments CASCADE;
DROP TABLE IF EXISTS public.user_service_favorites CASCADE;
DROP TABLE IF EXISTS public.user_service_followers CASCADE;
DROP TABLE IF EXISTS public.user_services CASCADE;

-- إنشاء جدول الخدمات الرئيسي
CREATE TABLE public.user_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    followers_count INTEGER DEFAULT 0,
    content_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_service UNIQUE (user_id)
);

-- إنشاء جدول محتوى الخدمات
CREATE TABLE public.user_service_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES public.user_services(id) ON DELETE CASCADE,
    title TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'audio', 'image')),
    content_url TEXT NOT NULL,
    thumbnail_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_content ENABLE ROW LEVEL SECURITY;

-- سياسات الجدول الرئيسي - مفتوحة للجميع
DROP POLICY IF EXISTS "Allow all select" ON public.user_services;
DROP POLICY IF EXISTS "Allow all insert" ON public.user_services;
DROP POLICY IF EXISTS "Allow all update" ON public.user_services;
DROP POLICY IF EXISTS "Allow all delete" ON public.user_services;

CREATE POLICY "Allow all select" ON public.user_services FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.user_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.user_services FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.user_services FOR DELETE USING (true);

-- سياسات جدول المحتوى
DROP POLICY IF EXISTS "Allow all select" ON public.user_service_content;
DROP POLICY IF EXISTS "Allow all insert" ON public.user_service_content;
DROP POLICY IF EXISTS "Allow all update" ON public.user_service_content;
DROP POLICY IF EXISTS "Allow all delete" ON public.user_service_content;

CREATE POLICY "Allow all select" ON public.user_service_content FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.user_service_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.user_service_content FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.user_service_content FOR DELETE USING (true);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON public.user_services(user_id);
CREATE INDEX IF NOT EXISTS idx_user_service_content_service_id ON public.user_service_content(service_id);
CREATE INDEX IF NOT EXISTS idx_user_service_content_type ON public.user_service_content(content_type);

-- إنشاء Storage bucket إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-services', 'user-services', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- حذف سياسات Storage القديمة أولاً بأسماء محددة
DROP POLICY IF EXISTS "Allow public read user-services" ON storage.objects;
DROP POLICY IF EXISTS "Allow all upload user-services" ON storage.objects;
DROP POLICY IF EXISTS "Allow all update user-services" ON storage.objects;
DROP POLICY IF EXISTS "Allow all delete user-services" ON storage.objects;

-- إنشاء سياسات Storage بأسماء فريدة جديدة
CREATE POLICY "user_services_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'user-services');

CREATE POLICY "user_services_public_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'user-services');

CREATE POLICY "user_services_public_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'user-services');

CREATE POLICY "user_services_public_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'user-services');

-- رسالة نجاح
DO $$
BEGIN
    RAISE NOTICE '✅ تم إنشاء جداول خدمات المستخدمين بنجاح!';
    RAISE NOTICE 'الأعمدة: id, user_id, name, description, avatar_url, cover_url';
END $$;

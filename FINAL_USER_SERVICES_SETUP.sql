-- سكريبت نهائي شامل لإعداد جدول user_services
-- يجب تشغيله في Supabase SQL Editor

-- 1. حذف الجدول القديم إذا كان موجوداً (لضمان البداية من الصفر)
DROP TABLE IF EXISTS public.user_service_followers CASCADE;
DROP TABLE IF EXISTS public.user_service_favorites CASCADE;
DROP TABLE IF EXISTS public.user_service_comments CASCADE;
DROP TABLE IF EXISTS public.user_service_likes CASCADE;
DROP TABLE IF EXISTS public.user_service_content CASCADE;
DROP TABLE IF EXISTS public.user_services CASCADE;

-- 2. إنشاء جدول user_services بالأسماء الصحيحة التي يتوقعها الكود
CREATE TABLE public.user_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    description TEXT,
    profile_image TEXT,
    cover_image TEXT,
    followers_count INTEGER DEFAULT 0,
    content_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_service UNIQUE (user_id)
);

-- 3. إنشاء جدول المحتوى
CREATE TABLE public.user_service_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.user_services(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'audio', 'image')),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. إنشاء جدول الإعجابات
CREATE TABLE public.user_service_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES public.user_service_content(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_like UNIQUE (content_id, user_id)
);

-- 5. إنشاء جدول التعليقات
CREATE TABLE public.user_service_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES public.user_service_content(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. إنشاء جدول المفضلة
CREATE TABLE public.user_service_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES public.user_service_content(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_favorite UNIQUE (content_id, user_id)
);

-- 7. إنشاء جدول المتابعين
CREATE TABLE public.user_service_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.user_services(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_follow UNIQUE (service_id, user_id)
);

-- 8. إنشاء الفهارس
CREATE INDEX idx_user_services_user_id ON public.user_services(user_id);
CREATE INDEX idx_user_service_content_service ON public.user_service_content(service_id);
CREATE INDEX idx_user_service_content_type ON public.user_service_content(content_type);
CREATE INDEX idx_user_service_likes_content ON public.user_service_likes(content_id);
CREATE INDEX idx_user_service_likes_user ON public.user_service_likes(user_id);
CREATE INDEX idx_user_service_comments_content ON public.user_service_comments(content_id);
CREATE INDEX idx_user_service_favorites_user ON public.user_service_favorites(user_id);
CREATE INDEX idx_user_service_followers_service ON public.user_service_followers(service_id);

-- 9. تفعيل RLS على جميع الجداول
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_followers ENABLE ROW LEVEL SECURITY;

-- 10. إنشاء سياسات RLS (السماح للجميع - التحقق يتم في الكود)
-- user_services
CREATE POLICY "Allow select user_services" ON public.user_services FOR SELECT USING (true);
CREATE POLICY "Allow insert user_services" ON public.user_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update user_services" ON public.user_services FOR UPDATE USING (true);
CREATE POLICY "Allow delete user_services" ON public.user_services FOR DELETE USING (true);

-- user_service_content
CREATE POLICY "Allow select user_service_content" ON public.user_service_content FOR SELECT USING (true);
CREATE POLICY "Allow insert user_service_content" ON public.user_service_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update user_service_content" ON public.user_service_content FOR UPDATE USING (true);
CREATE POLICY "Allow delete user_service_content" ON public.user_service_content FOR DELETE USING (true);

-- user_service_likes
CREATE POLICY "Allow select user_service_likes" ON public.user_service_likes FOR SELECT USING (true);
CREATE POLICY "Allow insert user_service_likes" ON public.user_service_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete user_service_likes" ON public.user_service_likes FOR DELETE USING (true);

-- user_service_comments
CREATE POLICY "Allow select user_service_comments" ON public.user_service_comments FOR SELECT USING (true);
CREATE POLICY "Allow insert user_service_comments" ON public.user_service_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete user_service_comments" ON public.user_service_comments FOR DELETE USING (true);

-- user_service_favorites
CREATE POLICY "Allow select user_service_favorites" ON public.user_service_favorites FOR SELECT USING (true);
CREATE POLICY "Allow insert user_service_favorites" ON public.user_service_favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete user_service_favorites" ON public.user_service_favorites FOR DELETE USING (true);

-- user_service_followers
CREATE POLICY "Allow select user_service_followers" ON public.user_service_followers FOR SELECT USING (true);
CREATE POLICY "Allow insert user_service_followers" ON public.user_service_followers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete user_service_followers" ON public.user_service_followers FOR DELETE USING (true);

-- 11. إعداد Storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-services', 'user-services', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 12. سياسات Storage
DROP POLICY IF EXISTS "Allow public read user-services" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload user-services" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner delete user-services" ON storage.objects;

CREATE POLICY "Allow public read user-services" ON storage.objects
FOR SELECT USING (bucket_id = 'user-services');

CREATE POLICY "Allow authenticated upload user-services" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'user-services');

CREATE POLICY "Allow owner delete user-services" ON storage.objects
FOR DELETE USING (bucket_id = 'user-services');

-- 13. رسالة نجاح
DO $$
BEGIN
    RAISE NOTICE '✅ تم إنشاء جميع الجداول والسياسات بنجاح!';
    RAISE NOTICE '📋 الجداول: user_services, user_service_content, user_service_likes, user_service_comments, user_service_favorites, user_service_followers';
    RAISE NOTICE '🗄️ Storage bucket: user-services';
END $$;

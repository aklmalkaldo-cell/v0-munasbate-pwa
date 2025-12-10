-- ===========================================
-- الخطوة 3: إنشاء جداول التفاعلات
-- شغل هذا السكريبت ثالثاً
-- ===========================================

-- حذف الفهارس القديمة أولاً لتجنب خطأ "already exists"
DROP INDEX IF EXISTS idx_service_likes_content;
DROP INDEX IF EXISTS idx_service_likes_user;
DROP INDEX IF EXISTS idx_service_comments_content;
DROP INDEX IF EXISTS idx_service_comments_user;
DROP INDEX IF EXISTS idx_service_favorites_content;
DROP INDEX IF EXISTS idx_service_favorites_user;
DROP INDEX IF EXISTS idx_service_followers_service;
DROP INDEX IF EXISTS idx_service_followers_user;

-- حذف الجداول إذا كانت موجودة
DROP TABLE IF EXISTS public.user_service_likes CASCADE;
DROP TABLE IF EXISTS public.user_service_comments CASCADE;
DROP TABLE IF EXISTS public.user_service_favorites CASCADE;
DROP TABLE IF EXISTS public.user_service_followers CASCADE;

-- 1. جدول الإعجابات
CREATE TABLE public.user_service_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES public.user_service_content(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, user_id)
);

CREATE INDEX idx_service_likes_content ON public.user_service_likes(content_id);
CREATE INDEX idx_service_likes_user ON public.user_service_likes(user_id);

-- 2. جدول التعليقات
CREATE TABLE public.user_service_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES public.user_service_content(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_comments_content ON public.user_service_comments(content_id);
CREATE INDEX idx_service_comments_user ON public.user_service_comments(user_id);

-- 3. جدول المفضلة
CREATE TABLE public.user_service_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES public.user_service_content(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, user_id)
);

CREATE INDEX idx_service_favorites_content ON public.user_service_favorites(content_id);
CREATE INDEX idx_service_favorites_user ON public.user_service_favorites(user_id);

-- 4. جدول المتابعين
CREATE TABLE public.user_service_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.user_services(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(service_id, user_id)
);

CREATE INDEX idx_service_followers_service ON public.user_service_followers(service_id);
CREATE INDEX idx_service_followers_user ON public.user_service_followers(user_id);

-- تفعيل RLS لجميع الجداول
ALTER TABLE public.user_service_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_followers ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للإعجابات
CREATE POLICY "Anyone can view likes" ON public.user_service_likes FOR SELECT USING (true);
CREATE POLICY "Users can add likes" ON public.user_service_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove likes" ON public.user_service_likes FOR DELETE USING (true);

-- سياسات RLS للتعليقات
CREATE POLICY "Anyone can view comments" ON public.user_service_comments FOR SELECT USING (true);
CREATE POLICY "Users can add comments" ON public.user_service_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete comments" ON public.user_service_comments FOR DELETE USING (true);

-- سياسات RLS للمفضلة
CREATE POLICY "Anyone can view favorites" ON public.user_service_favorites FOR SELECT USING (true);
CREATE POLICY "Users can add favorites" ON public.user_service_favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove favorites" ON public.user_service_favorites FOR DELETE USING (true);

-- سياسات RLS للمتابعين
CREATE POLICY "Anyone can view followers" ON public.user_service_followers FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.user_service_followers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unfollow" ON public.user_service_followers FOR DELETE USING (true);

-- رسالة نجاح
SELECT 'تم إنشاء جداول التفاعلات بنجاح!' as status;

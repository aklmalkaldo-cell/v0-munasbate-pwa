-- =============================================
-- سكريبت شامل لإنشاء جداول خدمات المستخدمين
-- شغل هذا السكريبت في Supabase SQL Editor
-- =============================================

-- 1. إنشاء جدول خدمات المستخدمين
CREATE TABLE IF NOT EXISTS public.user_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  avatar_url TEXT,
  followers_count INTEGER DEFAULT 0,
  content_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إنشاء جدول محتوى الخدمات
CREATE TABLE IF NOT EXISTS public.user_service_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.user_services(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'audio', 'image')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إنشاء جدول الإعجابات
CREATE TABLE IF NOT EXISTS public.user_service_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.user_service_content(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

-- 4. إنشاء جدول التعليقات
CREATE TABLE IF NOT EXISTS public.user_service_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.user_service_content(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. إنشاء جدول المحفوظات
CREATE TABLE IF NOT EXISTS public.user_service_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.user_service_content(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

-- 6. إنشاء جدول متابعي الخدمات
CREATE TABLE IF NOT EXISTS public.user_service_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.user_services(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, user_id)
);

-- 7. إنشاء الفهارس للأداء
CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON public.user_services(user_id);
CREATE INDEX IF NOT EXISTS idx_user_service_content_service_id ON public.user_service_content(service_id);
CREATE INDEX IF NOT EXISTS idx_user_service_content_type ON public.user_service_content(content_type);
CREATE INDEX IF NOT EXISTS idx_user_service_likes_content_id ON public.user_service_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_user_service_likes_user_id ON public.user_service_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_service_favorites_user_id ON public.user_service_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_service_followers_service_id ON public.user_service_followers(service_id);

-- =============================================
-- تفعيل RLS وإنشاء السياسات
-- =============================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_followers ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Anyone can view services" ON public.user_services;
DROP POLICY IF EXISTS "Users can create their service" ON public.user_services;
DROP POLICY IF EXISTS "Users can update their service" ON public.user_services;
DROP POLICY IF EXISTS "Users can delete their service" ON public.user_services;

DROP POLICY IF EXISTS "Anyone can view content" ON public.user_service_content;
DROP POLICY IF EXISTS "Service owners can create content" ON public.user_service_content;
DROP POLICY IF EXISTS "Service owners can update content" ON public.user_service_content;
DROP POLICY IF EXISTS "Service owners can delete content" ON public.user_service_content;

DROP POLICY IF EXISTS "Anyone can view likes" ON public.user_service_likes;
DROP POLICY IF EXISTS "Users can like content" ON public.user_service_likes;
DROP POLICY IF EXISTS "Users can unlike content" ON public.user_service_likes;

DROP POLICY IF EXISTS "Anyone can view comments" ON public.user_service_comments;
DROP POLICY IF EXISTS "Users can comment" ON public.user_service_comments;
DROP POLICY IF EXISTS "Users can delete their comments" ON public.user_service_comments;

DROP POLICY IF EXISTS "Anyone can view favorites" ON public.user_service_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.user_service_favorites;
DROP POLICY IF EXISTS "Users can remove favorites" ON public.user_service_favorites;

DROP POLICY IF EXISTS "Anyone can view followers" ON public.user_service_followers;
DROP POLICY IF EXISTS "Users can follow services" ON public.user_service_followers;
DROP POLICY IF EXISTS "Users can unfollow services" ON public.user_service_followers;

-- سياسات جدول user_services
CREATE POLICY "Anyone can view services" ON public.user_services FOR SELECT USING (true);
CREATE POLICY "Users can create their service" ON public.user_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their service" ON public.user_services FOR UPDATE USING (true);
CREATE POLICY "Users can delete their service" ON public.user_services FOR DELETE USING (true);

-- سياسات جدول user_service_content
CREATE POLICY "Anyone can view content" ON public.user_service_content FOR SELECT USING (true);
CREATE POLICY "Service owners can create content" ON public.user_service_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Service owners can update content" ON public.user_service_content FOR UPDATE USING (true);
CREATE POLICY "Service owners can delete content" ON public.user_service_content FOR DELETE USING (true);

-- سياسات جدول user_service_likes
CREATE POLICY "Anyone can view likes" ON public.user_service_likes FOR SELECT USING (true);
CREATE POLICY "Users can like content" ON public.user_service_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unlike content" ON public.user_service_likes FOR DELETE USING (true);

-- سياسات جدول user_service_comments
CREATE POLICY "Anyone can view comments" ON public.user_service_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.user_service_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete their comments" ON public.user_service_comments FOR DELETE USING (true);

-- سياسات جدول user_service_favorites
CREATE POLICY "Anyone can view favorites" ON public.user_service_favorites FOR SELECT USING (true);
CREATE POLICY "Users can add favorites" ON public.user_service_favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove favorites" ON public.user_service_favorites FOR DELETE USING (true);

-- سياسات جدول user_service_followers
CREATE POLICY "Anyone can view followers" ON public.user_service_followers FOR SELECT USING (true);
CREATE POLICY "Users can follow services" ON public.user_service_followers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unfollow services" ON public.user_service_followers FOR DELETE USING (true);

-- =============================================
-- إنشاء Triggers لتحديث العدادات تلقائياً
-- =============================================

-- دالة تحديث عداد الإعجابات
CREATE OR REPLACE FUNCTION update_user_service_content_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.user_service_content SET likes_count = likes_count + 1 WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.user_service_content SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث عداد التعليقات
CREATE OR REPLACE FUNCTION update_user_service_content_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.user_service_content SET comments_count = comments_count + 1 WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.user_service_content SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث عداد المتابعين
CREATE OR REPLACE FUNCTION update_user_service_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.user_services SET followers_count = followers_count + 1 WHERE id = NEW.service_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.user_services SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.service_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث عداد المحتوى
CREATE OR REPLACE FUNCTION update_user_service_content_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.user_services SET content_count = content_count + 1 WHERE id = NEW.service_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.user_services SET content_count = GREATEST(content_count - 1, 0) WHERE id = OLD.service_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- حذف Triggers القديمة إن وجدت
DROP TRIGGER IF EXISTS user_service_likes_count_trigger ON public.user_service_likes;
DROP TRIGGER IF EXISTS user_service_comments_count_trigger ON public.user_service_comments;
DROP TRIGGER IF EXISTS user_service_followers_count_trigger ON public.user_service_followers;
DROP TRIGGER IF EXISTS user_service_content_count_trigger ON public.user_service_content;

-- إنشاء Triggers جديدة
CREATE TRIGGER user_service_likes_count_trigger
AFTER INSERT OR DELETE ON public.user_service_likes
FOR EACH ROW EXECUTE FUNCTION update_user_service_content_likes_count();

CREATE TRIGGER user_service_comments_count_trigger
AFTER INSERT OR DELETE ON public.user_service_comments
FOR EACH ROW EXECUTE FUNCTION update_user_service_content_comments_count();

CREATE TRIGGER user_service_followers_count_trigger
AFTER INSERT OR DELETE ON public.user_service_followers
FOR EACH ROW EXECUTE FUNCTION update_user_service_followers_count();

CREATE TRIGGER user_service_content_count_trigger
AFTER INSERT OR DELETE ON public.user_service_content
FOR EACH ROW EXECUTE FUNCTION update_user_service_content_count();

-- =============================================
-- انتهى السكريبت بنجاح!
-- =============================================

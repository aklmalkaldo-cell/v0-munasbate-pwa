-- =============================================
-- Triggers لتحديث العدادات تلقائياً
-- =============================================

-- 1. دالة تحديث عداد الإعجابات للمنشورات
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts 
    SET likes_count = COALESCE(likes_count, 0) + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts 
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- حذف Trigger القديم إذا وجد
DROP TRIGGER IF EXISTS post_likes_count_trigger ON public.likes;

-- إنشاء Trigger جديد
CREATE TRIGGER post_likes_count_trigger
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- =============================================
-- 2. دالة تحديث عداد التعليقات للمنشورات
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts 
    SET comments_count = COALESCE(comments_count, 0) + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts 
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- حذف Trigger القديم إذا وجد
DROP TRIGGER IF EXISTS post_comments_count_trigger ON public.comments;

-- إنشاء Trigger جديد
CREATE TRIGGER post_comments_count_trigger
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- =============================================
-- 3. دالة تحديث عداد المتابعين والمتابَعين
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- زيادة عداد المتابَعين للشخص المُتابَع
    UPDATE public.app_users 
    SET followers_count = COALESCE(followers_count, 0) + 1 
    WHERE user_id = NEW.following_id;
    
    -- زيادة عداد المتابعين للشخص المُتابِع
    UPDATE public.app_users 
    SET following_count = COALESCE(following_count, 0) + 1 
    WHERE user_id = NEW.follower_id;
    
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    -- إنقاص عداد المتابَعين للشخص المُتابَع
    UPDATE public.app_users 
    SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) 
    WHERE user_id = OLD.following_id;
    
    -- إنقاص عداد المتابعين للشخص المُتابِع
    UPDATE public.app_users 
    SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) 
    WHERE user_id = OLD.follower_id;
    
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- حذف Trigger القديم إذا وجد
DROP TRIGGER IF EXISTS follow_counts_trigger ON public.follows;

-- إنشاء Trigger جديد
CREATE TRIGGER follow_counts_trigger
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- =============================================
-- 4. دالة تحديث عداد الإعجابات للخدمات
CREATE OR REPLACE FUNCTION update_service_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.services 
    SET likes_count = COALESCE(likes_count, 0) + 1 
    WHERE id = NEW.service_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.services 
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) 
    WHERE id = OLD.service_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- حذف Trigger القديم إذا وجد
DROP TRIGGER IF EXISTS service_likes_count_trigger ON public.service_likes;

-- إنشاء Trigger جديد
CREATE TRIGGER service_likes_count_trigger
AFTER INSERT OR DELETE ON public.service_likes
FOR EACH ROW EXECUTE FUNCTION update_service_likes_count();

-- =============================================
-- 5. دالة تحديث عداد التعليقات للخدمات
CREATE OR REPLACE FUNCTION update_service_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.services 
    SET comments_count = COALESCE(comments_count, 0) + 1 
    WHERE id = NEW.service_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.services 
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) 
    WHERE id = OLD.service_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- حذف Trigger القديم إذا وجد
DROP TRIGGER IF EXISTS service_comments_count_trigger ON public.service_comments;

-- إنشاء Trigger جديد
CREATE TRIGGER service_comments_count_trigger
AFTER INSERT OR DELETE ON public.service_comments
FOR EACH ROW EXECUTE FUNCTION update_service_comments_count();

-- =============================================
-- إضافة أعمدة العدادات إذا لم تكن موجودة

-- أعمدة المنشورات
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- أعمدة المستخدمين
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- أعمدة الخدمات
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- =============================================
-- تحديث العدادات الحالية من البيانات الموجودة

-- تحديث عدادات الإعجابات للمنشورات
UPDATE public.posts p
SET likes_count = (
  SELECT COUNT(*) FROM public.likes l WHERE l.post_id = p.id
);

-- تحديث عدادات التعليقات للمنشورات
UPDATE public.posts p
SET comments_count = (
  SELECT COUNT(*) FROM public.comments c WHERE c.post_id = p.id
);

-- تحديث عدادات المتابعين
UPDATE public.app_users u
SET followers_count = (
  SELECT COUNT(*) FROM public.follows f WHERE f.following_id = u.user_id
);

-- تحديث عدادات المتابعين
UPDATE public.app_users u
SET following_count = (
  SELECT COUNT(*) FROM public.follows f WHERE f.follower_id = u.user_id
);

-- تحديث عدادات الإعجابات للخدمات
UPDATE public.services s
SET likes_count = (
  SELECT COUNT(*) FROM public.service_likes sl WHERE sl.service_id = s.id
);

-- تحديث عدادات التعليقات للخدمات
UPDATE public.services s
SET comments_count = (
  SELECT COUNT(*) FROM public.service_comments sc WHERE sc.service_id = s.id
);

-- =============================================
-- سياسات RLS للجداول الجديدة

-- سياسات جدول follows
DROP POLICY IF EXISTS "Allow all follows operations" ON public.follows;
CREATE POLICY "Allow all follows operations" ON public.follows FOR ALL USING (true) WITH CHECK (true);

-- تمكين RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- سكريبت إعداد قاعدة البيانات الموحد والنهائي لتطبيق Munasbate
-- يشمل: الجداول، الـ Triggers، الـ Functions، وسياسات RLS
-- =====================================================

-- 1. تفعيل UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. إنشاء الجداول الأساسية
-- =====================================================

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS public.app_users (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  account_type TEXT DEFAULT 'user' CHECK (account_type IN ('user', 'agent')),
  avatar_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الخدمات
CREATE TABLE IF NOT EXISTS public.services (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('zaffat', 'sheilat', 'invitations', 'greetings')),
  occasion TEXT NOT NULL,
  filter_type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT DEFAULT 'video',
  has_music BOOLEAN,
  is_3d BOOLEAN,
  publisher_user_id TEXT REFERENCES public.app_users(user_id),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول المنشورات
CREATE TABLE IF NOT EXISTS public.posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  author_user_id TEXT REFERENCES public.app_users(user_id),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول إعجابات المنشورات
CREATE TABLE IF NOT EXISTS public.post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- جدول تعليقات المنشورات
CREATE TABLE IF NOT EXISTS public.post_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول المنشورات المحفوظة
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- جدول إعجابات الخدمات
CREATE TABLE IF NOT EXISTS public.service_likes (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES public.services(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, user_id)
);

-- جدول تعليقات الخدمات
CREATE TABLE IF NOT EXISTS public.service_comments (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES public.services(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الخدمات المحفوظة
CREATE TABLE IF NOT EXISTS public.saved_services (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES public.services(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, user_id)
);

-- جدول المتابعات
CREATE TABLE IF NOT EXISTS public.follows (
  id SERIAL PRIMARY KEY,
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- جدول الرسائل
CREATE TABLE IF NOT EXISTS public.messages (
  id SERIAL PRIMARY KEY,
  sender_user_id TEXT NOT NULL,
  receiver_user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. إنشاء الـ Functions لتحديث العدادات
-- =====================================================

-- دالة تحديث عداد الإعجابات للمنشورات
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث عداد التعليقات للمنشورات
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث عداد الإعجابات للخدمات
CREATE OR REPLACE FUNCTION update_service_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.services SET likes_count = likes_count + 1 WHERE id = NEW.service_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.services SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.service_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث عداد التعليقات للخدمات
CREATE OR REPLACE FUNCTION update_service_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.services SET comments_count = comments_count + 1 WHERE id = NEW.service_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.services SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.service_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث عدادات المتابعة
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- زيادة عدد المتابِعين للشخص المتابَع
    UPDATE public.app_users SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
    -- زيادة عدد المتابَعين للشخص المتابِع
    UPDATE public.app_users SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.app_users SET followers_count = GREATEST(followers_count - 1, 0) WHERE user_id = OLD.following_id;
    UPDATE public.app_users SET following_count = GREATEST(following_count - 1, 0) WHERE user_id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. إنشاء الـ Triggers
-- =====================================================

-- حذف الـ Triggers القديمة إن وجدت
DROP TRIGGER IF EXISTS trigger_post_likes_count ON public.post_likes;
DROP TRIGGER IF EXISTS trigger_post_comments_count ON public.post_comments;
DROP TRIGGER IF EXISTS trigger_service_likes_count ON public.service_likes;
DROP TRIGGER IF EXISTS trigger_service_comments_count ON public.service_comments;
DROP TRIGGER IF EXISTS trigger_follow_counts ON public.follows;

-- إنشاء الـ Triggers الجديدة
CREATE TRIGGER trigger_post_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER trigger_post_comments_count
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

CREATE TRIGGER trigger_service_likes_count
AFTER INSERT OR DELETE ON public.service_likes
FOR EACH ROW EXECUTE FUNCTION update_service_likes_count();

CREATE TRIGGER trigger_service_comments_count
AFTER INSERT OR DELETE ON public.service_comments
FOR EACH ROW EXECUTE FUNCTION update_service_comments_count();

CREATE TRIGGER trigger_follow_counts
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- =====================================================
-- 5. تفعيل RLS وإنشاء السياسات
-- =====================================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Allow all for app_users" ON public.app_users;
DROP POLICY IF EXISTS "Allow all for services" ON public.services;
DROP POLICY IF EXISTS "Allow all for posts" ON public.posts;
DROP POLICY IF EXISTS "Allow all for post_likes" ON public.post_likes;
DROP POLICY IF EXISTS "Allow all for post_comments" ON public.post_comments;
DROP POLICY IF EXISTS "Allow all for saved_posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Allow all for service_likes" ON public.service_likes;
DROP POLICY IF EXISTS "Allow all for service_comments" ON public.service_comments;
DROP POLICY IF EXISTS "Allow all for saved_services" ON public.saved_services;
DROP POLICY IF EXISTS "Allow all for follows" ON public.follows;
DROP POLICY IF EXISTS "Allow all for messages" ON public.messages;

-- إنشاء سياسات تسمح بجميع العمليات (للتطوير)
CREATE POLICY "Allow all for app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for post_likes" ON public.post_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for post_comments" ON public.post_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for saved_posts" ON public.saved_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_likes" ON public.service_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_comments" ON public.service_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for saved_services" ON public.saved_services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for follows" ON public.follows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 6. إنشاء Indexes لتحسين الأداء
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_occasion ON public.services(occasion);
CREATE INDEX IF NOT EXISTS idx_services_publisher ON public.services(publisher_user_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_service_likes_service ON public.service_likes(service_id);
CREATE INDEX IF NOT EXISTS idx_service_likes_user ON public.service_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_user_id);

-- =====================================================
-- 7. إعداد Storage bucket للملفات
-- =====================================================

-- ملاحظة: يجب إنشاء bucket اسمه "media" من لوحة تحكم Supabase
-- وتفعيل السياسات التالية:

-- السماح بالقراءة للجميع
-- INSERT INTO storage.policies (name, definition, bucket_id)
-- VALUES ('Public Read', '(bucket_id = ''media''::text)', 'media');

-- =====================================================
-- اكتمل إعداد قاعدة البيانات!
-- =====================================================

SELECT 'تم إعداد قاعدة البيانات بنجاح!' as message;

-- ============================================================================
-- سكريبت شامل لتحسين نظام الخدمات والفيديوهات القصيرة (TikTok-style)
-- ============================================================================

-- 1. تحديث جدول services ليقبل فيديوهات من جميع المستخدمين
-- ============================================================================
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'audio' CHECK (media_type IN ('audio', 'video'));

ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS duration INT DEFAULT 0;

ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0;

ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0;

-- 2. إنشاء جدول likes للخدمات (للفيديوهات والمقاطع)
-- ============================================================================
DROP TABLE IF EXISTS public.service_likes CASCADE;

CREATE TABLE public.service_likes (
  id SERIAL PRIMARY KEY,
  service_id INT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.app_users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, user_id)
);

CREATE INDEX idx_service_likes_service ON public.service_likes(service_id);
CREATE INDEX idx_service_likes_user ON public.service_likes(user_id);

-- 3. إنشاء جدول comments للخدمات (للفيديوهات والمقاطع)
-- ============================================================================
DROP TABLE IF EXISTS public.service_comments CASCADE;

CREATE TABLE public.service_comments (
  id SERIAL PRIMARY KEY,
  service_id INT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.app_users(user_id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_comments_service ON public.service_comments(service_id);
CREATE INDEX idx_service_comments_user ON public.service_comments(user_id);

-- 4. إنشاء جدول saved_services (المحفوظات من الخدمات)
-- ============================================================================
DROP TABLE IF EXISTS public.saved_services CASCADE;

CREATE TABLE public.saved_services (
  id SERIAL PRIMARY KEY,
  service_id INT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.app_users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, user_id)
);

CREATE INDEX idx_saved_services_user ON public.saved_services(user_id);

-- 5. إنشاء جدول follows لنظام المتابعة
-- ============================================================================
DROP TABLE IF EXISTS public.follows CASCADE;

CREATE TABLE public.follows (
  id SERIAL PRIMARY KEY,
  follower_user_id TEXT NOT NULL REFERENCES public.app_users(user_id) ON DELETE CASCADE,
  following_user_id TEXT NOT NULL REFERENCES public.app_users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_user_id, following_user_id),
  CHECK (follower_user_id != following_user_id)
);

CREATE INDEX idx_follows_follower ON public.follows(follower_user_id);
CREATE INDEX idx_follows_following ON public.follows(following_user_id);

-- 6. تفعيل RLS لجميع الجداول الجديدة
-- ============================================================================
ALTER TABLE public.service_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- 7. إضافة سياسات RLS للقراءة (الجميع يقرأ)
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'service_likes' AND policyname = 'Read all service likes'
  ) THEN
    CREATE POLICY "Read all service likes" ON public.service_likes
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'service_comments' AND policyname = 'Read all service comments'
  ) THEN
    CREATE POLICY "Read all service comments" ON public.service_comments
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_services' AND policyname = 'Read own saved services'
  ) THEN
    CREATE POLICY "Read own saved services" ON public.saved_services
      FOR SELECT USING (user_id = (current_setting('app.user_id')::text));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'follows' AND policyname = 'Read all follows'
  ) THEN
    CREATE POLICY "Read all follows" ON public.follows
      FOR SELECT USING (true);
  END IF;
END $$;

-- 8. إضافة سياسات RLS للكتابة (المستخدمون يكتبون بيانات خاصتهم)
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'service_likes' AND policyname = 'Users can insert own likes'
  ) THEN
    CREATE POLICY "Users can insert own likes" ON public.service_likes
      FOR INSERT WITH CHECK (user_id = (current_setting('app.user_id')::text));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'service_comments' AND policyname = 'Users can insert own comments'
  ) THEN
    CREATE POLICY "Users can insert own comments" ON public.service_comments
      FOR INSERT WITH CHECK (user_id = (current_setting('app.user_id')::text));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_services' AND policyname = 'Users can insert own saves'
  ) THEN
    CREATE POLICY "Users can insert own saves" ON public.saved_services
      FOR INSERT WITH CHECK (user_id = (current_setting('app.user_id')::text));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'follows' AND policyname = 'Users can insert own follows'
  ) THEN
    CREATE POLICY "Users can insert own follows" ON public.follows
      FOR INSERT WITH CHECK (follower_user_id = (current_setting('app.user_id')::text));
  END IF;
END $$;

-- 9. إضافة سياسات RLS للحذف (المستخدمون يحذفون ما لهم فقط)
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'service_likes' AND policyname = 'Users can delete own likes'
  ) THEN
    CREATE POLICY "Users can delete own likes" ON public.service_likes
      FOR DELETE USING (user_id = (current_setting('app.user_id')::text));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'service_comments' AND policyname = 'Users can delete own comments'
  ) THEN
    CREATE POLICY "Users can delete own comments" ON public.service_comments
      FOR DELETE USING (user_id = (current_setting('app.user_id')::text));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_services' AND policyname = 'Users can delete own saves'
  ) THEN
    CREATE POLICY "Users can delete own saves" ON public.saved_services
      FOR DELETE USING (user_id = (current_setting('app.user_id')::text));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'follows' AND policyname = 'Users can delete own follows'
  ) THEN
    CREATE POLICY "Users can delete own follows" ON public.follows
      FOR DELETE USING (follower_user_id = (current_setting('app.user_id')::text));
  END IF;
END $$;

-- 10. تحديث جدول app_users لإضافة أعمدة المتابعة
-- ============================================================================
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0;

ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0;

-- 11. مسح سياسات RLS القديمة من جدول services (إذا كانت موجودة)
-- ============================================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.services;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.services;
DROP POLICY IF EXISTS "Enable update for users" ON public.services;

-- 12. إضافة سياسات RLS الجديدة لجدول services
-- ============================================================================
CREATE POLICY "Enable read access for all users" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.services
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users" ON public.services
  FOR UPDATE USING (true);

-- ============================================================================
-- ملاحظات مهمة:
-- ============================================================================
-- 1. الآن كل المستخدمين يقدرون ينشرون خدمات (فيديوهات وصوتيات)
-- 2. الجداول الجديدة:
--    - service_likes: للإعجاب بالخدمات/الفيديوهات
--    - service_comments: للتعليق على الخدمات/الفيديوهات
--    - saved_services: لحفظ الخدمات المفضلة
--    - follows: لنظام المتابعة بين المستخدمين
-- 3. في عمود media_type لتحديد نوع الملف (audio أو video)
-- 4. عند عرض الفيديوهات، استخدم infinite scroll مثل TikTok

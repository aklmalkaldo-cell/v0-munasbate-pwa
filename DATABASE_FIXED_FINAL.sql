-- حذف الجداول القديمة إن وجدت
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.saved_posts CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;

-- جدول المنشورات
CREATE TABLE public.posts (
  id SERIAL PRIMARY KEY,
  author_user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON public.posts(author_user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for post authors" ON public.posts
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for post authors" ON public.posts
  FOR DELETE USING (true);

-- جدول الإعجابات
CREATE TABLE public.likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_likes_post ON public.likes(post_id);
CREATE INDEX idx_likes_user ON public.likes(user_id);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for like owners" ON public.likes
  FOR DELETE USING (true);

-- جدول التعليقات
CREATE TABLE public.comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_comments_author ON public.comments(author_user_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for comment authors" ON public.comments
  FOR DELETE USING (true);

-- جدول المنشورات المحفوظة
CREATE TABLE public.saved_posts (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_saved_posts_user ON public.saved_posts(user_id);
CREATE INDEX idx_saved_posts_post ON public.saved_posts(post_id);

ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users" ON public.saved_posts
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for users" ON public.saved_posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for users" ON public.saved_posts
  FOR DELETE USING (true);

-- جدول المتابعات
CREATE TABLE public.follows (
  id SERIAL PRIMARY KEY,
  follower_user_id TEXT NOT NULL,
  following_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_user_id, following_user_id)
);

CREATE INDEX idx_follows_follower ON public.follows(follower_user_id);
CREATE INDEX idx_follows_following ON public.follows(following_user_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.follows
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for followers" ON public.follows
  FOR DELETE USING (true);

-- جدول الإشعارات
CREATE TABLE public.notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  related_user_id TEXT,
  related_post_id INTEGER,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for notification owners" ON public.notifications
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for notification owners" ON public.notifications
  FOR UPDATE USING (true);

-- جدول الخدمات
CREATE TABLE public.services (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('zaffat', 'sheilat', 'invitations', 'greetings')),
  occasion TEXT NOT NULL,
  filter_type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  publisher_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_occasion ON public.services(occasion);
CREATE INDEX idx_services_publisher ON public.services(publisher_user_id);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for agents" ON public.services
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for service publishers" ON public.services
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for service publishers" ON public.services
  FOR DELETE USING (true);

-- إضافة بيانات تجريبية للخدمات (اختياري)
INSERT INTO public.services (category, occasion, filter_type, title, description, file_url, file_type, publisher_user_id) VALUES
  ('zaffat', 'wedding', 'with_music', 'زفة عروس راقية', 'زفة عروس بموسيقى هادئة ومميزة', '/placeholder.svg?height=200&width=300', 'audio', '1111111'),
  ('sheilat', 'graduation', 'with_music', 'شيلة تخرج حماسية', 'شيلة مميزة للاحتفال بالتخرج', '/placeholder.svg?height=200&width=300', 'audio', '1111111'),
  ('invitations', 'wedding', '2d', 'دعوة زفاف كلاسيكية', 'تصميم دعوة زفاف أنيق وبسيط', '/placeholder.svg?height=400&width=600', 'image', '3333333'),
  ('greetings', 'newborn', '3d', 'تهنئة مولود جديد', 'تصميم ثلاثي الأبعاد للتهنئة بالمولود', '/placeholder.svg?height=400&width=600', 'video', '3333333')
ON CONFLICT DO NOTHING;

-- =====================================================
-- سكريبت إعداد قاعدة البيانات الكامل لتطبيق Munasbate
-- =====================================================

-- 1. حذف الجداول القديمة إذا كانت موجودة
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP TABLE IF EXISTS public.post_comments CASCADE;
DROP TABLE IF EXISTS public.saved_posts CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.event_tasks CASCADE;
DROP TABLE IF EXISTS public.event_expenses CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.app_users CASCADE;

-- =====================================================
-- 2. جدول المستخدمين الرئيسي
-- =====================================================
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
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_app_users_user_id ON public.app_users(user_id);
CREATE INDEX idx_app_users_username ON public.app_users(username);

-- =====================================================
-- 3. جدول المنشورات
-- =====================================================
CREATE TABLE public.posts (
  id SERIAL PRIMARY KEY,
  author_user_id TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON public.posts(author_user_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);

-- =====================================================
-- 4. جدول الإعجابات
-- =====================================================
CREATE TABLE public.post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX idx_post_likes_user ON public.post_likes(user_id);

-- =====================================================
-- 5. جدول التعليقات
-- =====================================================
CREATE TABLE public.post_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_comments_post ON public.post_comments(post_id);

-- =====================================================
-- 6. جدول المنشورات المحفوظة
-- =====================================================
CREATE TABLE public.saved_posts (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_saved_posts_user ON public.saved_posts(user_id);

-- =====================================================
-- 7. جدول المتابعة
-- =====================================================
CREATE TABLE public.follows (
  id SERIAL PRIMARY KEY,
  follower_user_id TEXT NOT NULL,
  following_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_user_id, following_user_id)
);

CREATE INDEX idx_follows_follower ON public.follows(follower_user_id);
CREATE INDEX idx_follows_following ON public.follows(following_user_id);

-- =====================================================
-- 8. جدول الرسائل
-- =====================================================
CREATE TABLE public.messages (
  id SERIAL PRIMARY KEY,
  sender_user_id TEXT NOT NULL,
  receiver_user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON public.messages(sender_user_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_user_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);

-- =====================================================
-- 9. جدول الإشعارات
-- =====================================================
CREATE TABLE public.notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  from_username TEXT NOT NULL,
  post_id INTEGER,
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- =====================================================
-- 10. جدول الخدمات (زفات، شيلات، دعوات، تهنئات)
-- =====================================================
CREATE TABLE public.services (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('zaffat', 'sheilat', 'invitations', 'greetings')),
  occasion TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  filter_type TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video', 'image')),
  thumbnail_url TEXT,
  agent_user_id TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_occasion ON public.services(occasion);
CREATE INDEX idx_services_agent ON public.services(agent_user_id);

-- =====================================================
-- 11. جدول مهام المناسبات
-- =====================================================
CREATE TABLE public.event_tasks (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  task TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_tasks_user ON public.event_tasks(user_id);

-- =====================================================
-- 12. جدول مصروفات الميزانية
-- =====================================================
CREATE TABLE public.event_expenses (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_budget NUMERIC(10, 2) DEFAULT 0,
  item_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_expenses_user ON public.event_expenses(user_id);

-- =====================================================
-- 13. تفعيل Row Level Security
-- =====================================================
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_expenses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 14. سياسات الأمان (للاختبار - مفتوحة للجميع)
-- =====================================================

-- المستخدمين
CREATE POLICY "Enable all for app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);

-- المنشورات
CREATE POLICY "Enable all for posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);

-- الإعجابات
CREATE POLICY "Enable all for post_likes" ON public.post_likes FOR ALL USING (true) WITH CHECK (true);

-- التعليقات
CREATE POLICY "Enable all for post_comments" ON public.post_comments FOR ALL USING (true) WITH CHECK (true);

-- المنشورات المحفوظة
CREATE POLICY "Enable all for saved_posts" ON public.saved_posts FOR ALL USING (true) WITH CHECK (true);

-- المتابعة
CREATE POLICY "Enable all for follows" ON public.follows FOR ALL USING (true) WITH CHECK (true);

-- الرسائل
CREATE POLICY "Enable all for messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- الإشعارات
CREATE POLICY "Enable all for notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- الخدمات
CREATE POLICY "Enable all for services" ON public.services FOR ALL USING (true) WITH CHECK (true);

-- مهام المناسبات
CREATE POLICY "Enable all for event_tasks" ON public.event_tasks FOR ALL USING (true) WITH CHECK (true);

-- مصروفات الميزانية
CREATE POLICY "Enable all for event_expenses" ON public.event_expenses FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 15. إدخال حسابات خدمة العملاء الخمسة
-- =====================================================
INSERT INTO public.app_users (user_id, username, pin_hash, account_type, bio, avatar_url) VALUES
  ('1111111', 'خدمة الزفات والشيلات', encode(digest('Mnsb@Zf24Sh', 'sha256'), 'hex'), 'agent', 'خدمة طلبات الزفات والشيلات', '/placeholder.svg?height=100&width=100'),
  ('2222222', 'خدمة الباقات والعروض', encode(digest('Mnsb#Pk78Bq', 'sha256'), 'hex'), 'agent', 'خدمة طلبات الباقات والعروض', '/placeholder.svg?height=100&width=100'),
  ('3333333', 'خدمة الدعوات والتهنئات', encode(digest('Mnsb!Cd91Th', 'sha256'), 'hex'), 'agent', 'خدمة طلبات الدعوات والتهنئات', '/placeholder.svg?height=100&width=100'),
  ('4444444', 'الخدمات العامة', encode(digest('Mnsb$Sv33Gn', 'sha256'), 'hex'), 'agent', 'الخدمات العامة', '/placeholder.svg?height=100&width=100'),
  ('5555555', 'الاستفسارات والدعم', encode(digest('Mnsb?Sp55In', 'sha256'), 'hex'), 'agent', 'الاستفسارات والدعم التقني', '/placeholder.svg?height=100&width=100')
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- تم الانتهاء من إعداد قاعدة البيانات!
-- =====================================================

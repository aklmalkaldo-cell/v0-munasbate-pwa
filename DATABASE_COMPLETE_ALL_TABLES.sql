-- سكريبت كامل لجميع الجداول المطلوبة لتطبيق Munasbate

-- جدول المنشورات
CREATE TABLE IF NOT EXISTS public.posts (
  id SERIAL PRIMARY KEY,
  author_user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_author FOREIGN KEY (author_user_id) REFERENCES public.app_users(user_id) ON DELETE CASCADE
);

-- جدول الإعجابات
CREATE TABLE IF NOT EXISTS public.likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id),
  CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.app_users(user_id) ON DELETE CASCADE
);

-- جدول التعليقات
CREATE TABLE IF NOT EXISTS public.comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  author_user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_author FOREIGN KEY (author_user_id) REFERENCES public.app_users(user_id) ON DELETE CASCADE
);

-- جدول المنشورات المحفوظة
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id),
  CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.app_users(user_id) ON DELETE CASCADE
);

-- جدول المتابعات
CREATE TABLE IF NOT EXISTS public.follows (
  id SERIAL PRIMARY KEY,
  follower_user_id TEXT NOT NULL,
  following_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_user_id, following_user_id),
  CONSTRAINT fk_follower FOREIGN KEY (follower_user_id) REFERENCES public.app_users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_following FOREIGN KEY (following_user_id) REFERENCES public.app_users(user_id) ON DELETE CASCADE
);

-- جدول الرسائل
CREATE TABLE IF NOT EXISTS public.messages (
  id SERIAL PRIMARY KEY,
  sender_user_id TEXT NOT NULL,
  receiver_user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_sender FOREIGN KEY (sender_user_id) REFERENCES public.app_users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_receiver FOREIGN KEY (receiver_user_id) REFERENCES public.app_users(user_id) ON DELETE CASCADE
);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  related_user_id TEXT,
  related_post_id INTEGER,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.app_users(user_id) ON DELETE CASCADE
);

-- جدول الخدمات (زفات، شيلات، دعوات، تهنئات)
CREATE TABLE IF NOT EXISTS public.services (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('zaffat', 'sheilat', 'invitations', 'greetings')),
  occasion TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('audio', 'video', 'image')),
  filter_type TEXT,
  author_user_id TEXT NOT NULL,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_author FOREIGN KEY (author_user_id) REFERENCES public.app_users(user_id) ON DELETE CASCADE
);

-- إنشاء Indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_user_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_occasion ON public.services(occasion);

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- سياسات RLS مفتوحة للاختبار (يمكن تشديدها لاحقاً)
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.posts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update for post authors" ON public.posts FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Enable delete for post authors" ON public.posts FOR DELETE USING (true);

CREATE POLICY IF NOT EXISTS "Enable all for likes" ON public.likes FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all for comments" ON public.comments FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all for saved_posts" ON public.saved_posts FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all for follows" ON public.follows FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all for messages" ON public.messages FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all for notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all for services" ON public.services FOR ALL USING (true);

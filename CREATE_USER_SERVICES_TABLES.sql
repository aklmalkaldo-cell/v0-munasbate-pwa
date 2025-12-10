-- إنشاء جدول خدمات المستخدمين
CREATE TABLE IF NOT EXISTS public.user_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE, -- كل مستخدم يمكنه إنشاء خدمة واحدة فقط
  service_name TEXT NOT NULL,
  description TEXT,
  profile_image TEXT,
  cover_image TEXT,
  category TEXT DEFAULT 'other',
  followers_count INTEGER DEFAULT 0,
  content_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول محتوى خدمات المستخدمين
CREATE TABLE IF NOT EXISTS public.user_service_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_service_id UUID NOT NULL REFERENCES public.user_services(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('audio', 'video', 'image')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول متابعة خدمات المستخدمين
CREATE TABLE IF NOT EXISTS public.user_service_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_service_id UUID NOT NULL REFERENCES public.user_services(id) ON DELETE CASCADE,
  follower_user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_service_id, follower_user_id)
);

-- إنشاء جدول إعجابات محتوى خدمات المستخدمين
CREATE TABLE IF NOT EXISTS public.user_service_content_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.user_service_content(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

-- إنشاء جدول حفظ محتوى خدمات المستخدمين
CREATE TABLE IF NOT EXISTS public.user_service_content_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.user_service_content(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

-- إنشاء جدول تعليقات محتوى خدمات المستخدمين
CREATE TABLE IF NOT EXISTS public.user_service_content_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.user_service_content(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON public.user_services(user_id);
CREATE INDEX IF NOT EXISTS idx_user_service_content_service_id ON public.user_service_content(user_service_id);
CREATE INDEX IF NOT EXISTS idx_user_service_content_type ON public.user_service_content(content_type);
CREATE INDEX IF NOT EXISTS idx_user_service_follows_service_id ON public.user_service_follows(user_service_id);
CREATE INDEX IF NOT EXISTS idx_user_service_follows_follower ON public.user_service_follows(follower_user_id);

-- RLS Policies
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_content_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_content_comments ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة للجميع
CREATE POLICY "Anyone can view user services" ON public.user_services FOR SELECT USING (true);
CREATE POLICY "Anyone can view user service content" ON public.user_service_content FOR SELECT USING (true);
CREATE POLICY "Anyone can view follows" ON public.user_service_follows FOR SELECT USING (true);
CREATE POLICY "Anyone can view likes" ON public.user_service_content_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can view saves" ON public.user_service_content_saves FOR SELECT USING (true);
CREATE POLICY "Anyone can view comments" ON public.user_service_content_comments FOR SELECT USING (true);

-- سياسات الإدراج
CREATE POLICY "Users can create their service" ON public.user_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can add content to their service" ON public.user_service_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can follow services" ON public.user_service_follows FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can like content" ON public.user_service_content_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can save content" ON public.user_service_content_saves FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can comment" ON public.user_service_content_comments FOR INSERT WITH CHECK (true);

-- سياسات التحديث
CREATE POLICY "Users can update their service" ON public.user_services FOR UPDATE USING (true);
CREATE POLICY "Users can update their content" ON public.user_service_content FOR UPDATE USING (true);

-- سياسات الحذف
CREATE POLICY "Users can delete their service" ON public.user_services FOR DELETE USING (true);
CREATE POLICY "Users can delete their content" ON public.user_service_content FOR DELETE USING (true);
CREATE POLICY "Users can unfollow" ON public.user_service_follows FOR DELETE USING (true);
CREATE POLICY "Users can unlike" ON public.user_service_content_likes FOR DELETE USING (true);
CREATE POLICY "Users can unsave" ON public.user_service_content_saves FOR DELETE USING (true);
CREATE POLICY "Users can delete their comments" ON public.user_service_content_comments FOR DELETE USING (true);

-- Triggers لتحديث العدادات
CREATE OR REPLACE FUNCTION update_user_service_content_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.user_services SET content_count = content_count + 1 WHERE id = NEW.user_service_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.user_services SET content_count = content_count - 1 WHERE id = OLD.user_service_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_service_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.user_services SET followers_count = followers_count + 1 WHERE id = NEW.user_service_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.user_services SET followers_count = followers_count - 1 WHERE id = OLD.user_service_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_content_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.user_service_content SET likes_count = likes_count + 1 WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.user_service_content SET likes_count = likes_count - 1 WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_content_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.user_service_content SET comments_count = comments_count + 1 WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.user_service_content SET comments_count = comments_count - 1 WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- إنشاء Triggers
DROP TRIGGER IF EXISTS user_service_content_count_trigger ON public.user_service_content;
CREATE TRIGGER user_service_content_count_trigger
AFTER INSERT OR DELETE ON public.user_service_content
FOR EACH ROW EXECUTE FUNCTION update_user_service_content_count();

DROP TRIGGER IF EXISTS user_service_followers_count_trigger ON public.user_service_follows;
CREATE TRIGGER user_service_followers_count_trigger
AFTER INSERT OR DELETE ON public.user_service_follows
FOR EACH ROW EXECUTE FUNCTION update_user_service_followers_count();

DROP TRIGGER IF EXISTS content_likes_count_trigger ON public.user_service_content_likes;
CREATE TRIGGER content_likes_count_trigger
AFTER INSERT OR DELETE ON public.user_service_content_likes
FOR EACH ROW EXECUTE FUNCTION update_content_likes_count();

DROP TRIGGER IF EXISTS content_comments_count_trigger ON public.user_service_content_comments;
CREATE TRIGGER content_comments_count_trigger
AFTER INSERT OR DELETE ON public.user_service_content_comments
FOR EACH ROW EXECUTE FUNCTION update_content_comments_count();

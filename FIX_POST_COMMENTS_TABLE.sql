-- إصلاح جدول التعليقات على المنشورات
-- هذا السكريبت يتأكد من وجود الأعمدة الصحيحة

-- إنشاء الجدول إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.post_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.app_users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إذا كان الجدول موجوداً بعمود commenter_user_id، أعد تسميته إلى user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'post_comments' AND column_name = 'commenter_user_id'
    ) THEN
        ALTER TABLE public.post_comments RENAME COLUMN commenter_user_id TO user_id;
    END IF;
END $$;

-- تمكين RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Enable read access for all users" ON public.post_comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.post_comments;
DROP POLICY IF EXISTS "Enable delete for comment owner" ON public.post_comments;

-- إنشاء سياسات جديدة
CREATE POLICY "Enable read access for all users" ON public.post_comments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.post_comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for comment owner" ON public.post_comments
    FOR DELETE USING (true);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);

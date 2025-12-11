-- إصلاح عمود التعليقات
-- تحقق من وجود عمود comment_text وإضافته إذا لم يكن موجوداً

-- إضافة عمود comment_text إذا لم يكن موجوداً
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'service_comments' 
        AND column_name = 'comment_text'
    ) THEN
        ALTER TABLE public.service_comments ADD COLUMN comment_text TEXT;
    END IF;
END $$;

-- تحديث البيانات القديمة إذا كان هناك عمود content
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'service_comments' 
        AND column_name = 'content'
    ) THEN
        UPDATE public.service_comments SET comment_text = content WHERE comment_text IS NULL;
    END IF;
END $$;

-- إضافة عمود username إذا لم يكن موجوداً
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'service_comments' 
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.service_comments ADD COLUMN username TEXT;
    END IF;
END $$;

-- تحديث سياسات RLS
DROP POLICY IF EXISTS "service_comments_select_v2" ON public.service_comments;
DROP POLICY IF EXISTS "service_comments_insert_v2" ON public.service_comments;
DROP POLICY IF EXISTS "service_comments_delete_v2" ON public.service_comments;
DROP POLICY IF EXISTS "service_comments_select_v3" ON public.service_comments;
DROP POLICY IF EXISTS "service_comments_insert_v3" ON public.service_comments;
DROP POLICY IF EXISTS "service_comments_delete_v3" ON public.service_comments;

CREATE POLICY "service_comments_select_v3" ON public.service_comments FOR SELECT USING (true);
CREATE POLICY "service_comments_insert_v3" ON public.service_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "service_comments_delete_v3" ON public.service_comments FOR DELETE USING (true);

SELECT 'تم إصلاح جدول التعليقات بنجاح' as result;

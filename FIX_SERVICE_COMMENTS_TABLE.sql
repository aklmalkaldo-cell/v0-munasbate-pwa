-- إصلاح جدول service_comments لإضافة عمود username
-- =====================================================

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
    RAISE NOTICE 'تم إضافة عمود username إلى جدول service_comments';
  ELSE
    RAISE NOTICE 'عمود username موجود بالفعل';
  END IF;
END $$;

-- التأكد من أن RLS مفعل مع سياسات مفتوحة
ALTER TABLE public.service_comments ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "service_comments_select" ON public.service_comments;
DROP POLICY IF EXISTS "service_comments_insert" ON public.service_comments;
DROP POLICY IF EXISTS "service_comments_delete" ON public.service_comments;
DROP POLICY IF EXISTS "Allow all for service_comments" ON public.service_comments;
DROP POLICY IF EXISTS "Read all service comments" ON public.service_comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON public.service_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.service_comments;

-- إنشاء سياسات جديدة مفتوحة
CREATE POLICY "service_comments_select_v2" ON public.service_comments FOR SELECT USING (true);
CREATE POLICY "service_comments_insert_v2" ON public.service_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "service_comments_delete_v2" ON public.service_comments FOR DELETE USING (true);

-- رسالة نجاح
DO $$ 
BEGIN
  RAISE NOTICE '✅ تم إصلاح جدول service_comments بنجاح!';
END $$;

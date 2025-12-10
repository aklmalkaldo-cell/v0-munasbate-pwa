-- ========================================
-- إصلاح سياسات RLS لجدول services
-- ========================================

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Enable read access for all users" ON public.services;
DROP POLICY IF EXISTS "Enable insert for agents" ON public.services;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.services;
DROP POLICY IF EXISTS "Enable update for owners" ON public.services;
DROP POLICY IF EXISTS "Enable delete for owners" ON public.services;
DROP POLICY IF EXISTS "Allow all operations" ON public.services;

-- تعطيل RLS مؤقتاً لإعادة التهيئة
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;

-- إعادة تفعيل RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: السماح للجميع بالقراءة
CREATE POLICY "services_select_policy" 
ON public.services FOR SELECT 
USING (true);

-- سياسة الإدراج: السماح للجميع بالإدراج (بما أن النظام لا يستخدم Supabase Auth)
CREATE POLICY "services_insert_policy" 
ON public.services FOR INSERT 
WITH CHECK (true);

-- سياسة التحديث: السماح للجميع بالتحديث
CREATE POLICY "services_update_policy" 
ON public.services FOR UPDATE 
USING (true)
WITH CHECK (true);

-- سياسة الحذف: السماح للجميع بالحذف
CREATE POLICY "services_delete_policy" 
ON public.services FOR DELETE 
USING (true);

-- ========================================
-- إصلاح سياسات RLS لجدول storage.objects (bucket: media)
-- ========================================

-- حذف السياسات القديمة للـ storage
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "media_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "media_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "media_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "media_delete_policy" ON storage.objects;

-- سياسة القراءة للـ storage: السماح للجميع بالقراءة من bucket media
CREATE POLICY "media_select_policy" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'media');

-- سياسة الرفع للـ storage: السماح للجميع بالرفع إلى bucket media
CREATE POLICY "media_insert_policy" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'media');

-- سياسة التحديث للـ storage: السماح للجميع بالتحديث في bucket media
CREATE POLICY "media_update_policy" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- سياسة الحذف للـ storage: السماح للجميع بالحذف من bucket media
CREATE POLICY "media_delete_policy" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'media');

-- ========================================
-- التأكد من وجود الأعمدة الصحيحة في جدول services
-- ========================================

-- إضافة عمود is_3d إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'is_3d') THEN
        ALTER TABLE public.services ADD COLUMN is_3d BOOLEAN DEFAULT NULL;
    END IF;
END $$;

-- إضافة عمود has_music إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'has_music') THEN
        ALTER TABLE public.services ADD COLUMN has_music BOOLEAN DEFAULT NULL;
    END IF;
END $$;

-- التأكد من أن publisher_user_id هو TEXT
DO $$ 
BEGIN
    -- محاولة تغيير نوع العمود إذا كان موجوداً
    ALTER TABLE public.services ALTER COLUMN publisher_user_id TYPE TEXT;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- ========================================
-- إصلاح سياسات جداول أخرى مهمة
-- ========================================

-- service_likes
DROP POLICY IF EXISTS "service_likes_select" ON public.service_likes;
DROP POLICY IF EXISTS "service_likes_insert" ON public.service_likes;
DROP POLICY IF EXISTS "service_likes_delete" ON public.service_likes;

DO $$ BEGIN
    ALTER TABLE public.service_likes ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "service_likes_select" ON public.service_likes FOR SELECT USING (true);
CREATE POLICY "service_likes_insert" ON public.service_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "service_likes_delete" ON public.service_likes FOR DELETE USING (true);

-- service_comments
DROP POLICY IF EXISTS "service_comments_select" ON public.service_comments;
DROP POLICY IF EXISTS "service_comments_insert" ON public.service_comments;
DROP POLICY IF EXISTS "service_comments_delete" ON public.service_comments;

DO $$ BEGIN
    ALTER TABLE public.service_comments ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "service_comments_select" ON public.service_comments FOR SELECT USING (true);
CREATE POLICY "service_comments_insert" ON public.service_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "service_comments_delete" ON public.service_comments FOR DELETE USING (true);

-- saved_services
DROP POLICY IF EXISTS "saved_services_select" ON public.saved_services;
DROP POLICY IF EXISTS "saved_services_insert" ON public.saved_services;
DROP POLICY IF EXISTS "saved_services_delete" ON public.saved_services;

DO $$ BEGIN
    ALTER TABLE public.saved_services ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "saved_services_select" ON public.saved_services FOR SELECT USING (true);
CREATE POLICY "saved_services_insert" ON public.saved_services FOR INSERT WITH CHECK (true);
CREATE POLICY "saved_services_delete" ON public.saved_services FOR DELETE USING (true);

SELECT 'تم إصلاح جميع سياسات RLS بنجاح!' as result;

-- ===========================================
-- إصلاح جدول user_services
-- هذا السكريبت يضيف الأعمدة المفقودة ويصلح الأسماء
-- ===========================================

-- إضافة الأعمدة المفقودة إذا لم تكن موجودة
DO $$
BEGIN
    -- إضافة عمود service_name إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_services' AND column_name = 'service_name') THEN
        ALTER TABLE public.user_services ADD COLUMN service_name TEXT;
        -- نسخ البيانات من name إلى service_name إذا كان name موجوداً
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_services' AND column_name = 'name') THEN
            UPDATE public.user_services SET service_name = name WHERE service_name IS NULL;
        END IF;
    END IF;

    -- إضافة عمود profile_image إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_services' AND column_name = 'profile_image') THEN
        ALTER TABLE public.user_services ADD COLUMN profile_image TEXT;
        -- نسخ البيانات من avatar_url إلى profile_image إذا كان avatar_url موجوداً
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_services' AND column_name = 'avatar_url') THEN
            UPDATE public.user_services SET profile_image = avatar_url WHERE profile_image IS NULL;
        END IF;
    END IF;

    -- إضافة عمود cover_image إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_services' AND column_name = 'cover_image') THEN
        ALTER TABLE public.user_services ADD COLUMN cover_image TEXT;
        -- نسخ البيانات من cover_url إلى cover_image إذا كان cover_url موجوداً
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_services' AND column_name = 'cover_url') THEN
            UPDATE public.user_services SET cover_image = cover_url WHERE cover_image IS NULL;
        END IF;
    END IF;

    -- إضافة عمود is_active إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_services' AND column_name = 'is_active') THEN
        ALTER TABLE public.user_services ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- إضافة عمود followers_count إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_services' AND column_name = 'followers_count') THEN
        ALTER TABLE public.user_services ADD COLUMN followers_count INTEGER DEFAULT 0;
    END IF;

    -- إضافة عمود content_count إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_services' AND column_name = 'content_count') THEN
        ALTER TABLE public.user_services ADD COLUMN content_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- جعل service_name مطلوباً (NOT NULL) بعد التأكد من وجود قيم
UPDATE public.user_services SET service_name = COALESCE(service_name, name, 'خدمة بدون اسم') WHERE service_name IS NULL;
ALTER TABLE public.user_services ALTER COLUMN service_name SET NOT NULL;

-- إنشاء Storage bucket إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-services', 'user-services', true)
ON CONFLICT (id) DO NOTHING;

-- حذف سياسات Storage القديمة
DROP POLICY IF EXISTS "Allow public read user-services" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload user-services" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to user-services" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their files" ON storage.objects;

-- سياسات Storage جديدة - السماح للجميع
CREATE POLICY "Allow public read user-services"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-services');

CREATE POLICY "Allow public uploads to user-services"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-services');

CREATE POLICY "Allow public updates to user-services"
ON storage.objects FOR UPDATE
USING (bucket_id = 'user-services');

CREATE POLICY "Allow public deletes from user-services"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-services');

-- التأكد من سياسات RLS للجدول
DROP POLICY IF EXISTS "Anyone can view services" ON public.user_services;
DROP POLICY IF EXISTS "Users can create their service" ON public.user_services;
DROP POLICY IF EXISTS "Users can update their service" ON public.user_services;
DROP POLICY IF EXISTS "Users can delete their service" ON public.user_services;

CREATE POLICY "Anyone can view services" ON public.user_services FOR SELECT USING (true);
CREATE POLICY "Users can create their service" ON public.user_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their service" ON public.user_services FOR UPDATE USING (true);
CREATE POLICY "Users can delete their service" ON public.user_services FOR DELETE USING (true);

-- عرض بنية الجدول للتأكد
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_services'
ORDER BY ordinal_position;

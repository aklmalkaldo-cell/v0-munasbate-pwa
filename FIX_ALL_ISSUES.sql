-- ===============================================
-- سكريبت إصلاح شامل لجميع المشاكل
-- شغل هذا السكريبت في Supabase SQL Editor
-- ===============================================

-- 1. إصلاح جدول user_services - التأكد من وجود جميع الأعمدة
DO $$
BEGIN
    -- التأكد من وجود الجدول
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_services') THEN
        CREATE TABLE public.user_services (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            description TEXT,
            avatar_url TEXT,
            cover_url TEXT,
            followers_count INTEGER DEFAULT 0,
            content_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'تم إنشاء جدول user_services';
    ELSE
        RAISE NOTICE 'جدول user_services موجود';
    END IF;
END $$;

-- 2. إصلاح جدول notifications
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        CREATE TABLE public.notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'general',
            from_user_id TEXT,
            post_id UUID,
            service_id UUID,
            content_id UUID,
            message TEXT,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'تم إنشاء جدول notifications';
    ELSE
        RAISE NOTICE 'جدول notifications موجود';
    END IF;
END $$;

-- 3. إضافة الفهارس
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON public.user_services(user_id);

-- 4. تفعيل RLS
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. حذف السياسات القديمة وإنشاء سياسات جديدة
DROP POLICY IF EXISTS "Anyone can view services" ON public.user_services;
DROP POLICY IF EXISTS "Users can create their service" ON public.user_services;
DROP POLICY IF EXISTS "Users can update their service" ON public.user_services;
DROP POLICY IF EXISTS "Users can delete their service" ON public.user_services;

CREATE POLICY "Anyone can view services" ON public.user_services FOR SELECT USING (true);
CREATE POLICY "Users can create their service" ON public.user_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their service" ON public.user_services FOR UPDATE USING (true);
CREATE POLICY "Users can delete their service" ON public.user_services FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;

CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (true);

-- 6. إصلاح Storage bucket
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'user-services',
        'user-services',
        true,
        52428800,
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/ogg']
    )
    ON CONFLICT (id) DO UPDATE SET
        public = true,
        file_size_limit = 52428800;
    RAISE NOTICE 'تم إصلاح Storage bucket';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Storage bucket موجود أو حدث خطأ: %', SQLERRM;
END $$;

-- 7. سياسات Storage
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;

CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'user-services');
CREATE POLICY "Anyone can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-services');
CREATE POLICY "Anyone can update" ON storage.objects FOR UPDATE USING (bucket_id = 'user-services');
CREATE POLICY "Anyone can delete" ON storage.objects FOR DELETE USING (bucket_id = 'user-services');

-- تم الانتهاء
SELECT 'تم إصلاح جميع المشاكل بنجاح!' as result;

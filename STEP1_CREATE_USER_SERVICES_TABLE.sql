-- ===========================================
-- الخطوة 1: إنشاء جدول خدمات المستخدمين الرئيسي
-- شغل هذا السكريبت أولاً
-- ===========================================

-- حذف الجدول إذا كان موجوداً
DROP TABLE IF EXISTS public.user_services CASCADE;

-- إنشاء جدول خدمات المستخدمين
CREATE TABLE public.user_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    avatar_url TEXT,
    followers_count INTEGER DEFAULT 0,
    content_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء الفهارس
CREATE INDEX idx_user_services_user_id ON public.user_services(user_id);
CREATE INDEX idx_user_services_created_at ON public.user_services(created_at DESC);

-- تفعيل RLS
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "Anyone can view services" ON public.user_services FOR SELECT USING (true);
CREATE POLICY "Users can create their service" ON public.user_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their service" ON public.user_services FOR UPDATE USING (true);
CREATE POLICY "Users can delete their service" ON public.user_services FOR DELETE USING (true);

-- رسالة نجاح
SELECT 'تم إنشاء جدول user_services بنجاح!' as status;

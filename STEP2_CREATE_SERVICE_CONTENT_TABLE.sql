-- ===========================================
-- الخطوة 2: إنشاء جدول محتوى الخدمات
-- شغل هذا السكريبت ثانياً
-- ===========================================

-- حذف الجدول إذا كان موجوداً
DROP TABLE IF EXISTS public.user_service_content CASCADE;

-- إنشاء جدول محتوى الخدمات
CREATE TABLE public.user_service_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.user_services(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'audio', 'image')),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء الفهارس
CREATE INDEX idx_service_content_service_id ON public.user_service_content(service_id);
CREATE INDEX idx_service_content_user_id ON public.user_service_content(user_id);
CREATE INDEX idx_service_content_type ON public.user_service_content(content_type);
CREATE INDEX idx_service_content_created_at ON public.user_service_content(created_at DESC);

-- تفعيل RLS
ALTER TABLE public.user_service_content ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "Anyone can view content" ON public.user_service_content FOR SELECT USING (true);
CREATE POLICY "Users can create content" ON public.user_service_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update content" ON public.user_service_content FOR UPDATE USING (true);
CREATE POLICY "Users can delete content" ON public.user_service_content FOR DELETE USING (true);

-- رسالة نجاح
SELECT 'تم إنشاء جدول user_service_content بنجاح!' as status;

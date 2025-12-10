-- =============================================
-- إصلاح سياسات RLS لجدول user_services
-- هذا المشروع يستخدم نظام مصادقة مخصص (ليس Supabase Auth)
-- =============================================

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Users can create their service" ON public.user_services;
DROP POLICY IF EXISTS "Anyone can view services" ON public.user_services;
DROP POLICY IF EXISTS "Users can update their service" ON public.user_services;
DROP POLICY IF EXISTS "Users can delete their service" ON public.user_services;

-- سياسة القراءة: الجميع يمكنهم رؤية الخدمات
CREATE POLICY "Anyone can view services" 
ON public.user_services FOR SELECT 
USING (true);

-- سياسة الإنشاء: السماح بالإنشاء (التحقق يتم في الكود)
CREATE POLICY "Allow insert for all" 
ON public.user_services FOR INSERT 
WITH CHECK (true);

-- سياسة التحديث: السماح بالتحديث (التحقق يتم في الكود)
CREATE POLICY "Allow update for all" 
ON public.user_services FOR UPDATE 
USING (true)
WITH CHECK (true);

-- سياسة الحذف: السماح بالحذف (التحقق يتم في الكود)
CREATE POLICY "Allow delete for all" 
ON public.user_services FOR DELETE 
USING (true);

-- =============================================
-- إصلاح سياسات Storage لـ user-services bucket
-- =============================================

-- إنشاء bucket إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('user-services', 'user-services', true, 52428800)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 52428800;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Allow public read user-services" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to user-services" ON storage.objects;
DROP POLICY IF EXISTS "Allow update user-services" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete user-services" ON storage.objects;

-- سياسة القراءة
CREATE POLICY "Allow public read user-services" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'user-services');

-- سياسة الرفع
CREATE POLICY "Allow upload to user-services" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'user-services');

-- سياسة التحديث
CREATE POLICY "Allow update user-services" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'user-services');

-- سياسة الحذف
CREATE POLICY "Allow delete user-services" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'user-services');

-- =============================================
-- إصلاح سياسات RLS لجدول user_service_content
-- =============================================

DROP POLICY IF EXISTS "Anyone can view content" ON public.user_service_content;
DROP POLICY IF EXISTS "Service owners can insert content" ON public.user_service_content;
DROP POLICY IF EXISTS "Service owners can update content" ON public.user_service_content;
DROP POLICY IF EXISTS "Service owners can delete content" ON public.user_service_content;

CREATE POLICY "Anyone can view content" 
ON public.user_service_content FOR SELECT 
USING (true);

CREATE POLICY "Allow insert content" 
ON public.user_service_content FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update content" 
ON public.user_service_content FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete content" 
ON public.user_service_content FOR DELETE 
USING (true);

-- =============================================
-- إصلاح سياسات للجداول المرتبطة
-- =============================================

-- user_service_likes
DROP POLICY IF EXISTS "Anyone can view likes" ON public.user_service_likes;
DROP POLICY IF EXISTS "Users can like" ON public.user_service_likes;
DROP POLICY IF EXISTS "Users can unlike" ON public.user_service_likes;

CREATE POLICY "Anyone can view likes" ON public.user_service_likes FOR SELECT USING (true);
CREATE POLICY "Allow like" ON public.user_service_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow unlike" ON public.user_service_likes FOR DELETE USING (true);

-- user_service_saves
DROP POLICY IF EXISTS "Anyone can view saves" ON public.user_service_saves;
DROP POLICY IF EXISTS "Users can save" ON public.user_service_saves;
DROP POLICY IF EXISTS "Users can unsave" ON public.user_service_saves;

CREATE POLICY "Anyone can view saves" ON public.user_service_saves FOR SELECT USING (true);
CREATE POLICY "Allow save" ON public.user_service_saves FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow unsave" ON public.user_service_saves FOR DELETE USING (true);

-- user_service_follows
DROP POLICY IF EXISTS "Anyone can view follows" ON public.user_service_follows;
DROP POLICY IF EXISTS "Users can follow" ON public.user_service_follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.user_service_follows;

CREATE POLICY "Anyone can view follows" ON public.user_service_follows FOR SELECT USING (true);
CREATE POLICY "Allow follow" ON public.user_service_follows FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow unfollow" ON public.user_service_follows FOR DELETE USING (true);

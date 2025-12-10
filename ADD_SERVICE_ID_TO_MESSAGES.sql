-- إضافة عمود service_id في جدول messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS service_id INTEGER REFERENCES services(id) ON DELETE SET NULL;

-- إنشاء index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_messages_service_id ON messages(service_id);

-- إنشاء Buckets للصور في Storage (يجب تنفيذها يدوياً من لوحة تحكم Supabase)
-- 1. إنشاء bucket باسم 'avatars' وجعله Public
-- 2. إنشاء bucket باسم 'covers' وجعله Public

-- سياسات RLS للـ Storage
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view covers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload covers" ON storage.objects;

-- السماح بقراءة الصور للجميع
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can view covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'covers');

-- السماح برفع الصور للجميع
CREATE POLICY "Anyone can upload avatars"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload covers"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'covers');

-- السماح بتحديث الصور
CREATE POLICY "Anyone can update avatars"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can update covers"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'covers');

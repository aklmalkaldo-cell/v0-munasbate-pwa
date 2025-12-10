-- إصلاح حدود حجم الملفات في Supabase Storage
-- يجب تشغيل هذا في Supabase SQL Editor

-- ملاحظة: حد حجم الملفات في Supabase يتم تعديله من لوحة التحكم
-- Storage -> Settings -> File size limit

-- لكن يمكننا التأكد من أن السياسات تسمح برفع الملفات بدون قيود إضافية

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Allow public uploads to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to covers" ON storage.objects;

-- إنشاء سياسات جديدة بدون قيود على الحجم

-- 1. السماح للجميع بقراءة الملفات من جميع الـ buckets
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (true);

-- 2. السماح للجميع برفع الملفات إلى bucket media
CREATE POLICY "Public upload to media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'media');

-- 3. السماح للجميع برفع الملفات إلى bucket avatars
CREATE POLICY "Public upload to avatars"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

-- 4. السماح للجميع برفع الملفات إلى bucket covers
CREATE POLICY "Public upload to covers"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'covers');

-- 5. السماح للجميع بتحديث/الكتابة فوق الملفات
CREATE POLICY "Public update objects"
ON storage.objects FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- 6. السماح للجميع بحذف الملفات
CREATE POLICY "Public delete objects"
ON storage.objects FOR DELETE
TO public
USING (true);

-- ملاحظة مهمة:
-- لزيادة حد حجم الملفات في Supabase:
-- 1. اذهب إلى لوحة تحكم Supabase
-- 2. Storage -> Configuration
-- 3. غيّر "File size limit" إلى القيمة المطلوبة (مثل 50MB أو 100MB)
-- الحد الافتراضي هو 50MB في الخطة المجانية

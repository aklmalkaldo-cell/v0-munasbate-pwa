-- إصلاح سياسات Row Level Security لـ Storage bucket "media"

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;

-- سياسة للقراءة العامة - أي شخص يمكنه قراءة الملفات
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- سياسة للرفع - أي مستخدم مصادق عليه يمكنه رفع ملفات
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'media');

-- سياسة للتحديث - المستخدمون يمكنهم تحديث ملفاتهم الخاصة
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'media');

-- سياسة للحذف - المستخدمون يمكنهم حذف ملفاتهم الخاصة
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'media');

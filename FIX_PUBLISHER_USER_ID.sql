-- إصلاح عمود publisher_user_id ليكون TEXT بدلاً من INTEGER
-- وإضافة foreign key لجدول app_users

-- 1. حذف العمود القديم إذا كان موجوداً بنوع خاطئ
ALTER TABLE public.services DROP COLUMN IF EXISTS publisher_user_id;

-- 2. إضافة العمود الجديد بنوع TEXT
ALTER TABLE public.services ADD COLUMN publisher_user_id TEXT NOT NULL DEFAULT 'system';

-- 3. إضافة foreign key constraint
ALTER TABLE public.services
ADD CONSTRAINT services_publisher_user_id_fkey
FOREIGN KEY (publisher_user_id)
REFERENCES public.app_users(user_id)
ON DELETE CASCADE;

-- 4. حذف القيمة الافتراضية
ALTER TABLE public.services ALTER COLUMN publisher_user_id DROP DEFAULT;

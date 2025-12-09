-- إصلاح جدول services ليقبل publisher_user_id كـ TEXT

-- حذف Foreign Key القديم إذا كان موجوداً
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'services_publisher_user_id_fkey'
    ) THEN
        ALTER TABLE public.services DROP CONSTRAINT services_publisher_user_id_fkey;
    END IF;
END $$;

-- حذف العمود القديم إذا كان موجوداً
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'publisher_user_id'
    ) THEN
        ALTER TABLE public.services DROP COLUMN publisher_user_id;
    END IF;
END $$;

-- إضافة عمود publisher_user_id بنوع TEXT
ALTER TABLE public.services 
ADD COLUMN publisher_user_id TEXT;

-- إضافة Foreign Key constraint يربط بـ app_users
ALTER TABLE public.services
ADD CONSTRAINT services_publisher_user_id_fkey 
FOREIGN KEY (publisher_user_id) REFERENCES public.app_users(user_id) ON DELETE CASCADE;

-- إنشاء index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_services_publisher_user_id ON public.services(publisher_user_id);

-- التحقق من وجود العمود occasion_type وتغيير اسمه إلى occasion
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'occasion_type'
  ) THEN
    ALTER TABLE public.services RENAME COLUMN occasion_type TO occasion;
  END IF;
END $$;

-- إضافة الأعمدة الناقصة
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS occasion TEXT,
ADD COLUMN IF NOT EXISTS has_music BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_3d BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS agent_user_id TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- تفعيل RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- استخدام DO blocks لتجنب خطأ IF NOT EXISTS مع CREATE POLICY
DO $$
BEGIN
  -- السماح بقراءة جميع الخدمات
  CREATE POLICY "Enable read access for all users" ON public.services
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  -- السماح للوكلاء بإضافة خدمات
  CREATE POLICY "Enable insert for agents" ON public.services
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  -- السماح للوكلاء بتحديث خدماتهم
  CREATE POLICY "Enable update for agents" ON public.services
    FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

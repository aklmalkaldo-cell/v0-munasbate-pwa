-- تصحيح أعمدة جدول services إذا كانت بأسماء خاطئة
ALTER TABLE public.services 
RENAME COLUMN IF EXISTS occasion_type TO occasion;

ALTER TABLE public.services 
RENAME COLUMN IF EXISTS is_3d TO is_3d;

-- إضافة الأعمدة إذا لم تكن موجودة
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS occasion TEXT,
ADD COLUMN IF NOT EXISTS has_music BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_3d BOOLEAN DEFAULT false;

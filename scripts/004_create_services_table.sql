-- إنشاء جدول الخدمات
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('zaffat', 'sheilat', 'invitations', 'greetings')),
  occasion_type TEXT NOT NULL,
  has_music BOOLEAN, -- للزفات والشيلات
  is_3d BOOLEAN, -- للدعوات والتهنئات
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  agent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_select_all"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "services_insert_agents"
  ON public.services FOR INSERT
  WITH CHECK (
    auth.uid() = agent_id AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND account_type = 'agent')
  );

CREATE POLICY "services_update_own"
  ON public.services FOR UPDATE
  USING (auth.uid() = agent_id);

CREATE POLICY "services_delete_own"
  ON public.services FOR DELETE
  USING (auth.uid() = agent_id);

CREATE INDEX IF NOT EXISTS services_category_idx ON public.services(category);
CREATE INDEX IF NOT EXISTS services_occasion_idx ON public.services(occasion_type);

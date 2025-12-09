-- إنشاء جدول مخطط المناسبات
CREATE TABLE IF NOT EXISTS public.event_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_budget DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES public.event_budget(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_expenses ENABLE ROW LEVEL SECURITY;

-- سياسات event_tasks
CREATE POLICY "event_tasks_select_own" ON public.event_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "event_tasks_insert_own" ON public.event_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "event_tasks_update_own" ON public.event_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "event_tasks_delete_own" ON public.event_tasks FOR DELETE USING (auth.uid() = user_id);

-- سياسات event_budget
CREATE POLICY "event_budget_select_own" ON public.event_budget FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "event_budget_insert_own" ON public.event_budget FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "event_budget_update_own" ON public.event_budget FOR UPDATE USING (auth.uid() = user_id);

-- سياسات event_expenses
CREATE POLICY "event_expenses_select_own" ON public.event_expenses FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.event_budget WHERE id = budget_id AND user_id = auth.uid()));
CREATE POLICY "event_expenses_insert_own" ON public.event_expenses FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.event_budget WHERE id = budget_id AND user_id = auth.uid()));
CREATE POLICY "event_expenses_delete_own" ON public.event_expenses FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.event_budget WHERE id = budget_id AND user_id = auth.uid()));

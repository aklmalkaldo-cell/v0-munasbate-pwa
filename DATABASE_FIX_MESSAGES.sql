-- إصلاح جدول الرسائل ليستخدم user_id بدلاً من id
DROP TABLE IF EXISTS public.messages CASCADE;

CREATE TABLE public.messages (
  id BIGSERIAL PRIMARY KEY,
  sender_user_id TEXT NOT NULL,
  receiver_user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء indexes للأداء
CREATE INDEX idx_messages_sender ON public.messages(sender_user_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_user_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- تفعيل RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان - السماح بالقراءة والكتابة للجميع مؤقتاً
CREATE POLICY "Enable read access for all users" ON public.messages
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.messages
  FOR UPDATE USING (true);

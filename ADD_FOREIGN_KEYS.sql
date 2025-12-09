-- إضافة foreign keys للربط بين الجداول
-- يجب تشغيل هذا السكريبت في قاعدة البيانات لتفعيل العلاقات التلقائية

-- إضافة foreign key لجدول posts
ALTER TABLE public.posts 
  DROP CONSTRAINT IF EXISTS posts_author_user_id_fkey;

ALTER TABLE public.posts 
  ADD CONSTRAINT posts_author_user_id_fkey 
  FOREIGN KEY (author_user_id) 
  REFERENCES public.app_users(user_id) 
  ON DELETE CASCADE;

-- إضافة foreign key لجدول comments
ALTER TABLE public.comments 
  DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE public.comments 
  ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.app_users(user_id) 
  ON DELETE CASCADE;

-- إضافة foreign key لجدول likes
ALTER TABLE public.likes 
  DROP CONSTRAINT IF EXISTS likes_user_id_fkey;

ALTER TABLE public.likes 
  ADD CONSTRAINT likes_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.app_users(user_id) 
  ON DELETE CASCADE;

-- إضافة foreign key لجدول messages
ALTER TABLE public.messages 
  DROP CONSTRAINT IF EXISTS messages_sender_user_id_fkey,
  DROP CONSTRAINT IF EXISTS messages_receiver_user_id_fkey;

ALTER TABLE public.messages 
  ADD CONSTRAINT messages_sender_user_id_fkey 
  FOREIGN KEY (sender_user_id) 
  REFERENCES public.app_users(user_id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT messages_receiver_user_id_fkey 
  FOREIGN KEY (receiver_user_id) 
  REFERENCES public.app_users(user_id) 
  ON DELETE CASCADE;

-- إعادة تحميل schema cache
NOTIFY pgrst, 'reload schema';

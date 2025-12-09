-- إصلاح السكريبت SQL لإضافة foreign keys
-- المشكلة: العمود في app_users هو user_id وليس id

-- إضافة foreign key لجدول posts
ALTER TABLE public.posts 
ADD CONSTRAINT posts_author_user_id_fkey 
FOREIGN KEY (author_user_id) 
REFERENCES public.app_users(user_id);

-- إضافة foreign key لجدول comments
ALTER TABLE public.comments 
ADD CONSTRAINT comments_author_user_id_fkey 
FOREIGN KEY (author_user_id) 
REFERENCES public.app_users(user_id);

-- إضافة foreign key لجدول messages
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_user_id_fkey 
FOREIGN KEY (sender_user_id) 
REFERENCES public.app_users(user_id);

ALTER TABLE public.messages 
ADD CONSTRAINT messages_receiver_user_id_fkey 
FOREIGN KEY (receiver_user_id) 
REFERENCES public.app_users(user_id);

-- إضافة foreign key لجدول likes
ALTER TABLE public.likes 
ADD CONSTRAINT likes_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.app_users(user_id);

-- إضافة foreign key لجدول saved_posts
ALTER TABLE public.saved_posts 
ADD CONSTRAINT saved_posts_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.app_users(user_id);

-- إضافة foreign key لجدول follows
ALTER TABLE public.follows 
ADD CONSTRAINT follows_follower_user_id_fkey 
FOREIGN KEY (follower_user_id) 
REFERENCES public.app_users(user_id);

ALTER TABLE public.follows 
ADD CONSTRAINT follows_following_user_id_fkey 
FOREIGN KEY (following_user_id) 
REFERENCES public.app_users(user_id);

-- إضافة foreign key لجدول notifications
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.app_users(user_id);

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_from_user_id_fkey 
FOREIGN KEY (from_user_id) 
REFERENCES public.app_users(user_id);

-- إضافة foreign key لجدول services
ALTER TABLE public.services 
ADD CONSTRAINT services_agent_user_id_fkey 
FOREIGN KEY (agent_user_id) 
REFERENCES public.app_users(user_id);

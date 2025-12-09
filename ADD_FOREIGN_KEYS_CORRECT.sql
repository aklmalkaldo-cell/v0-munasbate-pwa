-- إضافة Foreign Keys للجداول الموجودة فقط
-- هذا السكريبت يضيف العلاقات بين الجداول لتحسين الأداء

-- إضافة foreign key لجدول posts (author_user_id -> app_users.user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_posts_author_user_id'
    ) THEN
        ALTER TABLE public.posts 
        ADD CONSTRAINT fk_posts_author_user_id 
        FOREIGN KEY (author_user_id) 
        REFERENCES public.app_users(user_id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- إضافة foreign key لجدول comments (author_user_id -> app_users.user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_comments_author_user_id'
    ) THEN
        ALTER TABLE public.comments 
        ADD CONSTRAINT fk_comments_author_user_id 
        FOREIGN KEY (author_user_id) 
        REFERENCES public.app_users(user_id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- إضافة foreign key لجدول likes (user_id -> app_users.user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_likes_user_id'
    ) THEN
        ALTER TABLE public.likes 
        ADD CONSTRAINT fk_likes_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES public.app_users(user_id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- إضافة foreign key لجدول saved_posts (user_id -> app_users.user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_saved_posts_user_id'
    ) THEN
        ALTER TABLE public.saved_posts 
        ADD CONSTRAINT fk_saved_posts_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES public.app_users(user_id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- إضافة foreign keys لجدول follows
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_follows_follower_user_id'
    ) THEN
        ALTER TABLE public.follows 
        ADD CONSTRAINT fk_follows_follower_user_id 
        FOREIGN KEY (follower_user_id) 
        REFERENCES public.app_users(user_id) 
        ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_follows_following_user_id'
    ) THEN
        ALTER TABLE public.follows 
        ADD CONSTRAINT fk_follows_following_user_id 
        FOREIGN KEY (following_user_id) 
        REFERENCES public.app_users(user_id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- إضافة foreign keys لجدول notifications
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_user_id'
    ) THEN
        ALTER TABLE public.notifications 
        ADD CONSTRAINT fk_notifications_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES public.app_users(user_id) 
        ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_related_user_id'
    ) THEN
        ALTER TABLE public.notifications 
        ADD CONSTRAINT fk_notifications_related_user_id 
        FOREIGN KEY (related_user_id) 
        REFERENCES public.app_users(user_id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- إضافة foreign key لجدول services (publisher_user_id -> app_users.user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_services_publisher_user_id'
    ) THEN
        ALTER TABLE public.services 
        ADD CONSTRAINT fk_services_publisher_user_id 
        FOREIGN KEY (publisher_user_id) 
        REFERENCES public.app_users(user_id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- إضافة foreign keys لجدول messages (إذا كان موجوداً)
-- فحص وجود جدول messages أولاً
DO $$
BEGIN
    -- فحص إذا كان جدول messages موجود
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        -- فحص إذا كان العمود sender_user_id موجود
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' AND column_name = 'sender_user_id'
        ) THEN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_messages_sender_user_id'
            ) THEN
                ALTER TABLE public.messages 
                ADD CONSTRAINT fk_messages_sender_user_id 
                FOREIGN KEY (sender_user_id) 
                REFERENCES public.app_users(user_id) 
                ON DELETE CASCADE;
            END IF;
        END IF;
        
        -- فحص إذا كان العمود receiver_user_id موجود
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' AND column_name = 'receiver_user_id'
        ) THEN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_messages_receiver_user_id'
            ) THEN
                ALTER TABLE public.messages 
                ADD CONSTRAINT fk_messages_receiver_user_id 
                FOREIGN KEY (receiver_user_id) 
                REFERENCES public.app_users(user_id) 
                ON DELETE CASCADE;
            END IF;
        END IF;
    END IF;
END $$;

-- ===========================================
-- الخطوة 4: إنشاء Triggers للعدادات
-- شغل هذا السكريبت رابعاً (اختياري)
-- ===========================================

-- دالة تحديث عداد الإعجابات
CREATE OR REPLACE FUNCTION update_service_content_likes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.user_service_content 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.content_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.user_service_content 
        SET likes_count = GREATEST(0, likes_count - 1) 
        WHERE id = OLD.content_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث عداد التعليقات
CREATE OR REPLACE FUNCTION update_service_content_comments()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.user_service_content 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.content_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.user_service_content 
        SET comments_count = GREATEST(0, comments_count - 1) 
        WHERE id = OLD.content_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث عداد المتابعين
CREATE OR REPLACE FUNCTION update_service_followers()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.user_services 
        SET followers_count = followers_count + 1 
        WHERE id = NEW.service_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.user_services 
        SET followers_count = GREATEST(0, followers_count - 1) 
        WHERE id = OLD.service_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث عداد المحتوى
CREATE OR REPLACE FUNCTION update_service_content_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.user_services 
        SET content_count = content_count + 1 
        WHERE id = NEW.service_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.user_services 
        SET content_count = GREATEST(0, content_count - 1) 
        WHERE id = OLD.service_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- حذف Triggers القديمة إذا كانت موجودة
DROP TRIGGER IF EXISTS trigger_service_likes ON public.user_service_likes;
DROP TRIGGER IF EXISTS trigger_service_comments ON public.user_service_comments;
DROP TRIGGER IF EXISTS trigger_service_followers ON public.user_service_followers;
DROP TRIGGER IF EXISTS trigger_service_content_count ON public.user_service_content;

-- إنشاء Triggers
CREATE TRIGGER trigger_service_likes
AFTER INSERT OR DELETE ON public.user_service_likes
FOR EACH ROW EXECUTE FUNCTION update_service_content_likes();

CREATE TRIGGER trigger_service_comments
AFTER INSERT OR DELETE ON public.user_service_comments
FOR EACH ROW EXECUTE FUNCTION update_service_content_comments();

CREATE TRIGGER trigger_service_followers
AFTER INSERT OR DELETE ON public.user_service_followers
FOR EACH ROW EXECUTE FUNCTION update_service_followers();

CREATE TRIGGER trigger_service_content_count
AFTER INSERT OR DELETE ON public.user_service_content
FOR EACH ROW EXECUTE FUNCTION update_service_content_count();

-- رسالة نجاح
SELECT 'تم إنشاء Triggers بنجاح!' as status;

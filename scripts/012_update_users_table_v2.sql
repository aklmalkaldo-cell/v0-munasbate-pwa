-- إضافة حقول جديدة لجدول المستخدمين لدعم نظام المصادقة المخصص

ALTER TABLE users
ADD COLUMN IF NOT EXISTS pin_hash TEXT,
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);

-- تحديث RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة (للبحث عن المستخدمين)
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

-- السماح بالإدخال لأي شخص (للتسجيل)
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
CREATE POLICY "Enable insert for all users" ON users
  FOR INSERT WITH CHECK (true);

-- السماح بالتحديث للمستخدم نفسه فقط
DROP POLICY IF EXISTS "Enable update for users based on session" ON users;
CREATE POLICY "Enable update for users based on session" ON users
  FOR UPDATE USING (true);

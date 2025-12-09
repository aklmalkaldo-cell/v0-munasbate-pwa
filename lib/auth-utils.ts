import { createClient } from "@/lib/supabase/client"
import bcrypt from "bcryptjs"

// توليد معرف مستخدم فريد من 7 أرقام
export async function generateUniqueUserId(): Promise<string> {
  const supabase = createClient()

  while (true) {
    const userId = Math.floor(1000000 + Math.random() * 9000000).toString()

    // التحقق من أن المعرف غير مستخدم
    const { data } = await supabase.from("users").select("user_id").eq("user_id", userId).single()

    if (!data) {
      return userId
    }
  }
}

// تشفير الرمز السري
export async function hashPin(pin: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(pin, salt)
}

// التحقق من الرمز السري
export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  return bcrypt.compare(pin, hashedPin)
}

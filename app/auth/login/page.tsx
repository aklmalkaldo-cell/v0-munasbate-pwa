"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [userId, setUserId] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const hashPin = async (pin: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(pin)
    const hash = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hash))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      console.log("[v0] بداية عملية تسجيل الدخول")

      // تشفير الرمز السري
      const pinHash = await hashPin(pin)
      console.log("[v0] تم تشفير الرمز السري")

      const { data, error: fetchError } = await supabase
        .from("app_users")
        .select("*")
        .eq("user_id", userId)
        .eq("pin_hash", pinHash)
        .maybeSingle()

      if (fetchError) {
        console.error("[v0] خطأ في البحث عن المستخدم:", fetchError)
        throw new Error("حدث خطأ في تسجيل الدخول")
      }

      if (!data) {
        console.log("[v0] المستخدم غير موجود أو الرمز خاطئ")
        throw new Error("المعرف أو الرمز السري غير صحيح")
      }

      console.log("[v0] تم العثور على المستخدم:", data)

      localStorage.setItem("user_id", data.user_id)
      localStorage.setItem("username", data.username)
      localStorage.setItem("is_guest", "false")
      console.log("[v0] تم حفظ معلومات الجلسة")

      // استخدام window.location بدلاً من router لضمان التحديث الكامل
      window.location.href = "/home"
    } catch (error: any) {
      console.log("[v0] خطأ في تسجيل الدخول:", error.message)
      setError(error.message || "حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#F5E9E8]" dir="rtl">
      <div className="w-full max-w-sm">
        <Card className="shadow-lg border-[#B38C8A]/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-[#B38C8A]">Munasbate</CardTitle>
            <CardDescription className="text-[#B38C8A]">تسجيل الدخول إلى حسابك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="userId" className="text-[#B38C8A]">
                    معرف المستخدم (7 أرقام)
                  </Label>
                  <Input
                    id="userId"
                    type="text"
                    placeholder="1234567"
                    required
                    maxLength={7}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value.replace(/\D/g, ""))}
                    className="bg-white border-[#B38C8A]/30 text-[#B38C8A]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pin" className="text-[#B38C8A]">
                    الرمز السري
                  </Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="أدخل الرمز السري"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="bg-white border-[#B38C8A]/30 text-[#B38C8A]"
                  />
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري تسجيل الدخول..." : "دخول"}
                </Button>
                <Link href="/auth/forgot">
                  <Button type="button" variant="link" className="w-full text-[#B38C8A]">
                    نسيت حسابي؟
                  </Button>
                </Link>
              </div>
              <div className="mt-4 text-center text-sm text-[#B38C8A]">
                ليس لديك حساب؟{" "}
                <Link href="/auth/signup" className="text-[#D4AF37] font-medium underline">
                  سجل الآن
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

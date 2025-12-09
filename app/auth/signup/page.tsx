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

export default function SignUpPage() {
  const [displayName, setDisplayName] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const generateUserId = () => {
    return Math.floor(1000000 + Math.random() * 9000000).toString()
  }

  const hashPin = async (pin: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(pin)
    const hash = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hash))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (pin !== confirmPin) {
      setError("الرمز السري غير متطابق")
      setIsLoading(false)
      return
    }

    if (pin.length < 4) {
      setError("الرمز السري يجب أن يكون 4 أرقام على الأقل")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      console.log("[v0] بداية عملية التسجيل")

      // توليد معرف فريد
      let userId = generateUserId()
      console.log("[v0] تم توليد المعرف:", userId)

      let { data: existing } = await supabase.from("app_users").select("user_id").eq("user_id", userId).maybeSingle()

      // إذا كان المعرف موجوداً، نولد معرف جديد
      while (existing) {
        userId = generateUserId()
        const result = await supabase.from("app_users").select("user_id").eq("user_id", userId).maybeSingle()
        existing = result.data
      }

      console.log("[v0] المعرف النهائي:", userId)

      // تشفير الرمز السري
      const pinHash = await hashPin(pin)
      console.log("[v0] تم تشفير الرمز السري")

      const { data, error: insertError } = await supabase
        .from("app_users")
        .insert({
          user_id: userId,
          username: displayName,
          pin_hash: pinHash,
        })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] خطأ في إضافة المستخدم:", insertError)
        throw new Error(insertError.message || "فشل إنشاء الحساب")
      }

      console.log("[v0] تم إنشاء المستخدم بنجاح:", data)

      localStorage.setItem("user_id", userId)
      localStorage.setItem("username", displayName)
      localStorage.setItem("is_guest", "false")
      localStorage.setItem(
        "munasbate_user",
        JSON.stringify({
          id: data.id,
          user_id: userId,
          username: displayName,
        }),
      )

      router.push(`/auth/signup-success?userId=${userId}`)
    } catch (error: any) {
      console.log("[v0] خطأ في التسجيل:", error.message)
      setError(error.message || "حدث خطأ أثناء التسجيل")
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
            <CardDescription className="text-[#B38C8A]">إنشاء حساب جديد</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="displayName" className="text-[#B38C8A]">
                    الاسم المستعار
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="أدخل اسمك المستعار"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-white border-[#B38C8A]/30 text-[#B38C8A]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pin" className="text-[#B38C8A]">
                    الرمز السري (4 أرقام أو أكثر)
                  </Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="أدخل رمز سري"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="bg-white border-[#B38C8A]/30 text-[#B38C8A]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPin" className="text-[#B38C8A]">
                    تأكيد الرمز السري
                  </Label>
                  <Input
                    id="confirmPin"
                    type="password"
                    placeholder="أعد إدخال الرمز السري"
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="bg-white border-[#B38C8A]/30 text-[#B38C8A]"
                  />
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري التسجيل..." : "تسجيل"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-[#B38C8A]">
                لديك حساب بالفعل؟{" "}
                <Link href="/auth/login" className="text-[#D4AF37] font-medium underline">
                  تسجيل الدخول
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    console.log("[v0] فحص localStorage...")
    const userId = localStorage.getItem("user_id")
    const isGuest = localStorage.getItem("is_guest")

    console.log("[v0] user_id:", userId)
    console.log("[v0] is_guest:", isGuest)

    if (userId && userId !== "9999999") {
      console.log("[v0] مستخدم مسجل، الانتقال إلى /home")
      router.push("/home")
    } else {
      console.log("[v0] لا يوجد مستخدم، عرض شاشة الترحيب")
      setIsChecking(false)
    }
  }, [router])

  const handleGuestMode = () => {
    console.log("[v0] وضع الزائر")
    localStorage.setItem("user_id", "9999999")
    localStorage.setItem("username", "زائر")
    localStorage.setItem("is_guest", "true")
    router.push("/home")
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <div className="text-4xl font-bold text-[#B38C8A]">Munasbate</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5E9E8] p-4" dir="rtl">
      {/* الشعار */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-[#B38C8A] mb-4">Munasbate</h1>
        <p className="text-[#B38C8A] text-lg">منصة متكاملة لخدمات المناسبات</p>
      </div>

      {/* الأزرار */}
      <div className="w-full max-w-md space-y-4">
        <Button
          onClick={() => router.push("/auth/login")}
          className="w-full h-14 bg-[#D4AF37] hover:bg-[#C49F27] text-white text-lg font-semibold rounded-2xl shadow-lg"
        >
          تسجيل الدخول
        </Button>

        <Button
          onClick={() => router.push("/auth/signup")}
          className="w-full h-14 bg-white hover:bg-gray-50 text-[#B38C8A] text-lg font-semibold rounded-2xl border-2 border-[#B38C8A]"
        >
          إنشاء حساب جديد
        </Button>

        <Button
          onClick={handleGuestMode}
          className="w-full h-14 bg-transparent hover:bg-white/50 text-[#B38C8A] text-base font-medium rounded-2xl border border-[#B38C8A]/40"
        >
          تصفح كزائر
        </Button>
      </div>

      {/* نص توضيحي */}
      <p className="mt-8 text-center text-sm text-[#B38C8A]/70">اكتشف عالم الزفات والشيلات والدعوات</p>
    </div>
  )
}

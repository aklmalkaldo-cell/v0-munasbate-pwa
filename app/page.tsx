"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem("user_id")

    if (userId && userId !== "9999999") {
      router.replace("/home")
    } else {
      setIsChecking(false)
    }
  }, [router])

  const handleGuestMode = () => {
    localStorage.setItem("user_id", "9999999")
    localStorage.setItem("username", "زائر")
    localStorage.setItem("is_guest", "true")
    router.replace("/home")
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <h1 className="text-4xl font-bold text-[#B38C8A]">Munasbate</h1>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5E9E8] p-4" dir="rtl">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-[#B38C8A] mb-4">Munasbate</h1>
        <p className="text-[#B38C8A] text-lg">منصة متكاملة لخدمات المناسبات</p>
      </div>

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

      <p className="mt-8 text-center text-sm text-[#B38C8A]/70">اكتشف عالم الزفات والشيلات والدعوات</p>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { ServiceCard } from "@/components/service-card"
import { Music, Mic, Mail, Heart, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [isGuest, setIsGuest] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const storedUsername = localStorage.getItem("username")
    const guestMode = localStorage.getItem("is_guest")

    if (!userId) {
      router.push("/")
      return
    }

    setUsername(storedUsername || "مستخدم")
    setIsGuest(guestMode === "true")
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <div className="text-[#B38C8A] text-lg">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        {/* ترحيب */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#B38C8A] mb-2">
            مرحباً، {username} {isGuest && "(زائر)"}
          </h2>
          <p className="text-[#B38C8A]/70">ماذا تحتاج لمناسبتك اليوم؟</p>
        </div>

        {/* شريط البحث */}
        <div className="mb-6 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B38C8A]/50" />
          <Input
            type="search"
            placeholder="ابحث عن زفات، شيلات، دعوات..."
            className="pr-10 bg-white border-[#B38C8A]/20 text-[#B38C8A] placeholder:text-[#B38C8A]/50 rounded-2xl"
          />
        </div>

        {/* بطاقات الخدمات */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#B38C8A] mb-4">خدماتنا</h3>
          <div className="grid grid-cols-2 gap-4">
            <ServiceCard title="زفات" icon={Music} href="/services/zaffat" />
            <ServiceCard title="شيلات" icon={Mic} href="/services/sheilat" />
            <ServiceCard title="دعوات" icon={Mail} href="/services/invitations" />
            <ServiceCard title="تهنئات" icon={Heart} href="/services/greetings" />
          </div>
        </div>

        {isGuest && (
          <div className="mb-6 p-4 bg-white/50 rounded-2xl border border-[#D4AF37]/30">
            <p className="text-center text-sm text-[#B38C8A] mb-3">
              أنت تتصفح كزائر. لإنشاء منشورات والتفاعل مع المجتمع، يرجى إنشاء حساب
            </p>
            <Button
              onClick={() => {
                localStorage.clear()
                router.push("/auth/signup")
              }}
              className="w-full bg-[#D4AF37] hover:bg-[#C49F27] text-white rounded-xl"
            >
              إنشاء حساب الآن
            </Button>
          </div>
        )}

        {/* قسم الاقتراحات */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#B38C8A] mb-4">الأكثر طلباً</h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-[#B38C8A]/70 text-center">ستظهر هنا الخدمات الأكثر طلباً قريباً</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

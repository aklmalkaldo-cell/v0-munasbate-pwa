"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Music, Mic, Mail, Heart, Search, TrendingUp, Star, Sparkles, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

// ... existing code (ServiceTypeSelector, EnhancedServiceCard, TopRatedCard components) ...

function ServiceTypeSelector({ onSelect }: { onSelect: (category: string) => void }) {
  const categories = [
    { value: "zaffat", label: "زفة", icon: Music, color: "from-[#D4AF37] to-[#B8963E]" },
    { value: "sheilat", label: "شيلة", icon: Mic, color: "from-[#B38C8A] to-[#9A7573]" },
    { value: "invitations", label: "دعوة", icon: Mail, color: "from-[#8B7355] to-[#6D5A43]" },
    { value: "greetings", label: "تهنئة", icon: Heart, color: "from-[#C9A86C] to-[#A88B4A]" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className={`bg-gradient-to-br ${cat.color} p-4 rounded-xl text-white flex items-center gap-3 hover:scale-[1.02] transition-transform`}
        >
          <cat.icon className="w-5 h-5" />
          <span className="font-medium">{cat.label}</span>
        </button>
      ))}
    </div>
  )
}

function EnhancedServiceCard({
  title,
  icon: Icon,
  href,
  gradient,
  count,
}: {
  title: string
  icon: React.ElementType
  href: string
  gradient: string
  count?: number
}) {
  return (
    <Link href={href}>
      <div
        className={`relative overflow-hidden rounded-2xl p-5 ${gradient} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          {count && <p className="text-white/80 text-sm">{count} خدمة متاحة</p>}
        </div>
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Sparkles className="w-4 h-4 text-white/50" />
        </div>
      </div>
    </Link>
  )
}

function TopRatedCard({
  title,
  category,
  rating,
  views,
}: {
  title: string
  category: string
  rating: number
  views: number
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-[#B38C8A]/10">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-[#B38C8A]">{title}</h4>
          <p className="text-sm text-[#B38C8A]/60">{category}</p>
        </div>
        <div className="flex items-center gap-1 bg-[#D4AF37]/10 px-2 py-1 rounded-full">
          <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
          <span className="text-xs font-medium text-[#D4AF37]">{rating}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-[#B38C8A]/50">
        <TrendingUp className="w-3 h-3" />
        <span>{views} مشاهدة</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [isGuest, setIsGuest] = useState(false)
  const [topServices, setTopServices] = useState<any[]>([])
  const [topServicesLoading, setTopServicesLoading] = useState(true)
  const [showServiceSelector, setShowServiceSelector] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const storedUsername = localStorage.getItem("username")
    const guestMode = localStorage.getItem("is_guest")

    if (!userId) {
      router.replace("/")
      return
    }

    setUsername(storedUsername || "مستخدم")
    setIsGuest(guestMode === "true")

    loadTopServices()
  }, [router])

  const loadTopServices = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("services")
        .select("id, title, category")
        .order("created_at", { ascending: false })
        .limit(3)

      if (data) setTopServices(data)
    } catch (error) {
      // تجاهل الخطأ - لا نعرقل الصفحة
    } finally {
      setTopServicesLoading(false)
    }
  }

  const handleSelectCategory = (category: string) => {
    setShowServiceSelector(false)
    router.push(`/agent/publish/${category}`)
  }

  const services = [
    {
      title: "زفات",
      icon: Music,
      href: "/services/zaffat",
      gradient: "bg-gradient-to-br from-[#D4AF37] to-[#B8963E]",
      count: 45,
    },
    {
      title: "شيلات",
      icon: Mic,
      href: "/services/sheilat",
      gradient: "bg-gradient-to-br from-[#B38C8A] to-[#9A7573]",
      count: 38,
    },
    {
      title: "دعوات",
      icon: Mail,
      href: "/services/invitations",
      gradient: "bg-gradient-to-br from-[#8B7355] to-[#6D5A43]",
      count: 52,
    },
    {
      title: "تهنئات",
      icon: Heart,
      href: "/services/greetings",
      gradient: "bg-gradient-to-br from-[#C9A86C] to-[#A88B4A]",
      count: 29,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] pb-24">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <div className="mb-6 relative">
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-[#D4AF37]/10 rounded-full blur-xl" />
          <h2 className="text-2xl font-bold text-[#B38C8A] mb-1 relative">
            مرحباً، {username || "مستخدم"} {isGuest && <span className="text-sm font-normal">(زائر)</span>}
          </h2>
          <p className="text-[#B38C8A]/70 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            ماذا تحتاج لمناسبتك اليوم؟
          </p>
        </div>

        <div className="mb-8 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B38C8A]/50" />
          <Input
            type="search"
            placeholder="ابحث عن زفات، شيلات، دعوات..."
            className="pr-12 py-6 bg-white/80 backdrop-blur-sm border-[#B38C8A]/10 text-[#B38C8A] placeholder:text-[#B38C8A]/40 rounded-2xl shadow-sm focus:shadow-md transition-shadow"
          />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-[#B38C8A]">خدماتنا</h3>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#B38C8A]/20 to-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {services.map((service) => (
              <EnhancedServiceCard key={service.href} {...service} />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-lg font-semibold text-[#B38C8A]">الأعلى تقييماً</h3>
          </div>
          <div className="space-y-3">
            {topServicesLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="h-5 w-32 bg-[#B38C8A]/20 rounded mb-2" />
                      <div className="h-4 w-20 bg-[#B38C8A]/10 rounded" />
                    </div>
                    <div className="h-6 w-12 bg-[#D4AF37]/20 rounded-full" />
                  </div>
                </div>
              ))
            ) : topServices.length > 0 ? (
              topServices.map((service, index) => (
                <TopRatedCard
                  key={service.id || index}
                  title={service.title || "خدمة جديدة"}
                  category={service.category || "زفات"}
                  rating={4.8}
                  views={Math.floor(Math.random() * 1000) + 100}
                />
              ))
            ) : (
              <div className="bg-white/50 rounded-2xl p-6 text-center">
                <Star className="w-8 h-8 text-[#D4AF37]/30 mx-auto mb-2" />
                <p className="text-sm text-[#B38C8A]/60">ستظهر هنا الخدمات الأعلى تقييماً</p>
              </div>
            )}
          </div>
        </div>

        {isGuest ? (
          <div className="mb-6 p-5 bg-gradient-to-br from-white to-[#FDF8F7] rounded-2xl border border-[#D4AF37]/20 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#B38C8A]">انضم إلينا الآن!</h4>
                <p className="text-sm text-[#B38C8A]/70">أنشئ حسابك واستمتع بجميع الميزات</p>
              </div>
            </div>
            <Button
              onClick={() => {
                localStorage.clear()
                router.push("/auth/signup")
              }}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#C49F27] hover:to-[#B38F17] text-white rounded-xl py-5 shadow-md hover:shadow-lg transition-all"
            >
              إنشاء حساب مجاني
            </Button>
          </div>
        ) : (
          <div className="mb-6 p-5 bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-[#B38C8A]">شارك إبداعك!</h4>
                <p className="text-sm text-[#B38C8A]/70">أضف خدمة جديدة الآن</p>
              </div>
              <Button
                onClick={() => setShowServiceSelector(true)}
                className="bg-[#D4AF37] hover:bg-[#C49F27] text-white rounded-xl gap-2"
              >
                <Plus className="w-4 h-4" />
                إنشاء
              </Button>
            </div>
          </div>
        )}

        {showServiceSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-[#B38C8A] mb-4 text-center">اختر نوع الخدمة</h3>
              <ServiceTypeSelector onSelect={handleSelectCategory} />
              <Button
                onClick={() => setShowServiceSelector(false)}
                variant="ghost"
                className="w-full mt-4 text-[#B38C8A]"
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

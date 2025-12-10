"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Plus, Settings, Users, FileVideo, ChevronLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface UserService {
  id: string
  user_id: string
  service_name: string
  description: string
  profile_image: string | null
  cover_image: string | null
  followers_count: number
  content_count: number
  created_at: string
}

function OtherServicesContent() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [userService, setUserService] = useState<UserService | null>(null)
  const [otherServices, setOtherServices] = useState<UserService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id")
    setUserId(storedUserId)
    loadServices(storedUserId)
  }, [])

  const loadServices = async (currentUserId: string | null) => {
    const supabase = createClient()

    try {
      const { data: allServices, error: fetchError } = await supabase
        .from("user_services")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("Error loading services:", fetchError)
        // إذا كان الجدول غير موجود، نعرض الصفحة بدون خدمات
        if (fetchError.code === "42P01") {
          setError("لم يتم إعداد قاعدة البيانات بعد")
        }
        setLoading(false)
        return
      }

      if (allServices) {
        if (currentUserId) {
          const myService = allServices.find((s) => s.user_id === currentUserId)
          const others = allServices.filter((s) => s.user_id !== currentUserId)
          setUserService(myService || null)
          setOtherServices(others)
        } else {
          setOtherServices(allServices)
        }
      }
    } catch (err) {
      console.error("Error loading services:", err)
      setError("حدث خطأ في تحميل الخدمات")
    } finally {
      setLoading(false)
    }
  }

  const ServiceCard = ({ service, isOwner = false }: { service: UserService; isOwner?: boolean }) => (
    <Link href={`/services/other/${service.id}`}>
      <div
        className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border ${isOwner ? "border-[#D4AF37]" : "border-[#B38C8A]/10"}`}
      >
        <div className="relative h-24 bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD]">
          {service.cover_image && (
            <Image src={service.cover_image || "/placeholder.svg"} alt="cover" fill className="object-cover" />
          )}
          {isOwner && (
            <div className="absolute top-2 right-2 bg-[#D4AF37] text-white text-xs px-2 py-1 rounded-full">خدمتي</div>
          )}
        </div>

        <div className="p-4 relative">
          <div className="absolute -top-8 right-4">
            <div className="w-16 h-16 rounded-full border-4 border-white bg-[#B38C8A] flex items-center justify-center overflow-hidden">
              {service.profile_image ? (
                <Image
                  src={service.profile_image || "/placeholder.svg"}
                  alt="profile"
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <span className="text-white text-xl font-bold">{service.service_name?.[0] || "؟"}</span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-bold text-[#B38C8A] text-lg mb-1">{service.service_name || "خدمة"}</h3>
            <p className="text-sm text-[#B38C8A]/70 line-clamp-2 mb-3">{service.description}</p>

            <div className="flex items-center gap-4 text-xs text-[#B38C8A]/60">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{service.followers_count || 0} متابع</span>
              </div>
              <div className="flex items-center gap-1">
                <FileVideo className="w-4 h-4" />
                <span>{service.content_count || 0} محتوى</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] pb-24">
        <TopHeader />
        <main className="pt-20 px-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-48" />
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] pb-24">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-[#B38C8A]">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-[#B38C8A]">خدمات أخرى</h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <p className="text-amber-700 text-sm">{error}</p>
          </div>
        )}

        {userId && !userService ? (
          <Link href="/services/other/create">
            <div className="mb-6 p-5 bg-gradient-to-br from-[#7B68EE]/10 to-[#6A5ACD]/10 rounded-2xl border-2 border-dashed border-[#7B68EE]/30 hover:border-[#7B68EE]/50 transition-colors">
              <div className="flex items-center justify-center gap-3 text-[#7B68EE]">
                <Plus className="w-6 h-6" />
                <span className="font-semibold text-lg">إنشاء خدمتي</span>
              </div>
              <p className="text-center text-sm text-[#7B68EE]/70 mt-2">أنشئ صفحة خدمتك الخاصة وابدأ بنشر محتواك</p>
            </div>
          </Link>
        ) : userService ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#B38C8A]">خدمتي</h2>
              <Link href={`/services/other/${userService.id}/manage`}>
                <Button variant="outline" size="sm" className="gap-2 border-[#D4AF37] text-[#D4AF37] bg-transparent">
                  <Settings className="w-4 h-4" />
                  إدارة
                </Button>
              </Link>
            </div>
            <ServiceCard service={userService} isOwner />
          </div>
        ) : null}

        <div>
          <h2 className="font-semibold text-[#B38C8A] mb-4">اكتشف الخدمات</h2>

          {otherServices.length === 0 && !error ? (
            <div className="bg-white/50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-[#7B68EE]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-[#7B68EE]/50" />
              </div>
              <p className="text-[#B38C8A]/60">لا توجد خدمات حالياً</p>
              <p className="text-sm text-[#B38C8A]/40 mt-1">كن أول من ينشئ خدمته!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {otherServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default function OtherServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[#7B68EE] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OtherServicesContent />
    </Suspense>
  )
}

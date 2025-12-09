"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { TikTokServiceViewer } from "@/components/tiktok-service-viewer"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { AgentPublishButton } from "@/components/agent-publish-button"

export default function GraduationZaffatPage() {
  const router = useRouter()
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "tiktok">("grid")

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("category", "zaffat")
        .eq("occasion", "graduation")
        .order("created_at", { ascending: false })

      console.log("[v0] تم جلب زفات التخرج:", data)
      setServices(data || [])
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] خطأ في جلب الخدمات:", error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <p className="text-[#B38C8A]">جاري التحميل...</p>
      </div>
    )
  }

  if (viewMode === "tiktok" && services.length > 0) {
    return (
      <div className="relative">
        <button
          onClick={() => setViewMode("grid")}
          className="absolute top-4 right-4 z-30 bg-white/80 hover:bg-white text-[#B38C8A] px-4 py-2 rounded-full shadow-lg"
        >
          عودة للقائمة
        </button>
        <TikTokServiceViewer initialServices={services} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/services/zaffat">
            <ChevronRight className="w-6 h-6 text-[#B38C8A]" />
          </Link>
          <h1 className="text-2xl font-bold text-[#B38C8A]">زفات التخرج</h1>
        </div>

        {services && services.length > 0 ? (
          <>
            <button
              onClick={() => setViewMode("tiktok")}
              className="w-full mb-4 bg-[#D4AF37] text-white py-3 rounded-xl font-bold hover:bg-[#D4AF37]/90 transition-colors"
            >
              عرض الفيديوهات 🎬
            </button>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setViewMode("tiktok")}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-[#F5E9E8] flex items-center justify-center relative">
                    {service.file_url && service.file_url.includes(".mp4") ? (
                      <video src={service.file_url} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-[#D4AF37] rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-2xl">♪</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-[#B38C8A] text-sm mb-1 line-clamp-1">{service.title}</h3>
                    <p className="text-xs text-[#B38C8A]/70 line-clamp-2">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-[#B38C8A]/70">لا توجد زفات متاحة حالياً في هذا القسم</p>
          </div>
        )}

        <AgentPublishButton category="zaffat" />
      </main>

      <BottomNav />
    </div>
  )
}

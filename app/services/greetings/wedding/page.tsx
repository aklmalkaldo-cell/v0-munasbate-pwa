"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { ServiceItemCard } from "@/components/service-item-card"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { AgentPublishButton } from "@/components/agent-publish-button"
import TikTokServiceViewer from "@/components/tiktok-service-viewer" // Import TikTokServiceViewer component

export default function WeddingGreetingsPage() {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "tiktok">("grid")
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("category", "greetings")
        .eq("occasion", "wedding")
        .eq("is3D", false) // فقط التهنئات 2D
        .order("created_at", { ascending: false })

      console.log("[v0] تم جلب تهنئات الزواج 2D:", data)
      setServices(data || [])
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] خطأ في جلب التهنئات:", error)
      setIsLoading(false)
    }
  }

  const handleVideoClick = (index: number) => {
    setSelectedIndex(index)
    setViewMode("tiktok")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <p className="text-[#B38C8A]">جاري التحميل...</p>
      </div>
    )
  }

  if (viewMode === "tiktok" && services.length > 0) {
    return <TikTokServiceViewer services={services} initialIndex={selectedIndex} onClose={() => setViewMode("grid")} />
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/services/greetings">
            <ChevronRight className="w-6 h-6 text-[#B38C8A]" />
          </Link>
          <h1 className="text-2xl font-bold text-[#B38C8A]">تهنئات الزواج</h1>
        </div>

        {services && services.length > 0 ? (
          <>
            <button
              onClick={() => handleVideoClick(0)}
              className="w-full mb-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white py-3 rounded-xl font-bold"
            >
              عرض جميع التهنئات بطريقة TikTok
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <div key={service.id} onClick={() => handleVideoClick(index)} className="cursor-pointer">
                  <ServiceItemCard
                    id={service.id}
                    title={service.title}
                    description={service.description}
                    fileUrl={service.file_url} // استخدام file_url بدلاً من media_url
                    thumbnailUrl={service.thumbnail_url}
                    type="video"
                    agentUserId={service.publisher_user_id}
                    category="greetings"
                    occasion="wedding"
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-[#B38C8A]/70">لا توجد تهنئات متاحة حالياً في هذا القسم</p>
          </div>
        )}

        <AgentPublishButton category="greetings" />
      </main>

      <BottomNav />
    </div>
  )
}

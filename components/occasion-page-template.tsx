"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { ChevronRight, Play, Plus, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import TikTokServiceViewer from "@/components/tiktok-service-viewer"

interface Service {
  id: number
  title: string
  description: string
  file_url: string
  category: string
  occasion: string
  has_music?: boolean
  is3D?: boolean
  publisher_user_id: string
}

interface OccasionPageProps {
  category: string
  categoryTitle: string
  occasion: string
  occasionTitle: string
  backHref: string
}

export default function OccasionPageTemplate({
  category,
  categoryTitle,
  occasion,
  occasionTitle,
  backHref,
}: OccasionPageProps) {
  const searchParams = useSearchParams()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTikTok, setShowTikTok] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const filterType = searchParams.get("filter") // "music" or "design"
  const filterValue = searchParams.get("value") // "true" or "false"

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    setCurrentUserId(userId)
    loadServices()
  }, [filterType, filterValue])

  const loadServices = async () => {
    try {
      const supabase = createClient()
      let query = supabase.from("services").select("*").eq("category", category).eq("occasion", occasion)

      if (filterType === "music" && filterValue !== null) {
        query = query.eq("has_music", filterValue === "true")
      } else if (filterType === "design" && filterValue !== null) {
        query = query.eq("is_3d", filterValue === "true")
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.log("Error loading services:", error)
      } else {
        setServices(data || [])
      }
    } catch (error) {
      console.log("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openTikTokView = (index: number) => {
    setSelectedIndex(index)
    setShowTikTok(true)
  }

  const getFilterLabel = () => {
    if (filterType === "music") {
      return filterValue === "true" ? "بموسيقى" : "بدون موسيقى"
    } else if (filterType === "design") {
      return filterValue === "true" ? "3D" : "2D"
    }
    return ""
  }

  if (showTikTok && services.length > 0) {
    return <TikTokServiceViewer services={services} initialIndex={selectedIndex} onClose={() => setShowTikTok(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] pb-24">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link href={backHref}>
            <ChevronRight className="w-6 h-6 text-[#B38C8A]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#B38C8A]">
              {categoryTitle} - {occasionTitle}
              {getFilterLabel() && <span className="text-sm font-normal mr-2">({getFilterLabel()})</span>}
            </h1>
            <p className="text-sm text-[#B38C8A]/60">{services.length} خدمة متاحة</p>
          </div>
        </div>

        {/* زر عرض الكل بطريقة TikTok */}
        {services.length > 0 && (
          <Button
            onClick={() => openTikTokView(0)}
            className="w-full mb-6 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-white rounded-xl py-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Play className="w-5 h-5" />
            عرض جميع المقاطع
          </Button>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#B38C8A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-[#B38C8A]/40" />
            </div>
            <p className="text-[#B38C8A]/60 mb-4">لا توجد خدمات حالياً</p>
            <Link href={`/agent/publish/${category}`}>
              <Button className="bg-[#D4AF37] hover:bg-[#C49F27] text-white rounded-xl gap-2">
                <Plus className="w-4 h-4" />
                أضف أول خدمة
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() => openTikTokView(index)}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}

        {/* زر إضافة خدمة */}
        {currentUserId && (
          <Link href={`/agent/publish/${category}`}>
            <div className="fixed bottom-24 left-4 w-14 h-14 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-40">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </Link>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

function ServiceCard({
  service,
  onClick,
  currentUserId,
}: {
  service: Service
  onClick: () => void
  currentUserId: string | null
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Video Preview */}
      <div className="aspect-[9/16] bg-black relative">
        {service.file_url ? (
          <video
            ref={videoRef}
            src={service.file_url}
            className="w-full h-full object-cover"
            muted
            playsInline
            onMouseEnter={() => videoRef.current?.play()}
            onMouseLeave={() => {
              if (videoRef.current) {
                videoRef.current.pause()
                videoRef.current.currentTime = 0
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#B38C8A]/10">
            <Play className="w-10 h-10 text-[#B38C8A]/30" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-[#B38C8A] text-sm line-clamp-1">{service.title}</h3>
        <p className="text-xs text-[#B38C8A]/60 line-clamp-1">{service.description}</p>
      </div>

      {/* Request Button */}
      <Link
        href={`/messages/${service.publisher_user_id}`}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 left-2 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-md"
      >
        <MessageCircle className="w-4 h-4 text-white" />
      </Link>
    </div>
  )
}

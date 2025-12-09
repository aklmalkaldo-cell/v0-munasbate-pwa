"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { TikTokServiceViewer } from "@/components/tiktok-service-viewer"

export default function ExplorePage() {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase.from("services").select("*").order("created_at", { ascending: false }).limit(100)

      setServices(data || [])
    } catch (error) {
      console.error("[v0] خطأ في جلب الخدمات:", error)
    } finally {
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

  return (
    <div className="min-h-screen bg-black">
      <TikTokServiceViewer initialServices={services} />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { ServiceItemCard } from "@/components/service-item-card"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { AgentPublishButton } from "@/components/agent-publish-button"

export default function BirthdayZaffatPage() {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadServices = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("category", "zaffat")
        .eq("occasion", "birthday")
        .order("created_at", { ascending: false })

      console.log("[v0] تم جلب زفات عيد الميلاد:", data)
      setServices(data || [])
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] خطأ في جلب الزفات:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <p className="text-[#B38C8A]">جاري التحميل...</p>
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
          <h1 className="text-2xl font-bold text-[#B38C8A]">زفات عيد الميلاد</h1>
        </div>

        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceItemCard
                key={service.id}
                id={service.id}
                title={service.title}
                description={service.description}
                fileUrl={service.file_url}
                thumbnailUrl={service.thumbnail_url}
                type="audio"
                agentUserId={service.publisher_user_id}
                category="zaffat"
                occasion="birthday"
              />
            ))}
          </div>
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

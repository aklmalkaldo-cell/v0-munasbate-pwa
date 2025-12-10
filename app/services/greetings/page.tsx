"use client"

import { useState, useEffect } from "react"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { ChevronRight, Box, Square, List, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function GreetingsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    setCurrentUserId(userId)
  }, [])

  const filters = [
    { id: "2d", label: "2D", icon: Square, value: false },
    { id: "3d", label: "3D", icon: Box, value: true },
    { id: "all", label: "عرض الكل", icon: List, value: null },
  ]

  const occasions = [
    { title: "زواج", href: "wedding", count: 25 },
    { title: "تخرج", href: "graduation", count: 18 },
    { title: "مواليد", href: "newborn", count: 22 },
    { title: "عيد", href: "eid", count: 30 },
    { title: "رمضان", href: "ramadan", count: 15 },
  ]

  const getOccasionHref = (occasionHref: string) => {
    if (selectedFilter === null || selectedFilter === "all") {
      return `/services/greetings/${occasionHref}`
    }
    const is3D = selectedFilter === "3d"
    return `/services/greetings/${occasionHref}?filter=design&value=${is3D}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] pb-24">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/home">
            <ChevronRight className="w-6 h-6 text-[#B38C8A]" />
          </Link>
          <h1 className="text-2xl font-bold text-[#B38C8A]">التهنئات</h1>
        </div>

        {selectedFilter === null ? (
          <div className="space-y-4">
            <p className="text-[#B38C8A] text-center mb-8">اختر نوع التهنئة المناسبة لك</p>
            <div className="space-y-3">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className="w-full p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#C9A86C] to-[#A88B4A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <filter.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-[#B38C8A]">{filter.label}</span>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-[#B38C8A]/50" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#B38C8A]">
                التهنئات - {filters.find((f) => f.id === selectedFilter)?.label}
              </h2>
              <button
                onClick={() => setSelectedFilter(null)}
                className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                تغيير
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {occasions.map((occasion) => (
                <Link key={occasion.href} href={getOccasionHref(occasion.href)}>
                  <div className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div>
                      <h3 className="font-semibold text-[#B38C8A] group-hover:text-[#D4AF37] transition-colors">
                        {occasion.title}
                      </h3>
                      <p className="text-sm text-[#B38C8A]/60">{occasion.count} خدمة</p>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-[#B38C8A]/50 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

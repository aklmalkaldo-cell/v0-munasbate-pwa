"use client"

import { useState, useEffect } from "react"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { FilterButtons } from "@/components/filter-buttons"
import { OccasionCard } from "@/components/occasion-card"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { AgentPublishButton } from "@/components/agent-publish-button"

export default function GreetingsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [accountType, setAccountType] = useState<string | null>(null)

  useEffect(() => {
    const type = localStorage.getItem("account_type")
    setAccountType(type)
  }, [])

  const filters = ["2D", "3D", "عرض الكل"]

  const occasions = [
    { title: "زواج", href: "/services/greetings/wedding", count: 25 },
    { title: "تخرج", href: "/services/greetings/graduation", count: 18 },
    { title: "مواليد", href: "/services/greetings/newborn", count: 22 },
    { title: "عيد ميلاد", href: "/services/greetings/birthday", count: 30 },
    { title: "نجاح", href: "/services/greetings/success", count: 15 },
  ]

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
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
            <p className="text-[#B38C8A] text-center mb-6">اختر نوع التهنئة المناسبة لك</p>
            <FilterButtons filters={filters} selectedFilter="" onFilterChange={setSelectedFilter} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#B38C8A]">التهنئات - {selectedFilter}</h2>
              <button onClick={() => setSelectedFilter(null)} className="text-sm text-[#D4AF37]">
                تغيير الفلتر
              </button>
            </div>
            <div className="space-y-3">
              {occasions.map((occasion) => (
                <OccasionCard key={occasion.href} title={occasion.title} href={occasion.href} count={occasion.count} />
              ))}
            </div>
          </div>
        )}
        {accountType === "agent" && <AgentPublishButton category="greetings" />}
      </main>

      <BottomNav />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { FilterButtons } from "@/components/filter-buttons"
import { OccasionCard } from "@/components/occasion-card"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { AgentPublishButton } from "@/components/agent-publish-button"

export default function InvitationsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [accountType, setAccountType] = useState<string | null>(null)

  useEffect(() => {
    const type = localStorage.getItem("account_type")
    setAccountType(type)
  }, [])

  const filters = ["2D", "3D", "عرض الكل"]

  const occasions = [
    { title: "زواج", href: "/services/invitations/wedding", count: 20 },
    { title: "تخرج", href: "/services/invitations/graduation", count: 14 },
    { title: "مواليد", href: "/services/invitations/newborn", count: 11 },
    { title: "عيد ميلاد", href: "/services/invitations/birthday", count: 18 },
    { title: "خطوبة", href: "/services/invitations/engagement", count: 16 },
  ]

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/home">
            <ChevronRight className="w-6 h-6 text-[#B38C8A]" />
          </Link>
          <h1 className="text-2xl font-bold text-[#B38C8A]">الدعوات</h1>
        </div>

        {selectedFilter === null ? (
          <div className="space-y-4">
            <p className="text-[#B38C8A] text-center mb-6">اختر نوع الدعوة المناسبة لك</p>
            <FilterButtons filters={filters} selectedFilter="" onFilterChange={setSelectedFilter} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#B38C8A]">الدعوات - {selectedFilter}</h2>
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
      </main>

      {accountType === "agent" && <AgentPublishButton category="invitations" />}
      <BottomNav />
    </div>
  )
}

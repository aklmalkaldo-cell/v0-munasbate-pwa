"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ChatListItem } from "@/components/chat-list-item"

export default function SearchUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const supabase = createClient()

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .or(`display_name.ilike.%${query}%,user_id.ilike.%${query}%`)
        .limit(20)

      setSearchResults(data || [])
    } catch (error) {
      console.log("[v0] خطأ في البحث:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold text-[#B38C8A] mb-6">بحث عن مستخدمين</h1>

        {/* شريط البحث */}
        <div className="relative mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B38C8A]/50" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="ابحث باسم المستخدم أو المعرف..."
            className="pr-10 bg-white border-[#B38C8A]/20"
          />
        </div>

        {/* نتائج البحث */}
        {isSearching ? (
          <div className="text-center py-8">
            <p className="text-[#B38C8A]/70">جاري البحث...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="bg-white rounded-xl overflow-hidden">
            {searchResults.map((user) => (
              <ChatListItem
                key={user.id}
                userId={user.user_id}
                displayName={user.display_name}
                avatarUrl={user.avatar_url}
              />
            ))}
          </div>
        ) : searchQuery.trim().length >= 2 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-[#B38C8A]/70">لم يتم العثور على نتائج</p>
          </div>
        ) : null}
      </main>

      <BottomNav />
    </div>
  )
}

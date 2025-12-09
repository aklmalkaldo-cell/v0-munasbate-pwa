"use client"

import Link from "next/link"
import { Bell, UserIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function TopHeader() {
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false)

        setUnreadNotifications(count || 0)
      }
    }

    fetchUnreadCount()
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-[#B38C8A]/20 z-50">
      <div className="flex items-center justify-between h-16 max-w-screen-xl mx-auto px-4">
        <Link href="/profile" className="p-2">
          <UserIcon className="w-6 h-6 text-[#B38C8A]" />
        </Link>

        <h1 className="text-2xl font-bold text-[#B38C8A]">Munasbate</h1>

        <Link href="/notifications" className="p-2 relative">
          <Bell className="w-6 h-6 text-[#B38C8A]" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 bg-[#D4AF37] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}

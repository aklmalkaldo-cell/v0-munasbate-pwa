"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Heart, MessageCircle, UserPlus, Mail, Bell } from "lucide-react"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const initPage = async () => {
      const storedUserId = localStorage.getItem("user_id")
      const isGuest = localStorage.getItem("is_guest") === "true"

      if (!storedUserId || isGuest) {
        router.push("/auth/login")
        return
      }

      setUserId(storedUserId)
      await loadNotifications(storedUserId)
    }

    initPage()
  }, [router])

  const loadNotifications = async (uid: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          from_user:app_users!notifications_from_user_id_fkey (
            user_id,
            username,
            avatar_url
          )
        `)
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        console.log("Error loading notifications:", error)
        // إذا لم يكن الجدول موجوداً، نعرض قائمة فارغة
        setNotifications([])
      } else {
        setNotifications(data || [])

        // تحديث الإشعارات كمقروءة
        await supabase.from("notifications").update({ is_read: true }).eq("user_id", uid).eq("is_read", false)
      }
    } catch (error) {
      console.log("Error:", error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-[#D4AF37]" />
      case "comment":
        return <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
      case "follow":
        return <UserPlus className="w-5 h-5 text-[#D4AF37]" />
      case "message":
        return <Mail className="w-5 h-5 text-[#D4AF37]" />
      default:
        return <Bell className="w-5 h-5 text-[#D4AF37]" />
    }
  }

  const getNotificationText = (notification: any) => {
    const name = notification.from_user?.username || "مستخدم"
    switch (notification.type) {
      case "like":
        return `${name} أعجب بمنشورك`
      case "comment":
        return `${name} علّق على منشورك`
      case "follow":
        return `${name} بدأ بمتابعتك`
      case "message":
        return `لديك رسالة جديدة من ${name}`
      default:
        return "إشعار جديد"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "الآن"
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 7) return `منذ ${diffDays} يوم`
    return date.toLocaleDateString("ar-SA")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#B38C8A]">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold text-[#B38C8A] mb-6">الإشعارات</h1>

        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm ${
                  !notification.is_read ? "border-r-4 border-[#D4AF37]" : ""
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F5E9E8] flex items-center justify-center">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#4A4A4A]">{getNotificationText(notification)}</p>
                  <p className="text-xs text-[#B38C8A]/60 mt-1">{formatDate(notification.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Bell className="w-16 h-16 text-[#B38C8A]/30 mx-auto mb-4" />
            <p className="text-[#B38C8A]/70 text-lg">لا توجد إشعارات حالياً</p>
            <p className="text-[#B38C8A]/50 text-sm mt-2">ستظهر هنا الإشعارات الجديدة</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

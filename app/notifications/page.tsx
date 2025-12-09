import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Heart, MessageCircle, UserPlus, Mail } from "lucide-react"

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // جلب الإشعارات
  const { data: notifications } = await supabase
    .from("notifications")
    .select(`
      *,
      from_user:from_user_id (
        display_name,
        avatar_url
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

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
        return null
    }
  }

  const getNotificationText = (notification: any) => {
    const name = notification.from_user?.display_name || "مستخدم"
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

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold text-[#B38C8A] mb-6">الإشعارات</h1>

        {notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-4 flex items-center gap-3 ${
                  !notification.is_read ? "border-r-4 border-[#D4AF37]" : ""
                }`}
              >
                <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <p className="text-sm text-[#B38C8A]">{getNotificationText(notification)}</p>
                  <p className="text-xs text-[#B38C8A]/50 mt-1">
                    {new Date(notification.created_at).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-[#B38C8A]/70">لا توجد إشعارات حالياً</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

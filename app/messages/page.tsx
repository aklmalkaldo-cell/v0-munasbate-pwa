"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { ChatListItem } from "@/components/chat-list-item"
import { createClient } from "@/lib/supabase/client"

const SERVICE_ACCOUNTS = [
  {
    userId: "1111111",
    displayName: "خدمة الزفات والشيلات",
    description: "للاستفسار عن الزفات والشيلات",
  },
  {
    userId: "2222222",
    displayName: "خدمة الباقات والعروض",
    description: "للاستفسار عن الباقات والعروض الخاصة",
  },
  {
    userId: "3333333",
    displayName: "خدمة الدعوات والتهنئات",
    description: "للاستفسار عن الدعوات والتهنئات",
  },
  {
    userId: "4444444",
    displayName: "الخدمات العامة",
    description: "للاستفسارات العامة",
  },
  {
    userId: "5555555",
    displayName: "الاستفسارات والدعم",
    description: "للدعم الفني والاستفسارات",
  },
]

export default function MessagesPage() {
  const router = useRouter()
  const [isGuest, setIsGuest] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userConversations, setUserConversations] = useState<any[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const guestMode = localStorage.getItem("is_guest") === "true"

    if (!userId) {
      router.replace("/")
      return
    }

    setCurrentUserId(userId)
    setIsGuest(guestMode)
    loadConversations(userId)
  }, [router])

  const loadConversations = async (userId: string) => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("messages")
        .select("sender_user_id, receiver_user_id")
        .or(`sender_user_id.eq.${userId},receiver_user_id.eq.${userId}`)
        .order("created_at", { ascending: false })

      if (error) throw error

      const otherUserIds = new Set<string>()
      data.forEach((msg: any) => {
        if (msg.sender_user_id !== userId) {
          otherUserIds.add(msg.sender_user_id)
        }
        if (msg.receiver_user_id !== userId) {
          otherUserIds.add(msg.receiver_user_id)
        }
      })

      setUserConversations(Array.from(otherUserIds))
    } catch (error) {
      // تجاهل الخطأ
    } finally {
      setConversationsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold text-[#B38C8A] px-4 mb-4">الرسائل</h1>

        {isGuest && (
          <div className="mx-4 mb-4 p-4 bg-white/50 rounded-2xl border border-[#D4AF37]/30">
            <p className="text-center text-sm text-[#B38C8A]">
              الزوار لا يمكنهم إرسال رسائل. يرجى إنشاء حساب للتواصل مع خدمة العملاء
            </p>
          </div>
        )}

        {/* حسابات الخدمة - تظهر مباشرة */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-[#B38C8A] px-4 mb-2">خدمة العملاء</h2>
          <div className="bg-white">
            {SERVICE_ACCOUNTS.map((account) => (
              <ChatListItem
                key={account.userId}
                userId={account.userId}
                displayName={account.displayName}
                lastMessage={account.description}
              />
            ))}
          </div>
        </div>

        {conversationsLoading ? (
          <div className="mb-4">
            <div className="h-5 w-24 bg-[#B38C8A]/20 rounded mx-4 mb-2 animate-pulse" />
            <div className="bg-white">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-4 border-b border-[#B38C8A]/10 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-[#B38C8A]/20" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-[#B38C8A]/20 rounded mb-2" />
                    <div className="h-3 w-48 bg-[#B38C8A]/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : userConversations.length > 0 ? (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-[#B38C8A] px-4 mb-2">محادثات أخرى</h2>
            <div className="bg-white">
              {userConversations.map((uId) => (
                <ChatListItem key={uId} userId={uId} displayName={`المستخدم ${uId}`} lastMessage="محادثة نشطة" />
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4">
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-[#B38C8A]/70">لا توجد محادثات أخرى</p>
              <p className="text-sm text-[#B38C8A]/50 mt-2">ابدأ محادثة مع خدمة العملاء</p>
            </div>
          </div>
        )}

        {!isGuest && (
          <div className="fixed bottom-24 left-4 z-40">
            <a
              href="https://wa.me/966508370913"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-transform hover:scale-110"
              title="راسلنا على WhatsApp"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.986 1.521 9.88 9.88 0 003.332 19.1 9.876 9.876 0 004.667-1.251 9.88 9.88 0 00-2.909-17.37" />
              </svg>
            </a>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

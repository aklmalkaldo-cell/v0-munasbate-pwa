"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, Send } from "lucide-react"
import Image from "next/image"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false)
  const [hasAutoReplied, setHasAutoReplied] = useState(false)

  const supabase = createClient()

  const getServiceName = (userId: string) => {
    if (userId === "1111111") return "استديو مناسبات - قسم الزفات والشيلات"
    if (userId === "2222222") return "استديو مناسبات - قسم الدعوات"
    if (userId === "3333333") return "استديو مناسبات - قسم التهنئات"
    if (userId === "4444444") return "استديو مناسبات - قسم الخدمات الخاصة"
    return "مستخدم"
  }

  useEffect(() => {
    loadChat()

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as any
          if (
            (newMsg.sender_user_id === currentUser?.user_id && newMsg.receiver_user_id === otherUser?.user_id) ||
            (newMsg.sender_user_id === otherUser?.user_id && newMsg.receiver_user_id === currentUser?.user_id)
          ) {
            setMessages((prev) => [...prev, newMsg])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChat = async () => {
    try {
      const currentUserId = localStorage.getItem("user_id")
      const isGuest = localStorage.getItem("is_guest") === "true"

      if (!currentUserId || isGuest) {
        router.push("/auth/login")
        return
      }

      const { data: currentUserData } = await supabase
        .from("app_users")
        .select("*")
        .eq("user_id", currentUserId)
        .single()

      if (!currentUserData) {
        router.push("/auth/login")
        return
      }

      setCurrentUser(currentUserData)

      const { data: otherUserData } = await supabase.from("app_users").select("*").eq("user_id", userId).single()

      setOtherUser(otherUserData)

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_user_id.eq.${currentUserId},receiver_user_id.eq.${userId}),and(sender_user_id.eq.${userId},receiver_user_id.eq.${currentUserId})`,
        )
        .order("created_at", { ascending: true })

      setMessages(messagesData || [])

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("receiver_user_id", currentUserId)
        .eq("sender_user_id", userId)
    } catch (error) {
      console.log("[v0] خطأ في تحميل المحادثة:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendAutoReply = async (senderUserId: string) => {
    if (hasAutoReplied || otherUser?.account_type !== "agent") return

    const autoReplyMessage = `أهلاً بك! حياك الله في ${getServiceName(otherUser.user_id)} 🌟
    
اترك رسالتك وانتظر الرد، سيتم الرد عليك في أقرب وقت من خلال الدعم الفني المخصص.

📱 للتواصل السريع عبر واتساب: +966508370913`

    await supabase.from("messages").insert({
      sender_user_id: otherUser.user_id,
      receiver_user_id: senderUserId,
      content: autoReplyMessage,
    })

    setHasAutoReplied(true)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || !otherUser) return

    try {
      const { error } = await supabase.from("messages").insert({
        sender_user_id: currentUser.user_id,
        receiver_user_id: otherUser.user_id,
        content: newMessage,
      })

      if (error) throw error

      if (messages.length === 0 && otherUser.account_type === "agent") {
        setTimeout(() => sendAutoReply(currentUser.user_id), 1000)
      }

      setNewMessage("")
    } catch (error) {
      console.log("[v0] خطأ في إرسال الرسالة:", error)
    }
  }

  const handleWhatsAppClick = () => {
    setShowWhatsAppDialog(true)
  }

  const confirmWhatsApp = () => {
    window.open("https://wa.me/966508370913", "_blank")
    setShowWhatsAppDialog(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <p className="text-[#B38C8A]">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] flex flex-col">
      <header className="bg-white border-b border-[#B38C8A]/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ChevronRight className="w-6 h-6 text-[#B38C8A]" />
          </button>

          <div className="w-10 h-10 rounded-full bg-[#F5E9E8] overflow-hidden">
            {otherUser?.avatar_url ? (
              <Image
                src={otherUser.avatar_url || "/placeholder.svg"}
                alt={otherUser.username}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#D4AF37]">
                {otherUser?.username?.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="font-medium text-[#B38C8A]">{getServiceName(otherUser?.user_id)}</h1>
            <p className="text-xs text-[#B38C8A]/60">
              {otherUser?.account_type === "agent" ? "خدمة عملاء" : `@${otherUser?.username}`}
            </p>
          </div>

          {otherUser?.account_type === "agent" && (
            <button
              onClick={handleWhatsAppClick}
              className="w-9 h-9 bg-[#25D366] hover:bg-[#20BA5A] rounded-full flex items-center justify-center transition-colors"
              title="تواصل عبر WhatsApp"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {showWhatsAppDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-[#B38C8A] mb-2">الانتقال إلى WhatsApp</h3>
            <p className="text-[#B38C8A]/70 mb-4">سيتم نقلك للدردشة مع الاستديو في WhatsApp</p>
            <div className="flex gap-2">
              <Button onClick={confirmWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#20BA5A]">
                موافق
              </Button>
              <Button onClick={() => setShowWhatsAppDialog(false)} variant="outline" className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message) => {
          const isSender = message.sender_user_id === currentUser?.user_id

          return (
            <div key={message.id} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isSender ? "bg-[#D4AF37] text-white rounded-br-sm" : "bg-white text-[#B38C8A] rounded-bl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                <p className={`text-xs mt-1 ${isSender ? "text-white/70" : "text-[#B38C8A]/50"}`}>
                  {new Date(message.created_at).toLocaleTimeString("ar-SA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="bg-white border-t border-[#B38C8A]/20 px-4 py-3 pb-safe">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالة..."
            className="flex-1 border-[#B38C8A]/20"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()} className="bg-[#D4AF37] hover:bg-[#B8941F]">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

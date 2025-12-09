"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Heart, MessageCircle, Bookmark, Send, X } from "lucide-react"

interface TikTokServiceViewerProps {
  services: any[]
  initialIndex?: number
  onClose?: () => void
}

export function TikTokServiceViewer({
  services: initialServices,
  initialIndex = 0,
  onClose,
}: TikTokServiceViewerProps) {
  const router = useRouter()
  const [services, setServices] = useState(initialServices)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [likes, setLikes] = useState<{ [key: number]: boolean }>({})
  const [saved, setSaved] = useState<{ [key: number]: boolean }>({})
  const [likesCount, setLikesCount] = useState<{ [key: number]: number }>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id")
    setUserId(storedUserId)

    if (storedUserId) {
      loadUserInteractions(storedUserId)
    }
  }, [])

  useEffect(() => {
    loadLikesCount()
  }, [services])

  const loadUserInteractions = async (uid: string) => {
    const supabase = createClient()

    const serviceIds = services.map((s) => s.id)

    const { data: likesData } = await supabase
      .from("service_likes")
      .select("service_id")
      .eq("user_id", uid)
      .in("service_id", serviceIds)

    const { data: savedData } = await supabase
      .from("saved_services")
      .select("service_id")
      .eq("user_id", uid)
      .in("service_id", serviceIds)

    const likesMap: { [key: number]: boolean } = {}
    const savedMap: { [key: number]: boolean } = {}

    likesData?.forEach((like) => {
      const idx = services.findIndex((s) => s.id === like.service_id)
      if (idx !== -1) likesMap[idx] = true
    })

    savedData?.forEach((save) => {
      const idx = services.findIndex((s) => s.id === save.service_id)
      if (idx !== -1) savedMap[idx] = true
    })

    setLikes(likesMap)
    setSaved(savedMap)
  }

  const loadLikesCount = async () => {
    const supabase = createClient()
    const counts: { [key: number]: number } = {}

    for (let i = 0; i < services.length; i++) {
      const { count } = await supabase
        .from("service_likes")
        .select("*", { count: "exact", head: true })
        .eq("service_id", services[i].id)

      counts[i] = count || 0
    }

    setLikesCount(counts)
  }

  const loadComments = async (serviceId: number) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("service_comments")
      .select(`
        *,
        user:app_users!service_comments_user_id_fkey(user_id, username, avatar_url)
      `)
      .eq("service_id", serviceId)
      .order("created_at", { ascending: false })

    setComments(data || [])
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY
  }

  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current

    if (Math.abs(diff) > 80) {
      if (diff > 0 && currentIndex < services.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowComments(false)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
        setShowComments(false)
      }
    }
  }

  const currentService = services[currentIndex]

  const handleLike = async () => {
    if (!userId) {
      alert("يجب تسجيل الدخول للإعجاب")
      return
    }

    const supabase = createClient()
    const isLiked = likes[currentIndex]

    if (isLiked) {
      await supabase.from("service_likes").delete().eq("service_id", currentService.id).eq("user_id", userId)
      setLikesCount({ ...likesCount, [currentIndex]: (likesCount[currentIndex] || 1) - 1 })
    } else {
      await supabase.from("service_likes").insert({ service_id: currentService.id, user_id: userId })
      setLikesCount({ ...likesCount, [currentIndex]: (likesCount[currentIndex] || 0) + 1 })
    }

    setLikes({ ...likes, [currentIndex]: !isLiked })
  }

  const handleSave = async () => {
    if (!userId) {
      alert("يجب تسجيل الدخول للحفظ")
      return
    }

    const supabase = createClient()
    const isSaved = saved[currentIndex]

    if (isSaved) {
      await supabase.from("saved_services").delete().eq("service_id", currentService.id).eq("user_id", userId)
    } else {
      await supabase.from("saved_services").insert({ service_id: currentService.id, user_id: userId })
    }

    setSaved({ ...saved, [currentIndex]: !isSaved })
  }

  const handleShowComments = () => {
    loadComments(currentService.id)
    setShowComments(true)
  }

  const handleAddComment = async () => {
    if (!userId || !newComment.trim()) return

    const supabase = createClient()
    await supabase.from("service_comments").insert({
      service_id: currentService.id,
      user_id: userId,
      content: newComment.trim(),
    })

    setNewComment("")
    loadComments(currentService.id)
  }

  const handleRequestService = () => {
    const publisherId = currentService.publisher_user_id || currentService.agent_user_id || "service_account"
    router.push(`/messages/${publisherId}`)
  }

  if (!currentService) {
    return <div className="w-full h-screen flex items-center justify-center text-[#B38C8A]">لا توجد خدمات متاحة</div>
  }

  const videoUrl = currentService.media_url || currentService.file_url
  const isVideo =
    videoUrl && (videoUrl.includes(".mp4") || videoUrl.includes(".mov") || currentService.file_type === "video")

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden touch-none"
    >
      <div className="w-full h-full relative">
        {isVideo ? (
          <video
            key={currentService.id}
            src={videoUrl}
            className="w-full h-full object-contain"
            controls
            autoPlay
            loop
            playsInline
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#B38C8A] to-[#D4AF37] flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-6xl">♪</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">{currentService.title}</h2>
              <p className="text-lg opacity-90">{currentService.description}</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-8 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
          <h3 className="font-bold text-white text-lg mb-1">{currentService.title}</h3>
          <p className="text-sm text-white/90 mb-4">{currentService.description}</p>

          <button
            onClick={handleRequestService}
            className="w-full bg-[#D4AF37] text-white font-bold py-3 rounded-xl hover:bg-[#D4AF37]/90 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            اطلب الآن
          </button>
        </div>

        <div className="absolute right-2 bottom-40 flex flex-col gap-6 z-10">
          <button onClick={handleLike} className="flex flex-col items-center gap-1 text-white drop-shadow-lg">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${likes[currentIndex] ? "bg-red-500" : "bg-white/20"}`}
            >
              <Heart className="w-6 h-6" fill={likes[currentIndex] ? "white" : "none"} />
            </div>
            <span className="text-xs font-bold">{likesCount[currentIndex] || 0}</span>
          </button>

          <button onClick={handleShowComments} className="flex flex-col items-center gap-1 text-white drop-shadow-lg">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs">تعليق</span>
          </button>

          <button onClick={handleSave} className="flex flex-col items-center gap-1 text-white drop-shadow-lg">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${saved[currentIndex] ? "bg-[#D4AF37]" : "bg-white/20"}`}
            >
              <Bookmark className="w-6 h-6" fill={saved[currentIndex] ? "white" : "none"} />
            </div>
            <span className="text-xs">حفظ</span>
          </button>
        </div>

        {/* عداد الموضع */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {services.length}
        </div>

        {/* مؤشر السحب */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 text-white/50 text-xs">
          اسحب للأعلى أو الأسفل
        </div>
      </div>

      {showComments && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h3 className="text-white font-bold text-lg">التعليقات</h3>
            <button onClick={() => setShowComments(false)} className="text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {comments.length === 0 ? (
              <p className="text-white/50 text-center py-8">لا توجد تعليقات بعد</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#B38C8A] flex items-center justify-center text-white text-sm flex-shrink-0">
                      {comment.user?.username?.[0] || "؟"}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{comment.user?.username || "مستخدم"}</p>
                      <p className="text-white/80 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {userId && (
            <div className="p-4 border-t border-white/20 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتب تعليق..."
                className="flex-1 bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2 placeholder:text-white/50"
              />
              <button
                onClick={handleAddComment}
                className="bg-[#D4AF37] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#D4AF37]/90 transition-colors"
              >
                إرسال
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TikTokServiceViewer

"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Flag,
  UserPlus,
  Gauge,
  PictureInPicture2,
} from "lucide-react"
import { usePathname } from "next/navigation"

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
  const pathname = usePathname()
  const [services, setServices] = useState(initialServices)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [likes, setLikes] = useState<{ [key: number]: boolean }>({})
  const [saved, setSaved] = useState<{ [key: number]: boolean }>({})
  const [likesCount, setLikesCount] = useState<{ [key: number]: number }>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isPiPActive, setIsPiPActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const swipeAreaRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const touchStartTime = useRef(0)
  const isSwiping = useRef(false)
  const hasMoved = useRef(false)
  const minSwipeDistance = 100
  const maxSwipeTime = 500

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

  useEffect(() => {
    setShowFullDescription(false)
    setShowOptions(false) // إغلاق قائمة الخيارات عند تغيير الفيديو
  }, [currentIndex])

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
    const { data, error } = await supabase
      .from("service_comments")
      .select("*")
      .eq("service_id", serviceId)
      .order("created_at", { ascending: false })

    if (error) {
      console.log("[v0] Error loading comments:", error)
    }

    setComments(data || [])
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
    touchStartTime.current = Date.now()
    touchEndY.current = e.touches[0].clientY
    touchEndX.current = e.touches[0].clientX
    isSwiping.current = true
    hasMoved.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) return
    touchEndY.current = e.touches[0].clientY
    touchEndX.current = e.touches[0].clientX

    const diffY = Math.abs(touchStartY.current - touchEndY.current)
    const diffX = Math.abs(touchStartX.current - touchEndX.current)

    if (diffY > 10 || diffX > 10) {
      hasMoved.current = true
    }
  }

  const handleTouchEnd = () => {
    if (!isSwiping.current) return

    const diffY = touchStartY.current - touchEndY.current
    const diffX = Math.abs(touchStartX.current - touchEndX.current)
    const timeDiff = Date.now() - touchStartTime.current

    const isValidSwipe =
      hasMoved.current && Math.abs(diffY) > minSwipeDistance && Math.abs(diffY) > diffX && timeDiff < maxSwipeTime

    if (isValidSwipe) {
      if (diffY > 0 && currentIndex < services.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowComments(false)
      } else if (diffY < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
        setShowComments(false)
      }
    }

    isSwiping.current = false
    hasMoved.current = false
    touchStartY.current = 0
    touchEndY.current = 0
    touchStartX.current = 0
    touchEndX.current = 0
    touchStartTime.current = 0
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setVideoProgress(progress || 0)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const percentage = clickX / width
      videoRef.current.currentTime = percentage * videoRef.current.duration
    }
  }

  const currentService = services[currentIndex]

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()

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

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()

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

  const handleShowComments = (e: React.MouseEvent) => {
    e.stopPropagation()
    loadComments(currentService.id)
    setShowComments(true)
  }

  const handleAddComment = async () => {
    if (!userId || !newComment.trim() || isSubmittingComment) return

    setIsSubmittingComment(true)
    const supabase = createClient()

    // جلب اسم المستخدم
    const { data: userData } = await supabase.from("app_users").select("username").eq("user_id", userId).single()

    const { error } = await supabase.from("service_comments").insert({
      service_id: currentService.id,
      user_id: userId,
      comment_text: newComment.trim(),
      username: userData?.username || "مستخدم",
    })

    if (error) {
      console.log("[v0] Error adding comment:", error)
      alert("حدث خطأ في إضافة التعليق")
    } else {
      setNewComment("")
      loadComments(currentService.id)
    }

    setIsSubmittingComment(false)
  }

  const handleRequestService = (e: React.MouseEvent) => {
    e.stopPropagation()

    const storedUserId = localStorage.getItem("user_id")
    if (!storedUserId) {
      alert("يجب تسجيل الدخول أولاً لطلب الخدمة")
      router.push("/login")
      return
    }

    const publisherId = currentService.publisher_user_id || currentService.agent_user_id || "service_account"

    if (publisherId === storedUserId) {
      alert("لا يمكنك مراسلة نفسك")
      return
    }

    const serviceData = {
      id: currentService.id,
      title: currentService.title,
      media_url: currentService.media_url || currentService.file_url,
      description: currentService.description,
      file_type: currentService.file_type,
    }

    const encodedService = encodeURIComponent(JSON.stringify(serviceData))
    const returnPath = encodeURIComponent(pathname)

    router.push(`/messages/${publisherId}?service=${encodedService}&return=${returnPath}`)
  }

  const handleSpeedChange = () => {
    if (!videoRef.current) return
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentSpeedIndex = speeds.indexOf(playbackSpeed)
    const nextSpeedIndex = (currentSpeedIndex + 1) % speeds.length
    const newSpeed = speeds[nextSpeedIndex]
    videoRef.current.playbackRate = newSpeed
    setPlaybackSpeed(newSpeed)
  }

  const handlePiP = async () => {
    if (!videoRef.current) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPiPActive(false)
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture()
        setIsPiPActive(true)
      } else {
        alert("متصفحك لا يدعم الشاشة المصغرة")
      }
    } catch (error) {
      console.log("[v0] PiP error:", error)
      alert("حدث خطأ في تفعيل الشاشة المصغرة")
    }
  }

  if (!currentService) {
    return <div className="w-full h-screen flex items-center justify-center text-[#B38C8A]">لا توجد خدمات متاحة</div>
  }

  const videoUrl = currentService.media_url || currentService.file_url
  const isVideo =
    videoUrl && (videoUrl.includes(".mp4") || videoUrl.includes(".mov") || currentService.file_type === "video")

  return (
    <div className="relative w-full h-screen bg-black flex flex-col overflow-hidden">
      <div
        ref={swipeAreaRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 relative touch-pan-y"
      >
        {isVideo ? (
          <video
            ref={videoRef}
            key={currentService.id}
            src={videoUrl}
            className="w-full h-full object-contain pointer-events-auto"
            controls={false}
            autoPlay
            loop
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onClick={() => {
              if (videoRef.current) {
                if (videoRef.current.paused) {
                  videoRef.current.play()
                } else {
                  videoRef.current.pause()
                }
              }
            }}
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

        {isVideo && (
          <div
            className="absolute bottom-32 left-0 right-16 h-1 bg-white/30 cursor-pointer z-20"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] transition-all duration-100"
              style={{ width: `${videoProgress}%` }}
            />
          </div>
        )}

        <div className="absolute bottom-16 left-0 right-16 px-4 z-10">
          <h3 className="font-bold text-white text-lg mb-1 line-clamp-1 drop-shadow-lg">{currentService.title}</h3>

          {currentService.description && (
            <div>
              {showFullDescription ? (
                <div className="text-sm text-white/90 bg-black/50 p-2 rounded-lg">
                  <p>{currentService.description}</p>
                  <button
                    onClick={() => setShowFullDescription(false)}
                    className="text-[#D4AF37] font-semibold mt-1 flex items-center gap-1"
                  >
                    <ChevronUp className="w-4 h-4" />
                    إخفاء
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowFullDescription(true)}
                  className="text-[#D4AF37] font-semibold text-sm flex items-center gap-1 drop-shadow-lg"
                >
                  <ChevronDown className="w-4 h-4" />
                  عرض الوصف
                </button>
              )}
            </div>
          )}
        </div>

        <div className="absolute right-2 bottom-36 flex flex-col gap-4 z-20">
          <button
            onClick={handleLike}
            onTouchEnd={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-1 text-white drop-shadow-lg"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                likes[currentIndex]
                  ? "bg-gradient-to-br from-[#D4AF37] to-[#F5D76E] shadow-[0_0_15px_rgba(212,175,55,0.6)]"
                  : "bg-black/40 backdrop-blur-sm border-2 border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.3)]"
              }`}
            >
              <Heart
                className={`w-6 h-6 ${likes[currentIndex] ? "text-white" : "text-[#D4AF37]"}`}
                fill={likes[currentIndex] ? "white" : "none"}
              />
            </div>
            <span className="text-xs font-bold text-[#D4AF37] drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">
              {likesCount[currentIndex] || 0}
            </span>
          </button>

          <button
            onClick={handleShowComments}
            onTouchEnd={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-1 text-white drop-shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border-2 border-[#D4AF37]/50 flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.3)]">
              <MessageCircle className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <span className="text-xs text-[#D4AF37] drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">تعليق</span>
          </button>

          <button
            onClick={handleSave}
            onTouchEnd={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-1 text-white drop-shadow-lg"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                saved[currentIndex]
                  ? "bg-gradient-to-br from-[#D4AF37] to-[#F5D76E] shadow-[0_0_15px_rgba(212,175,55,0.6)]"
                  : "bg-black/40 backdrop-blur-sm border-2 border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.3)]"
              }`}
            >
              <Bookmark
                className={`w-6 h-6 ${saved[currentIndex] ? "text-white" : "text-[#D4AF37]"}`}
                fill={saved[currentIndex] ? "white" : "none"}
              />
            </div>
            <span className="text-xs text-[#D4AF37] drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">حفظ</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowOptions(!showOptions)
            }}
            onTouchEnd={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-1 text-white drop-shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border-2 border-[#D4AF37]/50 flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.3)]">
              <MoreVertical className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <span className="text-xs text-[#D4AF37] drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">المزيد</span>
          </button>
        </div>

        {showOptions && (
          <div
            className="absolute right-16 bottom-36 bg-black/90 backdrop-blur-md rounded-xl border border-[#D4AF37]/30 overflow-hidden z-30"
            onTouchStart={(e) => e.stopPropagation()}
          >
            {/* سرعة التشغيل */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSpeedChange()
              }}
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#D4AF37]/20 w-full"
            >
              <Gauge className="w-5 h-5 text-[#D4AF37]" />
              <span>السرعة: {playbackSpeed}x</span>
            </button>

            {/* الشاشة المصغرة */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePiP()
                setShowOptions(false)
              }}
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#D4AF37]/20 w-full"
            >
              <PictureInPicture2 className="w-5 h-5 text-[#D4AF37]" />
              <span>{isPiPActive ? "إلغاء الشاشة المصغرة" : "شاشة مصغرة"}</span>
            </button>

            {/* متابعة */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                alert("تمت المتابعة!")
                setShowOptions(false)
              }}
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#D4AF37]/20 w-full"
            >
              <UserPlus className="w-5 h-5 text-[#D4AF37]" />
              <span>متابعة</span>
            </button>

            {/* إبلاغ */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                alert("تم الإبلاغ!")
                setShowOptions(false)
              }}
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#D4AF37]/20 w-full"
            >
              <Flag className="w-5 h-5 text-[#D4AF37]" />
              <span>إبلاغ</span>
            </button>
          </div>
        )}

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-white text-sm bg-black/50 px-3 py-1 rounded-full pointer-events-none">
          {currentIndex + 1} / {services.length}
        </div>

        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 text-white/50 text-xs pointer-events-none">
          اسحب للأعلى أو الأسفل
        </div>
      </div>

      {!showComments && (
        <div className="w-full bg-black px-4 py-3 safe-area-bottom">
          <button
            onClick={handleRequestService}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-black font-bold py-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-lg shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            <Send className="w-6 h-6" />
            اطلب الآن
          </button>
        </div>
      )}

      {showComments && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[60vh] bg-black/95 z-50 flex flex-col rounded-t-3xl shadow-2xl"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-[#D4AF37]/30">
            <h3 className="text-[#D4AF37] font-bold text-lg">التعليقات</h3>
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B38C8A] flex items-center justify-center text-white text-sm flex-shrink-0">
                      {comment.username?.[0] || "؟"}
                    </div>
                    <div>
                      <p className="text-[#D4AF37] font-semibold text-sm">{comment.username || "مستخدم"}</p>
                      <p className="text-white/80 text-sm">{comment.comment_text || comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {userId && (
            <div className="p-4 border-t border-[#D4AF37]/30 flex gap-2 safe-area-bottom">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتب تعليق..."
                className="flex-1 bg-white/10 text-white border border-[#D4AF37]/30 rounded-lg px-4 py-2 placeholder:text-white/50 focus:border-[#D4AF37] focus:outline-none"
              />
              <button
                onClick={handleAddComment}
                disabled={isSubmittingComment || !newComment.trim()}
                className="bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-black px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isSubmittingComment ? "..." : "إرسال"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TikTokServiceViewer

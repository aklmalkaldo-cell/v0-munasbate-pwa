"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  ShoppingBag,
  Send,
  User,
  SkipBack,
  SkipForward,
} from "lucide-react"
import { VerifiedBadge, isVerifiedUser } from "@/components/verified-badge"

interface ServiceContent {
  id: string
  service_id: string
  title: string
  content_type: "video" | "audio" | "image"
  content_url: string
  likes_count: number
  comments_count: number
  created_at: string
}

interface UserService {
  id: string
  user_id: string
  name: string
  description: string
  avatar_url: string
  followers_count: number
}

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  username?: string
  avatar_url?: string
}

export default function ContentViewPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string
  const contentId = params.contentId as string

  const [userId, setUserId] = useState<string | null>(null)
  const [content, setContent] = useState<ServiceContent | null>(null)
  const [service, setService] = useState<UserService | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  // حالات المشغل
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // حالات مشغل الصوت المتقدم
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // التعليقات
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id")
    setUserId(storedUserId)
    loadContent(storedUserId)
  }, [serviceId, contentId])

  const loadContent = async (currentUserId: string | null) => {
    const supabase = createClient()

    try {
      // جلب المحتوى
      const { data: contentData, error: contentError } = await supabase
        .from("user_service_content")
        .select("*")
        .eq("id", contentId)
        .single()

      if (contentError) throw contentError
      setContent(contentData)
      setLikesCount(contentData.likes_count || 0)

      // جلب بيانات الخدمة
      const { data: serviceData } = await supabase.from("user_services").select("*").eq("id", serviceId).single()

      setService(serviceData)

      // التحقق من الإعجاب والحفظ والمتابعة
      if (currentUserId) {
        const [likeResult, saveResult, followResult] = await Promise.all([
          supabase
            .from("user_service_likes")
            .select("id")
            .eq("content_id", contentId)
            .eq("user_id", currentUserId)
            .single(),
          supabase
            .from("user_service_favorites")
            .select("id")
            .eq("content_id", contentId)
            .eq("user_id", currentUserId)
            .single(),
          supabase
            .from("user_service_followers")
            .select("id")
            .eq("service_id", serviceId)
            .eq("follower_id", currentUserId)
            .single(),
        ])

        setIsLiked(!!likeResult.data)
        setIsSaved(!!saveResult.data)
        setIsFollowing(!!followResult.data)
      }

      // جلب التعليقات
      loadComments()
    } catch (error) {
      console.error("Error loading content:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    setLoadingComments(true)
    const supabase = createClient()

    try {
      const { data } = await supabase
        .from("user_service_comments")
        .select("*")
        .eq("content_id", contentId)
        .order("created_at", { ascending: false })
        .limit(50)

      if (data) {
        // جلب معلومات المستخدمين
        const userIds = [...new Set(data.map((c) => c.user_id))]
        const { data: usersData } = await supabase
          .from("app_users")
          .select("user_id, username, avatar_url")
          .in("user_id", userIds)

        const usersMap: { [key: string]: { username: string; avatar_url: string } } = {}
        usersData?.forEach((u) => {
          usersMap[u.user_id] = { username: u.username, avatar_url: u.avatar_url }
        })

        setComments(
          data.map((c) => ({
            ...c,
            username: usersMap[c.user_id]?.username || "مستخدم",
            avatar_url: usersMap[c.user_id]?.avatar_url,
          })),
        )
      }
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleLike = async () => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    const supabase = createClient()

    try {
      if (isLiked) {
        await supabase.from("user_service_likes").delete().eq("content_id", contentId).eq("user_id", userId)
        setLikesCount((prev) => prev - 1)
      } else {
        await supabase.from("user_service_likes").insert({ content_id: contentId, user_id: userId })
        setLikesCount((prev) => prev + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error("Error liking:", error)
    }
  }

  const handleSave = async () => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    const supabase = createClient()

    try {
      if (isSaved) {
        await supabase.from("user_service_favorites").delete().eq("content_id", contentId).eq("user_id", userId)
      } else {
        await supabase.from("user_service_favorites").insert({ content_id: contentId, user_id: userId })
      }
      setIsSaved(!isSaved)
    } catch (error) {
      console.error("Error saving:", error)
    }
  }

  const handleFollow = async () => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    const supabase = createClient()

    try {
      if (isFollowing) {
        await supabase.from("user_service_followers").delete().eq("service_id", serviceId).eq("follower_id", userId)
      } else {
        await supabase.from("user_service_followers").insert({ service_id: serviceId, follower_id: userId })
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error("Error following:", error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content?.title || "محتوى",
          url: window.location.href,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("تم نسخ الرابط")
    }
  }

  const handleRequestService = () => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    if (service && content) {
      const contentInfo = encodeURIComponent(
        JSON.stringify({
          type: "content_quote",
          contentId: content.id,
          contentTitle: content.title,
          contentType: content.content_type,
          contentUrl: content.content_url,
          serviceName: service.name,
        }),
      )
      router.push(`/messages/${service.user_id}?quote=${contentInfo}`)
    }
  }

  const handleAddComment = async () => {
    if (!userId || !newComment.trim()) return

    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("user_service_comments")
        .insert({
          content_id: contentId,
          user_id: userId,
          content: newComment.trim(),
        })
        .select()
        .single()

      if (error) throw error

      // جلب معلومات المستخدم
      const { data: userData } = await supabase
        .from("app_users")
        .select("username, avatar_url")
        .eq("user_id", userId)
        .single()

      setComments((prev) => [
        {
          ...data,
          username: userData?.username || "مستخدم",
          avatar_url: userData?.avatar_url,
        },
        ...prev,
      ])
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const togglePlay = () => {
    if (content?.content_type === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } else if (content?.content_type === "audio" && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
    setIsMuted(!isMuted)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration)
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0)
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
          <div className="w-10 h-10 border-3 border-[#7B68EE] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#B38C8A]">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!content || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#B38C8A] text-lg mb-4">المحتوى غير موجود</p>
          <Button onClick={() => router.back()} className="bg-[#7B68EE] hover:bg-[#6A5ACD] text-white">
            العودة
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-[#E8D8D8]">
        <div className="flex items-center justify-between p-3">
          <button onClick={() => router.back()} className="text-[#2D2D2D] p-2">
            <ChevronRight className="w-6 h-6" />
          </button>
          <h1 className="text-[#2D2D2D] font-medium truncate flex-1 text-center px-4">{content.title}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Media Section */}
      <div className="relative w-full bg-[#2D2D2D] flex items-center justify-center">
        {content.content_type === "image" && (
          <div className="w-full max-h-[50vh] flex items-center justify-center">
            <img
              src={content.content_url || "/placeholder.svg"}
              alt={content.title}
              className="max-w-full max-h-[50vh] object-contain"
            />
          </div>
        )}

        {content.content_type === "video" && (
          <div className="relative w-full aspect-video max-h-[50vh]">
            <video
              ref={videoRef}
              src={content.content_url}
              className="w-full h-full object-contain bg-black"
              playsInline
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <button onClick={togglePlay} className="bg-black/50 backdrop-blur-sm rounded-full p-3">
                {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
              </button>
              <button onClick={toggleMute} className="bg-black/50 backdrop-blur-sm rounded-full p-3">
                {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        )}

        {content.content_type === "audio" && (
          <div className="w-full py-8 flex flex-col items-center justify-center bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD]">
            <div
              className={`w-28 h-28 rounded-full bg-white/20 flex items-center justify-center mb-4 ${
                isPlaying ? "animate-pulse" : ""
              }`}
            >
              <Music className="w-14 h-14 text-white" />
            </div>

            <audio
              ref={audioRef}
              src={content.content_url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />

            {/* شريط التقدم */}
            <div className="w-full max-w-sm px-6 mb-4">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                style={{
                  background: `linear-gradient(to right, white ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%)`,
                }}
              />
              <div className="flex justify-between text-white/80 text-sm mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex items-center gap-6">
              <button
                onClick={skipBackward}
                className="bg-white/20 rounded-full p-3 active:scale-95 transition-transform"
              >
                <SkipBack className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={togglePlay}
                className="bg-white rounded-full p-4 shadow-lg active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause className="w-8 h-8 text-[#7B68EE]" /> : <Play className="w-8 h-8 text-[#7B68EE]" />}
              </button>
              <button
                onClick={skipForward}
                className="bg-white/20 rounded-full p-3 active:scale-95 transition-transform"
              >
                <SkipForward className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* زر كتم الصوت */}
            <button onClick={toggleMute} className="mt-4 bg-white/20 rounded-full p-2">
              {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="flex-1">
        <div className="p-4">
          {/* عنوان المحتوى */}
          <h2 className="text-[#2D2D2D] text-xl font-bold mb-1">{content.title}</h2>
          <p className="text-[#B38C8A] text-sm mb-4">{formatDate(content.created_at)}</p>

          {/* زر اطلب الآن */}
          {service.user_id !== userId && (
            <Button
              onClick={handleRequestService}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#C4A030] hover:to-[#A8861E] text-white py-5 rounded-xl text-lg font-bold mb-4 shadow-lg"
            >
              <ShoppingBag className="w-5 h-5 ml-2" />
              اطلب الآن
            </Button>
          )}

          <div className="flex items-center justify-center gap-8 mb-4 py-3 border-y border-[#E8D8D8]">
            <button onClick={handleLike} className="flex flex-col items-center gap-1">
              <div className={`p-2.5 rounded-full ${isLiked ? "bg-red-100" : "bg-[#F5E9E8]"}`}>
                <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-[#B38C8A]"}`} />
              </div>
              <span className="text-[#2D2D2D] text-xs">{likesCount}</span>
            </button>

            <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center gap-1">
              <div className="p-2.5 rounded-full bg-[#F5E9E8]">
                <MessageCircle className="w-5 h-5 text-[#B38C8A]" />
              </div>
              <span className="text-[#2D2D2D] text-xs">{comments.length}</span>
            </button>

            <button onClick={handleShare} className="flex flex-col items-center gap-1">
              <div className="p-2.5 rounded-full bg-[#F5E9E8]">
                <Share2 className="w-5 h-5 text-[#B38C8A]" />
              </div>
              <span className="text-[#2D2D2D] text-xs">مشاركة</span>
            </button>

            <button onClick={handleSave} className="flex flex-col items-center gap-1">
              <div className={`p-2.5 rounded-full ${isSaved ? "bg-[#7B68EE]/20" : "bg-[#F5E9E8]"}`}>
                <Bookmark className={`w-5 h-5 ${isSaved ? "fill-[#7B68EE] text-[#7B68EE]" : "text-[#B38C8A]"}`} />
              </div>
              <span className="text-[#2D2D2D] text-xs">حفظ</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                onClick={() => router.push(`/services/other/${serviceId}`)}
                className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD] flex items-center justify-center text-white overflow-hidden cursor-pointer flex-shrink-0"
              >
                {service.avatar_url ? (
                  <img
                    src={service.avatar_url || "/placeholder.svg"}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold">{service.name?.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3
                    onClick={() => router.push(`/services/other/${serviceId}`)}
                    className="text-[#2D2D2D] font-bold cursor-pointer hover:underline truncate text-sm"
                  >
                    {service.name}
                  </h3>
                  {isVerifiedUser(service.user_id) && <VerifiedBadge size={14} />}
                </div>
                <p className="text-[#B38C8A] text-xs">{service.followers_count || 0} متابع</p>
              </div>
              {/* زر المتابعة بجانب اسم الخدمة */}
              <Button
                onClick={handleFollow}
                size="sm"
                className={`flex-shrink-0 px-4 py-1.5 text-xs rounded-full ${
                  isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    : "bg-[#D4AF37] hover:bg-[#C9A227] text-white"
                }`}
              >
                {isFollowing ? "متابَع" : "متابعة"}
              </Button>
            </div>

            {service.description && <p className="text-[#666] text-sm mt-3 leading-relaxed">{service.description}</p>}
          </div>

          {/* قسم التعليقات */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center justify-between w-full text-[#2D2D2D] py-2"
            >
              <span className="font-bold">التعليقات ({comments.length})</span>
              <ChevronRight className={`w-5 h-5 transition-transform ${showComments ? "rotate-90" : ""}`} />
            </button>

            {showComments && (
              <div className="mt-4 space-y-4">
                {/* إضافة تعليق */}
                {userId && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7B68EE]/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 flex items-center gap-2 bg-[#F5E9E8] rounded-full px-4 py-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="أضف تعليقاً..."
                        className="flex-1 bg-transparent text-[#2D2D2D] placeholder-[#B38C8A] outline-none"
                        onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="text-[#7B68EE] disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* قائمة التعليقات */}
                {loadingComments ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-[#7B68EE] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-center text-[#B38C8A] py-4">لا توجد تعليقات بعد</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#7B68EE]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {comment.avatar_url ? (
                            <img
                              src={comment.avatar_url || "/placeholder.svg"}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-[#7B68EE]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[#2D2D2D] font-medium text-sm">{comment.username}</span>
                            <span className="text-[#B38C8A] text-xs">{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="text-[#666] text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

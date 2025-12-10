"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  FileVideo,
  Plus,
  Settings,
  Music,
  Video,
  ImageIcon,
  Grid3X3,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  X,
  Play,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface UserService {
  id: string
  user_id: string
  name: string // بدلاً من service_name
  description: string
  avatar_url: string | null // بدلاً من profile_image
  cover_url: string | null // بدلاً من cover_image
  followers_count: number
  content_count: number
}

interface ServiceContent {
  id: string
  title: string
  description: string
  content_type: "audio" | "video" | "image"
  file_url: string
  thumbnail_url: string | null
  likes_count: number
  comments_count: number
  views_count: number
  created_at: string
}

type FilterType = "all" | "audio" | "video" | "image"

function ServicePageContent() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const serviceId = params.serviceId as string

  const [userId, setUserId] = useState<string | null>(null)
  const [service, setService] = useState<UserService | null>(null)
  const [contents, setContents] = useState<ServiceContent[]>([])
  const [filteredContents, setFilteredContents] = useState<ServiceContent[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [selectedContent, setSelectedContent] = useState<ServiceContent | null>(null)
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({})
  const [saves, setSaves] = useState<{ [key: string]: boolean }>({})
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    const reservedPaths = ["create", "manage", "upload", "edit", "new"]
    if (reservedPaths.includes(serviceId)) {
      // هذا المسار يجب أن يُعالج بواسطة صفحة أخرى
      return
    }

    const storedUserId = localStorage.getItem("user_id")
    setUserId(storedUserId)
    loadService(storedUserId)
  }, [serviceId])

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredContents(contents)
    } else {
      setFilteredContents(contents.filter((c) => c.content_type === activeFilter))
    }
  }, [activeFilter, contents])

  const loadService = async (currentUserId: string | null) => {
    const supabase = createClient()

    try {
      // جلب بيانات الخدمة
      const { data: serviceData, error: serviceError } = await supabase
        .from("user_services")
        .select("*")
        .eq("id", serviceId)
        .single()

      if (serviceError) throw serviceError
      setService(serviceData)
      setIsOwner(currentUserId === serviceData.user_id)

      // جلب محتوى الخدمة
      const { data: contentData } = await supabase
        .from("user_service_content")
        .select("*")
        .eq("user_service_id", serviceId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      setContents(contentData || [])
      setFilteredContents(contentData || [])

      // التحقق من المتابعة
      if (currentUserId) {
        const { data: followData } = await supabase
          .from("user_service_follows")
          .select("id")
          .eq("user_service_id", serviceId)
          .eq("follower_user_id", currentUserId)
          .single()

        setIsFollowing(!!followData)

        // جلب الإعجابات والحفظ
        if (contentData) {
          const contentIds = contentData.map((c) => c.id)

          const { data: likesData } = await supabase
            .from("user_service_content_likes")
            .select("content_id")
            .eq("user_id", currentUserId)
            .in("content_id", contentIds)

          const { data: savesData } = await supabase
            .from("user_service_content_saves")
            .select("content_id")
            .eq("user_id", currentUserId)
            .in("content_id", contentIds)

          const likesMap: { [key: string]: boolean } = {}
          const savesMap: { [key: string]: boolean } = {}

          likesData?.forEach((l) => (likesMap[l.content_id] = true))
          savesData?.forEach((s) => (savesMap[s.content_id] = true))

          setLikes(likesMap)
          setSaves(savesMap)
        }
      }
    } catch (error) {
      console.error("Error loading service:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!userId) {
      alert("يجب تسجيل الدخول للمتابعة")
      return
    }

    const supabase = createClient()

    if (isFollowing) {
      await supabase
        .from("user_service_follows")
        .delete()
        .eq("user_service_id", serviceId)
        .eq("follower_user_id", userId)
    } else {
      await supabase.from("user_service_follows").insert({ user_service_id: serviceId, follower_user_id: userId })
    }

    setIsFollowing(!isFollowing)
    if (service) {
      setService({
        ...service,
        followers_count: isFollowing ? service.followers_count - 1 : service.followers_count + 1,
      })
    }
  }

  const handleLike = async (contentId: string) => {
    if (!userId) {
      alert("يجب تسجيل الدخول للإعجاب")
      return
    }

    const supabase = createClient()
    const isLiked = likes[contentId]

    if (isLiked) {
      await supabase.from("user_service_content_likes").delete().eq("content_id", contentId).eq("user_id", userId)
    } else {
      await supabase.from("user_service_content_likes").insert({ content_id: contentId, user_id: userId })
    }

    setLikes({ ...likes, [contentId]: !isLiked })

    // تحديث العداد في المحتوى المحدد
    if (selectedContent?.id === contentId) {
      setSelectedContent({
        ...selectedContent,
        likes_count: isLiked ? selectedContent.likes_count - 1 : selectedContent.likes_count + 1,
      })
    }
  }

  const handleSave = async (contentId: string) => {
    if (!userId) {
      alert("يجب تسجيل الدخول للحفظ")
      return
    }

    const supabase = createClient()
    const isSaved = saves[contentId]

    if (isSaved) {
      await supabase.from("user_service_content_saves").delete().eq("content_id", contentId).eq("user_id", userId)
    } else {
      await supabase.from("user_service_content_saves").insert({ content_id: contentId, user_id: userId })
    }

    setSaves({ ...saves, [contentId]: !isSaved })
  }

  const handleRequestService = () => {
    if (!userId) {
      alert("يجب تسجيل الدخول أولاً")
      router.push("/auth/login")
      return
    }

    if (!service || !selectedContent) return

    if (service.user_id === userId) {
      alert("لا يمكنك مراسلة نفسك")
      return
    }

    const contentData = {
      id: selectedContent.id,
      title: selectedContent.title,
      media_url: selectedContent.file_url,
      content_type: selectedContent.content_type,
      service_name: service.name,
    }

    const encodedContent = encodeURIComponent(JSON.stringify(contentData))
    const returnPath = encodeURIComponent(pathname)

    router.push(`/messages/${service.user_id}?service=${encodedContent}&return=${returnPath}`)
  }

  const loadComments = async (contentId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("user_service_content_comments")
      .select("*")
      .eq("content_id", contentId)
      .order("created_at", { ascending: false })

    setComments(data || [])
  }

  const handleAddComment = async () => {
    if (!userId || !newComment.trim() || !selectedContent) return

    const supabase = createClient()
    const username = localStorage.getItem("username") || "مستخدم"

    await supabase.from("user_service_content_comments").insert({
      content_id: selectedContent.id,
      user_id: userId,
      username: username,
      content: newComment.trim(),
    })

    setNewComment("")
    loadComments(selectedContent.id)

    // تحديث العداد
    setSelectedContent({
      ...selectedContent,
      comments_count: selectedContent.comments_count + 1,
    })
  }

  const filters: { type: FilterType; label: string; icon: any }[] = [
    { type: "all", label: "الكل", icon: Grid3X3 },
    { type: "video", label: "فيديوهات", icon: Video },
    { type: "audio", label: "صوتيات", icon: Music },
    { type: "image", label: "صور", icon: ImageIcon },
  ]

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />
      case "audio":
        return <Music className="w-5 h-5" />
      case "image":
        return <ImageIcon className="w-5 h-5" />
      default:
        return <FileVideo className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#7B68EE] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#B38C8A] mb-4">الخدمة غير موجودة</p>
          <Button onClick={() => router.back()}>العودة</Button>
        </div>
      </div>
    )
  }

  // عرض المحتوى المحدد (YouTube Style)
  if (selectedContent) {
    return (
      <div className="min-h-screen bg-black">
        {/* زر الإغلاق */}
        <button
          onClick={() => {
            setSelectedContent(null)
            setShowComments(false)
          }}
          className="absolute top-4 right-4 z-50 text-white bg-black/50 rounded-full p-2"
        >
          <X className="w-6 h-6" />
        </button>

        {/* مشغل المحتوى */}
        <div className="w-full h-[50vh] bg-black flex items-center justify-center">
          {selectedContent.content_type === "video" ? (
            <video src={selectedContent.file_url} controls autoPlay className="w-full h-full object-contain" />
          ) : selectedContent.content_type === "audio" ? (
            <div className="text-center text-white p-8">
              <div className="w-32 h-32 bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD] rounded-full mx-auto mb-6 flex items-center justify-center">
                <Music className="w-16 h-16" />
              </div>
              <h2 className="text-xl font-bold mb-4">{selectedContent.title}</h2>
              <audio src={selectedContent.file_url} controls autoPlay className="w-full max-w-md" />
            </div>
          ) : (
            <Image
              src={selectedContent.file_url || "/placeholder.svg"}
              alt={selectedContent.title}
              fill
              className="object-contain"
            />
          )}
        </div>

        {/* تفاصيل المحتوى */}
        <div className="bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] min-h-[50vh] p-4">
          {/* العنوان والوصف */}
          <h1 className="text-xl font-bold text-[#B38C8A] mb-2">{selectedContent.title}</h1>
          {selectedContent.description && <p className="text-[#B38C8A]/70 mb-4">{selectedContent.description}</p>}

          {/* معلومات الخدمة */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#B38C8A]/10">
            <div className="w-12 h-12 rounded-full bg-[#7B68EE] flex items-center justify-center overflow-hidden">
              {service.avatar_url ? (
                <Image
                  src={service.avatar_url || "/placeholder.svg"}
                  alt="profile"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <span className="text-white font-bold">{service.name[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#B38C8A]">{service.name}</h3>
              <p className="text-sm text-[#B38C8A]/60">{service.followers_count} متابع</p>
            </div>
            {!isOwner && (
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
                className={isFollowing ? "border-[#7B68EE] text-[#7B68EE]" : "bg-[#7B68EE]"}
              >
                {isFollowing ? "متابَع" : "متابعة"}
              </Button>
            )}
          </div>

          {/* أزرار التفاعل */}
          <div className="flex items-center justify-around mb-4">
            <button onClick={() => handleLike(selectedContent.id)} className="flex flex-col items-center gap-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${likes[selectedContent.id] ? "bg-red-500 text-white" : "bg-[#B38C8A]/10 text-[#B38C8A]"}`}
              >
                <Heart className="w-5 h-5" fill={likes[selectedContent.id] ? "white" : "none"} />
              </div>
              <span className="text-xs text-[#B38C8A]">{selectedContent.likes_count}</span>
            </button>

            <button
              onClick={() => {
                loadComments(selectedContent.id)
                setShowComments(true)
              }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-[#B38C8A]/10 flex items-center justify-center text-[#B38C8A]">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs text-[#B38C8A]">{selectedContent.comments_count}</span>
            </button>

            <button onClick={() => handleSave(selectedContent.id)} className="flex flex-col items-center gap-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${saves[selectedContent.id] ? "bg-[#D4AF37] text-white" : "bg-[#B38C8A]/10 text-[#B38C8A]"}`}
              >
                <Bookmark className="w-5 h-5" fill={saves[selectedContent.id] ? "white" : "none"} />
              </div>
              <span className="text-xs text-[#B38C8A]">حفظ</span>
            </button>
          </div>

          {/* زر طلب الخدمة */}
          {!isOwner && (
            <Button
              onClick={handleRequestService}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-white py-6 rounded-xl text-lg font-bold gap-2"
            >
              <Send className="w-5 h-5" />
              طلب الخدمة
            </Button>
          )}
        </div>

        {/* نافذة التعليقات */}
        {showComments && (
          <div className="fixed bottom-0 left-0 right-0 h-[60vh] bg-white z-50 rounded-t-3xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-[#B38C8A]">التعليقات</h3>
              <button onClick={() => setShowComments(false)}>
                <X className="w-6 h-6 text-[#B38C8A]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {comments.length === 0 ? (
                <p className="text-center text-[#B38C8A]/50 py-8">لا توجد تعليقات</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#B38C8A] flex items-center justify-center text-white text-sm">
                        {comment.username?.[0] || "؟"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#B38C8A]">{comment.username}</p>
                        <p className="text-[#B38C8A]/80 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {userId && (
              <div className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب تعليق..."
                  className="flex-1 bg-[#F5E9E8] rounded-lg px-4 py-2 text-[#B38C8A]"
                />
                <Button onClick={handleAddComment} className="bg-[#7B68EE]">
                  إرسال
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] pb-24">
      <TopHeader />

      <main className="pt-16">
        {/* صورة الغلاف */}
        <div className="relative h-40 bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD]">
          {service.cover_url && (
            <Image src={service.cover_url || "/placeholder.svg"} alt="cover" fill className="object-cover" />
          )}
          <button
            onClick={() => router.back()}
            className="absolute top-4 right-4 bg-black/30 text-white rounded-full p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {isOwner && (
            <Link
              href={`/services/other/${serviceId}/manage`}
              className="absolute top-4 left-4 bg-black/30 text-white rounded-full p-2"
            >
              <Settings className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* معلومات الخدمة */}
        <div className="px-4 pb-4 -mt-12 relative">
          <div className="flex items-end gap-4 mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-[#B38C8A] flex items-center justify-center overflow-hidden">
              {service.avatar_url ? (
                <Image
                  src={service.avatar_url || "/placeholder.svg"}
                  alt="profile"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <span className="text-white text-3xl font-bold">{service.name[0]}</span>
              )}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-xl font-bold text-[#B38C8A]">{service.name}</h1>
              <div className="flex items-center gap-4 text-sm text-[#B38C8A]/60">
                <span>{service.followers_count} متابع</span>
                <span>{service.content_count} محتوى</span>
              </div>
            </div>
          </div>

          {service.description && <p className="text-[#B38C8A]/70 mb-4">{service.description}</p>}

          {/* أزرار الإجراءات */}
          <div className="flex gap-3">
            {isOwner ? (
              <Link href={`/services/other/${serviceId}/upload`} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-[#7B68EE] to-[#6A5ACD] text-white gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة محتوى
                </Button>
              </Link>
            ) : (
              <Button
                onClick={handleFollow}
                className={`flex-1 ${isFollowing ? "bg-white border border-[#7B68EE] text-[#7B68EE]" : "bg-[#7B68EE] text-white"}`}
              >
                {isFollowing ? "متابَع" : "متابعة"}
              </Button>
            )}
          </div>
        </div>

        {/* فلاتر المحتوى */}
        <div className="px-4 border-b border-[#B38C8A]/10">
          <div className="flex gap-2 overflow-x-auto py-3">
            {filters.map((filter) => (
              <button
                key={filter.type}
                onClick={() => setActiveFilter(filter.type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  activeFilter === filter.type
                    ? "bg-[#7B68EE] text-white"
                    : "bg-white text-[#B38C8A] border border-[#B38C8A]/20"
                }`}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* شبكة المحتوى */}
        <div className="px-4 py-4">
          {filteredContents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#7B68EE]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FileVideo className="w-8 h-8 text-[#7B68EE]/50" />
              </div>
              <p className="text-[#B38C8A]/60">لا يوجد محتوى</p>
              {isOwner && (
                <Link href={`/services/other/${serviceId}/upload`}>
                  <Button className="mt-4 bg-[#7B68EE]">إضافة أول محتوى</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredContents.map((content) => (
                <button
                  key={content.id}
                  onClick={() => setSelectedContent(content)}
                  className="relative aspect-square bg-[#B38C8A]/10 rounded-xl overflow-hidden group"
                >
                  {content.content_type === "image" ? (
                    <Image
                      src={content.file_url || "/placeholder.svg"}
                      alt={content.title}
                      fill
                      className="object-cover"
                    />
                  ) : content.thumbnail_url ? (
                    <Image
                      src={content.thumbnail_url || "/placeholder.svg"}
                      alt={content.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD]">
                      {getContentIcon(content.content_type)}
                    </div>
                  )}

                  {/* أيقونة نوع المحتوى */}
                  <div className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5">
                    {getContentIcon(content.content_type)}
                  </div>

                  {/* Overlay على Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>

                  {/* العنوان */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-sm font-medium line-clamp-1">{content.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default function ServicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[#7B68EE] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ServicePageContent />
    </Suspense>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  Settings,
  Upload,
  Heart,
  MessageCircle,
  Play,
  Video,
  Music,
  ImageIcon,
  Grid3X3,
  Users,
} from "lucide-react"
import { VerifiedBadge, isVerifiedUser } from "@/components/verified-badge"

interface UserService {
  id: string
  user_id: string
  name: string
  description: string
  avatar_url: string
  cover_url: string
  followers_count: number
  content_count: number
  created_at: string
}

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

type FilterType = "all" | "video" | "audio" | "image"

export default function ServicePage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string

  const [userId, setUserId] = useState<string | null>(null)
  const [service, setService] = useState<UserService | null>(null)
  const [contents, setContents] = useState<ServiceContent[]>([])
  const [filteredContents, setFilteredContents] = useState<ServiceContent[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({})
  const [saves, setSaves] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const reservedWords = ["create", "manage", "upload", "edit", "new"]
    if (reservedWords.includes(serviceId?.toLowerCase())) {
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
      const { data: serviceData, error: serviceError } = await supabase
        .from("user_services")
        .select("*")
        .eq("id", serviceId)
        .single()

      if (serviceError) throw serviceError
      setService(serviceData)
      setIsOwner(currentUserId === serviceData.user_id)

      const { data: contentData, error: contentError } = await supabase
        .from("user_service_content")
        .select("*")
        .eq("service_id", serviceId)
        .order("created_at", { ascending: false })

      console.log("[v0] Content query result:", { contentData, contentError })

      setContents(contentData || [])
      setFilteredContents(contentData || [])

      if (currentUserId) {
        const { data: followData } = await supabase
          .from("user_service_followers")
          .select("id")
          .eq("service_id", serviceId)
          .eq("follower_id", currentUserId)
          .single()

        setIsFollowing(!!followData)

        if (contentData && contentData.length > 0) {
          const contentIds = contentData.map((c) => c.id)

          const { data: likesData } = await supabase
            .from("user_service_likes")
            .select("content_id")
            .eq("user_id", currentUserId)
            .in("content_id", contentIds)

          const { data: savesData } = await supabase
            .from("user_service_favorites")
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
      router.push("/auth/login")
      return
    }

    const supabase = createClient()

    try {
      if (isFollowing) {
        await supabase.from("user_service_followers").delete().eq("service_id", serviceId).eq("follower_id", userId)
      } else {
        await supabase.from("user_service_followers").insert({
          service_id: serviceId,
          follower_id: userId,
        })
      }
      setIsFollowing(!isFollowing)

      if (service) {
        setService({
          ...service,
          followers_count: isFollowing ? service.followers_count - 1 : service.followers_count + 1,
        })
      }
    } catch (error) {
      console.error("Error following:", error)
    }
  }

  const handleLike = async (contentId: string) => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    const supabase = createClient()
    const isLiked = likes[contentId]

    try {
      if (isLiked) {
        await supabase.from("user_service_likes").delete().eq("content_id", contentId).eq("user_id", userId)
      } else {
        await supabase.from("user_service_likes").insert({
          content_id: contentId,
          user_id: userId,
        })
      }

      setLikes((prev) => ({ ...prev, [contentId]: !isLiked }))

      setContents((prev) =>
        prev.map((c) =>
          c.id === contentId ? { ...c, likes_count: isLiked ? c.likes_count - 1 : c.likes_count + 1 } : c,
        ),
      )
    } catch (error) {
      console.error("Error liking:", error)
    }
  }

  const handleSave = async (contentId: string) => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    const supabase = createClient()
    const isSaved = saves[contentId]

    try {
      if (isSaved) {
        await supabase.from("user_service_favorites").delete().eq("content_id", contentId).eq("user_id", userId)
      } else {
        await supabase.from("user_service_favorites").insert({
          content_id: contentId,
          user_id: userId,
        })
      }

      setSaves((prev) => ({ ...prev, [contentId]: !isSaved }))
    } catch (error) {
      console.error("Error saving:", error)
    }
  }

  const handleRequestService = (content: ServiceContent) => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    if (service) {
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

  const filters: { type: FilterType; label: string; icon: any }[] = [
    { type: "all", label: "الكل", icon: Grid3X3 },
    { type: "video", label: "فيديو", icon: Video },
    { type: "audio", label: "صوت", icon: Music },
    { type: "image", label: "صور", icon: ImageIcon },
  ]

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

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#B38C8A] text-lg mb-4">الخدمة غير موجودة</p>
          <Button onClick={() => router.push("/services/other")} className="bg-[#7B68EE]">
            العودة للخدمات
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8]">
      <TopHeader />

      <main className="pt-16 pb-24">
        <div className="relative h-40 bg-gradient-to-r from-[#7B68EE] to-[#6A5ACD]">
          {service.cover_url && (
            <img src={service.cover_url || "/placeholder.svg"} alt="cover" className="w-full h-full object-cover" />
          )}
          <button
            onClick={() => router.back()}
            className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white rounded-full p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {isOwner && (
            <div className="absolute top-4 left-4 flex gap-2">
              <button
                onClick={() => router.push(`/services/other/${serviceId}/upload`)}
                className="bg-black/30 backdrop-blur-sm text-white rounded-full p-2"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push(`/services/other/${serviceId}/manage`)}
                className="bg-black/30 backdrop-blur-sm text-white rounded-full p-2"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="px-4 -mt-12 relative z-10">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD] flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0">
                {service.avatar_url ? (
                  <img
                    src={service.avatar_url || "/placeholder.svg"}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  service.name?.charAt(0)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#2D2D2D] truncate">{service.name}</h1>
                  {isVerifiedUser(service.user_id) && <VerifiedBadge size={20} />}
                </div>
                <p className="text-[#B38C8A] text-sm mt-1 line-clamp-2">{service.description}</p>

                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1 text-[#7B68EE]">
                    <Users className="w-4 h-4" />
                    <span>{service.followers_count || 0} متابع</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#B38C8A]">
                    <Grid3X3 className="w-4 h-4" />
                    <span>{contents.length} محتوى</span>
                  </div>
                </div>
              </div>
            </div>

            {!isOwner && (
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleFollow}
                  className={`flex-1 ${
                    isFollowing
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-[#7B68EE] hover:bg-[#6A5ACD] text-white"
                  }`}
                >
                  {isFollowing ? "إلغاء المتابعة" : "متابعة"}
                </Button>
                <Button
                  onClick={() => router.push(`/messages/${service.user_id}`)}
                  variant="outline"
                  className="flex-1 border-[#7B68EE] text-[#7B68EE]"
                >
                  <MessageCircle className="w-4 h-4 ml-2" />
                  تواصل
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 mt-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter.type}
                onClick={() => setActiveFilter(filter.type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeFilter === filter.type
                    ? "bg-[#7B68EE] text-white"
                    : "bg-white text-[#B38C8A] border border-[#B38C8A]/20"
                }`}
              >
                <filter.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 mt-4">
          {filteredContents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#7B68EE]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid3X3 className="w-8 h-8 text-[#7B68EE]/50" />
              </div>
              <p className="text-[#B38C8A]">لا يوجد محتوى حتى الآن</p>
              {isOwner && (
                <Button
                  onClick={() => router.push(`/services/other/${serviceId}/upload`)}
                  className="mt-4 bg-[#7B68EE]"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  أضف محتوى
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredContents.map((content) => (
                <div
                  key={content.id}
                  onClick={() => router.push(`/services/other/${serviceId}/content/${content.id}`)}
                  className="relative aspect-square rounded-xl overflow-hidden bg-white shadow-sm cursor-pointer group"
                >
                  {content.content_type === "image" && (
                    <img
                      src={content.content_url || "/placeholder.svg"}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {content.content_type === "video" && (
                    <div className="relative w-full h-full bg-black">
                      <video src={content.content_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  )}
                  {content.content_type === "audio" && (
                    <div className="w-full h-full bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD] flex items-center justify-center">
                      <Music className="w-12 h-12 text-white/80" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate">{content.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-white/80 text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {content.likes_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

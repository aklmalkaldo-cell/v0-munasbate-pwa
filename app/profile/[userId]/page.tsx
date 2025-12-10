"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, MessageCircle, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { VerifiedBadge, isVerifiedUser } from "@/components/verified-badge"

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const profileUserId = params.userId as string
  const supabase = createClient()

  const [userData, setUserData] = useState<any>(null)
  const [postsCount, setPostsCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [posts, setPosts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"posts" | "services">("posts")
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    setCurrentUserId(userId)

    if (userId === profileUserId) {
      router.push("/profile")
      return
    }

    loadProfile()
  }, [profileUserId])

  const loadProfile = async () => {
    try {
      const { data: user, error } = await supabase.from("app_users").select("*").eq("user_id", profileUserId).single()

      if (error || !user) {
        router.push("/home")
        return
      }

      setUserData(user)
      setFollowersCount(user.followers_count || 0)
      setFollowingCount(user.following_count || 0)

      const { data: userPosts } = await supabase
        .from("posts")
        .select("*")
        .eq("author_user_id", profileUserId)
        .order("created_at", { ascending: false })

      setPosts(userPosts || [])
      setPostsCount(userPosts?.length || 0)

      const { data: userServices } = await supabase
        .from("services")
        .select("*")
        .eq("publisher_user_id", profileUserId)
        .order("created_at", { ascending: false })

      setServices(userServices || [])

      const currentId = localStorage.getItem("user_id")
      if (currentId) {
        const { data: followData } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_user_id", currentId)
          .eq("following_user_id", profileUserId)
          .maybeSingle()

        setIsFollowing(!!followData)
      }

      setIsLoading(false)
    } catch (error) {
      console.log("[v0] خطأ في تحميل الملف الشخصي:", error)
      setIsLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUserId) {
      alert("يجب تسجيل الدخول للمتابعة")
      return
    }

    setIsFollowLoading(true)

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_user_id", currentUserId)
          .eq("following_user_id", profileUserId)

        if (error) throw error

        setIsFollowing(false)
      } else {
        const { error } = await supabase.from("follows").insert({
          follower_user_id: currentUserId,
          following_user_id: profileUserId,
        })

        if (error) throw error

        setIsFollowing(true)

        await supabase.from("notifications").insert({
          user_id: profileUserId,
          type: "follow",
          from_user_id: currentUserId,
        })
      }

      const { data: updatedUser } = await supabase
        .from("app_users")
        .select("followers_count, following_count")
        .eq("user_id", profileUserId)
        .single()

      if (updatedUser) {
        setFollowersCount(updatedUser.followers_count || 0)
        setFollowingCount(updatedUser.following_count || 0)
      }
    } catch (error) {
      console.log("[v0] خطأ في المتابعة:", error)
      alert("حدث خطأ")
    } finally {
      setIsFollowLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <p className="text-[#B38C8A]">المستخدم غير موجود</p>
      </div>
    )
  }

  const displayItems = activeTab === "posts" ? posts : services

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-16 max-w-screen-xl mx-auto">
        <div className="px-4 py-2">
          <button onClick={() => router.push("/home")} className="flex items-center gap-1 text-[#B38C8A]">
            <ChevronRight className="w-5 h-5" />
            <span>رجوع</span>
          </button>
        </div>

        <div className="relative h-40 bg-gradient-to-br from-[#F5E9E8] to-[#B38C8A]/20">
          {userData?.cover_url && (
            <Image src={userData.cover_url || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
          )}
        </div>

        <div className="px-4 -mt-16 relative">
          <div className="flex items-end justify-between mb-4">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
              {userData?.avatar_url ? (
                <Image
                  src={userData.avatar_url || "/placeholder.svg"}
                  alt={userData.username}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#F5E9E8] flex items-center justify-center text-3xl font-bold text-[#D4AF37]">
                  {userData?.username?.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`rounded-xl gap-2 ${
                  isFollowing
                    ? "bg-[#B38C8A]/20 text-[#B38C8A] hover:bg-[#B38C8A]/30"
                    : "bg-[#D4AF37] text-white hover:bg-[#C49F27]"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    إلغاء المتابعة
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    متابعة
                  </>
                )}
              </Button>

              <Link href={`/messages/${profileUserId}`}>
                <Button variant="outline" className="border-[#B38C8A] text-[#B38C8A] rounded-xl bg-transparent">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#B38C8A]">{userData?.username}</h1>
              {isVerifiedUser(userData?.user_id) && <VerifiedBadge size={24} />}
            </div>
            <p className="text-sm text-[#B38C8A]/70 mb-2">@{userData?.user_id}</p>
            {userData?.bio && <p className="text-sm text-[#B38C8A] leading-relaxed">{userData.bio}</p>}
          </div>

          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-[#B38C8A]/20">
            <div className="text-center">
              <p className="text-xl font-bold text-[#B38C8A]">{postsCount}</p>
              <p className="text-sm text-[#B38C8A]/70">منشور</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#B38C8A]">{followersCount}</p>
              <p className="text-sm text-[#B38C8A]/70">متابع</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#B38C8A]">{followingCount}</p>
              <p className="text-sm text-[#B38C8A]/70">يتابع</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex border-b border-[#B38C8A]/20">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "posts" ? "text-[#D4AF37] border-b-2 border-[#D4AF37]" : "text-[#B38C8A]/70"
                }`}
              >
                المنشورات ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "services" ? "text-[#D4AF37] border-b-2 border-[#D4AF37]" : "text-[#B38C8A]/70"
                }`}
              >
                الخدمات ({services.length})
              </button>
            </div>
          </div>

          {displayItems && displayItems.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 mb-6">
              {displayItems.map((item) => (
                <div key={item.id} className="aspect-square bg-white rounded-lg overflow-hidden relative group">
                  {activeTab === "posts" ? (
                    item.image_url ? (
                      <Image
                        src={item.image_url || "/placeholder.svg"}
                        alt="Post"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full p-2 flex items-center justify-center text-xs text-[#B38C8A] line-clamp-4">
                        {item.content}
                      </div>
                    )
                  ) : item.file_url ? (
                    <video src={item.file_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <div className="w-full h-full p-2 flex items-center justify-center text-xs text-[#B38C8A]">
                      {item.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center mb-6">
              <p className="text-[#B38C8A]/70">{activeTab === "posts" ? "لم ينشر شيئاً بعد" : "لم ينشر خدمات بعد"}</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Settings, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [userData, setUserData] = useState<any>(null)
  const [postsCount, setPostsCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [posts, setPosts] = useState<any[]>([])
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts")
  const [profileLoading, setProfileLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const userId = localStorage.getItem("user_id")
    const isGuest = localStorage.getItem("is_guest") === "true"

    if (!userId || isGuest) {
      router.replace("/")
      return
    }

    setCurrentUserId(userId)

    try {
      const { data: user, error } = await supabase
        .from("app_users")
        .select("user_id, username, avatar_url, cover_url, bio")
        .eq("user_id", userId)
        .single()

      if (error) throw error

      setUserData(user)
      setProfileLoading(false)

      loadUserPosts(userId)
    } catch (error) {
      setProfileLoading(false)
    }
  }

  const loadUserPosts = async (userId: string) => {
    try {
      const { data: userPosts } = await supabase
        .from("posts")
        .select("id, content, image_url")
        .eq("author_user_id", userId)
        .order("created_at", { ascending: false })

      setPosts(userPosts || [])
      setPostsCount(userPosts?.length || 0)

      const { data: saved } = await supabase.from("saved_posts").select("post_id").eq("user_id", userId)

      if (saved && saved.length > 0) {
        const postIds = saved.map((s) => s.post_id)
        const { data: savedPostsData } = await supabase.from("posts").select("id, content, image_url").in("id", postIds)

        setSavedPosts(savedPostsData || [])
      }
    } catch (error) {
      // تجاهل الخطأ
    } finally {
      setPostsLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا المنشور؟")
    if (!confirmed) return

    try {
      await supabase.from("post_likes").delete().eq("post_id", postId)
      await supabase.from("post_comments").delete().eq("post_id", postId)
      await supabase.from("saved_posts").delete().eq("post_id", postId)

      const { error } = await supabase.from("posts").delete().eq("id", postId)

      if (error) throw error

      setPosts(posts.filter((p) => p.id !== postId))
      setPostsCount((prev) => prev - 1)

      alert("تم حذف المنشور بنجاح")
    } catch (error) {
      alert("حدث خطأ في حذف المنشور")
    }
  }

  const displayPosts = activeTab === "posts" ? posts : savedPosts

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-16 max-w-screen-xl mx-auto">
        <div className="relative h-48 bg-gradient-to-br from-[#F5E9E8] to-[#B38C8A]/20">
          {userData?.cover_url && (
            <Image src={userData.cover_url || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
          )}
        </div>

        <div className="px-4 -mt-16 relative">
          <div className="flex items-end justify-between mb-4">
            {profileLoading ? (
              <div className="w-32 h-32 rounded-full bg-white animate-pulse" />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                {userData?.avatar_url ? (
                  <Image
                    src={userData.avatar_url || "/placeholder.svg"}
                    alt={userData.username}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#F5E9E8] flex items-center justify-center text-4xl font-bold text-[#D4AF37]">
                    {userData?.username?.charAt(0)}
                  </div>
                )}
              </div>
            )}

            <Link href="/profile/settings">
              <Button variant="outline" size="sm" className="border-[#B38C8A] text-[#B38C8A] bg-white">
                <Settings className="w-4 h-4 ml-2" />
                تعديل الملف
              </Button>
            </Link>
          </div>

          <div className="mb-4">
            {profileLoading ? (
              <>
                <div className="h-7 w-40 bg-[#B38C8A]/20 rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-24 bg-[#B38C8A]/10 rounded-lg animate-pulse" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-[#B38C8A] mb-1">{userData?.username}</h1>
                <p className="text-sm text-[#B38C8A]/70 mb-2">@{userData?.user_id}</p>
                {userData?.bio && <p className="text-sm text-[#B38C8A] leading-relaxed">{userData.bio}</p>}
              </>
            )}
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
                className={`flex-1 py-3 text-sm font-medium ${activeTab === "posts" ? "text-[#D4AF37] border-b-2 border-[#D4AF37]" : "text-[#B38C8A]/70"}`}
              >
                المنشورات ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex-1 py-3 text-sm font-medium ${activeTab === "saved" ? "text-[#D4AF37] border-b-2 border-[#D4AF37]" : "text-[#B38C8A]/70"}`}
              >
                المحفوظات ({savedPosts.length})
              </button>
            </div>
          </div>

          {postsLoading ? (
            <div className="grid grid-cols-3 gap-1 mb-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-white rounded-lg animate-pulse" />
              ))}
            </div>
          ) : displayPosts && displayPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 mb-6">
              {displayPosts.map((post) => (
                <div key={post.id} className="aspect-square bg-white rounded-lg overflow-hidden relative group">
                  {post.image_url ? (
                    <Image
                      src={post.image_url || "/placeholder.svg"}
                      alt="Post"
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full p-2 flex items-center justify-center text-xs text-[#B38C8A] line-clamp-4">
                      {post.content}
                    </div>
                  )}

                  {activeTab === "posts" && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center mb-6">
              <p className="text-[#B38C8A]/70">{activeTab === "posts" ? "لم تنشر شيئاً بعد" : "لم تحفظ أي منشور بعد"}</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

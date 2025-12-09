"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { PostCard } from "@/components/post-card"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function PostsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "following">("all")

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id")
    const guestMode = localStorage.getItem("is_guest") === "true"

    if (!storedUserId) {
      router.push("/")
      return
    }

    console.log("[v0] تحميل المنشورات للمستخدم:", storedUserId)
    setUserId(storedUserId)
    setIsGuest(guestMode)
    loadPosts(storedUserId, guestMode)
  }, [router, activeTab])

  const loadPosts = async (currentUserId: string, isGuestMode: boolean) => {
    try {
      const supabase = createClient()

      console.log("[v0] جلب المنشورات من قاعدة البيانات...")

      let query = supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50)

      if (activeTab === "following" && !isGuestMode) {
        const { data: followingData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", currentUserId)

        const followingIds = followingData?.map((f) => f.following_id) || []

        if (followingIds.length === 0) {
          setPosts([])
          setLoading(false)
          return
        }

        query = query.in("author_user_id", followingIds)
      }

      const { data: postsData, error: postsError } = await query

      if (postsError) {
        console.log("[v0] خطأ في جلب المنشورات:", postsError.message)
        setPosts([])
      } else {
        const authorIds = [...new Set(postsData?.map((p) => p.author_user_id) || [])]

        const { data: authorsData } = await supabase
          .from("app_users")
          .select("user_id, username, avatar_url")
          .in("user_id", authorIds)

        const authorsMap = new Map(authorsData?.map((a) => [a.user_id, a]) || [])

        const formattedPosts =
          postsData?.map((post) => ({
            ...post,
            author: authorsMap.get(post.author_user_id)
              ? {
                  display_name: authorsMap.get(post.author_user_id)!.username,
                  avatar_url: authorsMap.get(post.author_user_id)!.avatar_url,
                  user_id: authorsMap.get(post.author_user_id)!.user_id,
                }
              : null,
          })) || []

        console.log("[v0] تم جلب المنشورات:", formattedPosts.length)
        setPosts(formattedPosts)
      }
    } catch (error: any) {
      console.log("[v0] خطأ في جلب المنشورات:", error.message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <div className="text-[#B38C8A]">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-16 max-w-screen-xl mx-auto">
        <div className="sticky top-16 bg-[#F5E9E8] z-10 border-b border-[#B38C8A]/20">
          <div className="flex">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-4 text-sm font-medium ${
                activeTab === "all" ? "text-[#D4AF37] border-b-2 border-[#D4AF37]" : "text-[#B38C8A]/70"
              }`}
            >
              لك
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 py-4 text-sm font-medium ${
                activeTab === "following" ? "text-[#D4AF37] border-b-2 border-[#D4AF37]" : "text-[#B38C8A]/70"
              }`}
            >
              متابعة
            </button>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {isGuest && (
            <div className="bg-white rounded-2xl p-6 text-center border-2 border-[#D4AF37]/30">
              <p className="text-[#B38C8A] mb-3">أنت في وضع الزائر</p>
              <Link href="/auth/signup" className="text-[#D4AF37] font-medium hover:underline">
                سجل الآن للتفاعل مع المنشورات
              </Link>
            </div>
          )}

          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} currentUserId={userId} />)
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-[#B38C8A]/70 mb-4">لا توجد منشورات حالياً</p>
              {!isGuest && (
                <Link href="/posts/create" className="text-[#D4AF37] font-medium hover:underline">
                  كن أول من ينشر
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      {!isGuest && (
        <Link
          href="/posts/create"
          className="fixed bottom-24 left-4 w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg hover:bg-[#B8941F] transition-colors z-40"
        >
          <Plus className="w-8 h-8 text-white" />
        </Link>
      )}

      <BottomNav />
    </div>
  )
}

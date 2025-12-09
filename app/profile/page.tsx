"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    console.log("[v0] تحميل الملف الشخصي...")
    const userId = localStorage.getItem("user_id")
    const isGuest = localStorage.getItem("is_guest") === "true"

    console.log("[v0] user_id:", userId)
    console.log("[v0] is_guest:", isGuest)

    if (!userId || isGuest) {
      console.log("[v0] زائر أو غير مسجل، العودة للصفحة الرئيسية")
      router.push("/")
      return
    }

    try {
      console.log("[v0] جلب بيانات المستخدم من قاعدة البيانات...")
      const { data: user, error } = await supabase.from("app_users").select("*").eq("user_id", userId).single()

      if (error) {
        console.error("[v0] خطأ في جلب بيانات المستخدم:", error)
        throw error
      }

      console.log("[v0] تم جلب بيانات المستخدم:", user)
      setUserData(user)

      // جلب منشورات المستخدم
      const { data: userPosts } = await supabase.from("posts").select("*").eq("author_user_id", userId)
      setPosts(userPosts || [])
      setPostsCount(userPosts?.length || 0)

      setIsLoading(false)
    } catch (error) {
      console.log("[v0] خطأ في تحميل الملف الشخصي:", error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <p className="text-[#B38C8A]">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-16 max-w-screen-xl mx-auto">
        {/* صورة الغلاف */}
        <div className="relative h-48 bg-gradient-to-br from-[#F5E9E8] to-[#B38C8A]/20">
          {userData?.cover_url && (
            <Image src={userData.cover_url || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
          )}
        </div>

        {/* معلومات الملف الشخصي */}
        <div className="px-4 -mt-16 relative">
          <div className="flex items-end justify-between mb-4">
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

            <Link href="/profile/settings">
              <Button variant="outline" size="sm" className="border-[#B38C8A] text-[#B38C8A] bg-white">
                <Settings className="w-4 h-4 ml-2" />
                تعديل الملف
              </Button>
            </Link>
          </div>

          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[#B38C8A] mb-1">{userData?.username}</h1>
            <p className="text-sm text-[#B38C8A]/70 mb-2">@{userData?.user_id}</p>
            {userData?.bio && <p className="text-sm text-[#B38C8A] leading-relaxed">{userData.bio}</p>}
          </div>

          {/* الإحصائيات */}
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

          {/* تبويبات المحتوى */}
          <div className="mb-4">
            <div className="flex border-b border-[#B38C8A]/20">
              <button className="flex-1 py-3 text-sm font-medium text-[#D4AF37] border-b-2 border-[#D4AF37]">
                المنشورات
              </button>
              <button className="flex-1 py-3 text-sm font-medium text-[#B38C8A]/70">المحفوظات</button>
            </div>
          </div>

          {/* شبكة المنشورات */}
          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 mb-6">
              {posts.map((post) => (
                <div key={post.id} className="aspect-square bg-white rounded-lg overflow-hidden">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center mb-6">
              <p className="text-[#B38C8A]/70">لم تنشر شيئاً بعد</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { PostCard } from "@/components/post-card"
import Link from "next/link"

export default async function FollowingPostsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // جلب قائمة المتابَعين
  const { data: following } = await supabase.from("follows").select("following_id").eq("follower_id", user.id)

  const followingIds = following?.map((f) => f.following_id) || []

  // جلب منشورات المتابَعين فقط
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      author:author_id (
        display_name,
        avatar_url,
        user_id
      )
    `)
    .in("author_id", followingIds)
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-16 max-w-screen-xl mx-auto">
        {/* تبويبات */}
        <div className="sticky top-16 bg-[#F5E9E8] z-10 border-b border-[#B38C8A]/20">
          <div className="flex">
            <Link href="/posts" className="flex-1 py-4 text-center">
              <span className="text-sm font-medium text-[#B38C8A]/70">لك</span>
            </Link>
            <button className="flex-1 py-4 text-sm font-medium text-[#D4AF37] border-b-2 border-[#D4AF37]">
              متابعة
            </button>
          </div>
        </div>

        {/* قائمة المنشورات */}
        <div className="px-4 py-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} />)
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-[#B38C8A]/70">لا توجد منشورات من المتابَعين</p>
              <p className="text-sm text-[#B38C8A]/50 mt-2">ابدأ بمتابعة بعض المستخدمين لترى منشوراتهم هنا</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

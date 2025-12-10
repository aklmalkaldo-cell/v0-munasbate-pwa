"use client"

import type React from "react"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Trash2, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PostDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  if (postId === "create") {
    notFound()
  }

  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id")
    const guestMode = localStorage.getItem("is_guest") === "true"

    setUserId(storedUserId)
    setIsGuest(guestMode)

    loadPostAndComments()
  }, [postId])

  const loadPostAndComments = async () => {
    const supabase = createClient()

    try {
      console.log("[v0] جلب المنشور والتعليقات")

      const { data: postData, error: postError } = await supabase.from("posts").select("*").eq("id", postId).single()

      if (postError) throw postError

      const { data: authorData } = await supabase
        .from("app_users")
        .select("user_id, username, avatar_url")
        .eq("user_id", postData.author_user_id)
        .single()

      const formattedPost = {
        ...postData,
        author: authorData
          ? {
              display_name: authorData.username,
              avatar_url: authorData.avatar_url,
              user_id: authorData.user_id,
            }
          : null,
      }

      setPost(formattedPost)

      const { data: commentsData, error: commentsError } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      if (!commentsError && commentsData) {
        const commenterIds = [...new Set(commentsData.map((c) => c.user_id))]

        if (commenterIds.length > 0) {
          const { data: commentersData } = await supabase
            .from("app_users")
            .select("user_id, username, avatar_url")
            .in("user_id", commenterIds)

          const commentersMap = new Map(commentersData?.map((a) => [a.user_id, a]) || [])

          const formattedComments = commentsData.map((comment) => ({
            ...comment,
            author: commentersMap.get(comment.user_id) || null,
          }))

          setComments(formattedComments)
        } else {
          setComments([])
        }
      }
    } catch (error: any) {
      console.log("[v0] خطأ في جلب المنشور:", error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || isGuest) {
      alert("يجب تسجيل الدخول للتعليق")
      return
    }

    if (!newComment.trim()) return

    setSubmitting(true)
    const supabase = createClient()

    try {
      console.log("[v0] إضافة تعليق")

      const { data: userData } = await supabase
        .from("app_users")
        .select("user_id, username, avatar_url")
        .eq("user_id", userId)
        .single()

      if (!userData) {
        alert("لم يتم العثور على بيانات المستخدم")
        return
      }

      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: userId,
          username: userData.username,
          content: newComment,
        })
        .select()
        .single()

      if (error) throw error

      const newCommentObj = {
        ...data,
        author: userData,
      }

      setComments((prev) => [...prev, newCommentObj])
      setNewComment("")

      try {
        if (post?.author && userId !== post.author.user_id) {
          await supabase.from("notifications").insert({
            user_id: post.author.user_id,
            type: "comment",
            from_user_id: userId,
            post_id: postId,
          })
        }
      } catch (notifError) {
        console.log("[v0] خطأ في إضافة الإشعار (غير حرج):", notifError)
      }
    } catch (error: any) {
      console.log("[v0] خطأ في إضافة التعليق:", error.message)

      let errorMessage = "حدث خطأ في إضافة التعليق"
      if (error.code === "42501") {
        errorMessage = "ليس لديك صلاحية إضافة تعليق"
      } else if (error.code === "23503") {
        errorMessage = "المنشور غير موجود"
      } else if (error.message) {
        errorMessage += ": " + error.message
      }

      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    if (!userId || !post) return

    if (post.author_user_id !== userId) {
      alert("يمكنك حذف منشوراتك فقط")
      return
    }

    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟")) return

    const supabase = createClient()

    try {
      console.log("[v0] حذف المنشور:", postId)

      const { error } = await supabase.from("posts").delete().eq("id", postId)

      if (error) throw error

      alert("تم حذف المنشور")
      router.push("/posts")
    } catch (error) {
      console.log("[v0] خطأ في حذف المنشور:", error)
      alert("حدث خطأ في حذف المنشور")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <p className="text-[#B38C8A]">جاري التحميل...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <p className="text-[#B38C8A]">المنشور غير موجود</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 max-w-screen-xl mx-auto">
        {/* العودة */}
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-2">
            <Link href="/posts">
              <ChevronRight className="w-6 h-6 text-[#B38C8A]" />
            </Link>
            <h1 className="text-xl font-bold text-[#B38C8A]">المنشور</h1>
          </div>

          {userId === post.author_user_id && (
            <Button
              onClick={handleDeletePost}
              variant="outline"
              size="sm"
              className="text-red-500 hover:bg-red-50 bg-transparent"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف
            </Button>
          )}
        </div>

        {/* المنشور */}
        <div className="px-4">
          <PostCard post={post} currentUserId={userId || undefined} />
        </div>

        {/* التعليقات */}
        <div className="px-4 mt-6">
          <h2 className="text-lg font-semibold text-[#B38C8A] mb-4">التعليقات ({comments.length})</h2>

          {/* نموذج إضافة تعليق */}
          {!isGuest ? (
            <form onSubmit={handleAddComment} className="mb-6 bg-white rounded-xl p-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتب تعليقاً..."
                className="mb-2 border-[#B38C8A]/20"
              />
              <Button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="bg-[#D4AF37] hover:bg-[#B8941F]"
              >
                <Send className="w-4 h-4 ml-2" />
                {submitting ? "جاري الإرسال..." : "إرسال"}
              </Button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-white rounded-xl text-center">
              <p className="text-[#B38C8A]">يجب تسجيل الدخول للتعليق</p>
            </div>
          )}

          {/* قائمة التعليقات */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F5E9E8] overflow-hidden flex-shrink-0">
                      {comment.author?.avatar_url ? (
                        <Image
                          src={comment.author.avatar_url || "/placeholder.svg"}
                          alt={comment.author.username}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#D4AF37]">
                          {comment.author?.username?.charAt(0) || "م"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#B38C8A] text-sm mb-1">{comment.author?.username || "مستخدم"}</p>
                      <p className="text-[#B38C8A] text-sm leading-relaxed">{comment.content}</p>
                      <p className="text-xs text-[#B38C8A]/50 mt-2">
                        {new Date(comment.created_at).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-[#B38C8A]/70 text-sm">كن أول من يعلق على هذا المنشور</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

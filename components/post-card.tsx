"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Bookmark, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { VerifiedBadge, isVerifiedUser } from "@/components/verified-badge"

interface PostCardProps {
  post: {
    id: string
    content: string
    image_url?: string
    likes_count: number
    comments_count: number
    created_at: string
    author_user_id?: string
    author?: {
      display_name: string
      avatar_url?: string
      user_id: string
    }
  }
  currentUserId?: string
  onDelete?: (postId: string) => void
}

export function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const isOwner = currentUserId && (post.author_user_id === currentUserId || post.author?.user_id === currentUserId)

  useEffect(() => {
    if (!currentUserId) return

    const checkLikeAndSave = async () => {
      const { data: likeData } = await supabase
        .from("post_likes")
        .select("*")
        .eq("user_id", currentUserId)
        .eq("post_id", post.id)
        .maybeSingle()

      if (likeData) {
        setIsLiked(true)
      }

      const { data: saveData } = await supabase
        .from("saved_posts")
        .select("*")
        .eq("user_id", currentUserId)
        .eq("post_id", post.id)
        .maybeSingle()

      if (saveData) {
        setIsSaved(true)
      }
    }

    checkLikeAndSave()
  }, [currentUserId, post.id, supabase])

  const handleDelete = async () => {
    if (!currentUserId || !isOwner) return

    const confirmed = window.confirm("هل أنت متأكد من حذف هذا المنشور؟")
    if (!confirmed) return

    setIsDeleting(true)

    try {
      await supabase.from("post_likes").delete().eq("post_id", post.id)
      await supabase.from("post_comments").delete().eq("post_id", post.id)
      await supabase.from("saved_posts").delete().eq("post_id", post.id)

      const { error } = await supabase.from("posts").delete().eq("id", post.id)

      if (error) throw error

      if (onDelete) {
        onDelete(post.id)
      }

      alert("تم حذف المنشور بنجاح")
    } catch (error) {
      console.log("[v0] خطأ في حذف المنشور:", error)
      alert("حدث خطأ في حذف المنشور")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLike = async () => {
    if (!currentUserId) {
      alert("يجب تسجيل الدخول للتفاعل مع المنشورات")
      return
    }

    try {
      if (isLiked) {
        const { error } = await supabase.from("post_likes").delete().eq("user_id", currentUserId).eq("post_id", post.id)

        if (error) throw error
        setIsLiked(false)
      } else {
        const { error } = await supabase.from("post_likes").insert({
          user_id: currentUserId,
          post_id: post.id,
        })

        if (error) throw error
        setIsLiked(true)

        if (post.author && currentUserId !== post.author.user_id) {
          await supabase.from("notifications").insert({
            user_id: post.author.user_id,
            type: "like",
            from_user_id: currentUserId,
            post_id: post.id,
          })
        }
      }

      const { data: updatedPost } = await supabase
        .from("posts")
        .select("likes_count, comments_count")
        .eq("id", post.id)
        .single()

      if (updatedPost) {
        setLikesCount(updatedPost.likes_count || 0)
        setCommentsCount(updatedPost.comments_count || 0)
      }
    } catch (error) {
      console.log("[v0] خطأ في الإعجاب:", error)
      alert("حدث خطأ في الإعجاب")
    }
  }

  const handleSave = async () => {
    if (!currentUserId) {
      alert("يجب تسجيل الدخول للتفاعل مع المنشورات")
      return
    }

    try {
      if (isSaved) {
        const { error } = await supabase
          .from("saved_posts")
          .delete()
          .eq("user_id", currentUserId)
          .eq("post_id", post.id)

        if (error) throw error

        setIsSaved(false)
      } else {
        const { error } = await supabase.from("saved_posts").insert({
          user_id: currentUserId,
          post_id: post.id,
        })

        if (error) throw error

        setIsSaved(true)
      }
    } catch (error) {
      console.log("[v0] خطأ في الحفظ:", error)
      alert("حدث خطأ في الحفظ")
    }
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
      <div className="flex items-center gap-3 p-4">
        <Link href={`/profile/${post.author?.user_id}`}>
          <div className="w-10 h-10 rounded-full bg-[#F5E9E8] overflow-hidden">
            {post.author?.avatar_url ? (
              <Image
                src={post.author.avatar_url || "/placeholder.svg"}
                alt={post.author.display_name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#D4AF37]">
                {post.author?.display_name?.charAt(0)}
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1">
          <Link href={`/profile/${post.author?.user_id}`}>
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-[#B38C8A]">{post.author?.display_name}</p>
              {isVerifiedUser(post.author?.user_id) && <VerifiedBadge size={18} />}
            </div>
          </Link>
          <p className="text-xs text-[#B38C8A]/60">{new Date(post.created_at).toLocaleDateString("ar-SA")}</p>
        </div>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-4 pb-3">
        <p className="text-[#B38C8A] leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.image_url && (
        <div className="relative w-full aspect-square">
          <Image src={post.image_url || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
        </div>
      )}

      <div className="flex items-center gap-4 p-4 border-t border-[#B38C8A]/10">
        <button onClick={handleLike} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <Heart className={`w-5 h-5 ${isLiked ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#B38C8A]"}`} />
          <span className="text-sm text-[#B38C8A]">{likesCount || 0}</span>
        </button>

        <Link href={`/posts/${post.id}`} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <MessageCircle className="w-5 h-5 text-[#B38C8A]" />
          <span className="text-sm text-[#B38C8A]">{commentsCount || 0}</span>
        </Link>

        <button onClick={handleSave} className="mr-auto hover:opacity-70 transition-opacity">
          <Bookmark className={`w-5 h-5 ${isSaved ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#B38C8A]"}`} />
        </button>
      </div>
    </div>
  )
}

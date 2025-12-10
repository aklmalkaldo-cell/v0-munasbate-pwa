"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, X, Loader2 } from "lucide-react"
import Image from "next/image"

export default function CreatePostPage() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGuest, setIsGuest] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const guestStatus = localStorage.getItem("is_guest") === "true"

    if (!userId) {
      router.push("/")
      return
    }

    setIsGuest(guestStatus)
  }, [router])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePublish = async () => {
    if (!content.trim()) {
      alert("الرجاء كتابة محتوى المنشور")
      return
    }

    if (isGuest) {
      alert("يجب تسجيل الدخول أولاً")
      router.push("/auth/login")
      return
    }

    const currentUserId = localStorage.getItem("user_id")

    setIsLoading(true)
    setUploadMessage("جاري نشر المنشور...")

    // حفظ البيانات للرفع
    const postContent = content
    const postImage = imagePreview

    // الانتقال لصفحة المنشورات فوراً
    router.push("/posts")

    // إكمال الرفع في الخلفية
    const supabase = createClient()

    try {
      const { error } = await supabase.from("posts").insert({
        author_user_id: currentUserId,
        content: postContent,
        image_url: postImage,
      })

      if (error) {
        console.log("[v0] خطأ في النشر:", error)
        // يمكن إضافة إشعار للمستخدم هنا
      }
    } catch (error: any) {
      console.error("[v0] خطأ في النشر:", error)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      {isLoading && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-[#D4AF37] text-white py-2 px-4 flex items-center justify-center gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{uploadMessage}</span>
        </div>
      )}

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => router.push("/posts")} variant="ghost" className="text-[#B38C8A]">
            إلغاء
          </Button>
          <h1 className="text-xl font-bold text-[#B38C8A]">منشور جديد</h1>
          <Button
            onClick={handlePublish}
            disabled={isLoading || !content.trim()}
            className="bg-[#D4AF37] hover:bg-[#B8941F] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري النشر
              </>
            ) : (
              "نشر"
            )}
          </Button>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="ماذا يدور في ذهنك؟"
            className="min-h-[200px] border-none focus-visible:ring-0 text-[#B38C8A] text-lg resize-none"
            maxLength={500}
          />

          {imagePreview && (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden">
              <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#B38C8A]/10">
            <label
              htmlFor="image-upload"
              className="flex items-center gap-2 cursor-pointer text-[#B38C8A] hover:text-[#D4AF37]"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-sm">إضافة صورة</span>
              <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </label>

            <span className="text-sm text-[#B38C8A]/60">{content.length}/500</span>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

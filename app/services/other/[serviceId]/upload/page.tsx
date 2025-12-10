"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Upload, Video, Music, ImageIcon, X } from "lucide-react"

type ContentType = "video" | "audio" | "image"

export default function UploadContentPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string

  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [contentType, setContentType] = useState<ContentType>("video")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id")
    if (!storedUserId) {
      router.push("/auth/login")
      return
    }
    setUserId(storedUserId)
    verifyOwnership(storedUserId)
  }, [router, serviceId])

  const verifyOwnership = async (uid: string) => {
    const supabase = createClient()
    const { data } = await supabase.from("user_services").select("user_id").eq("id", serviceId).single()

    if (!data || data.user_id !== uid) {
      router.replace(`/services/other/${serviceId}`)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)

      // معاينة الملف
      if (contentType === "image") {
        setFilePreview(URL.createObjectURL(selectedFile))
      } else if (contentType === "video") {
        setFilePreview(URL.createObjectURL(selectedFile))
      } else {
        setFilePreview(null)
      }
    }
  }

  const getAcceptedTypes = () => {
    switch (contentType) {
      case "video":
        return "video/*"
      case "audio":
        return "audio/*"
      case "image":
        return "image/*"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !file || !formData.title.trim()) {
      alert("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // رفع الملف
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      const filePath = `content/${contentType}s/${fileName}`

      const { error: uploadError } = await supabase.storage.from("user-services").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("user-services").getPublicUrl(filePath)

      // إنشاء المحتوى
      const { error: insertError } = await supabase.from("user_service_content").insert({
        user_service_id: serviceId,
        user_id: userId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        content_type: contentType,
        file_url: publicUrl,
      })

      if (insertError) throw insertError

      router.replace(`/services/other/${serviceId}`)
    } catch (error) {
      console.error("Error uploading content:", error)
      alert("حدث خطأ أثناء رفع المحتوى")
    } finally {
      setLoading(false)
    }
  }

  const contentTypes: { type: ContentType; label: string; icon: any }[] = [
    { type: "video", label: "فيديو", icon: Video },
    { type: "audio", label: "صوت", icon: Music },
    { type: "image", label: "صورة", icon: ImageIcon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8]">
      <TopHeader />

      <main className="pt-20 px-4 pb-8 max-w-screen-md mx-auto">
        {/* العنوان */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-[#B38C8A]">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-[#B38C8A]">إضافة محتوى</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اختيار نوع المحتوى */}
          <div>
            <label className="block text-sm font-medium text-[#B38C8A] mb-3">نوع المحتوى</label>
            <div className="grid grid-cols-3 gap-3">
              {contentTypes.map((ct) => (
                <button
                  key={ct.type}
                  type="button"
                  onClick={() => {
                    setContentType(ct.type)
                    setFile(null)
                    setFilePreview(null)
                  }}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    contentType === ct.type
                      ? "bg-[#7B68EE] text-white"
                      : "bg-white text-[#B38C8A] border border-[#B38C8A]/20"
                  }`}
                >
                  <ct.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{ct.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* رفع الملف */}
          <div>
            <label className="block text-sm font-medium text-[#B38C8A] mb-2">
              الملف <span className="text-red-500">*</span>
            </label>

            {file ? (
              <div className="relative">
                {contentType === "image" && filePreview && (
                  <div className="relative h-48 rounded-xl overflow-hidden">
                    <img src={filePreview || "/placeholder.svg"} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
                {contentType === "video" && filePreview && (
                  <video src={filePreview} controls className="w-full h-48 rounded-xl object-cover" />
                )}
                {contentType === "audio" && (
                  <div className="bg-[#7B68EE]/10 rounded-xl p-6 text-center">
                    <Music className="w-12 h-12 text-[#7B68EE] mx-auto mb-2" />
                    <p className="text-[#B38C8A]">{file.name}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setFilePreview(null)
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block">
                <div className="border-2 border-dashed border-[#7B68EE]/30 rounded-xl p-8 text-center cursor-pointer hover:border-[#7B68EE]/50 transition-colors">
                  <Upload className="w-10 h-10 text-[#7B68EE]/50 mx-auto mb-3" />
                  <p className="text-[#B38C8A] font-medium">اضغط لاختيار ملف</p>
                  <p className="text-sm text-[#B38C8A]/60 mt-1">
                    {contentType === "video" && "MP4, MOV, AVI"}
                    {contentType === "audio" && "MP3, WAV, M4A"}
                    {contentType === "image" && "JPG, PNG, GIF"}
                  </p>
                </div>
                <input type="file" accept={getAcceptedTypes()} onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* عنوان المحتوى */}
          <div>
            <label className="block text-sm font-medium text-[#B38C8A] mb-2">
              العنوان <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="أدخل عنوان المحتوى"
              className="bg-white border-[#B38C8A]/20"
              required
            />
          </div>

          {/* الوصف */}
          <div>
            <label className="block text-sm font-medium text-[#B38C8A] mb-2">الوصف</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="أضف وصفاً للمحتوى (اختياري)"
              className="bg-white border-[#B38C8A]/20 min-h-[100px]"
            />
          </div>

          {/* زر النشر */}
          <Button
            type="submit"
            disabled={loading || !file || !formData.title.trim()}
            className="w-full bg-gradient-to-r from-[#7B68EE] to-[#6A5ACD] hover:from-[#6A5ACD] hover:to-[#5B4BC7] text-white py-6 rounded-xl text-lg font-bold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري النشر...
              </div>
            ) : (
              "نشر المحتوى"
            )}
          </Button>
        </form>
      </main>
    </div>
  )
}

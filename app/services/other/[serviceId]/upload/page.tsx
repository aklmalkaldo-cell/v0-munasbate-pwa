"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Upload, Video, Music, ImageIcon, X, CheckCircle } from "lucide-react"

type ContentType = "video" | "audio" | "image"

export default function UploadContentPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string

  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [contentType, setContentType] = useState<ContentType>("video")
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

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
      setUploadStatus("idle")
      setErrorMessage("")

      if (contentType === "image" || contentType === "video") {
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

    if (!userId || !file || !title.trim()) {
      alert("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    setLoading(true)
    setUploadStatus("uploading")
    setUploadProgress(0)
    setErrorMessage("")

    try {
      const supabase = createClient()

      setUploadProgress(10)

      // رفع الملف
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      const filePath = `content/${contentType}s/${fileName}`

      setUploadProgress(30)

      const { error: uploadError } = await supabase.storage.from("user-services").upload(filePath, file)

      if (uploadError) {
        throw new Error("فشل رفع الملف: " + uploadError.message)
      }

      setUploadProgress(60)

      const {
        data: { publicUrl },
      } = supabase.storage.from("user-services").getPublicUrl(filePath)

      setUploadProgress(80)

      const { error: insertError } = await supabase.from("user_service_content").insert({
        service_id: serviceId,
        title: title.trim(),
        content_type: contentType,
        content_url: publicUrl,
      })

      if (insertError) {
        throw new Error("فشل حفظ المحتوى: " + insertError.message)
      }

      setUploadProgress(100)
      setUploadStatus("success")

      setTimeout(() => {
        router.replace(`/services/other/${serviceId}`)
      }, 1500)
    } catch (error: any) {
      console.error("Error uploading content:", error)
      setUploadStatus("error")
      setErrorMessage(error.message || "حدث خطأ غير متوقع")
      setUploadProgress(0)
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

      {uploadStatus === "uploading" && (
        <div className="fixed top-16 left-0 right-0 z-50 px-4 py-2 bg-white/90 backdrop-blur-sm shadow-sm">
          <div className="max-w-screen-md mx-auto">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-[#7B68EE] font-medium">جاري رفع المحتوى...</span>
              <span className="text-sm text-[#7B68EE] font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#7B68EE] to-[#6A5ACD] h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {uploadStatus === "success" && (
        <div className="fixed top-16 left-0 right-0 z-50 px-4 py-3 bg-green-500 text-white">
          <div className="max-w-screen-md mx-auto flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">تم نشر المحتوى بنجاح! جاري العودة للصفحة...</span>
          </div>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="fixed top-16 left-0 right-0 z-50 px-4 py-3 bg-red-500 text-white">
          <div className="max-w-screen-md mx-auto flex items-center justify-between">
            <span className="font-medium">{errorMessage}</span>
            <button onClick={() => setUploadStatus("idle")} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان المحتوى"
              className="bg-white border-[#B38C8A]/20"
              required
            />
          </div>

          {/* زر النشر */}
          <Button
            type="submit"
            disabled={loading || !file || !title.trim()}
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

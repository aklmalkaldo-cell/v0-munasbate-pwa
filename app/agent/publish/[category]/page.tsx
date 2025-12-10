"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, ArrowRight, CheckCircle } from "lucide-react"
import { publishService, uploadFile } from "@/lib/services"

export default function PublishPage() {
  const router = useRouter()
  const params = useParams()
  const category = params.category as string

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [occasionType, setOccasionType] = useState("")
  const [hasMusic, setHasMusic] = useState<boolean | undefined>(undefined)
  const [is3D, setIs3D] = useState<boolean | undefined>(undefined)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [publishedServiceId, setPublishedServiceId] = useState<number | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const isGuest = localStorage.getItem("is_guest") === "true"

    if (!userId || isGuest) {
      alert("يجب تسجيل الدخول للنشر")
      router.push("/")
      return
    }

    setCurrentUserId(userId)
    setIsReady(true)
  }, [router])

  const getCategoryName = () => {
    switch (category) {
      case "zaffat":
        return "زفات"
      case "sheilat":
        return "شيلات"
      case "invitations":
        return "دعوات"
      case "greetings":
        return "تهنئات"
      default:
        return "خدمة"
    }
  }

  const occasions = [
    { value: "wedding", label: "زواج" },
    { value: "graduation", label: "تخرج" },
    { value: "newborn", label: "مواليد" },
    { value: "birthday", label: "عيد ميلاد" },
    { value: "success", label: "نجاح" },
    { value: "engagement", label: "خطوبة" },
    { value: "national", label: "وطنية" },
    { value: "promotion", label: "ترقية" },
  ]

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUserId) {
      alert("يجب تسجيل الدخول")
      router.push("/")
      return
    }

    if (!title || !description || !occasionType) {
      alert("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    if ((category === "zaffat" || category === "sheilat") && hasMusic === undefined) {
      alert("يرجى تحديد ما إذا كان المحتوى يحتوي على موسيقى أم لا")
      return
    }

    if ((category === "invitations" || category === "greetings") && is3D === undefined) {
      alert("يرجى تحديد نوع التصميم (2D أو 3D)")
      return
    }

    setIsLoading(true)

    try {
      let uploadedMediaUrl = ""
      let fileType = "audio"

      if (file) {
        const extension = file.name.split(".").pop()?.toLowerCase()
        if (["mp4", "webm", "mov", "avi"].includes(extension || "")) {
          fileType = "video"
        }

        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(7)
        const fileName = `${timestamp}_${randomStr}.${extension}`
        const filePath = `services/${category}/${fileName}`

        uploadedMediaUrl = await uploadFile(file, filePath)
      } else {
        if (category === "invitations" || category === "greetings") {
          fileType = "video"
        }
      }

      const publishedService = await publishService({
        title,
        description,
        category,
        occasion: occasionType,
        has_music: hasMusic ?? null,
        is_3d: is3D ?? null,
        file_url: uploadedMediaUrl,
        file_type: fileType,
        publisher_user_id: currentUserId,
      })

      setPublishedServiceId(publishedService.id)
      setPublishSuccess(true)
    } catch (error: any) {
      alert(`حدث خطأ أثناء النشر: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const goToPublishedService = () => {
    const filterParam = hasMusic !== undefined ? `?hasMusic=${hasMusic}` : is3D !== undefined ? `?is3D=${is3D}` : ""
    router.push(`/services/${category}/${occasionType}${filterParam}`)
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <p className="text-[#B38C8A]">جاري التحميل...</p>
      </div>
    )
  }

  if (publishSuccess) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#B38C8A] mb-2">تم النشر بنجاح!</h2>
          <p className="text-gray-600 mb-6">تم نشر {getCategoryName()} الخاصة بك بنجاح</p>
          <div className="space-y-3">
            <Button onClick={goToPublishedService} className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white">
              عرض الخدمة المنشورة
            </Button>
            <Button
              onClick={() => router.push("/home")}
              variant="outline"
              className="w-full border-[#B38C8A] text-[#B38C8A]"
            >
              العودة للرئيسية
            </Button>
            <Button
              onClick={() => {
                setPublishSuccess(false)
                setTitle("")
                setDescription("")
                setOccasionType("")
                setHasMusic(undefined)
                setIs3D(undefined)
                setFile(null)
              }}
              variant="ghost"
              className="w-full text-[#B38C8A]"
            >
              نشر خدمة أخرى
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => router.push("/services")} variant="ghost" className="text-[#B38C8A] gap-2">
            <ArrowRight className="w-4 h-4" />
            رجوع
          </Button>
          <h1 className="text-xl font-bold text-[#B38C8A]">نشر {getCategoryName()}</h1>
          <div className="w-16"></div>
        </div>

        <form onSubmit={handlePublish} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div>
              <Label htmlFor="title" className="text-[#B38C8A]">
                العنوان *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان الخدمة"
                required
                className="bg-[#F5E9E8] border-[#B38C8A]/20"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-[#B38C8A]">
                الوصف *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصفاً للخدمة"
                required
                className="bg-[#F5E9E8] border-[#B38C8A]/20"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="occasion" className="text-[#B38C8A]">
                نوع المناسبة *
              </Label>
              <Select value={occasionType} onValueChange={setOccasionType}>
                <SelectTrigger className="bg-[#F5E9E8] border-[#B38C8A]/20">
                  <SelectValue placeholder="اختر نوع المناسبة" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map((occasion) => (
                    <SelectItem key={occasion.value} value={occasion.value}>
                      {occasion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(category === "zaffat" || category === "sheilat") && (
              <div>
                <Label className="text-[#B38C8A] mb-2 block">هل يحتوي على موسيقى؟ *</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setHasMusic(true)}
                    className={`flex-1 ${hasMusic === true ? "bg-[#D4AF37] text-white" : "bg-[#F5E9E8] text-[#B38C8A] hover:bg-[#E5D9D8]"}`}
                  >
                    نعم، بموسيقى
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setHasMusic(false)}
                    className={`flex-1 ${hasMusic === false ? "bg-[#D4AF37] text-white" : "bg-[#F5E9E8] text-[#B38C8A] hover:bg-[#E5D9D8]"}`}
                  >
                    لا، بدون موسيقى
                  </Button>
                </div>
              </div>
            )}

            {(category === "invitations" || category === "greetings") && (
              <div>
                <Label className="text-[#B38C8A] mb-2 block">نوع التصميم *</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setIs3D(false)}
                    className={`flex-1 ${is3D === false ? "bg-[#D4AF37] text-white" : "bg-[#F5E9E8] text-[#B38C8A] hover:bg-[#E5D9D8]"}`}
                  >
                    تصميم 2D
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIs3D(true)}
                    className={`flex-1 ${is3D === true ? "bg-[#D4AF37] text-white" : "bg-[#F5E9E8] text-[#B38C8A] hover:bg-[#E5D9D8]"}`}
                  >
                    تصميم 3D
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="file" className="text-[#B38C8A]">
                رفع الملف (فيديو أو صوت)
              </Label>
              <div className="mt-2 flex items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#B38C8A]/20 border-dashed rounded-lg cursor-pointer bg-[#F5E9E8] hover:bg-[#E5D9D8] transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-[#B38C8A]" />
                    <p className="text-sm text-[#B38C8A]">{file ? file.name : "اضغط لرفع الملف"}</p>
                    <p className="text-xs text-[#B38C8A]/50 mt-1">MP4, MOV, MP3, WAV</p>
                  </div>
                  <input
                    id="file"
                    type="file"
                    accept="video/*,audio/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white py-6 text-lg rounded-xl"
          >
            {isLoading ? "جاري النشر..." : "نشر الآن"}
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}

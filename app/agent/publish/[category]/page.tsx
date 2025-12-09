"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"

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

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const isGuest = localStorage.getItem("is_guest") === "true"

    if (!userId || isGuest) {
      alert("يجب تسجيل الدخول للنشر")
      router.push("/")
      return
    }

    setCurrentUserId(userId)
  }, [router])

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

    console.log("[v0] بداية عملية النشر")
    console.log("[v0] البيانات:", { title, description, category, occasionType, hasMusic, is3D })

    setIsLoading(true)

    const supabase = createClient()

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

        console.log("[v0] رفع ملف:", { fileName, size: file.size, type: file.type })

        const { data: uploadData, error: uploadError } = await supabase.storage.from("media").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) {
          console.log("[v0] خطأ في رفع الملف:", uploadError)
          alert("فشل رفع الملف. يرجى المحاولة مرة أخرى.")
          setIsLoading(false)
          return
        }

        const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath)
        uploadedMediaUrl = urlData.publicUrl
        console.log("[v0] URL الملف المرفوع:", uploadedMediaUrl)
      } else {
        if (category === "invitations" || category === "greetings") {
          fileType = "video"
        }
      }

      console.log("[v0] إضافة الخدمة إلى قاعدة البيانات...")

      const { data, error } = await supabase
        .from("services")
        .insert({
          title,
          description,
          category,
          occasion: occasionType,
          has_music: hasMusic ?? null,
          is3D: is3D ?? null,
          file_url: uploadedMediaUrl,
          file_type: fileType,
          publisher_user_id: currentUserId,
        })
        .select()

      if (error) {
        console.log("[v0] خطأ في إضافة الخدمة:", error)
        throw error
      }

      console.log("[v0] تم النشر بنجاح:", data)
      alert("تم النشر بنجاح!")
      router.back()
    } catch (error: any) {
      console.log("[v0] خطأ في النشر:", error.message)
      alert(`حدث خطأ أثناء النشر: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <p className="text-[#B38C8A]">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => router.back()} variant="ghost" className="text-[#B38C8A]">
            ← رجوع
          </Button>
          <h1 className="text-2xl font-bold text-[#B38C8A]">نشر خدمة جديدة</h1>
          <div className="w-12"></div>
        </div>

        <form onSubmit={handlePublish} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div>
              <Label htmlFor="title" className="text-[#B38C8A]">
                العنوان
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
                الوصف
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصفاً للخدمة"
                className="bg-[#F5E9E8] border-[#B38C8A]/20"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="occasion" className="text-[#B38C8A]">
                نوع المناسبة
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
                <Label className="text-[#B38C8A] mb-2 block">هل يحتوي على موسيقى؟</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setHasMusic(true)}
                    className={hasMusic === true ? "bg-[#D4AF37]" : "bg-white text-[#B38C8A]"}
                  >
                    نعم
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setHasMusic(false)}
                    className={hasMusic === false ? "bg-[#D4AF37]" : "bg-white text-[#B38C8A]"}
                  >
                    لا
                  </Button>
                </div>
              </div>
            )}

            {(category === "invitations" || category === "greetings") && (
              <div>
                <Label className="text-[#B38C8A] mb-2 block">نوع التصميم</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setIs3D(false)}
                    className={is3D === false ? "bg-[#D4AF37]" : "bg-white text-[#B38C8A]"}
                  >
                    2D
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIs3D(true)}
                    className={is3D === true ? "bg-[#D4AF37]" : "bg-white text-[#B38C8A]"}
                  >
                    3D
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="file" className="text-[#B38C8A]">
                رفع الملف
              </Label>
              <div className="mt-2 flex items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#B38C8A]/20 border-dashed rounded-lg cursor-pointer bg-[#F5E9E8] hover:bg-[#F5E9E8]/70"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-[#B38C8A]" />
                    <p className="text-sm text-[#B38C8A]">{file ? file.name : "اضغط لرفع الملف"}</p>
                  </div>
                  <input
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white">
            {isLoading ? "جاري النشر..." : "نشر"}
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}

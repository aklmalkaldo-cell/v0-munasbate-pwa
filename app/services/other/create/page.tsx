"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Camera, ImageIcon, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function CreateUserServicePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  useEffect(() => {
    const initPage = async () => {
      try {
        const storedUserId = localStorage.getItem("user_id")
        const isGuest = localStorage.getItem("is_guest") === "true"

        if (!storedUserId || isGuest) {
          alert("يجب تسجيل الدخول لإنشاء خدمة")
          router.push("/auth/login")
          return
        }

        setUserId(storedUserId)
        await checkExistingService(storedUserId)
      } catch (error) {
        console.error("Init error:", error)
      } finally {
        setChecking(false)
      }
    }

    initPage()
  }, [router])

  const checkExistingService = async (uid: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("user_services").select("id").eq("user_id", uid).maybeSingle()

      if (error) {
        if (error.code === "42P01") {
          // الجدول غير موجود
          setDbError("جدول الخدمات غير موجود. يرجى تشغيل سكريبت إنشاء الجداول.")
        } else if (error.code === "42703") {
          // عمود غير موجود
          setDbError("هناك مشكلة في هيكل قاعدة البيانات. يرجى التواصل مع الدعم.")
        } else {
          console.error("Error checking service:", error)
        }
        return
      }

      if (data) {
        router.replace(`/services/other/${data.id}`)
      }
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      setProfilePreview(URL.createObjectURL(file))
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}_${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert("حجم الملف كبير جداً. الحد الأقصى 10MB")
      return null
    }

    const { error } = await supabase.storage.from("user-services").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      alert("فشل رفع الصورة: " + error.message)
      return null
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("user-services").getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const serviceName = formData.serviceName.trim()

    if (!userId) {
      alert("يجب تسجيل الدخول أولاً")
      router.push("/auth/login")
      return
    }

    if (!serviceName) {
      alert("يرجى إدخال اسم الخدمة")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { data: existingService } = await supabase
        .from("user_services")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      if (existingService) {
        alert("لديك خدمة بالفعل!")
        router.replace(`/services/other/${existingService.id}`)
        return
      }

      let profileImageUrl = null
      let coverImageUrl = null

      if (profileImage) {
        profileImageUrl = await uploadImage(profileImage, "profiles")
        if (profileImage && !profileImageUrl) {
          setLoading(false)
          return
        }
      }

      if (coverImage) {
        coverImageUrl = await uploadImage(coverImage, "covers")
        if (coverImage && !coverImageUrl) {
          setLoading(false)
          return
        }
      }

      const insertData = {
        user_id: userId,
        name: serviceName,
        description: formData.description.trim() || null,
        avatar_url: profileImageUrl,
        cover_url: coverImageUrl,
      }

      const { data, error } = await supabase.from("user_services").insert(insertData).select().single()

      if (error) {
        console.error("Insert error:", error.message, error.code, error.details)
        if (error.code === "23505") {
          alert("لديك خدمة بالفعل! لا يمكنك إنشاء أكثر من خدمة واحدة.")
        } else if (error.code === "42501") {
          alert("ليس لديك صلاحية لإنشاء خدمة. تأكد من تسجيل الدخول.")
        } else if (error.code === "42P01") {
          alert("لم يتم إعداد قاعدة البيانات بعد. يرجى تشغيل سكريبت إنشاء الجداول.")
        } else {
          alert("حدث خطأ: " + error.message)
        }
        return
      }

      router.replace(`/services/other/${data.id}`)
    } catch (error: any) {
      console.error("Error creating service:", error)
      alert("حدث خطأ أثناء إنشاء الخدمة: " + (error.message || "خطأ غير معروف"))
    } finally {
      setLoading(false)
    }
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8]">
        <TopHeader />
        <main className="pt-20 px-4 pb-8 max-w-screen-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-[#B38C8A]">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-[#B38C8A]">إنشاء خدمتي</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-red-700 mb-2">خطأ في قاعدة البيانات</h2>
            <p className="text-red-600 mb-4">{dbError}</p>
            <Button onClick={() => router.back()} variant="outline" className="border-red-300 text-red-600">
              العودة
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#7B68EE] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#B38C8A]">جاري التحقق...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8]">
      <TopHeader />

      <main className="pt-20 px-4 pb-8 max-w-screen-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-[#B38C8A]">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-[#B38C8A]">إنشاء خدمتي</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#B38C8A] mb-2">صورة الغلاف</label>
            <div className="relative h-40 bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD] rounded-2xl overflow-hidden">
              {coverPreview && (
                <Image src={coverPreview || "/placeholder.svg"} alt="cover" fill className="object-cover" />
              )}
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors">
                <div className="bg-white/90 rounded-full p-3">
                  <ImageIcon className="w-6 h-6 text-[#7B68EE]" />
                </div>
                <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#B38C8A] mb-2">صورة الخدمة</label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full bg-[#B38C8A] overflow-hidden">
                {profilePreview ? (
                  <Image src={profilePreview || "/placeholder.svg"} alt="profile" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                    {formData.serviceName[0] || "؟"}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
                </label>
              </div>
              <p className="text-sm text-[#B38C8A]/60">اختر صورة تمثل خدمتك</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#B38C8A] mb-2">
              اسم الخدمة <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              placeholder="مثال: استوديو الإبداع"
              className="bg-white border-[#B38C8A]/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#B38C8A] mb-2">وصف الخدمة</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="اكتب وصفاً مختصراً عن خدمتك وما تقدمه..."
              className="bg-white border-[#B38C8A]/20 min-h-[120px]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !formData.serviceName.trim()}
            className="w-full bg-gradient-to-r from-[#7B68EE] to-[#6A5ACD] hover:from-[#6A5ACD] hover:to-[#5B4BC7] text-white py-6 rounded-xl text-lg font-bold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الإنشاء...
              </div>
            ) : (
              "إنشاء الخدمة"
            )}
          </Button>
        </form>
      </main>
    </div>
  )
}

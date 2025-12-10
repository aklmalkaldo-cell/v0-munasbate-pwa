"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Camera, ImageIcon, Trash2 } from "lucide-react"
import Image from "next/image"

export default function ManageServicePage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string

  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [existingProfileImage, setExistingProfileImage] = useState<string | null>(null)
  const [existingCoverImage, setExistingCoverImage] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id")
    if (!storedUserId) {
      router.push("/auth/login")
      return
    }
    setUserId(storedUserId)
    loadService(storedUserId)
  }, [router, serviceId])

  const loadService = async (uid: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.from("user_services").select("*").eq("id", serviceId).single()

    if (error || !data || data.user_id !== uid) {
      router.replace("/services/other")
      return
    }

    setFormData({
      serviceName: data.service_name,
      description: data.description || "",
    })
    setExistingProfileImage(data.profile_image)
    setExistingCoverImage(data.cover_image)
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

    const { error } = await supabase.storage.from("user-services").upload(filePath, file)

    if (error) {
      console.error("Upload error:", error)
      return null
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("user-services").getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !formData.serviceName.trim()) {
      alert("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const updateData: any = {
        service_name: formData.serviceName.trim(),
        description: formData.description.trim(),
        updated_at: new Date().toISOString(),
      }

      if (profileImage) {
        const profileUrl = await uploadImage(profileImage, "profiles")
        if (profileUrl) updateData.profile_image = profileUrl
      }

      if (coverImage) {
        const coverUrl = await uploadImage(coverImage, "covers")
        if (coverUrl) updateData.cover_image = coverUrl
      }

      const { error } = await supabase.from("user_services").update(updateData).eq("id", serviceId)

      if (error) throw error

      router.push(`/services/other/${serviceId}`)
    } catch (error) {
      console.error("Error updating service:", error)
      alert("حدث خطأ أثناء تحديث الخدمة")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف الخدمة؟ سيتم حذف جميع المحتوى المرتبط بها.")) {
      return
    }

    setDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("user_services").delete().eq("id", serviceId)

      if (error) throw error

      router.replace("/services/other")
    } catch (error) {
      console.error("Error deleting service:", error)
      alert("حدث خطأ أثناء حذف الخدمة")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8]">
      <TopHeader />

      <main className="pt-20 px-4 pb-8 max-w-screen-md mx-auto">
        {/* العنوان */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-[#B38C8A]">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-[#B38C8A]">إدارة الخدمة</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* صورة الغلاف */}
          <div>
            <label className="block text-sm font-medium text-[#B38C8A] mb-2">صورة الغلاف</label>
            <div className="relative h-40 bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD] rounded-2xl overflow-hidden">
              {(coverPreview || existingCoverImage) && (
                <Image src={coverPreview || existingCoverImage!} alt="cover" fill className="object-cover" />
              )}
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors">
                <div className="bg-white/90 rounded-full p-3">
                  <ImageIcon className="w-6 h-6 text-[#7B68EE]" />
                </div>
                <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* صورة البروفايل */}
          <div>
            <label className="block text-sm font-medium text-[#B38C8A] mb-2">صورة الخدمة</label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full bg-[#B38C8A] overflow-hidden">
                {profilePreview || existingProfileImage ? (
                  <Image src={profilePreview || existingProfileImage!} alt="profile" fill className="object-cover" />
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
            </div>
          </div>

          {/* اسم الخدمة */}
          <div>
            <label className="block text-sm font-medium text-[#B38C8A] mb-2">
              اسم الخدمة <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              className="bg-white border-[#B38C8A]/20"
              required
            />
          </div>

          {/* الوصف */}
          <div>
            <label className="block text-sm font-medium text-[#B38C8A] mb-2">وصف الخدمة</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white border-[#B38C8A]/20 min-h-[120px]"
            />
          </div>

          {/* زر الحفظ */}
          <Button
            type="submit"
            disabled={loading || !formData.serviceName.trim()}
            className="w-full bg-gradient-to-r from-[#7B68EE] to-[#6A5ACD] hover:from-[#6A5ACD] hover:to-[#5B4BC7] text-white py-6 rounded-xl text-lg font-bold"
          >
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>

          {/* زر الحذف */}
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            variant="outline"
            className="w-full border-red-500 text-red-500 hover:bg-red-50 py-6 rounded-xl gap-2 bg-transparent"
          >
            <Trash2 className="w-5 h-5" />
            {deleting ? "جاري الحذف..." : "حذف الخدمة"}
          </Button>
        </form>
      </main>
    </div>
  )
}

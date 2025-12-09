"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { LogOut } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const isGuest = localStorage.getItem("is_guest") === "true"

    if (!userId || isGuest) {
      router.push("/auth/login")
      return
    }

    setCurrentUserId(userId)
    loadUserData(userId)
  }, [])

  const loadUserData = async (userId: string) => {
    console.log("[v0] جلب بيانات المستخدم:", userId)
    const { data: userData, error } = await supabase.from("app_users").select("*").eq("user_id", userId).single()

    if (error) {
      console.error("[v0] خطأ في جلب البيانات:", error)
      return
    }

    console.log("[v0] تم جلب البيانات:", userData)
    if (userData) {
      setDisplayName(userData.username || "")
      setBio(userData.bio || "")
      setEmail(userData.email || "")
      setPhone(userData.phone || "")
      setIsPrivate(userData.is_private || false)
    }
  }

  const handleSave = async () => {
    if (!currentUserId) {
      alert("خطأ: لم يتم العثور على معلومات المستخدم")
      return
    }

    setIsLoading(true)
    console.log("[v0] حفظ التغييرات للمستخدم:", currentUserId)

    try {
      const { error } = await supabase
        .from("app_users")
        .update({
          username: displayName,
          bio,
          email,
          phone,
          is_private: isPrivate,
        })
        .eq("user_id", currentUserId)

      if (error) {
        console.error("[v0] خطأ في الحفظ:", error)
        throw error
      }

      console.log("[v0] تم الحفظ بنجاح")

      localStorage.setItem("username", displayName)

      alert("تم حفظ التغييرات بنجاح")
      window.location.href = "/profile"
    } catch (error: any) {
      console.error("[v0] خطأ:", error)
      alert("حدث خطأ أثناء الحفظ: " + (error.message || "خطأ غير معروف"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user_id")
    localStorage.removeItem("username")
    localStorage.removeItem("is_guest")
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold text-[#B38C8A] mb-6">الإعدادات</h1>

        <div className="space-y-6">
          {/* تعديل الملف الشخصي */}
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#B38C8A] mb-4">تعديل الملف الشخصي</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="text-[#B38C8A]">
                  الاسم المستعار
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-[#F5E9E8] border-[#B38C8A]/20"
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-[#B38C8A]">
                  النبذة التعريفية
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-[#F5E9E8] border-[#B38C8A]/20"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* ربط الحساب */}
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#B38C8A] mb-4">ربط الحساب</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-[#B38C8A]">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="bg-[#F5E9E8] border-[#B38C8A]/20"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-[#B38C8A]">
                  رقم الجوال
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="bg-[#F5E9E8] border-[#B38C8A]/20"
                />
              </div>
            </div>
          </div>

          {/* الخصوصية */}
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#B38C8A] mb-4">الخصوصية</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#B38C8A] font-medium">حساب خاص</p>
                <p className="text-sm text-[#B38C8A]/70">يتطلب الموافقة على طلبات المتابعة</p>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>
          </div>

          {/* حفظ التغييرات */}
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white"
          >
            {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>

          {/* تسجيل الخروج */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-500 text-red-500 hover:bg-red-50 bg-transparent"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

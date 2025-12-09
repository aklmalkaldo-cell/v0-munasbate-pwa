"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPage() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [foundUserId, setFoundUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setFoundUserId(null)

    const supabase = createClient()

    try {
      let query = supabase.from("users").select("user_id")

      if (email) {
        query = query.eq("email", email)
      } else if (phone) {
        query = query.eq("phone", phone)
      } else {
        throw new Error("الرجاء إدخال البريد الإلكتروني أو رقم الجوال")
      }

      const { data, error: queryError } = await query.single()

      if (queryError || !data) {
        throw new Error("لم يتم العثور على حساب مرتبط بهذه المعلومات")
      }

      setFoundUserId(data.user_id)
    } catch (error: any) {
      console.log("[v0] خطأ في استرداد الحساب:", error)
      setError(error.message || "حدث خطأ أثناء البحث")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#B38C8A]">استرداد الحساب</CardTitle>
            <CardDescription className="text-[#B38C8A]">
              أدخل البريد الإلكتروني أو رقم الجوال المرتبط بحسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!foundUserId ? (
              <form onSubmit={handleRecover}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-[#B38C8A]">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border-[#B38C8A]/30"
                    />
                  </div>
                  <div className="text-center text-sm text-[#B38C8A]">أو</div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-[#B38C8A]">
                      رقم الجوال
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-white border-[#B38C8A]/30"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "جاري البحث..." : "بحث"}
                  </Button>
                  <Link href="/auth/login">
                    <Button type="button" variant="link" className="w-full text-[#B38C8A]">
                      العودة لتسجيل الدخول
                    </Button>
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#F5E9E8] p-4 rounded-lg text-center">
                  <p className="text-sm text-[#B38C8A] mb-2">تم العثور على حسابك!</p>
                  <p className="text-sm text-[#B38C8A] font-medium mb-2">معرفك هو:</p>
                  <p className="text-3xl font-bold text-[#D4AF37]">{foundUserId}</p>
                </div>
                <Link href="/auth/login">
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white">تسجيل الدخول</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

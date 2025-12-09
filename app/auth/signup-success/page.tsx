"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Copy } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense } from "react"

function SignUpSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get("userId")
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (userId) {
      navigator.clipboard.writeText(userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <Card className="shadow-lg text-center border-[#B38C8A]/20">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-[#D4AF37]" />
          </div>
          <CardTitle className="text-2xl text-[#B38C8A]">تم التسجيل بنجاح!</CardTitle>
          <CardDescription className="text-[#B38C8A]">تم إنشاء حسابك في منصبتي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#F5E9E8] p-4 rounded-lg">
            <p className="text-sm text-[#B38C8A] font-medium mb-2">معرفك الفريد (User ID):</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-bold text-[#D4AF37]">{userId || "سيظهر هنا"}</p>
              {userId && (
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  size="icon"
                  className="text-[#B38C8A] hover:text-[#D4AF37]"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
            {copied && <p className="text-xs text-[#D4AF37] mt-2">تم النسخ!</p>}
            <p className="text-xs text-[#B38C8A] mt-2">احفظ هذا الرقم للدخول لاحقاً</p>
          </div>
          <Button onClick={() => router.push("/home")} className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white">
            الانتقال للصفحة الرئيسية
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#F5E9E8]" dir="rtl">
      <Suspense fallback={<div className="text-[#B38C8A]">جاري التحميل...</div>}>
        <SignUpSuccessContent />
      </Suspense>
    </div>
  )
}

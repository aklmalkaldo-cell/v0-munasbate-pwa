"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Copy } from "lucide-react"
import { useState } from "react"

export default function SuccessPage() {
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
    <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="w-20 h-20 text-[#D4AF37]" />
          </div>

          <h1 className="text-3xl font-bold text-[#B38C8A]">تم إنشاء الحساب بنجاح!</h1>

          <div className="bg-[#F5E9E8] rounded-xl p-6 space-y-4">
            <p className="text-[#B38C8A]">معرفك الفريد هو:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-3xl font-bold text-[#D4AF37]">{userId}</code>
              <Button onClick={handleCopy} variant="ghost" size="icon" className="text-[#B38C8A] hover:text-[#D4AF37]">
                <Copy className="w-5 h-5" />
              </Button>
            </div>
            {copied && <p className="text-sm text-[#D4AF37]">تم النسخ!</p>}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">احفظ هذا المعرف! ستحتاجه لتسجيل الدخول</p>
          </div>

          <Button
            onClick={() => router.push("/home")}
            className="w-full bg-[#D4AF37] hover:bg-[#C19B2B] text-white rounded-xl py-6 text-lg"
          >
            الانتقال للصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  )
}

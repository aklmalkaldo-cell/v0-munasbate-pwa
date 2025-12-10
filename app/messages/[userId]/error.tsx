"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] خطأ في صفحة الرسائل:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-[#B38C8A] mb-2">خطأ في المحادثة</h2>
        <p className="text-gray-600 mb-6">عذراً، حدث خطأ أثناء تحميل المحادثة.</p>
        <div className="space-y-3">
          <Button onClick={reset} className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white gap-2">
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </Button>
          <Link href="/messages">
            <Button variant="outline" className="w-full border-[#B38C8A] text-[#B38C8A] gap-2 bg-transparent">
              <MessageCircle className="w-4 h-4" />
              العودة للرسائل
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

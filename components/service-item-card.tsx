"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play, Pause, Mail, Plus } from "lucide-react"

interface ServiceItemCardProps {
  id: string
  title: string
  description?: string
  fileUrl: string
  thumbnailUrl?: string
  type: "audio" | "video" | "image"
  agentUserId: string
  category?: string
  occasion?: string
  accountType?: string | null
}

export function ServiceItemCard({
  id,
  title,
  description,
  fileUrl,
  thumbnailUrl,
  type,
  agentUserId,
  category,
  occasion,
  accountType,
}: ServiceItemCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handleContactAgent = () => {
    window.location.href = `/messages/${agentUserId}`
  }

  const handlePublishService = () => {
    window.location.href = `/agent/publish/${category}`
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#B38C8A]/10">
      {/* معاينة الملف */}
      <div className="relative w-full aspect-video bg-[#F5E9E8]">
        {type === "image" || thumbnailUrl ? (
          <Image src={thumbnailUrl || fileUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center hover:bg-[#B8941F] transition-colors"
            >
              {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white mr-1" />}
            </button>
          </div>
        )}
      </div>

      {/* المعلومات */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-[#B38C8A] mb-2 line-clamp-2">{title}</h3>
        {description && <p className="text-sm text-[#B38C8A]/70 mb-4 line-clamp-2">{description}</p>}

        <div className="flex gap-2">
          <Button onClick={handleContactAgent} className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-white">
            <Mail className="w-4 h-4 ml-2" />
            اطلب الآن
          </Button>

          {accountType === "agent" && (
            <Button
              onClick={handlePublishService}
              className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-white"
              title="إضافة مقطع جديد"
            >
              <Plus className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

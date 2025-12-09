import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface ServiceCardProps {
  title: string
  icon: LucideIcon
  href: string
  gradient?: string
}

export function ServiceCard({ title, icon: Icon, href }: ServiceCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-[#B38C8A]/10"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-[#F5E9E8] flex items-center justify-center">
          <Icon className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <h3 className="text-lg font-medium text-[#B38C8A] text-center">{title}</h3>
      </div>
    </Link>
  )
}

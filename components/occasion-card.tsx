import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface OccasionCardProps {
  title: string
  href: string
  count?: number
}

export function OccasionCard({ title, href, count }: OccasionCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow border border-[#B38C8A]/10"
    >
      <div>
        <h3 className="text-lg font-medium text-[#B38C8A]">{title}</h3>
        {count !== undefined && (
          <p className="text-sm text-[#B38C8A]/60 mt-1">
            {count} {count === 1 ? "عنصر" : "عناصر"}
          </p>
        )}
      </div>
      <ChevronLeft className="w-5 h-5 text-[#B38C8A]/40" />
    </Link>
  )
}

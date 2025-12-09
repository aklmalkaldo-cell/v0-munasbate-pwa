"use client"

import { Plus } from "lucide-react"
import Link from "next/link"

interface AgentPublishButtonProps {
  category: string
}

export function AgentPublishButton({ category }: AgentPublishButtonProps) {
  return (
    <Link
      href={`/agent/publish/${category}`}
      className="fixed bottom-24 left-4 w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg hover:bg-[#B8941F] transition-colors z-40"
    >
      <Plus className="w-8 h-8 text-white" />
    </Link>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Calendar, MessageCircle, User } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/home", icon: Home, label: "الرئيسية" },
    { href: "/posts", icon: FileText, label: "المنشورات" },
    { href: "/planner", icon: Calendar, label: "مخططي" },
    { href: "/messages", icon: MessageCircle, label: "الدردشات" },
    { href: "/profile", icon: User, label: "الملف" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#B38C8A]/20 z-50">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 flex-1">
              <Icon className={`w-6 h-6 ${isActive ? "text-[#D4AF37]" : "text-[#B38C8A]"}`} />
              <span className={`text-xs ${isActive ? "text-[#D4AF37] font-medium" : "text-[#B38C8A]"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

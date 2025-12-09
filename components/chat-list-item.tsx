import Link from "next/link"
import Image from "next/image"

interface ChatListItemProps {
  userId: string
  displayName: string
  avatarUrl?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
}

export function ChatListItem({
  userId,
  displayName,
  avatarUrl,
  lastMessage,
  lastMessageTime,
  unreadCount = 0,
}: ChatListItemProps) {
  return (
    <Link
      href={`/messages/${userId}`}
      className="flex items-center gap-3 p-4 hover:bg-white/50 transition-colors border-b border-[#B38C8A]/10"
    >
      {/* الصورة الشخصية */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-[#F5E9E8] overflow-hidden">
          {avatarUrl ? (
            <Image
              src={avatarUrl || "/placeholder.svg"}
              alt={displayName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#D4AF37]">
              {displayName?.charAt(0)}
            </div>
          )}
        </div>
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D4AF37] flex items-center justify-center">
            <span className="text-xs text-white font-medium">{unreadCount > 9 ? "9+" : unreadCount}</span>
          </div>
        )}
      </div>

      {/* المحتوى */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-[#B38C8A] truncate">{displayName}</h3>
          {lastMessageTime && <span className="text-xs text-[#B38C8A]/50 flex-shrink-0 mr-2">{lastMessageTime}</span>}
        </div>
        {lastMessage && <p className="text-sm text-[#B38C8A]/70 truncate">{lastMessage}</p>}
      </div>
    </Link>
  )
}

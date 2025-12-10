export function VerifiedBadge({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block flex-shrink-0"
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#e8c9c9", stopOpacity: 0.8 }} />
          <stop offset="50%" style={{ stopColor: "#d4a5a5", stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: "#c99999", stopOpacity: 0.85 }} />
        </linearGradient>
        <linearGradient id="noteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#f5e6c8", stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: "#e6d4a8", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#d4b888", stopOpacity: 1 }} />
        </linearGradient>
        <radialGradient id="checkBgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "#f5ede0", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#e8d8c0", stopOpacity: 1 }} />
        </radialGradient>
        <filter id="shadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="2" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="100" cy="100" r="95" fill="url(#bgGradient)" opacity="0.9" />
      <circle cx="100" cy="100" r="70" fill="#c4a0a0" opacity="0.6" />

      <g filter="url(#shadow)">
        <rect x="75" y="35" width="10" height="75" fill="url(#noteGradient)" rx="2" />
        <rect x="78" y="35" width="6" height="75" fill="#f5e6c8" opacity="0.5" rx="1" />
        <ellipse cx="95" cy="115" rx="24" ry="18" fill="url(#noteGradient)" />
        <ellipse cx="95" cy="113" rx="21" ry="16" fill="#f5e6c8" opacity="0.4" />
        <path d="M 85 35 Q 125 28, 135 55 Q 128 48, 85 58 Z" fill="url(#noteGradient)" />
        <path d="M 85 37 Q 122 30, 132 55 Q 126 50, 85 60 Z" fill="#f5e6c8" opacity="0.4" />
        <rect x="65" y="65" width="40" height="45" fill="none" stroke="#c4a0a0" strokeWidth="3.5" rx="2" />
      </g>

      <g transform="translate(130, 105)">
        <circle cx="0" cy="0" r="18" fill="#ffffff" opacity="0.95" />
        <circle cx="0" cy="0" r="16" fill="url(#checkBgGradient)" />
        <path
          d="M -6 -1 L -2 4 L 7 -6"
          fill="none"
          stroke="#c4a060"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

// الحسابات الموثقة
export const VERIFIED_USER_IDS = ["1111111"]

export function isVerifiedUser(userId: string | undefined | null): boolean {
  if (!userId) return false
  return VERIFIED_USER_IDS.includes(userId)
}

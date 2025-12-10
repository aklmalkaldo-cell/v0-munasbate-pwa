// مكونات Skeleton Loaders للتحميل السريع
export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9E8] via-[#FDF8F7] to-[#F5E9E8] pb-24">
      <div className="h-16 bg-white/50" />
      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-8 w-48 bg-[#B38C8A]/20 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-64 bg-[#B38C8A]/10 rounded-lg animate-pulse" />
        </div>

        {/* Search skeleton */}
        <div className="mb-8">
          <div className="h-14 bg-white/80 rounded-2xl animate-pulse" />
        </div>

        {/* Services grid skeleton */}
        <div className="mb-8">
          <div className="h-6 w-24 bg-[#B38C8A]/20 rounded-lg animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-[#D4AF37]/20 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Top rated skeleton */}
        <div className="mb-8">
          <div className="h-6 w-32 bg-[#B38C8A]/20 rounded-lg animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export function PostsSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <div className="h-16 bg-white/50" />
      <main className="pt-16 max-w-screen-xl mx-auto">
        <div className="h-12 bg-[#F5E9E8] border-b border-[#B38C8A]/20" />
        <div className="px-4 py-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#B38C8A]/20" />
                <div>
                  <div className="h-4 w-24 bg-[#B38C8A]/20 rounded mb-2" />
                  <div className="h-3 w-16 bg-[#B38C8A]/10 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-[#B38C8A]/10 rounded" />
                <div className="h-4 w-3/4 bg-[#B38C8A]/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <div className="h-16 bg-white/50" />
      <main className="pt-16 max-w-screen-xl mx-auto">
        <div className="h-48 bg-gradient-to-br from-[#F5E9E8] to-[#B38C8A]/20 animate-pulse" />
        <div className="px-4 -mt-16 relative">
          <div className="flex items-end justify-between mb-4">
            <div className="w-32 h-32 rounded-full bg-white animate-pulse" />
            <div className="h-10 w-28 bg-white rounded-lg animate-pulse" />
          </div>
          <div className="mb-4">
            <div className="h-7 w-40 bg-[#B38C8A]/20 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-24 bg-[#B38C8A]/10 rounded-lg animate-pulse" />
          </div>
          <div className="flex items-center gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="h-6 w-12 bg-[#B38C8A]/20 rounded animate-pulse mx-auto mb-1" />
                <div className="h-4 w-16 bg-[#B38C8A]/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export function MessagesSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <div className="h-16 bg-white/50" />
      <main className="pt-20 max-w-screen-xl mx-auto">
        <div className="h-8 w-24 bg-[#B38C8A]/20 rounded-lg animate-pulse mx-4 mb-4" />
        <div className="bg-white">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 border-b border-[#B38C8A]/10 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-[#B38C8A]/20" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-[#B38C8A]/20 rounded mb-2" />
                <div className="h-3 w-48 bg-[#B38C8A]/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 animate-pulse">
      <div className="h-40 bg-[#B38C8A]/20 rounded-lg mb-3" />
      <div className="h-5 w-3/4 bg-[#B38C8A]/20 rounded mb-2" />
      <div className="h-4 w-1/2 bg-[#B38C8A]/10 rounded" />
    </div>
  )
}

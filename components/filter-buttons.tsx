"use client"

import { Button } from "@/components/ui/button"

interface FilterButtonsProps {
  filters: string[]
  selectedFilter: string
  onFilterChange: (filter: string) => void
}

export function FilterButtons({ filters, selectedFilter, onFilterChange }: FilterButtonsProps) {
  return (
    <div className="flex flex-col gap-4">
      {filters.map((filter) => (
        <Button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`h-16 text-lg font-medium transition-all ${
            selectedFilter === filter
              ? "bg-[#D4AF37] text-white hover:bg-[#B8941F]"
              : "bg-white text-[#B38C8A] hover:bg-white/80 border-2 border-[#B38C8A]/20"
          }`}
        >
          {filter}
        </Button>
      ))}
    </div>
  )
}

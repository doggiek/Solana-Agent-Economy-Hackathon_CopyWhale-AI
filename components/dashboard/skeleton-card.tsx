"use client"

import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  className?: string
  rows?: number
}

export function SkeletonCard({ className, rows = 3 }: SkeletonCardProps) {
  return (
    <GlassCard className={cn("p-6", className)} hover={false}>
      <div className="mb-4 h-5 w-32 animate-pulse rounded-lg bg-secondary" />
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-secondary" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
            </div>
            <div className="space-y-2 text-right">
              <div className="ml-auto h-4 w-20 animate-pulse rounded bg-secondary" />
              <div className="ml-auto h-3 w-12 animate-pulse rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

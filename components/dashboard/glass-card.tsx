"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-glass-border bg-glass backdrop-blur-xl",
        "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        hover && "transition-all duration-300 hover:border-neon-purple/50 hover:shadow-[0_8px_32px_rgba(139,92,246,0.15)]",
        className
      )}
    >
      {children}
    </div>
  )
}

"use client"

import { GlassCard } from "./glass-card"
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, Send } from "lucide-react"
import { cn } from "@/lib/utils"

const actions = [
  {
    label: "充值",
    icon: ArrowDownToLine,
    gradient: "from-profit to-emerald-600",
  },
  {
    label: "提现",
    icon: ArrowUpFromLine,
    gradient: "from-neon-purple to-neon-blue",
  },
  {
    label: "转账",
    icon: Send,
    gradient: "from-neon-blue to-cyan-500",
  },
  {
    label: "兑换",
    icon: RefreshCw,
    gradient: "from-amber-400 to-orange-500",
  },
]

export function QuickActions() {
  return (
    <GlassCard className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">快捷操作</h3>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className="group flex flex-col items-center gap-2"
          >
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br transition-all duration-300",
              "group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]",
              action.gradient
            )}>
              <action.icon className="h-5 w-5 text-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </GlassCard>
  )
}

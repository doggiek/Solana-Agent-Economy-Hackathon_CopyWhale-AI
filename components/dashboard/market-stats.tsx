"use client"

import { GlassCard } from "./glass-card"
import { Activity, BarChart3, Zap } from "lucide-react"

const stats = [
  {
    label: "24h 成交量",
    value: "$2.4B",
    change: "+12.3%",
    icon: Activity,
    isPositive: true,
  },
  {
    label: "市场总值",
    value: "$2.67T",
    change: "+5.8%",
    icon: BarChart3,
    isPositive: true,
  },
  {
    label: "Gas 费用",
    value: "24 Gwei",
    change: "-8.2%",
    icon: Zap,
    isPositive: true,
  },
]

export function MarketStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <GlassCard key={stat.label} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-xl font-bold text-foreground">{stat.value}</p>
              <p className={stat.isPositive ? "text-xs text-profit" : "text-xs text-loss"}>
                {stat.change}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-purple/20">
              <stat.icon className="h-4 w-4 text-neon-purple" />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  )
}

"use client"

import { GlassCard } from "./glass-card"
import { TrendingUp, Wallet } from "lucide-react"

export function PortfolioCard() {
  const totalBalance = 127453.82
  const profitLoss = 12847.32
  const profitPercent = 11.23

  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue">
          <Wallet className="h-5 w-5 text-foreground" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">总资产</h3>
      </div>
      
      <p className="mb-2 text-3xl font-bold text-foreground">
        ${totalBalance.toLocaleString()}
      </p>
      
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-profit" />
        <span className="text-sm font-medium text-profit">
          +${profitLoss.toLocaleString()} ({profitPercent}%)
        </span>
        <span className="text-xs text-muted-foreground">24h</span>
      </div>
    </GlassCard>
  )
}

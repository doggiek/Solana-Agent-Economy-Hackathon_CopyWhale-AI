"use client"

import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

const watchlistItems = [
  { symbol: "ARB", name: "Arbitrum", price: 1.23, change: 8.45 },
  { symbol: "OP", name: "Optimism", price: 2.87, change: -2.34 },
  { symbol: "LINK", name: "Chainlink", price: 14.56, change: 4.12 },
  { symbol: "UNI", name: "Uniswap", price: 7.89, change: -1.23 },
]

export function Watchlist() {
  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">关注列表</h3>
        <Star className="h-4 w-4 text-amber-400" />
      </div>
      
      <div className="space-y-3">
        {watchlistItems.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between rounded-xl bg-secondary/50 p-3 transition-all duration-200 hover:bg-secondary"
          >
            <div>
              <p className="font-medium text-foreground">{item.symbol}</p>
              <p className="text-xs text-muted-foreground">{item.name}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">${item.price}</p>
              <p className={cn(
                "text-xs font-medium",
                item.change >= 0 ? "text-profit" : "text-loss"
              )}>
                {item.change >= 0 ? "+" : ""}{item.change}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

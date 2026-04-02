"use client"

import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"

const assets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "₿",
    iconBg: "from-orange-400 to-orange-600",
    balance: 2.4523,
    value: 165847.32,
    change: 3.24,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    iconBg: "from-blue-400 to-purple-500",
    balance: 18.234,
    value: 45623.45,
    change: -1.82,
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "◎",
    iconBg: "from-purple-400 to-pink-500",
    balance: 245.67,
    value: 32456.78,
    change: 5.67,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    icon: "A",
    iconBg: "from-red-400 to-red-600",
    balance: 523.45,
    value: 18234.56,
    change: -0.45,
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    icon: "M",
    iconBg: "from-purple-500 to-purple-700",
    balance: 12453.23,
    value: 8745.32,
    change: 2.34,
  },
]

export function AssetList() {
  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">持仓资产</h3>
        <button className="text-xs text-neon-purple transition-colors hover:text-neon-purple/80">
          查看全部
        </button>
      </div>
      
      <div className="space-y-3">
        {assets.map((asset) => (
          <div
            key={asset.symbol}
            className="group flex items-center justify-between rounded-xl bg-secondary/50 p-3 transition-all duration-200 hover:bg-secondary"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br",
                asset.iconBg
              )}>
                <span className="text-lg font-bold text-foreground">{asset.icon}</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{asset.symbol}</p>
                <p className="text-xs text-muted-foreground">{asset.name}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-medium text-foreground">
                ${asset.value.toLocaleString()}
              </p>
              <div className="flex items-center justify-end gap-1">
                <span className="text-xs text-muted-foreground">
                  {asset.balance} {asset.symbol}
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  asset.change >= 0 ? "text-profit" : "text-loss"
                )}>
                  {asset.change >= 0 ? "+" : ""}{asset.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

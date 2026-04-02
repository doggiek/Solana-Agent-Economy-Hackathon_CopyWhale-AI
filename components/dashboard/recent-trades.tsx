"use client"

import { GlassCard } from "./glass-card"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

const trades = [
  {
    type: "buy",
    asset: "BTC",
    amount: 0.0234,
    price: 67523.45,
    time: "2 分钟前",
    total: 1580.05,
  },
  {
    type: "sell",
    asset: "ETH",
    amount: 2.5,
    price: 2503.67,
    time: "15 分钟前",
    total: 6259.18,
  },
  {
    type: "buy",
    asset: "SOL",
    amount: 45.2,
    price: 132.45,
    time: "1 小时前",
    total: 5986.74,
  },
  {
    type: "buy",
    asset: "AVAX",
    amount: 120.5,
    price: 34.82,
    time: "3 小时前",
    total: 4195.81,
  },
  {
    type: "sell",
    asset: "MATIC",
    amount: 2500,
    price: 0.704,
    time: "5 小时前",
    total: 1760.00,
  },
]

export function RecentTrades() {
  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">最近交易</h3>
        <button className="text-xs text-neon-purple transition-colors hover:text-neon-purple/80">
          查看历史
        </button>
      </div>
      
      <div className="space-y-3">
        {trades.map((trade, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-xl bg-secondary/50 p-3 transition-all duration-200 hover:bg-secondary"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full",
                trade.type === "buy" 
                  ? "bg-profit/20 text-profit" 
                  : "bg-loss/20 text-loss"
              )}>
                {trade.type === "buy" ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium uppercase",
                    trade.type === "buy" ? "text-profit" : "text-loss"
                  )}>
                    {trade.type === "buy" ? "买入" : "卖出"}
                  </span>
                  <span className="font-medium text-foreground">{trade.asset}</span>
                </div>
                <p className="text-xs text-muted-foreground">{trade.time}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-medium text-foreground">
                ${trade.total.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {trade.amount} @ ${trade.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

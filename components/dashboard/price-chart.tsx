"use client"

import { GlassCard } from "./glass-card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useState } from "react"

const generateChartData = () => {
  const data = []
  let price = 67500
  for (let i = 0; i < 24; i++) {
    price = price + (Math.random() - 0.48) * 500
    data.push({
      time: `${i}:00`,
      price: Math.round(price * 100) / 100,
    })
  }
  return data
}

const chartData = generateChartData()

const timeframes = ["1H", "4H", "1D", "1W", "1M", "ALL"]

export function PriceChart() {
  const [activeTimeframe, setActiveTimeframe] = useState("1D")
  const currentPrice = chartData[chartData.length - 1].price
  const startPrice = chartData[0].price
  const priceChange = ((currentPrice - startPrice) / startPrice) * 100
  const isProfit = priceChange >= 0

  return (
    <GlassCard className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600">
              <span className="text-lg font-bold text-foreground">₿</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Bitcoin</h2>
              <span className="text-sm text-muted-foreground">BTC/USDT</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-foreground">
            ${currentPrice.toLocaleString()}
          </p>
          <p className={cn("text-sm font-medium", isProfit ? "text-profit" : "text-loss")}>
            {isProfit ? "+" : ""}{priceChange.toFixed(2)}% (24h)
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => setActiveTimeframe(tf)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
              activeTimeframe === tf
                ? "bg-neon-purple text-foreground shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
            )}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isProfit ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                <stop offset="100%" stopColor={isProfit ? "#22c55e" : "#ef4444"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["dataMin - 200", "dataMax + 200"]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 15, 20, 0.9)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                borderRadius: "12px",
                padding: "12px",
              }}
              labelStyle={{ color: "#9ca3af" }}
              itemStyle={{ color: isProfit ? "#22c55e" : "#ef4444" }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isProfit ? "#22c55e" : "#ef4444"}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

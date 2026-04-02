"use client";

import { useState } from "react";
import { GlassCard } from "@/components/dashboard/glass-card";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Zap,
  AlertTriangle,
  Bot,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ConnectButton, useWallet } from "@/components/wallet/wallet-connect";
import Link from "next/link";

// Mock data
const stats = {
  totalProfit: 45280,
  dailyProfit: 2840,
  activeTrades: 4,
};

const tradeHistory = [
  {
    id: 1,
    token: "BONK",
    action: "sell",
    amount: "12.5M",
    profit: 320,
    timestamp: "5 分钟前",
    color: "#f97316",
  },
  {
    id: 2,
    token: "PEPE",
    action: "buy",
    amount: "8.2M",
    profit: null,
    timestamp: "12 分钟前",
    color: "#10b981",
  },
  {
    id: 3,
    token: "WIF",
    action: "sell",
    amount: "5,000",
    profit: 890,
    timestamp: "45 分钟前",
    color: "#06b6d4",
  },
  {
    id: 4,
    token: "SHIB",
    action: "sell",
    amount: "500M",
    profit: -120,
    timestamp: "1.5 小时前",
    color: "#ef4444",
  },
  {
    id: 5,
    token: "ARB",
    action: "buy",
    amount: "2,500",
    profit: null,
    timestamp: "2 小时前",
    color: "#8b5cf6",
  },
];

const activityLog = [
  {
    id: 1,
    message: "检测到鲸鱼正在买入 BONK",
    type: "detect",
    timestamp: "刚刚",
  },
  {
    id: 2,
    message: "已执行买入订单：8.2M PEPE",
    type: "execute",
    timestamp: "12 分钟前",
  },
  {
    id: 3,
    message: "卖出 BONK 获利 +12.8%",
    type: "profit",
    timestamp: "5 分钟前",
  },
  {
    id: 4,
    message: "风险预警：SHIB 波动率上升",
    type: "warning",
    timestamp: "30 分钟前",
  },
  {
    id: 5,
    message: "检测到 vitalik.eth 新交易",
    type: "detect",
    timestamp: "45 分钟前",
  },
  {
    id: 6,
    message: "已执行卖出订单：5K WIF",
    type: "execute",
    timestamp: "45 分钟前",
  },
  {
    id: 7,
    message: "卖出 WIF 获利 +23.5%",
    type: "profit",
    timestamp: "45 分钟前",
  },
];

function TokenIcon({ token, color }: { token: string; color: string }) {
  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-foreground"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {token.slice(0, 2)}
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "detect":
      return <Bot className="h-4 w-4 text-neon-blue" />;
    case "execute":
      return <Zap className="h-4 w-4 text-neon-purple" />;
    case "profit":
      return <TrendingUp className="h-4 w-4 text-profit" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-loss" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
}

export default function CopyTradingPage() {
  const [isAutoCopyEnabled, setIsAutoCopyEnabled] = useState(true);
  const [copyPercentage, setCopyPercentage] = useState([50]);
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const { isConnected } = useWallet();

  const riskColors = {
    low: "border-profit/50 bg-profit/10 text-profit",
    medium: "border-neon-purple/50 bg-neon-purple/10 text-neon-purple",
    high: "border-loss/50 bg-loss/10 text-loss",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-neon-purple/30 blur-[150px]" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-neon-blue/25 blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-profit/15 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-glass-border bg-glass/50 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Left: Logo + Status */}
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue">
                    <Bot className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    TradeBot
                  </span>
                </Link>

                {/* Status Badge */}
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                    isAutoCopyEnabled
                      ? "border border-profit/30 bg-profit/10 text-profit"
                      : "border border-loss/30 bg-loss/10 text-loss"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isAutoCopyEnabled ? "animate-pulse bg-profit" : "bg-loss"
                    }`}
                  />
                  {isAutoCopyEnabled ? "运行中" : "已停止"}
                </div>
              </div>

              {/* Right: Wallet */}
              <div className="flex items-center gap-2">
                <ConnectButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Controls */}
            <div className="space-y-6 lg:col-span-2">
              {/* Main Controls */}
              <GlassCard className="p-6">
                <h2 className="mb-6 text-lg font-semibold text-foreground">
                  交易控制
                </h2>

                {/* Auto Copy Toggle */}
                <div className="mb-6 flex items-center justify-between rounded-xl border border-glass-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                      <Zap className="h-5 w-5 text-neon-purple" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">自动跟单</p>
                      <p className="text-sm text-muted-foreground">
                        追踪聪明钱并自动复制交易
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAutoCopyEnabled(!isAutoCopyEnabled)}
                    className={`relative h-7 w-14 rounded-full transition-all duration-300 ${
                      isAutoCopyEnabled
                        ? "bg-gradient-to-r from-neon-purple to-neon-blue shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                        : "bg-secondary"
                    }`}
                  >
                    <div
                      className={`absolute top-1 h-5 w-5 rounded-full bg-foreground shadow-md transition-all duration-300 ${
                        isAutoCopyEnabled ? "left-8" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Copy Percentage Slider */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-medium text-foreground">跟单比例</p>
                    <span className="rounded-lg bg-neon-purple/20 px-3 py-1 text-sm font-semibold text-neon-purple">
                      {copyPercentage[0]}%
                    </span>
                  </div>
                  <Slider
                    value={copyPercentage}
                    onValueChange={setCopyPercentage}
                    min={10}
                    max={100}
                    step={5}
                    className="py-2"
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Risk Level Selector */}
                <div>
                  <p className="mb-3 font-medium text-foreground">风险等级</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(["low", "medium", "high"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setRiskLevel(level)}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          riskLevel === level
                            ? riskColors[level]
                            : "border-glass-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                        }`}
                      >
                        {level === "low" && "保守"}
                        {level === "medium" && "平衡"}
                        {level === "high" && "激进"}
                      </button>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <GlassCard className="p-4 text-center">
                  <p className="text-2xl font-bold text-profit">
                    ${(stats.totalProfit / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-muted-foreground">总收益</p>
                </GlassCard>

                <GlassCard className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    +${stats.dailyProfit.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">今日收益</p>
                </GlassCard>

                <GlassCard className="p-4 text-center">
                  <p className="text-2xl font-bold text-neon-purple">
                    {stats.activeTrades}
                  </p>
                  <p className="text-xs text-muted-foreground">活跃交易</p>
                </GlassCard>
              </div>

              {/* Transaction History */}
              <GlassCard className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    交易历史
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    查看全部
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {tradeHistory.map((trade) => (
                    <div
                      key={trade.id}
                      className="group flex items-center justify-between rounded-xl border border-transparent bg-secondary/30 p-3 transition-all duration-200 hover:border-glass-border hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <TokenIcon token={trade.token} color={trade.color} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {trade.token}
                            </span>
                            <span
                              className={`flex items-center gap-0.5 text-xs font-medium ${
                                trade.action === "buy"
                                  ? "text-profit"
                                  : "text-loss"
                              }`}
                            >
                              {trade.action === "buy" ? (
                                <ArrowDownRight className="h-3 w-3" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3" />
                              )}
                              {trade.action === "buy" ? "买入" : "卖出"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {trade.amount}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {trade.profit !== null ? (
                          <p
                            className={`font-medium ${
                              trade.profit >= 0 ? "text-profit" : "text-loss"
                            }`}
                          >
                            {trade.profit >= 0 ? "+" : ""}${trade.profit}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            持仓中
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {trade.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Right Column: Activity Log */}
            <GlassCard className="h-fit p-5 lg:sticky lg:top-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                  <Activity className="h-4 w-4 text-neon-purple" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Agent 活动日志
                </h2>
              </div>

              <div className="space-y-3">
                {activityLog.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-secondary/30"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary/50">
                      <ActivityIcon type={log.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-foreground">
                        {log.message}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {log.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-glass-border pt-4">
                <Button
                  variant="outline"
                  className="w-full border-glass-border bg-transparent text-muted-foreground hover:border-neon-purple/50 hover:bg-neon-purple/10 hover:text-foreground"
                >
                  查看完整日志
                </Button>
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
}

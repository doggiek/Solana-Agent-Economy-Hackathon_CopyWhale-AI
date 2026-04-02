"use client";

import { useEffect, useMemo, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ConnectButton, useWallet } from "@/components/wallet/wallet-connect";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { WalletAnalysis } from "@/lib/wallet-analysis";

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

interface LiveTradeSignal {
  id: string;
  source: string;
  sourceShort: string;
  token: string;
  action: "buy" | "sell";
  amount: string;
  valueUsd: number;
  timestamp: string;
  color: string;
  tokenDetail?: string;
}

interface LiveActivityItem {
  id: string;
  message: string;
  type: string;
  timestamp: string;
}

interface SimulatedPosition {
  key: string;
  source: string;
  sourceShort: string;
  token: string;
  color: string;
  quantity: number;
  costUsd: number;
  lastMarkUsd: number;
}

function shortenAddress(address: string) {
  if (address.length <= 14) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function parseSourceAddresses(input: string) {
  return Array.from(
    new Set(
      input
        .split(/[,\s]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function parseCurrencyValue(value: string) {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCompactAmount(value: string) {
  const cleaned = value.trim().toUpperCase();
  const multiplier = cleaned.endsWith("M")
    ? 1_000_000
    : cleaned.endsWith("K")
      ? 1_000
      : 1;
  const numeric = Number(cleaned.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numeric) ? numeric * multiplier : 0;
}

function buildLiveSignals(analyses: WalletAnalysis[]) {
  const signals: LiveTradeSignal[] = [];

  for (const analysis of analyses) {
    for (const item of analysis.listItems) {
      if (!item.action) {
        continue;
      }

      signals.push({
        id: `${analysis.address}-${item.id}`,
        source: analysis.address,
        sourceShort: shortenAddress(analysis.address),
        token: item.token,
        tokenDetail: item.tokenDetail,
        action: item.action,
        amount: item.amount,
        valueUsd: parseCurrencyValue(item.value),
        timestamp: item.subtitle,
        color: item.color,
      });
    }
  }

  return signals;
}

function buildSimulatedPortfolio(
  signals: LiveTradeSignal[],
  copyPercentage: number,
  options: {
    isAutoCopyEnabled: boolean;
    maxPositionUsd: number;
    stopLossPct: number;
    takeProfitPct: number;
  },
) {
  const ratio = copyPercentage / 100;
  const chronological = [...signals].reverse();
  const openPositions = new Map<string, SimulatedPosition>();
  const history: Array<
    LiveTradeSignal & { profit: number | null; copiedUsd: number; sourceLabel: string }
  > = [];
  const activity: LiveActivityItem[] = [];
  let realizedProfit = 0;

  for (const signal of chronological) {
    const sourceLabel = signal.sourceShort;
    const copiedUsd = Number((signal.valueUsd * ratio).toFixed(2));
    const quantity = parseCompactAmount(signal.amount) * ratio;
    const key = `${signal.source}:${signal.token}`;
    const current = openPositions.get(key);
    const isMemeCandidate = signal.token !== "SOL";

    if (signal.action === "buy") {
      if (!options.isAutoCopyEnabled) {
        activity.push({
          id: `${signal.id}-paused`,
          message: `检测到 ${sourceLabel} 买入 ${signal.token}，但自动跟单未开启，当前仅观察`,
          type: "warning",
          timestamp: signal.timestamp,
        });
        continue;
      }

      if (!isMemeCandidate) {
        activity.push({
          id: `${signal.id}-skip-non-meme`,
          message: `跳过 ${sourceLabel} 的 ${signal.token} 买入信号，当前策略只跟 meme buy`,
          type: "warning",
          timestamp: signal.timestamp,
        });
        continue;
      }

      if (copiedUsd > options.maxPositionUsd) {
        activity.push({
          id: `${signal.id}-cap`,
          message: `跳过 ${sourceLabel} 的 ${signal.token} 买入信号，超出单币仓位上限 $${options.maxPositionUsd}`,
          type: "warning",
          timestamp: signal.timestamp,
        });
        continue;
      }

      const next = current || {
        key,
        source: signal.source,
        sourceShort: signal.sourceShort,
        token: signal.token,
        color: signal.color,
        quantity: 0,
        costUsd: 0,
        lastMarkUsd: 0,
      };
      next.quantity += quantity;
      next.costUsd += copiedUsd;
      next.lastMarkUsd = copiedUsd;
      openPositions.set(key, next);

      history.push({
        ...signal,
        copiedUsd,
        profit: null,
        sourceLabel,
      });
      activity.push({
        id: `${signal.id}-detect`,
        message: `检测到 ${sourceLabel} 买入 ${signal.token}，已生成模拟买入信号`,
        type: "detect",
        timestamp: signal.timestamp,
      });
      continue;
    }

    if (current && current.quantity > 0) {
      const avgCostPerUnit = current.costUsd / current.quantity;
      const closeQty = Math.min(current.quantity, quantity || current.quantity);
      const receivedUsd = copiedUsd || current.costUsd;
      const estimatedCost = closeQty * avgCostPerUnit;
      const profit = Number((receivedUsd - estimatedCost).toFixed(2));

      current.quantity = Math.max(0, current.quantity - closeQty);
      current.costUsd = Math.max(0, current.costUsd - estimatedCost);
      if (current.quantity === 0) {
        openPositions.delete(key);
      } else {
        openPositions.set(key, current);
      }

      realizedProfit += profit;
      history.push({
        ...signal,
        copiedUsd,
        profit,
        sourceLabel,
      });
      activity.push({
        id: `${signal.id}-execute`,
        message: `跟随 ${sourceLabel} 卖出 ${signal.token}，模拟收益 ${profit >= 0 ? "+" : ""}$${profit}`,
        type: profit >= 0 ? "profit" : "warning",
        timestamp: signal.timestamp,
      });
    } else {
      history.push({
        ...signal,
        copiedUsd,
        profit: null,
        sourceLabel,
      });
      activity.push({
        id: `${signal.id}-warning`,
        message: `检测到 ${sourceLabel} 卖出 ${signal.token}，但当前没有对应模拟仓位，已跳过执行`,
        type: "warning",
        timestamp: signal.timestamp,
      });
    }

    if (current && current.quantity > 0 && current.costUsd > 0) {
      const pnlPct = ((current.lastMarkUsd - current.costUsd) / current.costUsd) * 100;

      if (pnlPct <= -options.stopLossPct) {
        activity.push({
          id: `${signal.id}-stop-loss`,
          message: `${current.sourceShort} / ${current.token} 触发模拟止损（-${options.stopLossPct}%）`,
          type: "warning",
          timestamp: signal.timestamp,
        });
      }

      if (pnlPct >= options.takeProfitPct) {
        activity.push({
          id: `${signal.id}-take-profit`,
          message: `${current.sourceShort} / ${current.token} 达到模拟止盈（+${options.takeProfitPct}%）`,
          type: "profit",
          timestamp: signal.timestamp,
        });
      }
    }
  }

  return {
    history: history.reverse().slice(0, 18),
    activity: activity.reverse().slice(0, 18),
    openPositions: Array.from(openPositions.values()),
    realizedProfit: Number(realizedProfit.toFixed(2)),
  };
}

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
  const searchParams = useSearchParams();
  const [hasMounted, setHasMounted] = useState(false);
  const mode = searchParams.get("mode") === "live" ? "live" : "demo";
  const sourceAddress = searchParams.get("source") || "";
  const autoStart = searchParams.get("autostart") === "1";
  const [isAutoCopyEnabled, setIsAutoCopyEnabled] = useState(autoStart);
  const [copyPercentage, setCopyPercentage] = useState([50]);
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [watchlistInput, setWatchlistInput] = useState(sourceAddress);
  const { isConnected } = useWallet();
  const [liveAnalyses, setLiveAnalyses] = useState<WalletAnalysis[]>([]);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(mode === "live");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setIsAutoCopyEnabled(autoStart);
  }, [autoStart, sourceAddress, mode]);

  useEffect(() => {
    setWatchlistInput(sourceAddress);
  }, [sourceAddress]);

  const sourceAddresses = useMemo(
    () => parseSourceAddresses(watchlistInput),
    [watchlistInput],
  );

  useEffect(() => {
    if (mode !== "live") {
      setLiveAnalyses([]);
      setLiveError(null);
      setIsLiveLoading(false);
      return;
    }

    if (sourceAddresses.length === 0) {
      setLiveAnalyses([]);
      setLiveError(null);
      setIsLiveLoading(false);
      return;
    }

    let cancelled = false;

    async function loadLiveAnalyses() {
      setIsLiveLoading(true);
      setLiveError(null);

      try {
        const responses = await Promise.all(
          sourceAddresses.map(async (address) => {
            const response = await fetch(
              `/api/wallet-analysis?address=${encodeURIComponent(address)}&mode=live`,
            );
            const data = (await response.json()) as WalletAnalysis & {
              error?: string;
            };

            if (!response.ok) {
              throw new Error(data.error || `Failed to load ${address}`);
            }

            return data;
          }),
        );

        if (!cancelled) {
          setLiveAnalyses(responses);
        }
      } catch (error) {
        if (!cancelled) {
          setLiveError(
            error instanceof Error ? error.message : "Failed to load live copy-trading data.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLiveLoading(false);
        }
      }
    }

    loadLiveAnalyses();

    return () => {
      cancelled = true;
    };
  }, [mode, sourceAddresses]);

  const sourceLabel = useMemo(() => {
    if (sourceAddresses.length === 0) {
      return mode === "live" ? "未选择 live 地址" : "Demo smart money";
    }

    if (sourceAddresses.length === 1) {
      return shortenAddress(sourceAddresses[0]);
    }

    return `${sourceAddresses.length} 个地址`;
  }, [mode, sourceAddresses]);

  const panelTitle =
    mode === "live" ? "实时跟单控制" : "Demo 跟单控制";
  const panelSubtitle =
    mode === "live"
      ? "当前会话会围绕你刚才选中的 smart money 地址配置跟单，并把最近交易转成模拟执行信号。"
      : "当前为演示模式，下面的数据和执行日志都是 mock。";
  const liveSignals = useMemo(
    () => buildLiveSignals(liveAnalyses),
    [liveAnalyses],
  );
  const simulatedPortfolio = useMemo(
    () =>
      buildSimulatedPortfolio(liveSignals, copyPercentage[0], {
        isAutoCopyEnabled,
        maxPositionUsd: riskLevel === "low" ? 30 : riskLevel === "medium" ? 75 : 150,
        stopLossPct: riskLevel === "low" ? 4 : riskLevel === "medium" ? 6 : 10,
        takeProfitPct: riskLevel === "low" ? 8 : riskLevel === "medium" ? 12 : 18,
      }),
    [copyPercentage, isAutoCopyEnabled, liveSignals, riskLevel],
  );
  const resolvedStats =
    mode === "live"
      ? {
          totalProfit: simulatedPortfolio.realizedProfit,
          dailyProfit: simulatedPortfolio.realizedProfit,
          activeTrades: simulatedPortfolio.openPositions.length,
          watchedWallets: sourceAddresses.length,
          queuedSignals: liveSignals.length,
        }
      : { ...stats, watchedWallets: 1, queuedSignals: tradeHistory.length };
  const resolvedTradeHistory =
    mode === "live"
      ? simulatedPortfolio.history.map((trade, index) => ({
          id: index + 1,
          token: trade.token,
          action: trade.action,
          amount: `${trade.amount} · 跟单 $${trade.copiedUsd.toFixed(2)}`,
          profit: trade.profit,
          timestamp: `${trade.sourceLabel} · ${trade.timestamp}`,
          color: trade.color,
        }))
      : tradeHistory;
  const resolvedActivityLog =
    mode === "live"
      ? [
          {
            id: "live-source",
            message:
              sourceAddresses.length > 0
                ? `正在监听 ${sourceAddresses.length} 个 smart money 地址`
                : "等待选择要跟单的 live 地址",
            type: "detect",
            timestamp: "刚刚",
          },
          {
            id: "live-exec",
            message: isAutoCopyEnabled
              ? "自动跟单已开启，新的买卖信号会进入模拟执行队列"
              : "自动跟单尚未启动，当前只观察不执行",
            type: "execute",
            timestamp: "刚刚",
          },
          ...simulatedPortfolio.activity,
        ]
      : activityLog;

  const riskColors = {
    low: "border-profit/50 bg-profit/10 text-profit",
    medium: "border-neon-purple/50 bg-neon-purple/10 text-neon-purple",
    high: "border-loss/50 bg-loss/10 text-loss",
  };

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-neon-purple/30 blur-[150px]" />
          <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-neon-blue/25 blur-[150px]" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-profit/15 blur-[120px]" />
        </div>
        <div className="relative z-10">
          <header className="border-b border-glass-border bg-glass/50 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue">
                    <Bot className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    TradeBot
                  </span>
                </Link>
                <ConnectButton />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            <GlassCard className="flex min-h-[240px] items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="mx-auto h-7 w-7 animate-spin text-neon-purple" />
                <p className="mt-3 text-sm text-muted-foreground">
                  正在初始化跟单控制台...
                </p>
              </div>
            </GlassCard>
          </main>
        </div>
      </div>
    );
  }

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
                <div className="rounded-full border border-glass-border bg-secondary/40 px-3 py-1.5 text-sm font-medium text-muted-foreground">
                  {mode === "live" ? "Live" : "Demo"}
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
          {mode === "live" && isLiveLoading ? (
            <GlassCard className="mb-6 flex min-h-[180px] items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="mx-auto h-7 w-7 animate-spin text-neon-purple" />
                <p className="mt-3 text-sm text-muted-foreground">
                  正在加载 live 跟单信号...
                </p>
              </div>
            </GlassCard>
          ) : null}

          {mode === "live" && liveError ? (
            <GlassCard className="mb-6 p-5">
              <p className="text-base font-semibold text-loss">Live 数据加载失败</p>
              <p className="mt-2 text-sm text-muted-foreground">{liveError}</p>
            </GlassCard>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Controls */}
            <div className="space-y-6 lg:col-span-2">
              {/* Main Controls */}
              <GlassCard className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">
                      {panelTitle}
                    </h2>
                    <span className="rounded-full border border-glass-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                      {sourceLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {panelSubtitle}
                  </p>
                </div>

                {mode === "live" ? (
                  <div className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-medium text-foreground">跟踪地址池</p>
                      <span className="text-xs text-muted-foreground">
                        支持多个地址，换行或逗号分隔
                      </span>
                    </div>
                    <textarea
                      value={watchlistInput}
                      onChange={(event) => setWatchlistInput(event.target.value)}
                      className="min-h-[96px] w-full rounded-xl border border-glass-border bg-secondary/30 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-neon-purple/50"
                      placeholder="输入一个或多个 smart money 地址"
                    />
                  </div>
                ) : null}

                {/* Auto Copy Toggle */}
                <div className="mb-6 flex items-center justify-between rounded-xl border border-glass-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                      <Zap className="h-5 w-5 text-neon-purple" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">自动跟单</p>
                      <p className="text-sm text-muted-foreground">
                        {mode === "live"
                          ? "只跟 meme buy；卖出时同步卖；遵守单币仓位上限与止盈止损"
                          : "追踪聪明钱并自动复制交易"}
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
                    {mode === "live"
                      ? `${resolvedStats.watchedWallets}`
                      : `$${(resolvedStats.totalProfit / 1000).toFixed(1)}K`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mode === "live" ? "跟踪地址" : "总收益"}
                  </p>
                </GlassCard>

                <GlassCard className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {mode === "live"
                      ? `${resolvedStats.queuedSignals}`
                      : `+$${resolvedStats.dailyProfit.toLocaleString()}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mode === "live" ? "信号队列" : "今日收益"}
                  </p>
                </GlassCard>

                <GlassCard className="p-4 text-center">
                  <p className="text-2xl font-bold text-neon-purple">
                    {resolvedStats.activeTrades}
                  </p>
                  <p className="text-xs text-muted-foreground">活跃交易</p>
                </GlassCard>
              </div>

              {mode === "live" ? (
                <GlassCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                      模拟收益
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      基于 recent trades 的简化跟单策略
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-glass-border bg-secondary/30 p-4">
                      <p className="text-2xl font-bold text-profit">
                        ${resolvedStats.totalProfit.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        模拟已实现收益
                      </p>
                    </div>
                    <div className="rounded-xl border border-glass-border bg-secondary/30 p-4">
                      <p className="text-2xl font-bold text-foreground">
                        {copyPercentage[0]}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        当前跟单比例
                      </p>
                    </div>
                    <div className="rounded-xl border border-glass-border bg-secondary/30 p-4">
                      <p className="text-2xl font-bold text-neon-purple">
                        {simulatedPortfolio.openPositions.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        当前模拟持仓
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-glass-border bg-secondary/20 p-3">
                      <p className="text-sm font-medium text-foreground">
                        单币仓位上限
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ${riskLevel === "low" ? 30 : riskLevel === "medium" ? 75 : 150}
                      </p>
                    </div>
                    <div className="rounded-xl border border-glass-border bg-secondary/20 p-3">
                      <p className="text-sm font-medium text-foreground">
                        模拟止损
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        -{riskLevel === "low" ? 4 : riskLevel === "medium" ? 6 : 10}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-glass-border bg-secondary/20 p-3">
                      <p className="text-sm font-medium text-foreground">
                        模拟止盈
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        +{riskLevel === "low" ? 8 : riskLevel === "medium" ? 12 : 18}%
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ) : null}

              {/* Transaction History */}
              <GlassCard className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    {mode === "live" ? "模拟执行记录" : "交易历史"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {mode === "live" ? "实时队列" : "查看全部"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {resolvedTradeHistory.map((trade) => (
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
                {resolvedActivityLog.map((log) => (
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

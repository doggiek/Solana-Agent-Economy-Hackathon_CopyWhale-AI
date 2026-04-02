"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/dashboard/glass-card";
import {
  ArrowLeft,
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
    copiedUsd: 120,
    profit: 320,
    timestamp: "5 分钟前",
    color: "#f97316",
    sourceLabel: "Demo",
    status: "executed" as const,
  },
  {
    id: 2,
    token: "PEPE",
    action: "buy",
    amount: "8.2M",
    copiedUsd: 80,
    profit: null,
    timestamp: "12 分钟前",
    color: "#10b981",
    sourceLabel: "Demo",
    status: "open" as const,
  },
  {
    id: 3,
    token: "WIF",
    action: "sell",
    amount: "5,000",
    copiedUsd: 95,
    profit: 890,
    timestamp: "45 分钟前",
    color: "#06b6d4",
    sourceLabel: "Demo",
    status: "executed" as const,
  },
  {
    id: 4,
    token: "SHIB",
    action: "sell",
    amount: "500M",
    copiedUsd: 60,
    profit: -120,
    timestamp: "1.5 小时前",
    color: "#ef4444",
    sourceLabel: "Demo",
    status: "executed" as const,
  },
  {
    id: 5,
    token: "ARB",
    action: "buy",
    amount: "2,500",
    copiedUsd: 75,
    profit: null,
    timestamp: "2 小时前",
    color: "#8b5cf6",
    sourceLabel: "Demo",
    status: "open" as const,
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

const LIVE_WATCHLIST_STORAGE_KEY = "copywhale-live-watchlist";

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

interface FollowTask {
  key: string;
  source: string;
  sourceShort: string;
  status: "running" | "paused" | "error";
  riskLevel: "low" | "medium" | "high";
  copyPercentage: number;
  signalCount: number;
  latestSignalLabel: string;
  latestSignalTimestamp: string;
  realizedProfitUsd: number;
  openPositions: number;
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
  currentValueUsd: number;
}

interface SimulatedTradeRecord {
  id: string;
  source: string;
  sourceLabel: string;
  token: string;
  action: "buy" | "sell";
  amount: string;
  copiedUsd: number;
  profit: number | null;
  timestamp: string;
  color: string;
  status: "executed" | "skipped" | "open";
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
    pausedSources: Set<string>;
  },
) {
  const ratio = copyPercentage / 100;
  const chronological = [...signals].reverse();
  const openPositions = new Map<string, SimulatedPosition>();
  const history: SimulatedTradeRecord[] = [];
  const activity: LiveActivityItem[] = [];
  let realizedProfit = 0;

  for (const signal of chronological) {
    const sourceLabel = signal.sourceShort;
    const copiedUsd = Number((signal.valueUsd * ratio).toFixed(2));
    const quantity = parseCompactAmount(signal.amount) * ratio;
    const key = `${signal.source}:${signal.token}`;
    const current = openPositions.get(key);
    const isMemeCandidate = signal.token !== "SOL";
    const isSourcePaused = options.pausedSources.has(signal.source);

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

      if (isSourcePaused) {
        activity.push({
          id: `${signal.id}-task-paused`,
          message: `${sourceLabel} 当前已暂停，跳过 ${signal.token} 买入信号`,
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
        currentValueUsd: 0,
      };
      next.quantity += quantity;
      next.costUsd += copiedUsd;
      next.lastMarkUsd = copiedUsd;
      next.currentValueUsd = copiedUsd;
      openPositions.set(key, next);

      history.push({
        id: signal.id,
        source: signal.source,
        token: signal.token,
        action: signal.action,
        amount: signal.amount,
        timestamp: signal.timestamp,
        color: signal.color,
        copiedUsd,
        profit: null,
        sourceLabel,
        status: "open",
      });
      activity.push({
        id: `${signal.id}-detect`,
        message: `检测到 ${sourceLabel} 买入 ${signal.token}，已生成模拟买入信号`,
        type: "detect",
        timestamp: signal.timestamp,
      });
      continue;
    }

    if (isSourcePaused) {
      history.push({
        id: signal.id,
        source: signal.source,
        token: signal.token,
        action: signal.action,
        amount: signal.amount,
        timestamp: signal.timestamp,
        color: signal.color,
        copiedUsd,
        profit: null,
        sourceLabel,
        status: "skipped",
      });
      activity.push({
        id: `${signal.id}-task-paused-sell`,
        message: `${sourceLabel} 当前已暂停，卖出信号仅记录不执行`,
        type: "warning",
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
        id: signal.id,
        source: signal.source,
        token: signal.token,
        action: signal.action,
        amount: signal.amount,
        timestamp: signal.timestamp,
        color: signal.color,
        copiedUsd,
        profit,
        sourceLabel,
        status: "executed",
      });
      activity.push({
        id: `${signal.id}-execute`,
        message: `跟随 ${sourceLabel} 卖出 ${signal.token}，模拟收益 ${profit >= 0 ? "+" : ""}$${profit}`,
        type: profit >= 0 ? "profit" : "warning",
        timestamp: signal.timestamp,
      });
    } else {
      history.push({
        id: signal.id,
        source: signal.source,
        token: signal.token,
        action: signal.action,
        amount: signal.amount,
        timestamp: signal.timestamp,
        color: signal.color,
        copiedUsd,
        profit: null,
        sourceLabel,
        status: "skipped",
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

  for (const position of openPositions.values()) {
    position.currentValueUsd = Number(position.lastMarkUsd.toFixed(2));
  }

  return {
    history: history.reverse().slice(0, 18),
    activity: activity.reverse().slice(0, 18),
    openPositions: Array.from(openPositions.values()),
    realizedProfit: Number(realizedProfit.toFixed(2)),
  };
}

function buildFollowTasks(
  analyses: WalletAnalysis[],
  simulatedPortfolio: {
    history: SimulatedTradeRecord[];
    openPositions: SimulatedPosition[];
  },
  options: {
    isAutoCopyEnabled: boolean;
    riskLevel: "low" | "medium" | "high";
    copyPercentage: number;
    pausedSources: Set<string>;
  },
): FollowTask[] {
  return analyses.map((analysis) => {
    const latestItem = analysis.listItems[0];
    const isPaused = options.pausedSources.has(analysis.address);
    const realizedProfitUsd = simulatedPortfolio.history
      .filter(
        (record) =>
          record.source === analysis.address && typeof record.profit === "number",
      )
      .reduce((sum, record) => sum + (record.profit || 0), 0);
    const openPositions = simulatedPortfolio.openPositions.filter(
      (position) => position.source === analysis.address,
    ).length;
    return {
      key: analysis.address,
      source: analysis.address,
      sourceShort: shortenAddress(analysis.address),
      status: options.isAutoCopyEnabled && !isPaused ? "running" : "paused",
      riskLevel: options.riskLevel,
      copyPercentage: options.copyPercentage,
      signalCount: analysis.metrics?.recentTradeCount ?? analysis.listItems.length,
      latestSignalLabel: latestItem
        ? `${latestItem.action === "buy" ? "买入" : latestItem.action === "sell" ? "卖出" : "观察"} ${latestItem.token}`
        : "等待实时信号",
      latestSignalTimestamp: latestItem?.subtitle || "暂无更新",
      realizedProfitUsd: Number(realizedProfitUsd.toFixed(2)),
      openPositions,
    };
  });
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

function formatUsd(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}$${value.toFixed(2)}`;
}

export default function CopyTradingPage() {
  const searchParams = useSearchParams();
  const [hasMounted, setHasMounted] = useState(false);
  const mode = searchParams.get("mode") === "live" ? "live" : "demo";
  const sourceAddress = searchParams.get("source") || "";
  const autoStart = searchParams.get("autostart") === "1";
  const ratioParam = Number(searchParams.get("ratio") || "50");
  const normalizedRatio = Number.isFinite(ratioParam)
    ? Math.min(100, Math.max(10, ratioParam))
    : 50;
  const riskParam = searchParams.get("risk");
  const normalizedRisk =
    riskParam === "low" || riskParam === "medium" || riskParam === "high"
      ? riskParam
      : "medium";
  const [isAutoCopyEnabled, setIsAutoCopyEnabled] = useState(autoStart);
  const [copyPercentage, setCopyPercentage] = useState([normalizedRatio]);
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">(
    normalizedRisk,
  );
  const [watchlistInput, setWatchlistInput] = useState(sourceAddress);
  const [pausedSources, setPausedSources] = useState<string[]>([]);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState("all");
  const [selectedTokenFilter, setSelectedTokenFilter] = useState("all");
  const [positionSortBy, setPositionSortBy] = useState<
    "value_desc" | "source_asc" | "token_asc"
  >("value_desc");
  const [closedPositionKeys, setClosedPositionKeys] = useState<string[]>([]);
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
    setCopyPercentage([normalizedRatio]);
  }, [normalizedRatio, sourceAddress, mode]);

  useEffect(() => {
    setRiskLevel(normalizedRisk);
  }, [normalizedRisk, sourceAddress, mode]);

  useEffect(() => {
    if (!hasMounted || mode !== "live") {
      return;
    }

    const storedInput =
      window.localStorage.getItem(LIVE_WATCHLIST_STORAGE_KEY) || "";
    const storedSources = parseSourceAddresses(storedInput);
    const mergedSources = sourceAddress
      ? Array.from(new Set([...storedSources, sourceAddress]))
      : storedSources;
    const nextInput = mergedSources.join("\n");

    setWatchlistInput(nextInput);

    if (nextInput !== storedInput) {
      window.localStorage.setItem(LIVE_WATCHLIST_STORAGE_KEY, nextInput);
    }
  }, [hasMounted, mode, sourceAddress]);

  useEffect(() => {
    if (!hasMounted || mode !== "live") {
      return;
    }

    window.localStorage.setItem(
      LIVE_WATCHLIST_STORAGE_KEY,
      parseSourceAddresses(watchlistInput).join("\n"),
    );
  }, [hasMounted, mode, watchlistInput]);

  useEffect(() => {
    setPausedSources((current) =>
      current.filter((source) => parseSourceAddresses(watchlistInput).includes(source)),
    );
  }, [watchlistInput]);

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
      return mode === "live" ? "未选择 live 地址" : "Demo 聪明钱";
    }

    if (sourceAddresses.length === 1) {
      return shortenAddress(sourceAddresses[0]);
    }

    return `${sourceAddresses.length} 个地址`;
  }, [mode, sourceAddresses]);

  const panelTitle =
    mode === "live" ? "跟单任务池" : "Demo 跟单控制";
  const panelSubtitle =
    mode === "live"
      ? "这里展示当前会话里正在跟踪的 smart money 地址池与任务运行状态。"
      : "当前为演示模式，下面的数据和执行日志来自内置 demo 数据集。";
  const liveSignals = useMemo(
    () => buildLiveSignals(liveAnalyses),
    [liveAnalyses],
  );
  const pausedSourceSet = useMemo(() => new Set(pausedSources), [pausedSources]);
  const simulatedPortfolio = useMemo(
    () =>
      buildSimulatedPortfolio(liveSignals, copyPercentage[0], {
        isAutoCopyEnabled,
        maxPositionUsd: riskLevel === "low" ? 30 : riskLevel === "medium" ? 75 : 150,
        stopLossPct: riskLevel === "low" ? 4 : riskLevel === "medium" ? 6 : 10,
        takeProfitPct: riskLevel === "low" ? 8 : riskLevel === "medium" ? 12 : 18,
        pausedSources: pausedSourceSet,
      }),
    [copyPercentage, isAutoCopyEnabled, liveSignals, pausedSourceSet, riskLevel],
  );
  const followTasks = useMemo(
    () =>
      buildFollowTasks(liveAnalyses, simulatedPortfolio, {
        isAutoCopyEnabled,
        riskLevel,
        copyPercentage: copyPercentage[0],
        pausedSources: pausedSourceSet,
      }),
    [
      copyPercentage,
      isAutoCopyEnabled,
      liveAnalyses,
      pausedSourceSet,
      riskLevel,
      simulatedPortfolio,
    ],
  );
  const resolvedStats =
    mode === "live"
      ? {
          totalProfit: simulatedPortfolio.realizedProfit,
          dailyProfit: simulatedPortfolio.realizedProfit,
          activeTrades: simulatedPortfolio.openPositions.length,
          watchedWallets: sourceAddresses.length,
          queuedSignals: liveSignals.length,
          memeTrades: liveAnalyses.reduce(
            (sum, analysis) => sum + (analysis.metrics?.memeTradeCount ?? 0),
            0,
          ),
          trackedTokens: Array.from(
            new Set(simulatedPortfolio.history.map((trade) => trade.token)),
          ).length,
        }
      : {
          ...stats,
          watchedWallets: 1,
          queuedSignals: tradeHistory.length,
          memeTrades: 0,
          trackedTokens: Array.from(
            new Set(tradeHistory.map((trade) => trade.token)),
          ).length,
        };
  const resolvedTradeHistory =
    mode === "live"
      ? simulatedPortfolio.history
      : tradeHistory;
  const executionSourceOptions = useMemo(() => {
    if (mode !== "live") {
      return [];
    }

    return Array.from(
      new Set(resolvedTradeHistory.map((trade) => trade.sourceLabel)),
    );
  }, [mode, resolvedTradeHistory]);
  const executionTokenOptions = useMemo(() => {
    if (mode !== "live") {
      return [];
    }

    return Array.from(new Set(resolvedTradeHistory.map((trade) => trade.token)));
  }, [mode, resolvedTradeHistory]);
  const filteredTradeHistory = useMemo(() => {
    if (mode !== "live") {
      return resolvedTradeHistory;
    }

    return resolvedTradeHistory.filter((trade) => {
      const sourceMatches =
        selectedSourceFilter === "all" || trade.sourceLabel === selectedSourceFilter;
      const tokenMatches =
        selectedTokenFilter === "all" || trade.token === selectedTokenFilter;
      return sourceMatches && tokenMatches;
    });
  }, [mode, resolvedTradeHistory, selectedSourceFilter, selectedTokenFilter]);
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
  const visibleOpenPositions = useMemo(() => {
    const positions = simulatedPortfolio.openPositions.filter(
      (position) => !closedPositionKeys.includes(position.key),
    );

    const sorted = [...positions];
    if (positionSortBy === "source_asc") {
      sorted.sort((a, b) => a.sourceShort.localeCompare(b.sourceShort));
    } else if (positionSortBy === "token_asc") {
      sorted.sort((a, b) => a.token.localeCompare(b.token));
    } else {
      sorted.sort((a, b) => b.currentValueUsd - a.currentValueUsd);
    }

    return sorted;
  }, [closedPositionKeys, positionSortBy, simulatedPortfolio.openPositions]);

  const toggleTaskPause = (source: string) => {
    setPausedSources((current) =>
      current.includes(source)
        ? current.filter((item) => item !== source)
        : [...current, source],
    );
  };

  const removeTask = (source: string) => {
    const nextSources = parseSourceAddresses(watchlistInput).filter(
      (item) => item !== source,
    );
    setWatchlistInput(nextSources.join("\n"));
    setPausedSources((current) => current.filter((item) => item !== source));
  };

  const closePosition = (positionKey: string) => {
    setClosedPositionKeys((current) =>
      current.includes(positionKey) ? current : [...current, positionKey],
    );
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
            <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue">
                    <Bot className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    CopyWhale AI
                  </span>
                </Link>
                <ConnectButton />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
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
        <header className="border-b border-glass-border bg-glass/50 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl border border-glass-border bg-glass/50 text-muted-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-neon-purple" />
                  <h1 className="text-xl font-semibold text-foreground">
                    交易面板
                  </h1>
                  <div
                    className={`ml-1 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
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
                  <span className="rounded-full border border-glass-border bg-secondary/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {mode === "live" ? "Live" : "Demo"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ConnectButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
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
              <div className="mb-4 flex items-center gap-2 px-1">
                <Activity className="h-4 w-4 text-neon-blue" />
                <p className="text-base font-semibold text-foreground">
                  控制台概览
                </p>
              </div>
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
                      ? `${resolvedStats.trackedTokens}`
                      : `+$${resolvedStats.dailyProfit.toLocaleString()}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mode === "live" ? "交易 Token" : "今日收益"}
                  </p>
                </GlassCard>

                <GlassCard className="p-4 text-center">
                  <p className="text-2xl font-bold text-neon-purple">
                    {resolvedStats.activeTrades}
                  </p>
                  <p className="text-xs text-muted-foreground">活跃交易</p>
                </GlassCard>
              </div>

              {mode === "demo" ? (
                <GlassCard className="p-6">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                        <Zap className="h-5 w-5 text-neon-purple" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          {panelTitle}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {panelSubtitle}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-glass-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                      {sourceLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-glass-border bg-secondary/30 p-4">
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
                </GlassCard>
              ) : null}

              {mode === "live" ? (
                <>
                  <GlassCard className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neon-blue">
                          Tasks
                        </p>
                        <h2 className="text-lg font-semibold text-foreground">
                          跟单任务
                        </h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {sourceAddresses.length} 个地址正在跟踪
                        </span>
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
                    </div>
                    <div className="space-y-3">
                      {followTasks.length > 0 ? (
                        followTasks.map((task) => (
                          <div
                            key={task.key}
                            className="flex flex-col gap-3 rounded-xl border border-glass-border bg-secondary/25 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">
                                  {task.sourceShort}
                                </p>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                    task.status === "running"
                                      ? "border border-profit/30 bg-profit/10 text-profit"
                                      : task.status === "paused"
                                        ? "border border-loss/30 bg-loss/10 text-loss"
                                        : "border border-glass-border bg-secondary/50 text-muted-foreground"
                                  }`}
                                >
                                  {task.status === "running"
                                    ? "运行中"
                                    : task.status === "paused"
                                      ? "已暂停"
                                      : "异常"}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {task.latestSignalLabel} · {task.latestSignalTimestamp}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-center text-xs text-muted-foreground sm:min-w-[220px]">
                              <div className="rounded-lg bg-secondary/40 px-3 py-2">
                                <p
                                  className={`text-base font-semibold ${
                                    task.realizedProfitUsd >= 0
                                      ? "text-profit"
                                      : "text-loss"
                                  }`}
                                >
                                  {formatUsd(task.realizedProfitUsd)}
                                </p>
                                <p>任务收益</p>
                              </div>
                              <div className="rounded-lg bg-secondary/40 px-3 py-2">
                                <p className="text-base font-semibold capitalize text-foreground">
                                  {task.openPositions}
                                </p>
                                <p>持仓数</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:self-stretch">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-glass-border bg-transparent text-muted-foreground hover:border-neon-purple/50 hover:bg-neon-purple/10 hover:text-foreground"
                                onClick={() => toggleTaskPause(task.source)}
                              >
                                {task.status === "running" ? "暂停" : "恢复"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-loss/30 bg-transparent text-loss hover:bg-loss/10"
                                onClick={() => removeTask(task.source)}
                              >
                                移除
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-glass-border bg-secondary/20 p-6 text-center text-sm text-muted-foreground">
                          还没有 live 跟单任务。输入 smart money 地址后，这里会出现运行中的任务卡。
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  <GlassCard className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neon-purple">
                          Portfolio
                        </p>
                        <h2 className="text-lg font-semibold text-foreground">
                          当前持仓
                        </h2>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        当前模拟仓位与浮盈亏
                      </span>
                    </div>
                    <div className="mb-4 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-glass-border bg-secondary/30 p-4">
                        <p className="text-2xl font-bold text-profit">
                          ${resolvedStats.totalProfit.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">模拟已实现收益</p>
                      </div>
                      <div className="rounded-xl border border-glass-border bg-secondary/30 p-4">
                        <p className="text-2xl font-bold text-foreground">
                          {copyPercentage[0]}%
                        </p>
                        <p className="text-xs text-muted-foreground">当前跟单比例</p>
                      </div>
                      <div className="rounded-xl border border-glass-border bg-secondary/30 p-4">
                        <p className="text-2xl font-bold text-neon-purple">
                          {visibleOpenPositions.length}
                        </p>
                        <p className="text-xs text-muted-foreground">当前模拟持仓</p>
                      </div>
                    </div>
                    <div className="mb-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-glass-border bg-secondary/20 p-3">
                        <p className="text-sm font-medium text-foreground">单币仓位上限</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          ${riskLevel === "low" ? 30 : riskLevel === "medium" ? 75 : 150}
                        </p>
                      </div>
                      <div className="rounded-xl border border-glass-border bg-secondary/20 p-3">
                        <p className="text-sm font-medium text-foreground">模拟止损</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          -{riskLevel === "low" ? 4 : riskLevel === "medium" ? 6 : 10}%
                        </p>
                      </div>
                      <div className="rounded-xl border border-glass-border bg-secondary/20 p-3">
                        <p className="text-sm font-medium text-foreground">模拟止盈</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          +{riskLevel === "low" ? 8 : riskLevel === "medium" ? 12 : 18}%
                        </p>
                      </div>
                    </div>
                    <div className="mb-4 flex items-center justify-end">
                      <select
                        value={positionSortBy}
                        onChange={(event) =>
                          setPositionSortBy(
                            event.target.value as "value_desc" | "source_asc" | "token_asc",
                          )
                        }
                        className="rounded-xl border border-glass-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none focus:border-neon-purple/50"
                      >
                        <option value="value_desc">按持仓价值排序</option>
                        <option value="source_asc">按来源地址排序</option>
                        <option value="token_asc">按 Token 排序</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      {visibleOpenPositions.length > 0 ? (
                        visibleOpenPositions.map((position) => {
                          const unrealized =
                            position.currentValueUsd - position.costUsd;
                          const unrealizedPct =
                            position.costUsd > 0
                              ? (unrealized / position.costUsd) * 100
                              : 0;
                          return (
                            <div
                              key={position.key}
                              className="flex items-center justify-between rounded-xl border border-glass-border bg-secondary/20 p-4"
                            >
                              <div className="flex items-center gap-3">
                                <TokenIcon token={position.token} color={position.color} />
                                <div>
                                  <p className="font-medium text-foreground">
                                    {position.token}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    来源 {position.sourceShort} · 持仓 {position.quantity.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-right text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground">成本</p>
                                  <p className="font-medium text-foreground">
                                    ${position.costUsd.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">当前价值</p>
                                  <p className="font-medium text-foreground">
                                    ${position.currentValueUsd.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">浮盈亏</p>
                                  <p
                                    className={`font-medium ${
                                      unrealized >= 0 ? "text-profit" : "text-loss"
                                    }`}
                                  >
                                    {formatUsd(unrealized)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {unrealizedPct >= 0 ? "+" : ""}
                                    {unrealizedPct.toFixed(2)}%
                                  </p>
                                </div>
                              </div>
                              <div className="ml-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="border-loss/30 bg-transparent text-loss hover:bg-loss/10"
                                  onClick={() => closePosition(position.key)}
                                >
                                  关闭
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-xl border border-dashed border-glass-border bg-secondary/20 p-6 text-center text-sm text-muted-foreground">
                          当前没有打开的模拟仓位。开启自动跟单并等到下一笔买入信号后，这里会出现仓位。
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </>
              ) : null}

              {/* Transaction History */}
              <GlassCard className="p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-profit">
                        Execution
                      </p>
                      <h2 className="text-lg font-semibold text-foreground">
                        {mode === "live" ? "执行记录" : "交易历史"}
                      </h2>
                    </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {mode === "live" ? "实时队列" : "查看全部"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                {mode === "live" ? (
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <select
                      value={selectedSourceFilter}
                      onChange={(event) => setSelectedSourceFilter(event.target.value)}
                      className="rounded-xl border border-glass-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none focus:border-neon-purple/50"
                    >
                      <option value="all">全部来源地址</option>
                      {executionSourceOptions.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedTokenFilter}
                      onChange={(event) => setSelectedTokenFilter(event.target.value)}
                      className="rounded-xl border border-glass-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none focus:border-neon-purple/50"
                    >
                      <option value="all">全部 Token</option>
                      {executionTokenOptions.map((token) => (
                        <option key={token} value={token}>
                          {token}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div className="space-y-3">
                  {filteredTradeHistory.map((trade, index) => (
                    <div
                      key={mode === "live" ? trade.id : trade.id ?? index}
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
                            {mode === "live"
                              ? `${trade.amount} · 跟单 $${trade.copiedUsd.toFixed(2)}`
                              : trade.amount}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {mode === "live" ? (
                          <p
                            className={`text-xs font-medium ${
                              trade.status === "executed"
                                ? "text-profit"
                                : trade.status === "skipped"
                                  ? "text-loss"
                                  : "text-neon-blue"
                            }`}
                          >
                            {trade.status === "executed"
                              ? "executed"
                              : trade.status === "skipped"
                                ? "skipped"
                                : "open"}
                          </p>
                        ) : null}
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
                            {mode === "live" ? "待平仓" : "持仓中"}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {mode === "live"
                            ? `${trade.sourceLabel} · ${trade.timestamp}`
                            : trade.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  {filteredTradeHistory.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-glass-border bg-secondary/20 p-6 text-center text-sm text-muted-foreground">
                      当前筛选条件下没有执行记录。
                    </div>
                  ) : null}
                </div>
              </GlassCard>
            </div>

            {/* Right Column: Activity Log */}
            <GlassCard className="h-fit p-5 lg:sticky lg:top-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                    <Activity className="h-4 w-4 text-neon-purple" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neon-purple">
                      Agent
                    </p>
                    <h2 className="text-lg font-semibold text-foreground">
                      活动日志
                    </h2>
                  </div>
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

"use client";

import { use, useEffect, useState } from "react";
import { GlassCard } from "@/components/dashboard/glass-card";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  CircleHelp,
  Copy,
  Check,
  TrendingUp,
  Zap,
  ChartLine,
  Loader2,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WalletAnalysis } from "@/lib/wallet-analysis";

function TokenIcon({ token, color }: { token: string; color: string }) {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-foreground"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {token.slice(0, 2)}
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    "Smart Money": "from-profit to-emerald-400",
    Whale: "from-neon-blue to-cyan-400",
    Degen: "from-loss to-orange-400",
  };

  return (
    <span
      className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-foreground ${colors[tag] || colors["Smart Money"]}`}
    >
      {tag}
    </span>
  );
}

function FollowDecisionBadge({ verdict }: { verdict: "follow" | "watch" | "avoid" }) {
  const styles = {
    follow: "border-profit/30 bg-profit/10 text-profit",
    watch: "border-neon-blue/30 bg-neon-blue/10 text-neon-blue",
    avoid: "border-loss/30 bg-loss/10 text-loss",
  } as const;

  const labels = {
    follow: "可跟单",
    watch: "先观察",
    avoid: "暂回避",
  } as const;

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[verdict]}`}
    >
      {labels[verdict]}
    </span>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone?: "profit" | "neutral" | "warning";
}) {
  const styles = {
    profit: "border-profit/30 bg-profit/10 text-profit",
    neutral: "border-glass-border bg-secondary/60 text-muted-foreground",
    warning: "border-loss/30 bg-loss/10 text-loss",
  } as const;

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[tone || "neutral"]}`}
    >
      {label}
    </span>
  );
}

function formatChartValue(value: number, prefix = "") {
  const abs = Math.abs(value);
  if (abs >= 1000000) {
    return `${prefix}${(value / 1000000).toFixed(1)}M`;
  }
  if (abs >= 1000) {
    return `${prefix}${(value / 1000).toFixed(1)}K`;
  }
  return `${prefix}${value.toFixed(0)}`;
}

export default function WalletAnalyticsPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "live" ? "live" : "demo";

  const [copied, setCopied] = useState(false);
  const [isAutoCopyEnabled, setIsAutoCopyEnabled] = useState(false);
  const [copyPercentage, setCopyPercentage] = useState([50]);
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalysis() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/wallet-analysis?address=${encodeURIComponent(address)}&mode=${mode}`,
          {
            signal: controller.signal,
          },
        );

        const data = (await response.json()) as WalletAnalysis & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Failed to load wallet analysis");
        }

        setAnalysis(data);
      } catch (loadError) {
        if ((loadError as Error).name === "AbortError") {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load wallet analysis",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalysis();

    return () => controller.abort();
  }, [address, mode]);

  const copyAddress = () => {
    if (!analysis) {
      return;
    }

    navigator.clipboard.writeText(analysis.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tradeDegraded = analysis?.metrics?.recentTradeStatus === "degraded";
  const riskColors = {
    low: "border-profit/50 bg-profit/10 text-profit",
    medium: "border-neon-purple/50 bg-neon-purple/10 text-neon-purple",
    high: "border-loss/50 bg-loss/10 text-loss",
  } as const;

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl border border-glass-border bg-glass/50 text-muted-foreground transition-all hover:border-neon-purple/50 hover:bg-neon-purple/10 hover:text-foreground"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon-blue">
                    <span className="text-lg font-bold text-foreground">
                      {(analysis?.displayAddress || address)
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-lg font-semibold text-foreground">
                        {analysis?.displayAddress || address}
                      </h1>
                      {analysis && (
                        <>
                          <button
                            onClick={copyAddress}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-profit" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                          <TagBadge tag={analysis.tag} />
                          <span className="rounded-full border border-glass-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                            {analysis.mode === "live" ? "Live" : "Demo"}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">
                      {analysis?.shortAddress || address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-profit/30 bg-profit/10 px-4 py-2">
                <TrendingUp className="h-5 w-5 text-profit" />
                <div>
                  <div className="text-lg font-bold text-profit">
                    {analysis?.heroValue || "--"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analysis?.heroLabel || "加载中"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {isLoading ? (
            <GlassCard className="flex min-h-[420px] items-center justify-center p-10">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-neon-purple" />
                <p className="mt-4 text-sm text-muted-foreground">
                  正在加载 {mode === "live" ? "Covalent 实时数据" : "Demo 数据"}
                  ...
                </p>
              </div>
            </GlassCard>
          ) : error ? (
            <GlassCard className="p-8">
              <p className="text-lg font-semibold text-loss">加载失败</p>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>排查建议：</p>
                <p>1. 确认 `.env.local` 里已有 `COVALENT_API_KEY`。</p>
                <p>
                  2. 如果报错和 recent trades / RPC 有关，请在 `.env.local`
                  增加 `SOLANA_RPC_URL`；像 Tatum 这类服务还需要
                  `SOLANA_RPC_API_KEY`。
                </p>
                <p>
                  3. 修改 `.env.local` 后需要重启 `npm run dev`，Next.js
                  才会重新读取环境变量。
                </p>
                <p>
                  4. 目前 live 模式依赖 Covalent + Solana RPC，任一上游网络异常都可能影响部分数据。
                </p>
              </div>
            </GlassCard>
          ) : analysis ? (
            <>
              <div className="mb-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <GlassCard className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                      <Brain className="h-4 w-4 text-neon-purple" />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">
                      AI 洞察
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {analysis.insight}
                  </p>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Radio className="h-4 w-4 text-neon-blue" />
                    <h2 className="text-base font-semibold text-foreground">
                      数据来源
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.source}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    最近同步: {analysis.updatedAtLabel}
                  </p>
                </GlassCard>
              </div>

              {tradeDegraded ? (
                <GlassCard className="mb-6 border border-loss/20 p-4">
                  <p className="text-sm font-medium text-loss">
                    最近交易抓取受限
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    当前页面已经回退为资产视图。最常见原因是公共 Solana RPC 被限流；接入
                    Helius 这类专用 RPC 后，recent trades、Meme 交易和买卖比会恢复。
                  </p>
                </GlassCard>
              ) : null}

              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                {analysis.stats.map((stat) => (
                  <GlassCard key={stat.label} className="p-4 text-center">
                    <p
                      className={`text-2xl font-bold ${
                        stat.tone === "profit"
                          ? "text-profit"
                          : stat.tone === "warning"
                            ? "text-loss"
                            : "text-foreground"
                      }`}
                    >
                      {stat.value}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <span>{stat.label}</span>
                      {stat.description ? (
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex cursor-help items-center"
                              aria-label={`${stat.label} 说明`}
                            >
                              <CircleHelp className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            sideOffset={8}
                            className="max-w-[260px] border border-glass-border bg-card text-muted-foreground shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
                          >
                            {stat.description}
                          </TooltipContent>
                        </UITooltip>
                      ) : null}
                    </div>
                  </GlassCard>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <GlassCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground">
                      {analysis.listTitle}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {analysis.mode === "live" ? "实时返回" : "演示数据"}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {analysis.listItems.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between rounded-xl border border-transparent bg-secondary/30 p-3 transition-all duration-200 hover:border-glass-border hover:bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <TokenIcon token={item.token} color={item.color} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {item.token}
                              </span>
                              {item.tokenDetail &&
                              item.tokenDetail !== item.token ? (
                                <span className="text-xs text-muted-foreground">
                                  {item.tokenDetail}
                                </span>
                              ) : null}
                              {item.action && (
                                <span
                                  className={`flex items-center gap-0.5 text-xs font-medium ${
                                    item.action === "buy"
                                      ? "text-profit"
                                      : "text-loss"
                                  }`}
                                >
                                  {item.action === "buy" ? (
                                    <ArrowDownRight className="h-3 w-3" />
                                  ) : (
                                    <ArrowUpRight className="h-3 w-3" />
                                  )}
                                  {item.action === "buy" ? "买入" : "卖出"}
                                </span>
                              )}
                              {item.statusLabel ? (
                                <StatusBadge
                                  label={item.statusLabel}
                                  tone={item.statusTone}
                                />
                              ) : null}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.amount} · {item.value}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {item.subtitle}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <div className="space-y-6">
                  <GlassCard className="p-5">
                    <h3 className="mb-4 text-base font-semibold text-foreground">
                      {analysis.chartTitle}
                    </h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analysis.chartData}>
                          <defs>
                            <linearGradient
                              id="analysisGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="var(--profit)"
                                stopOpacity={0.4}
                              />
                              <stop
                                offset="100%"
                                stopColor="var(--profit)"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "var(--muted-foreground)",
                              fontSize: 12,
                            }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "var(--muted-foreground)",
                              fontSize: 12,
                            }}
                            tickFormatter={(value) =>
                              formatChartValue(value, analysis.chartValuePrefix)
                            }
                          />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--glass-border)",
                              borderRadius: "12px",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                            }}
                            labelStyle={{ color: "var(--foreground)" }}
                            itemStyle={{ color: "var(--profit)" }}
                            formatter={(value: number) => [
                              formatChartValue(
                                value,
                                analysis.chartValuePrefix,
                              ),
                              analysis.chartTitle,
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="var(--profit)"
                            strokeWidth={2}
                            fill="url(#analysisGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>

                  {analysis.followDecision ? (
                    <GlassCard className="p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-neon-blue" />
                        <h3 className="text-base font-semibold text-foreground">
                          跟单判断
                        </h3>
                        <FollowDecisionBadge
                          verdict={analysis.followDecision.verdict}
                        />
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {analysis.followDecision.summary}
                      </p>
                      {analysis.metrics ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          当前交易覆盖率：{analysis.metrics.parsedTradeCoverageLabel}
                          。这表示我们只在最近扫描的链上签名里，还原出了这部分明确的买卖。
                        </p>
                      ) : null}

                      <div className="mt-5 space-y-5">
                        <div>
                          <p className="mb-3 text-sm font-medium text-foreground">风险等级</p>
                          <div className="grid grid-cols-3 gap-3">
                            {(["low", "medium", "high"] as const).map((level) => (
                              <button
                                key={level}
                                type="button"
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

                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">跟单比例</p>
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

                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-xl border border-glass-border bg-secondary/30 px-4 py-3">
                            <p className="text-sm font-medium text-foreground">单币仓位上限</p>
                            <p className="text-sm text-muted-foreground">
                              ${riskLevel === "low" ? 30 : riskLevel === "medium" ? 75 : 150}
                            </p>
                          </div>
                          <div className="flex items-center justify-between rounded-xl border border-glass-border bg-secondary/30 px-4 py-3">
                            <p className="text-sm font-medium text-foreground">模拟止损</p>
                            <p className="text-sm text-muted-foreground">
                              -{riskLevel === "low" ? 4 : riskLevel === "medium" ? 6 : 10}%
                            </p>
                          </div>
                          <div className="flex items-center justify-between rounded-xl border border-glass-border bg-secondary/30 px-4 py-3">
                            <p className="text-sm font-medium text-foreground">模拟止盈</p>
                            <p className="text-sm text-muted-foreground">
                              +{riskLevel === "low" ? 8 : riskLevel === "medium" ? 12 : 18}%
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <Button
                            onClick={() => {
                              setIsAutoCopyEnabled(true);
                              const target = `/copy-trading?mode=${analysis.mode}&source=${encodeURIComponent(
                                analysis.address,
                              )}&autostart=1&ratio=${copyPercentage[0]}&risk=${riskLevel}`;
                              window.open(target, "_blank", "noopener,noreferrer");
                            }}
                            className={`group relative h-12 overflow-hidden rounded-2xl text-sm font-semibold transition-all duration-300 ${
                              analysis.followDecision.verdict === "follow"
                                ? "bg-gradient-to-r from-neon-purple to-neon-blue text-foreground hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <Zap
                                className={`h-5 w-5 ${isAutoCopyEnabled ? "animate-pulse" : ""}`}
                              />
                              {isAutoCopyEnabled ? "跳转到交易面板" : "加入自动跟单池"}
                            </span>
                            {analysis.followDecision.verdict === "follow" ? (
                              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            ) : null}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-2xl border-glass-border bg-transparent text-muted-foreground hover:border-neon-purple/50 hover:bg-neon-purple/10 hover:text-foreground"
                            onClick={() => {
                              const target = `/copy-trading?mode=${analysis.mode}&source=${encodeURIComponent(
                                analysis.address,
                              )}&ratio=${copyPercentage[0]}&risk=${riskLevel}`;
                              window.open(target, "_blank", "noopener,noreferrer");
                            }}
                          >
                            查看交易面板
                          </Button>
                        </div>

                        <div className="rounded-2xl border border-glass-border bg-secondary/20 p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Premium / x402
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                付费解锁更完整的 premium copy plan，用于演示 agent 的可收费情报能力。
                              </p>
                            </div>
                            <span className="rounded-full border border-neon-blue/30 bg-neon-blue/10 px-2.5 py-1 text-[11px] font-medium text-neon-blue">
                              x402 demo
                            </span>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 rounded-xl border-glass-border bg-transparent text-xs text-muted-foreground hover:border-neon-blue/40 hover:bg-neon-blue/10 hover:text-foreground"
                              onClick={() => {
                                const target = `/api/premium/copy-plan?wallet=${encodeURIComponent(
                                  analysis.address,
                                )}`;
                                window.open(target, "_blank", "noopener,noreferrer");
                              }}
                            >
                              查看 402 响应
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 rounded-xl border-glass-border bg-transparent text-xs text-muted-foreground hover:border-neon-purple/40 hover:bg-neon-purple/10 hover:text-foreground"
                              onClick={() => {
                                const target = `/api/premium/copy-plan?wallet=${encodeURIComponent(
                                  analysis.address,
                                )}&demo_paid=1`;
                                window.open(target, "_blank", "noopener,noreferrer");
                              }}
                            >
                              演示已支付结果
                            </Button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ) : null}

                  <GlassCard className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <ChartLine className="h-4 w-4 text-neon-blue" />
                      <h3 className="text-base font-semibold text-foreground">
                        模式说明
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {analysis.notices.map((notice) => (
                        <p
                          key={notice}
                          className="text-sm text-muted-foreground"
                        >
                          {notice}
                        </p>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

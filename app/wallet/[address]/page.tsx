"use client";

import { use, useEffect, useState } from "react";
import { GlassCard } from "@/components/dashboard/glass-card";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Copy,
  Check,
  TrendingUp,
  Zap,
  ChartLine,
  Loader2,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
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
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "live" ? "live" : "demo";

  const [copied, setCopied] = useState(false);
  const [isAutoCopyEnabled, setIsAutoCopyEnabled] = useState(false);
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
              <p className="mt-3 text-sm text-muted-foreground">
                Live 模式请确认 `COVALENT_API_KEY` 已在 `.env.local` 配置。
              </p>
            </GlassCard>
          ) : analysis ? (
            <>
              <div className="mb-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <GlassCard className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                      <Brain className="h-4 w-4 text-neon-purple" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                      AI 洞察
                    </h2>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">
                    {analysis.insight}
                  </p>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Radio className="h-4 w-4 text-neon-blue" />
                    <h2 className="text-sm font-semibold text-foreground">
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
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </GlassCard>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <GlassCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
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
                    <h3 className="mb-4 text-sm font-medium text-muted-foreground">
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
                          <Tooltip
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

                  <GlassCard className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <ChartLine className="h-4 w-4 text-neon-blue" />
                      <h3 className="text-sm font-medium text-foreground">
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

              <div className="mt-8">
                <Button
                  onClick={() => setIsAutoCopyEnabled(!isAutoCopyEnabled)}
                  className={`group relative h-14 w-full overflow-hidden rounded-2xl text-base font-semibold transition-all duration-300 ${
                    isAutoCopyEnabled
                      ? "bg-profit text-primary-foreground shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                      : "bg-gradient-to-r from-neon-purple to-neon-blue text-foreground hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Zap
                      className={`h-5 w-5 ${isAutoCopyEnabled ? "animate-pulse" : ""}`}
                    />
                    {isAutoCopyEnabled ? "自动跟单已开启" : "开启自动跟单"}
                  </span>
                  {!isAutoCopyEnabled && (
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  )}
                </Button>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

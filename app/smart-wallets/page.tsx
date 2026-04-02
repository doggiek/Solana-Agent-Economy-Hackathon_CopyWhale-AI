"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Loader2,
  Radar,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/dashboard/glass-card";
import {
  DEFAULT_CANDIDATE_ADDRESSES,
  parseCandidateAddresses,
} from "@/lib/smart-wallet-finder";

interface FinderResult {
  address: string;
  score: number;
  tier: "observe" | "candidate" | "smart";
  title: string;
  summary: string;
  reasons: string[];
  error?: string;
  analysis?: {
    metrics?: {
      recentTradeCount: number;
      memeTradeCount: number;
      buyCount: number;
      sellCount: number;
      recentTokens: string[];
      holdingTokens: string[];
      holdingValueUsd: number;
      recentTradeStatus: "ok" | "degraded";
    };
  } | null;
}

const tierStyles = {
  smart: "border-profit/40 bg-profit/10 text-profit",
  candidate: "border-neon-blue/40 bg-neon-blue/10 text-neon-blue",
  observe: "border-loss/30 bg-loss/10 text-loss",
};

export default function SmartWalletFinderPage() {
  const [input, setInput] = useState(DEFAULT_CANDIDATE_ADDRESSES.join("\n"));
  const [results, setResults] = useState<FinderResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function runFinder(rawInput = input) {
    const addresses = parseCandidateAddresses(rawInput);
    if (addresses.length === 0) {
      setError("请至少输入一个候选地址。");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/smart-wallet-finder?addresses=${encodeURIComponent(addresses.join(","))}`,
      );
      const data = (await response.json()) as {
        error?: string;
        results?: FinderResult[];
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to score candidates");
      }

      setResults(data.results || []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to score candidates",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    runFinder(DEFAULT_CANDIDATE_ADDRESSES.join("\n"));
  }, []);

  return (
    <div className="min-h-screen bg-background">
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
              <div>
                <div className="flex items-center gap-2">
                  <Radar className="h-5 w-5 text-neon-blue" />
                  <h1 className="text-xl font-semibold text-foreground">
                    聪明地址雷达
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  批量筛选候选地址，优先找出持续交易 meme 的样本。
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
            <GlassCard className="p-5" hover={false}>
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-neon-purple" />
                <h2 className="font-semibold text-foreground">候选地址池</h2>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[240px] w-full rounded-2xl border border-glass-border bg-secondary/40 p-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="每行一个地址，粘贴 DexScreener / Solscan 找到的候选地址"
              />
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => runFinder()}
                  className="flex-1 bg-gradient-to-r from-neon-purple to-neon-blue text-foreground"
                >
                  运行筛选
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setInput(DEFAULT_CANDIDATE_ADDRESSES.join("\n"))
                  }
                  className="border-glass-border bg-glass/40"
                >
                  重置样本
                </Button>
              </div>
              <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                <p>建议先从 DexScreener 池子的 Top Traders 拿 5-10 个候选地址。</p>
                <p>这个工具会优先看 recent trades、meme trade 数量、买卖比和轮动特征。</p>
              </div>
            </GlassCard>

            <div className="space-y-4">
              <GlassCard className="p-5" hover={false}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-profit" />
                  <h2 className="font-semibold text-foreground">筛选逻辑</h2>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-glass-border bg-secondary/30 p-4">
                    <Target className="h-4 w-4 text-neon-blue" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      交易频率
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      最近交易数越多，越像持续操作型地址。
                    </p>
                  </div>
                  <div className="rounded-2xl border border-glass-border bg-secondary/30 p-4">
                    <Brain className="h-4 w-4 text-neon-purple" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Meme 轮动
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      识别是否反复交易 TRUMP、BONK、WIF、PENGU 等 meme。
                    </p>
                  </div>
                  <div className="rounded-2xl border border-glass-border bg-secondary/30 p-4">
                    <Radar className="h-4 w-4 text-profit" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      买卖节奏
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      有卖出动作、不是只买不卖的地址更适合模拟跟单。
                    </p>
                  </div>
                </div>
              </GlassCard>

              {error ? (
                <GlassCard className="p-5" hover={false}>
                  <p className="font-semibold text-loss">筛选失败</p>
                  <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                </GlassCard>
              ) : null}

              {isLoading ? (
                <GlassCard className="flex min-h-[320px] items-center justify-center p-8" hover={false}>
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-neon-purple" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      正在为候选地址打分...
                    </p>
                  </div>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <GlassCard key={result.address} className="p-5" hover={false}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              #{index + 1}
                            </span>
                            <span className="truncate text-base font-semibold text-foreground">
                              {result.address}
                            </span>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-medium ${tierStyles[result.tier]}`}
                            >
                              {result.title}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {result.summary}
                          </p>
                          {result.error ? (
                            <p className="mt-2 text-xs text-loss">{result.error}</p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {result.reasons.slice(0, 4).map((reason) => (
                              <span
                                key={reason}
                                className="rounded-full border border-glass-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-4">
                          <div className="text-right">
                            <p className="text-3xl font-bold text-foreground">
                              {result.score}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Smart Score
                            </p>
                          </div>
                          <Link
                            href={`/wallet/${encodeURIComponent(result.address)}?mode=live`}
                          >
                            <Button className="bg-gradient-to-r from-neon-purple to-neon-blue text-foreground">
                              查看详情
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {result.analysis?.metrics ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-4">
                          <div className="rounded-2xl border border-glass-border bg-secondary/30 p-3 text-center">
                            <p className="text-xl font-bold text-foreground">
                              {result.analysis.metrics.recentTradeCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              最近交易
                            </p>
                          </div>
                          <div className="rounded-2xl border border-glass-border bg-secondary/30 p-3 text-center">
                            <p className="text-xl font-bold text-profit">
                              {result.analysis.metrics.memeTradeCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Meme 交易
                            </p>
                          </div>
                          <div className="rounded-2xl border border-glass-border bg-secondary/30 p-3 text-center">
                            <p className="text-xl font-bold text-foreground">
                              {result.analysis.metrics.buyCount}/
                              {result.analysis.metrics.sellCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              买 / 卖
                            </p>
                          </div>
                          <div className="rounded-2xl border border-glass-border bg-secondary/30 p-3 text-center">
                            <p className="truncate text-sm font-bold text-foreground">
                              {result.analysis.metrics.recentTokens.slice(0, 3).join(", ") ||
                                result.analysis.metrics.holdingTokens.slice(0, 3).join(", ") ||
                                "--"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              近期 / 持仓资产
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

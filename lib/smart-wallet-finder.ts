import type { WalletAnalysis } from "@/lib/wallet-analysis";

export const DEFAULT_CANDIDATE_ADDRESSES = [
  "DX1XwE1PJViYZSthtKdwk5QhmZX5M6cyAqCfC1o5JGfJ",
  "BdhGYpj58ZcwXncCBCjcL1oaVemLcDNUaX9LqzwYcm6d",
  "FFkKauDCfrJ1ADzNgWt3cdohxVfQvTtpW1QFFdJCy4FL",
];

export interface SmartWalletResult {
  address: string;
  score: number;
  tier: "observe" | "candidate" | "smart";
  title: string;
  summary: string;
  reasons: string[];
  analysis: WalletAnalysis | null;
  error?: string;
}

export function parseCandidateAddresses(input: string) {
  return Array.from(
    new Set(
      input
        .split(/[\n,\s]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, 12);
}

export function scoreWalletAnalysis(
  analysis: WalletAnalysis,
): SmartWalletResult {
  const metrics = analysis.metrics;

  if (!metrics) {
    return {
      address: analysis.address,
      score: 0,
      tier: "observe",
      title: "数据不足",
      summary: "当前分析结果缺少评分指标，建议先检查 live 数据链路。",
      reasons: ["metrics missing"],
      analysis,
    };
  }

  let score = 0;
  const reasons: string[] = [];

  if (metrics.recentTradeStatus === "degraded") {
    reasons.push("最近交易抓取降级，当前结果可能低估该地址");
  }

  score += Math.min(metrics.recentTradeCount, 20) * 4;
  score += Math.min(metrics.memeTradeCount, 10) * 12;
  score += Math.min(metrics.recentTokens.length, 6) * 8;
  score += metrics.sellCount > 0 ? 12 : 0;
  score += metrics.buyCount > 0 ? 8 : 0;
  score += Math.min(metrics.holdingValueUsd / 1000, 20);

  const holdingMemes = metrics.holdingTokens.filter((token) =>
    ["TRUMP", "BONK", "PENGU", "WIF", "POPCAT", "ARC"].includes(
      token.toUpperCase(),
    ),
  );
  score += Math.min(holdingMemes.length, 3) * 6;

  if (metrics.memeTradeCount >= 3 && metrics.recentTokens.length >= 2) {
    score += 18;
    reasons.push("出现多币种 meme 轮动");
  }

  if (metrics.sellCount > 0) {
    reasons.push("存在止盈/卖出动作，不是只买不卖");
  }

  if (metrics.recentTradeCount >= 8) {
    reasons.push("近窗口交易频率较高");
  }

  if (metrics.memeTradeCount === 0) {
    score -= metrics.recentTradeStatus === "degraded" ? 8 : 25;
    reasons.push("没有识别到明确的 meme 交易");
  }

  if (metrics.recentTradeCount <= 2) {
    score -= metrics.recentTradeStatus === "degraded" ? 6 : 20;
    reasons.push("最近可解析交易太少");
  }

  if (metrics.recentTokens.length <= 1) {
    score -= 10;
    reasons.push("近期只碰到单一资产");
  }

  if (holdingMemes.length > 0) {
    reasons.push(`当前持仓包含 ${holdingMemes.join("、")} 等 meme 资产`);
  }

  if (metrics.holdingValueUsd >= 5000) {
    reasons.push("当前钱包仍有一定持仓规模");
  }

  const normalizedScore = Math.max(0, Math.min(100, score));

  if (normalizedScore >= 70) {
    return {
      address: analysis.address,
      score: normalizedScore,
      tier: "smart",
      title: "可重点跟踪",
      summary:
        "这个地址更像持续交易型 smart money，适合进入下一步模拟跟单观察。",
      reasons,
      analysis,
    };
  }

  if (normalizedScore >= 40) {
    return {
      address: analysis.address,
      score: normalizedScore,
      tier: "candidate",
      title: "可继续观察",
      summary:
        metrics.recentTradeStatus === "degraded"
          ? "这个地址可能有价值，但当前 recent trades 抓取降级，建议补一个更稳定的 Solana RPC 后再看。"
          : "这个地址有一定交易行为，但还不够稳定，建议继续观察后续 meme 买卖节奏。",
      reasons,
      analysis,
    };
  }

  return {
    address: analysis.address,
    score: normalizedScore,
    tier: "observe",
    title: metrics.recentTradeStatus === "degraded" ? "待补数据" : "噪音样本",
    summary:
      metrics.recentTradeStatus === "degraded"
        ? "当前主要问题是 recent trades 抓取降级，不能直接判定这个地址没有价值。"
        : "更像单次参与或噪音地址，不建议直接作为聪明钱样本。",
    reasons,
    analysis,
  };
}

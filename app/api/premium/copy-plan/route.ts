import { NextResponse } from "next/server";
import { getLiveWalletAnalysis } from "@/lib/wallet-analysis";

const DEMO_X402_PRICE_USDC = "0.05";

function hasDemoPayment(request: Request, url: URL) {
  const headerPayment =
    request.headers.get("x-demo-x402-payment") ||
    request.headers.get("x-x402-payment");

  return headerPayment === "paid" || url.searchParams.get("demo_paid") === "1";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet")?.trim();

  if (!wallet) {
    return NextResponse.json(
      {
        error: "Missing wallet query parameter.",
      },
      { status: 400 },
    );
  }

  if (!hasDemoPayment(request, url)) {
    return NextResponse.json(
      {
        error: "Payment required for premium copy plan.",
        x402: {
          required: true,
          asset: "USDC",
          amount: DEMO_X402_PRICE_USDC,
          network: "Solana",
          note: "Hackathon demo: send header x-demo-x402-payment: paid, or append ?demo_paid=1 to unlock this premium endpoint.",
        },
      },
      { status: 402 },
    );
  }

  try {
    const analysis = await getLiveWalletAnalysis(wallet);
    const followDecision = analysis.followDecision;
    const metrics = analysis.metrics;

    const defaultRatio =
      followDecision?.verdict === "follow"
        ? 50
        : followDecision?.verdict === "watch"
          ? 25
          : 10;
    const riskLevel =
      followDecision?.verdict === "follow"
        ? "medium"
        : followDecision?.verdict === "watch"
          ? "low"
          : "low";

    return NextResponse.json({
      wallet: analysis.address,
      displayAddress: analysis.displayAddress,
      source: analysis.source,
      premium: true,
      copyPlan: {
        verdict: followDecision?.verdict || "watch",
        label: followDecision?.label || "继续观察",
        summary:
          followDecision?.summary ||
          "当前信号不足，建议先观察再决定是否进入模拟跟单。",
        recommendedRatioPct: defaultRatio,
        recommendedRisk: riskLevel,
        stopLossPct: riskLevel === "low" ? 4 : 6,
        takeProfitPct: riskLevel === "low" ? 8 : 12,
        maxPositionUsd: riskLevel === "low" ? 30 : 75,
      },
      signalSnapshot: {
        recentTradeCount: metrics?.recentTradeCount || 0,
        memeTradeCount: metrics?.memeTradeCount || 0,
        buyCount: metrics?.buyCount || 0,
        sellCount: metrics?.sellCount || 0,
        parsedTradeCoverage: metrics?.parsedTradeCoverageLabel || "--",
        recentTokens: metrics?.recentTokens || [],
      },
      notes: [
        "This is a lightweight x402-compatible premium endpoint for hackathon demo purposes.",
        "Use it to power premium copy-plan suggestions after payment, while real execution still happens through Bitget Wallet.",
      ],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to build premium copy plan.",
      },
      { status: 500 },
    );
  }
}

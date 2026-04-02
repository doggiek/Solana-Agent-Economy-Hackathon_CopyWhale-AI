import { NextRequest, NextResponse } from "next/server";
import { getLiveWalletAnalysis } from "@/lib/wallet-analysis";
import {
  DEFAULT_CANDIDATE_ADDRESSES,
  parseCandidateAddresses,
  scoreWalletAnalysis,
} from "@/lib/smart-wallet-finder";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("addresses") || "";
  const addresses = raw
    ? parseCandidateAddresses(raw)
    : DEFAULT_CANDIDATE_ADDRESSES;

  if (addresses.length === 0) {
    return NextResponse.json(
      { error: "Missing candidate addresses." },
      { status: 400 },
    );
  }

  const results = await Promise.all(
    addresses.map(async (address) => {
      try {
        const analysis = await getLiveWalletAnalysis(address);
        return scoreWalletAnalysis(analysis);
      } catch (error) {
        return {
          address,
          score: 0,
          tier: "observe" as const,
          title: "加载失败",
          summary: "这个地址当前没有拿到足够的数据。",
          reasons: [],
          analysis: null,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
  );

  results.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    addresses,
    results,
  });
}

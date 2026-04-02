import { NextRequest, NextResponse } from "next/server";
import {
  getHeliusDebugTransactions,
  getLiveWalletAnalysis,
} from "@/lib/wallet-analysis";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim();

  if (!address) {
    return NextResponse.json(
      { error: "Missing address parameter." },
      { status: 400 },
    );
  }

  const heliusApiKey = process.env.HELIUS_API_KEY;
  if (!heliusApiKey) {
    return NextResponse.json(
      { error: "Missing HELIUS_API_KEY." },
      { status: 400 },
    );
  }

  try {
    const analysis = await getLiveWalletAnalysis(address);
    const tokenMetadata = new Map<
      string,
      { symbol: string; name?: string; priceUsd: number; decimals: number }
    >();

    for (const token of analysis.metrics?.holdingTokens || []) {
      tokenMetadata.set(token, {
        symbol: token,
        name: token,
        priceUsd: 0,
        decimals: 0,
      });
    }

    const debug = await getHeliusDebugTransactions(
      address,
      heliusApiKey,
      tokenMetadata,
    );

    return NextResponse.json({
      address,
      source: analysis.source,
      metrics: analysis.metrics,
      sample: debug,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to debug Helius.",
      },
      { status: 500 },
    );
  }
}

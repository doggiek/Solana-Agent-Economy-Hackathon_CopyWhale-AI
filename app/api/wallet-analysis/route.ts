import { NextRequest, NextResponse } from "next/server";
import {
  getDemoWalletAnalysis,
  getLiveWalletAnalysis,
  type AnalysisMode,
} from "@/lib/wallet-analysis";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim();
  const mode = (searchParams.get("mode") || "demo") as AnalysisMode;

  if (!address) {
    return NextResponse.json(
      { error: "Missing address parameter." },
      { status: 400 },
    );
  }

  try {
    const analysis =
      mode === "live"
        ? await getLiveWalletAnalysis(address)
        : getDemoWalletAnalysis(address);

    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze wallet.",
      },
      { status: 500 },
    );
  }
}

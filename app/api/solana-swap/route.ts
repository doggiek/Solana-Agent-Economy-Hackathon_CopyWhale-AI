import { NextResponse } from "next/server";

const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";
const JUPITER_API_BASE = "https://lite-api.jup.ag/swap/v1";

interface SwapRequestBody {
  inputMint?: string;
  outputMint?: string;
  amount?: number;
  userPublicKey?: string;
  slippageBps?: number;
}

export async function POST(request: Request) {
  const body = (await request.json()) as SwapRequestBody;
  const inputMint = body.inputMint?.trim();
  const outputMint = body.outputMint?.trim();
  const amount = body.amount || 0;
  const userPublicKey = body.userPublicKey?.trim();
  const slippageBps = body.slippageBps || 500;

  if (!inputMint || !outputMint || !userPublicKey || amount <= 0) {
    return NextResponse.json(
      {
        error: "Missing inputMint, outputMint, amount, or userPublicKey.",
      },
      { status: 400 },
    );
  }

  if (inputMint === outputMint) {
    return NextResponse.json(
      {
        error: "inputMint and outputMint cannot be the same.",
      },
      { status: 400 },
    );
  }

  try {
    const safeInputMint = inputMint;
    const safeOutputMint = outputMint;

    async function fetchQuote(restrictIntermediateTokens: boolean) {
      const quoteUrl = new URL(`${JUPITER_API_BASE}/quote`);
      quoteUrl.searchParams.set("inputMint", safeInputMint);
      quoteUrl.searchParams.set("outputMint", safeOutputMint);
      quoteUrl.searchParams.set("amount", String(Math.floor(amount)));
      quoteUrl.searchParams.set("slippageBps", String(slippageBps));
      quoteUrl.searchParams.set(
        "restrictIntermediateTokens",
        restrictIntermediateTokens ? "true" : "false",
      );

      const quoteResponse = await fetch(quoteUrl, {
        cache: "no-store",
      });
      const quoteJson = (await quoteResponse.json()) as {
        error?: string;
        outAmount?: string;
        inAmount?: string;
        priceImpactPct?: string;
        routePlan?: unknown[];
      };

      return { quoteResponse, quoteJson };
    }

    let { quoteResponse, quoteJson } = await fetchQuote(true);

    if (
      (!quoteResponse.ok || quoteJson.error) &&
      quoteJson.error?.toLowerCase().includes("no routes found")
    ) {
      ({ quoteResponse, quoteJson } = await fetchQuote(false));
    }

    if (!quoteResponse.ok || quoteJson.error) {
      const normalizedError = quoteJson.error?.toLowerCase() || "";
      const friendlyError = normalizedError.includes("no routes found")
        ? "这笔测试单当前没有可成交路径。可以换一个 token，或把测试金额调大一点再试。"
        : normalizedError.includes(
              "restrict_intermediate_tokens to false is not supported for free tier users",
            )
          ? "当前免费额度下不能放宽路由限制，这个 token 暂时找不到可成交路径。建议换一个更活跃的 token 再试。"
        : quoteJson.error || "Failed to fetch Jupiter quote.";

      return NextResponse.json(
        {
          error: friendlyError,
        },
        { status: 502 },
      );
    }

    const swapResponse = await fetch(`${JUPITER_API_BASE}/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse: quoteJson,
        userPublicKey,
        dynamicComputeUnitLimit: true,
        wrapAndUnwrapSol:
          safeInputMint === WRAPPED_SOL_MINT ||
          safeOutputMint === WRAPPED_SOL_MINT,
      }),
      cache: "no-store",
    });
    const swapJson = (await swapResponse.json()) as {
      error?: string;
      swapTransaction?: string;
      lastValidBlockHeight?: number;
      prioritizationFeeLamports?: number;
    };

    if (!swapResponse.ok || !swapJson.swapTransaction) {
      return NextResponse.json(
        {
          error: swapJson.error || "Failed to prepare Jupiter swap transaction.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      swapTransaction: swapJson.swapTransaction,
      quote: {
        inAmount: quoteJson.inAmount,
        outAmount: quoteJson.outAmount,
        priceImpactPct: quoteJson.priceImpactPct,
        routeCount: quoteJson.routePlan?.length || 0,
      },
      meta: {
        inputMint: safeInputMint,
        outputMint: safeOutputMint,
        slippageBps,
        lastValidBlockHeight: swapJson.lastValidBlockHeight,
        prioritizationFeeLamports: swapJson.prioritizationFeeLamports,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected Jupiter swap preparation error.",
      },
      { status: 500 },
    );
  }
}

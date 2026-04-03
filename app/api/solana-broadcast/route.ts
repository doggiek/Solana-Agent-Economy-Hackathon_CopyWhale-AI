import { NextResponse } from "next/server";

interface BroadcastRequestBody {
  transaction?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as BroadcastRequestBody;
  const transaction = body.transaction?.trim();
  const rpcUrl =
    process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  const rpcApiKey = process.env.SOLANA_RPC_API_KEY;

  if (!transaction) {
    return NextResponse.json(
      { error: "Missing signed transaction." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(rpcApiKey ? { "x-api-key": rpcApiKey } : {}),
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sendTransaction",
        params: [
          transaction,
          {
            encoding: "base64",
            preflightCommitment: "confirmed",
            maxRetries: 3,
          },
        ],
      }),
      cache: "no-store",
    });
    const json = (await response.json()) as {
      result?: string;
      error?: { message?: string };
    };

    if (!response.ok || !json.result) {
      return NextResponse.json(
        {
          error: json.error?.message || "Failed to broadcast Solana transaction.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ signature: json.result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected Solana broadcast error.",
      },
      { status: 500 },
    );
  }
}

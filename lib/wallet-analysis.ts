import { formatDistanceToNow } from "date-fns";

export type AnalysisMode = "demo" | "live";

export interface AnalysisListItem {
  id: string;
  token: string;
  tokenDetail?: string;
  action?: "buy" | "sell";
  statusLabel?: string;
  statusTone?: "profit" | "neutral" | "warning";
  amount: string;
  value: string;
  subtitle: string;
  color: string;
}

export interface AnalysisStat {
  label: string;
  value: string;
  tone?: "profit" | "neutral" | "warning";
  description?: string;
}

export interface AnalysisChartPoint {
  label: string;
  value: number;
}

export interface WalletAnalysis {
  mode: AnalysisMode;
  source: string;
  address: string;
  displayAddress: string;
  shortAddress: string;
  tag: "Smart Money" | "Whale" | "Degen";
  heroLabel: string;
  heroValue: string;
  heroTone: "profit" | "neutral" | "warning";
  insight: string;
  stats: AnalysisStat[];
  listTitle: string;
  listItems: AnalysisListItem[];
  chartTitle: string;
  chartData: AnalysisChartPoint[];
  chartValuePrefix?: string;
  notices: string[];
  updatedAtLabel: string;
  followDecision?: {
    verdict: "follow" | "watch" | "avoid";
    label: string;
    summary: string;
  };
  metrics?: {
    recentTradeCount: number;
    memeTradeCount: number;
    buyCount: number;
    sellCount: number;
    recentTokens: string[];
    holdingTokens: string[];
    holdingValueUsd: number;
    recentTradeStatus: "ok" | "degraded";
    scannedSignatureCount: number;
    parsedTradeCoverageLabel: string;
  };
}

interface CovalentActivityResponse {
  error?: boolean;
  error_message?: string;
  data?: {
    updated_at?: string;
    address?: string;
    items?: Array<{
      first_seen_at?: string;
      last_seen_at?: string;
      extends?: {
        name?: string;
        chain_id?: string;
        label?: string;
        category_label?: string;
      };
    }>;
  };
}

interface CovalentBalancesResponse {
  error?: boolean;
  error_message?: string;
  data?: {
    updated_at?: string;
    address?: string;
    items?: Array<{
      contract_name?: string;
      contract_ticker_symbol?: string;
      contract_display_name?: string;
      contract_address?: string;
      pretty_quote?: string;
      quote?: number;
      balance?: string;
      contract_decimals?: number;
      last_transferred_at?: string;
      logo_urls?: {
        token_logo_url?: string;
      };
      is_native_token?: boolean;
    }>;
  };
}

interface SolanaSignatureInfo {
  signature: string;
  blockTime?: number;
  err?: unknown;
}

interface SolanaRpcTransactionResponse {
  result?: {
    blockTime?: number;
    meta?: {
      err?: unknown;
      preBalances?: number[];
      postBalances?: number[];
      preTokenBalances?: Array<{
        accountIndex?: number;
        mint?: string;
        owner?: string;
        uiTokenAmount?: {
          uiAmount?: number | null;
          decimals?: number;
        };
      }>;
      postTokenBalances?: Array<{
        accountIndex?: number;
        mint?: string;
        owner?: string;
        uiTokenAmount?: {
          uiAmount?: number | null;
          decimals?: number;
        };
      }>;
    };
    transaction?: {
      signatures?: string[];
      message?: {
        accountKeys?: Array<
          | string
          | {
              pubkey?: string;
            }
        >;
      };
    };
  } | null;
}

interface ParsedTrade {
  id: string;
  token: string;
  tokenDetail?: string;
  action: "buy" | "sell";
  amount: string;
  value: string;
  subtitle: string;
  color: string;
  tokenSymbol: string;
  tokenValueUsd: number;
  timestamp: number;
}

interface TokenDelta {
  mint: string;
  symbol: string;
  name?: string;
  delta: number;
  priceUsd: number;
  quoteUsd: number;
}

interface SolanaTradesResult {
  trades: ParsedTrade[];
  scannedSignatureCount: number;
  provider: "helius" | "rpc";
  heliusError?: string | null;
}

interface HeliusEnhancedTransaction {
  signature?: string;
  timestamp?: number;
  description?: string;
  type?: string;
  tokenTransfers?: HeliusTokenTransfer[];
  nativeTransfers?: Array<{
    fromUserAccount?: string;
    toUserAccount?: string;
    amount?: number;
  }>;
  events?: {
    swap?: {
      nativeInput?: {
        amount?: string;
      };
      nativeOutput?: {
        amount?: string;
      };
      tokenInputs?: HeliusSwapTokenAmount[];
      tokenOutputs?: HeliusSwapTokenAmount[];
      innerSwaps?: Array<{
        tokenInputs?: HeliusSwapTokenTransfer[];
        tokenOutputs?: HeliusSwapTokenTransfer[];
      }>;
    };
  };
}

interface HeliusSwapTokenAmount {
  mint?: string;
  rawTokenAmount?: {
    tokenAmount?: string;
    decimals?: number;
    tokenAmountUi?: number;
  };
}

interface HeliusSwapTokenTransfer {
  mint?: string;
  tokenAmount?: number;
}

interface HeliusTokenTransfer {
  fromUserAccount?: string;
  toUserAccount?: string;
  fromTokenAccount?: string;
  toTokenAccount?: string;
  tokenAmount?: number;
  mint?: string;
}

interface HeliusTransferCandidate {
  mint: string;
  symbol: string;
  name?: string;
  tokenAmount: number;
  quoteUsd: number;
}

export interface HeliusDebugEntry {
  signature: string;
  type?: string;
  description?: string;
  timestamp?: number;
  tokenTransfers: Array<{
    mint?: string;
    fromUserAccount?: string;
    toUserAccount?: string;
    tokenAmount?: number;
  }>;
  nativeTransfers: Array<{
    fromUserAccount?: string;
    toUserAccount?: string;
    amount?: number;
  }>;
  parsed: {
    token: string;
    action: "buy" | "sell";
    amount: string;
    value: string;
  } | null;
}

const demoTransactions: AnalysisListItem[] = [
  {
    id: "1",
    token: "PEPE",
    tokenDetail: "Pepe",
    action: "buy",
    amount: "2.5M",
    value: "$4,250",
    subtitle: "2 分钟前",
    color: "#10b981",
  },
  {
    id: "2",
    token: "ARB",
    tokenDetail: "Arbitrum",
    action: "sell",
    amount: "15,000",
    value: "$18,750",
    subtitle: "15 分钟前",
    color: "#8b5cf6",
  },
  {
    id: "3",
    token: "DOGE",
    tokenDetail: "Dogecoin",
    action: "buy",
    amount: "500,000",
    value: "$85,000",
    subtitle: "1 小时前",
    color: "#f59e0b",
  },
  {
    id: "4",
    token: "SHIB",
    tokenDetail: "Shiba Inu",
    action: "sell",
    amount: "1.2B",
    value: "$12,400",
    subtitle: "3 小时前",
    color: "#ef4444",
  },
  {
    id: "5",
    token: "WIF",
    tokenDetail: "dogwifhat",
    action: "buy",
    amount: "25,000",
    value: "$62,500",
    subtitle: "5 小时前",
    color: "#06b6d4",
  },
  {
    id: "6",
    token: "BONK",
    tokenDetail: "Bonk",
    action: "buy",
    amount: "50M",
    value: "$1,250",
    subtitle: "8 小时前",
    color: "#f97316",
  },
];

const demoChartData: AnalysisChartPoint[] = [
  { label: "周一", value: 2400 },
  { label: "周二", value: 1398 },
  { label: "周三", value: 9800 },
  { label: "周四", value: 3908 },
  { label: "周五", value: 4800 },
  { label: "周六", value: -2000 },
  { label: "周日", value: 18400 },
];

const palette = [
  "#10b981",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#f97316",
  "#ef4444",
];

const MEME_TICKERS = new Set([
  "TRUMP",
  "BONK",
  "PENGU",
  "WIF",
  "POPCAT",
  "FARTCOIN",
  "MEW",
  "PNUT",
  "GOAT",
  "PEPE",
  "ARC",
  "DOG",
  "MOODENG",
]);

const STABLE_TICKERS = new Set(["USDC", "USDT", "USDS", "PYUSD"]);
const QUOTE_TICKERS = new Set([
  "SOL",
  "WSOL",
  ...Array.from(STABLE_TICKERS),
]);
const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";
const SOL_ALIAS_SYMBOLS = new Set([
  "SOL",
  "WSOL",
  "WRAPPED SOL",
  "WRAPPED_SOL",
  "SO11111111111111111111111111111111111111112",
  "SO11...",
]);
const NON_MEME_TOKENS = new Set(["BTC", "ETH", "SOL", "USDC", "USDT", "BNB"]);
const MEME_STAT_TOOLTIP =
  "规则：先排除 BTC/ETH/SOL/USDC/USDT/BNB 等主流币；如果能拿到市值且超过 5 亿美元，也不记作 meme。当前部分 Solana token 拿不到市值时，会退化成名单排除法。";

function isMemeToken(symbol: string, marketCap?: number) {
  const normalized = symbol.toUpperCase();

  if (NON_MEME_TOKENS.has(normalized)) {
    return false;
  }

  if (marketCap && marketCap > 500_000_000) {
    return false;
  }

  if (MEME_TICKERS.has(normalized)) {
    return true;
  }

  // Fallback for truncated/new tickers when market cap is unavailable.
  return true;
}

function isQuoteToken(symbol: string) {
  return QUOTE_TICKERS.has(normalizeQuoteSymbol(symbol));
}

function normalizeQuoteSymbol(symbol: string) {
  const normalized = symbol.trim().toUpperCase();

  if (
    SOL_ALIAS_SYMBOLS.has(normalized) ||
    normalized.startsWith("SO111") ||
    normalized.startsWith("SO11")
  ) {
    return "SOL";
  }

  return normalized;
}

function resolveTokenIdentity(
  mint: string,
  tokenMetadata: Map<string, { symbol: string; name?: string; priceUsd: number; decimals: number }>,
) {
  if (mint === WRAPPED_SOL_MINT) {
    return {
      symbol: "SOL",
      name: "Solana",
    };
  }

  const metadata = tokenMetadata.get(mint);
  const metadataSymbol = metadata?.symbol || (mint ? shortenAddress(mint) : "TOKEN");
  if (normalizeQuoteSymbol(metadataSymbol) === "SOL") {
    return {
      symbol: "SOL",
      name: "Solana",
    };
  }

  return {
    symbol: metadataSymbol,
    name: metadata?.name,
  };
}

export function getDemoWalletAnalysis(address: string): WalletAnalysis {
  const resolvedAddress =
    address === "vitalik.eth"
      ? "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
      : address;
  const displayAddress = address === "vitalik.eth" ? "vitalik.eth" : address;

  return {
    mode: "demo",
    source: "Demo Mock Dataset",
    address: resolvedAddress,
    displayAddress,
    shortAddress: shortenAddress(resolvedAddress),
    tag: "Smart Money",
    heroLabel: "模拟总收益",
    heroValue: "+12.4%",
    heroTone: "profit",
    insight:
      "该钱包持续买入 Meme 币，胜率高达 78%。最近偏好低市值项目，平均持仓时间 3-5 天，适合作为 hackathon 演示用 smart money 样本。",
    stats: [
      { label: "胜率", value: "78%", tone: "profit" },
      { label: "总收益", value: "$245.6K", tone: "profit" },
      { label: "7日 PnL", value: "+$18.4K", tone: "profit" },
    ],
    listTitle: "最近交易",
    listItems: demoTransactions,
    chartTitle: "7日收益曲线",
    chartData: demoChartData,
    chartValuePrefix: "$",
    notices: [
      "当前为 Demo 模式，页面展示的是固定 mock 数据。",
      "切换到 Live 模式后，会通过 Covalent GoldRush 返回真实链上数据。",
    ],
    updatedAtLabel: "Demo dataset",
    metrics: {
      recentTradeCount: demoTransactions.length,
      memeTradeCount: 4,
      buyCount: demoTransactions.filter((item) => item.action === "buy").length,
      sellCount: demoTransactions.filter((item) => item.action === "sell").length,
      recentTokens: demoTransactions.map((item) => item.token),
      holdingTokens: ["PEPE", "WIF", "BONK"],
      holdingValueUsd: 245600,
      recentTradeStatus: "ok",
      scannedSignatureCount: demoTransactions.length,
      parsedTradeCoverageLabel: `${demoTransactions.length}/${demoTransactions.length}`,
    },
  };
}

export async function getLiveWalletAnalysis(
  address: string,
): Promise<WalletAnalysis> {
  const apiKey = process.env.COVALENT_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing COVALENT_API_KEY. Add it to your .env.local before using Live mode.",
    );
  }

  const encodedAddress = encodeURIComponent(address);
  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };
  const solanaRpcUrl =
    process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  const solanaRpcApiKey = process.env.SOLANA_RPC_API_KEY;
  const heliusApiKey = process.env.HELIUS_API_KEY;

  // https://goldrush.dev/docs/api-reference/foundational-api/cross-chain/get-address-activity
  const activityUrl = `https://api.covalenthq.com/v1/address/${encodedAddress}/activity/?testnets=false`;
  const isSolanaAddress = looksLikeSolanaAddress(address);
  const balancesUrl = isSolanaAddress
    ? `https://api.covalenthq.com/v1/solana-mainnet/address/${encodedAddress}/balances_v2/?quote-currency=USD&no-spam=true`
    : null;

  const [activityResult, balancesResult] = await Promise.all([
    fetch(activityUrl, { headers, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return {
            ok: false as const,
            status: response.status,
            json: null,
            error: `GoldRush activity request failed with ${response.status}`,
          };
        }

        return {
          ok: true as const,
          status: response.status,
          json: (await response.json()) as
            | CovalentActivityResponse
            | { data?: never },
          error: null,
        };
      })
      .catch(() => ({
        ok: false as const,
        status: 0,
        json: null,
        error: "Unable to reach Covalent activity endpoint.",
      })),
    balancesUrl
      ? fetch(balancesUrl, { headers, cache: "no-store" })
          .then(async (response) => {
            if (!response.ok) {
              return {
                ok: false as const,
                status: response.status,
                json: null,
                error: `GoldRush balances request failed with ${response.status}`,
              };
            }

            return {
              ok: true as const,
              status: response.status,
              json: (await response.json()) as
                | CovalentBalancesResponse
                | { data?: never },
              error: null,
            };
          })
          .catch(() => ({
            ok: false as const,
            status: 0,
            json: null,
            error: "Unable to reach Covalent balances endpoint.",
          }))
      : Promise.resolve(null),
  ]);

  let activityJson: CovalentActivityResponse | null = null;
  if (activityResult.ok && activityResult.json) {
    activityJson = activityResult.json;
    if ("error" in activityJson && activityJson.error) {
      activityJson = null;
    }
  }

  let balancesJson: CovalentBalancesResponse | null = null;
  if (balancesResult?.ok && balancesResult.json) {
    const parsed = balancesResult.json;
    if ("error" in parsed && parsed.error) {
      throw new Error(parsed.error_message || "Failed to load token balances");
    }
    balancesJson = parsed;
  }

  const activityItems = activityJson?.data?.items || [];
  const balanceItems = (balancesJson?.data?.items || [])
    .filter((item) => (item.quote || 0) > 0)
    .sort((a, b) => (b.quote || 0) - (a.quote || 0));

  const totalValue = balanceItems.reduce(
    (sum, item) => sum + (item.quote || 0),
    0,
  );
  const topHoldings = balanceItems.slice(0, 6);
  const tokenMetadata = createTokenMetadataMap(balanceItems);
  const recentTradesResult = isSolanaAddress
    ? await fetchRecentTrades({
        address,
        tokenMetadata,
        rpcUrl: solanaRpcUrl,
        rpcApiKey: solanaRpcApiKey,
        heliusApiKey,
      })
        .then((result) => ({ ...result, error: null as string | null }))
        .catch((error) => ({
          trades: [],
          scannedSignatureCount: 0,
          provider: "rpc" as const,
          heliusError: null,
          error:
            error instanceof Error
              ? error.message
              : "Unable to reach Solana RPC for recent trades.",
        }))
    : {
        trades: [],
        scannedSignatureCount: 0,
        provider: "rpc" as const,
        heliusError: null,
        error: null as string | null,
      };
  const recentTrades = recentTradesResult.trades;
  const topChains = activityItems
    .slice()
    .sort(
      (a, b) =>
        new Date(b.last_seen_at || 0).getTime() -
        new Date(a.last_seen_at || 0).getTime(),
    )
    .slice(0, 6);

  if (!balancesJson && !activityJson && recentTrades.length === 0) {
    const messages = [
      balancesResult && !balancesResult.ok ? balancesResult.error : null,
      !activityResult.ok ? activityResult.error || "Activity endpoint failed." : null,
      recentTradesResult.error,
    ].filter(Boolean);

    throw new Error(
      messages[0] ||
        "Unable to load live data. Please check your network, Covalent key, or SOLANA_RPC_URL.",
    );
  }

  const tradeItems = recentTrades.map((trade) => ({
    id: trade.id,
    token: trade.token,
    tokenDetail: trade.tokenDetail,
    action: trade.action,
    amount: trade.amount,
    value: trade.value,
    subtitle: trade.subtitle,
    color: trade.color,
  }));
  const listItems: AnalysisListItem[] =
    tradeItems.length > 0
      ? tradeItems
      : topHoldings.length > 0
        ? topHoldings.map((item, index) => ({
            id:
              item.contract_address || item.contract_ticker_symbol || `${index}`,
            token:
              item.contract_ticker_symbol ||
              item.contract_display_name ||
              item.contract_name ||
              "TOKEN",
            amount: formatTokenBalance(item.balance, item.contract_decimals),
            value: item.pretty_quote || formatCurrency(item.quote || 0),
            subtitle: item.last_transferred_at
              ? `${relativeTime(item.last_transferred_at)} · Solana`
              : "Solana 持仓",
            color: palette[index % palette.length],
          }))
        : topChains.map((item, index) => ({
          id: `${item.extends?.chain_id || index}`,
          token: item.extends?.label || item.extends?.name || "Unknown Chain",
          amount: item.first_seen_at
            ? `首次活跃 ${relativeTime(item.first_seen_at)}`
            : "链上活跃",
          value: item.last_seen_at
            ? `最近 ${relativeTime(item.last_seen_at)}`
            : "Recently active",
          subtitle: item.extends?.category_label || "Cross-chain activity",
          color: palette[index % palette.length],
        }));

  const tradeChart = aggregateTradesByToken(recentTrades);
  const chartData =
    tradeChart.length > 0
      ? tradeChart
      : topHoldings.length > 0
        ? topHoldings.slice(0, 6).map((item) => ({
          label:
            item.contract_ticker_symbol ||
            item.contract_display_name ||
            item.contract_name ||
            "TOKEN",
          value: item.quote || 0,
        }))
        : topChains.map((item, index) => ({
          label:
            item.extends?.label || item.extends?.name || `Chain ${index + 1}`,
          value: topChains.length - index,
        }));

  const topSymbols = topHoldings
    .slice(0, 3)
    .map(
      (item) =>
        item.contract_ticker_symbol ||
        item.contract_display_name ||
        item.contract_name,
    )
    .filter((value): value is string => Boolean(value));

  const memeTrades = recentTrades.filter((trade) =>
    isMemeToken(trade.tokenSymbol),
  );
  const holdingMemeCount = topSymbols.filter((symbol) =>
    isMemeToken(symbol),
  ).length;
  const buyCount = recentTrades.filter((trade) => trade.action === "buy").length;
  const sellCount = recentTrades.filter((trade) => trade.action === "sell").length;
  const hasTradeDegraded = Boolean(recentTradesResult.error);
  const tag = inferTag(
    totalValue,
    activityItems.length,
    hasTradeDegraded ? holdingMemeCount : memeTrades.length,
  );
  const notices: string[] = ["Live 模式数据来自 Covalent GoldRush。"];

  if (!activityResult.ok) {
    notices.push(
      `跨链 activity 接口未返回有效结果（HTTP ${activityResult.status || "network"}），当前页面已回退为仅展示可用的持仓数据。`,
    );
  }

  if (balancesResult && !balancesResult.ok) {
    notices.push(
      `Covalent balances 暂时不可用（HTTP ${balancesResult.status || "network"}）。如果持续失败，请检查 API key 或网络连接。`,
    );
  }

  if (recentTradesResult.error) {
    notices.push(
      `最近交易抓取失败：${recentTradesResult.error}。如果持续失败，请在 .env.local 里配置可用的 SOLANA_RPC_URL。`,
    );
  } else if (
    recentTradesResult.scannedSignatureCount > 0 &&
    recentTrades.length < recentTradesResult.scannedSignatureCount
  ) {
    notices.push(
      `当前只从最近 ${recentTradesResult.scannedSignatureCount} 笔链上签名里解析出了 ${recentTrades.length} 笔明确买卖。其余交易可能是转账、批量指令、创建/关闭账户，或需要更强的 Solana 交易索引服务才能完整还原。`,
    );
  }

  if (recentTradesResult.provider === "helius") {
    notices.push(
      "最近交易优先通过 Helius Enhanced Transactions 解析，可更完整覆盖 swap 和 token account 变化；raw RPC 仅作为兜底。",
    );
  } else if (recentTradesResult.heliusError) {
    notices.push(
      `已检测到 HELIUS_API_KEY，但 Helius 增强交易当前未生效：${recentTradesResult.heliusError}。页面已回退到 Solana RPC 解析。`,
    );
  }

  if (!isSolanaAddress) {
    notices.push(
      "当前 live 模式最适合 Solana 地址。非 Solana 地址会优先展示跨链活跃信息，持仓数据可能不完整。",
    );
  }

  if (topHoldings.length === 0) {
    notices.push(
      "这个地址暂时没有返回可估值的 Solana 持仓，因此页面展示的是跨链活跃数据。",
    );
  }

  if (recentTrades.length === 0) {
    notices.push(
      "暂时没有解析到明确的 recent swaps，页面回退为资产视图。接入 Solscan/Helius 后可进一步增强。",
    );
  }

  const insight = buildTradeInsight({
    recentTrades,
    memeTrades,
    topSymbols,
    totalValue,
    chainCount: activityItems.length,
  });
  const followDecision = buildFollowDecision({
    recentTrades,
    memeTrades,
    buyCount,
    sellCount,
    hasTradeDegraded,
  });

  return {
    mode: "live",
    source:
      recentTradesResult.provider === "helius"
        ? "Covalent GoldRush + Helius Enhanced Transactions"
        : recentTradesResult.heliusError
          ? "Covalent GoldRush + Solana RPC Fallback"
          : "Covalent GoldRush + Solana RPC",
    address:
      balancesJson?.data?.address || activityJson?.data?.address || address,
    displayAddress: address,
    shortAddress: shortenAddress(
      balancesJson?.data?.address || activityJson?.data?.address || address,
    ),
    tag,
    heroLabel: totalValue > 0 ? "实时持仓估值" : "活跃链数",
    heroValue:
      totalValue > 0
        ? formatCurrency(totalValue)
        : `${activityItems.length} chains`,
    heroTone: totalValue > 0 ? "profit" : "neutral",
    insight,
    stats: hasTradeDegraded
      ? [
          {
            label: "最近交易",
            value: "--",
            tone: "warning",
          },
          {
            label: "Meme 交易",
            value: "--",
            tone: "warning",
            description: MEME_STAT_TOOLTIP,
          },
          {
            label: "买卖比",
            value: "--",
            tone: "warning",
          },
        ]
      : [
          {
            label: "最近交易",
            value: `${recentTrades.length}`,
            tone: recentTrades.length >= 8 ? "profit" : "neutral",
          },
          {
            label: "Meme 交易",
            value: `${memeTrades.length}`,
            tone: memeTrades.length >= 3 ? "profit" : "warning",
            description: MEME_STAT_TOOLTIP,
          },
          {
            label: "买卖比",
            value: `${buyCount}/${sellCount || 0}`,
            tone: buyCount > sellCount ? "profit" : "neutral",
          },
        ],
    listTitle:
      tradeItems.length > 0
        ? "最近交易"
        : hasTradeDegraded
          ? "交易抓取受限，已回退资产视图"
        : topHoldings.length > 0
          ? "真实持仓"
          : "跨链活跃",
    listItems,
    chartTitle:
      tradeChart.length > 0
        ? "Most Traded Tokens"
        : topHoldings.length > 0
          ? "Top Holdings (USD)"
          : "Active Chains",
    chartData,
    chartValuePrefix:
      tradeChart.length > 0 || topHoldings.length > 0 ? "$" : "",
    notices,
    updatedAtLabel: relativeTime(
      balancesJson?.data?.updated_at ||
        activityJson?.data?.updated_at ||
        new Date().toISOString(),
    ),
    followDecision,
    metrics: {
      recentTradeCount: recentTrades.length,
      memeTradeCount: memeTrades.length,
      buyCount,
      sellCount,
      recentTokens: Array.from(new Set(recentTrades.map((trade) => trade.token))).slice(0, 6),
      holdingTokens: topSymbols,
      holdingValueUsd: totalValue,
      recentTradeStatus: hasTradeDegraded ? "degraded" : "ok",
      scannedSignatureCount: recentTradesResult.scannedSignatureCount,
      parsedTradeCoverageLabel:
        recentTradesResult.scannedSignatureCount > 0
          ? `${recentTrades.length}/${recentTradesResult.scannedSignatureCount}`
          : "--",
    },
  };
}

function inferTag(totalValue: number, chainCount: number, memeTradeCount = 0) {
  if (totalValue >= 100000 || chainCount >= 5 || memeTradeCount >= 6) {
    return "Whale";
  }
  if (totalValue >= 5000 || chainCount >= 2 || memeTradeCount >= 2) {
    return "Smart Money";
  }
  return "Degen";
}

function looksLikeSolanaAddress(value: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

function shortenAddress(address: string) {
  if (address.length <= 14) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatTokenBalance(balance?: string, decimals?: number) {
  if (!balance) {
    return "0";
  }

  const precision = decimals ?? 0;
  const raw = BigInt(balance);
  const divisor = 10 ** Math.min(precision, 9);
  const normalized =
    Number(raw / BigInt(10 ** Math.max(precision - 9, 0))) / divisor;

  if (normalized >= 1_000_000) {
    return `${(normalized / 1_000_000).toFixed(2)}M`;
  }

  if (normalized >= 1_000) {
    return `${(normalized / 1_000).toFixed(2)}K`;
  }

  return normalized.toLocaleString("en-US", {
    maximumFractionDigits: 4,
  });
}

function relativeTime(value: string) {
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
}

function createTokenMetadataMap(
  balanceItems: NonNullable<CovalentBalancesResponse["data"]>["items"],
) {
  const map = new Map<
    string,
    { symbol: string; name?: string; priceUsd: number; decimals: number }
  >();

  for (const item of balanceItems || []) {
    if (!item.contract_address) continue;
    const decimals = item.contract_decimals ?? 0;
    const balance = item.balance ? Number(item.balance) / 10 ** decimals : 0;
    const priceUsd = balance > 0 && item.quote ? item.quote / balance : 0;
    map.set(item.contract_address, {
      symbol:
        item.contract_ticker_symbol ||
        item.contract_display_name ||
        item.contract_name ||
        shortenAddress(item.contract_address),
      name: item.contract_display_name || item.contract_name || undefined,
      priceUsd,
      decimals,
    });
  }

  return map;
}

async function fetchRecentSolanaTrades(
  address: string,
  rpcUrl: string,
  tokenMetadata: Map<string, { symbol: string; name?: string; priceUsd: number; decimals: number }>,
  rpcApiKey?: string,
): Promise<SolanaTradesResult> {
  const signaturesResponse = await solanaRpc<SolanaSignatureInfo[]>(
    rpcUrl,
    "getSignaturesForAddress",
    [address, { limit: 24 }],
    rpcApiKey,
  );

  const signatures = (signaturesResponse || []).filter((item) => !item.err);
  const transactions = await Promise.allSettled(
    signatures.map((item) =>
      solanaRpc<SolanaRpcTransactionResponse["result"]>(
        rpcUrl,
        "getTransaction",
        [item.signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }],
        rpcApiKey,
      ),
    ),
  );

  const trades = transactions
    .map((result, index) =>
      parseTrade(
        result.status === "fulfilled" ? result.value : null,
        address,
        signatures[index]?.signature || "",
        tokenMetadata,
      ),
    )
    .filter((trade): trade is ParsedTrade => Boolean(trade))
    .slice(0, 12);

  return {
    trades,
    scannedSignatureCount: signatures.length,
    provider: "rpc",
    heliusError: null,
  };
}

async function fetchRecentTrades({
  address,
  tokenMetadata,
  rpcUrl,
  rpcApiKey,
  heliusApiKey,
}: {
  address: string;
  tokenMetadata: Map<
    string,
    { symbol: string; name?: string; priceUsd: number; decimals: number }
  >;
  rpcUrl: string;
  rpcApiKey?: string;
  heliusApiKey?: string;
}): Promise<SolanaTradesResult> {
  if (heliusApiKey) {
    try {
      const heliusResult = await fetchRecentHeliusTrades(
        address,
        heliusApiKey,
        tokenMetadata,
      );
      if (heliusResult.trades.length > 0) {
        return heliusResult;
      }
      const fallback = await fetchRecentSolanaTrades(
        address,
        rpcUrl,
        tokenMetadata,
        rpcApiKey,
      );
      return {
        ...fallback,
        heliusError: "Helius returned 0 parsable trades for this address.",
      };
    } catch (error) {
      const fallback = await fetchRecentSolanaTrades(
        address,
        rpcUrl,
        tokenMetadata,
        rpcApiKey,
      );
      return {
        ...fallback,
        heliusError:
          error instanceof Error ? error.message : "Unknown Helius error.",
      };
    }
  }

  return fetchRecentSolanaTrades(address, rpcUrl, tokenMetadata, rpcApiKey);
}

async function fetchRecentHeliusTrades(
  address: string,
  heliusApiKey: string,
  tokenMetadata: Map<string, { symbol: string; name?: string; priceUsd: number; decimals: number }>,
): Promise<SolanaTradesResult> {
  const url = new URL(
    `https://api-mainnet.helius-rpc.com/v0/addresses/${address}/transactions`,
  );
  url.searchParams.set("api-key", heliusApiKey);
  url.searchParams.set("limit", "100");
  url.searchParams.set("sort-order", "desc");
  url.searchParams.set("commitment", "confirmed");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error("Helius transaction history timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Helius transaction history failed with ${response.status}`);
  }

  const json = (await response.json()) as HeliusEnhancedTransaction[];
  const trades = json
    .map((tx) => parseHeliusTrade(tx, address, tokenMetadata))
    .filter((trade): trade is ParsedTrade => Boolean(trade))
    .slice(0, 16);

  return {
    trades,
    scannedSignatureCount: json.length,
    provider: "helius",
    heliusError: null,
  };
}

export async function getHeliusDebugTransactions(
  address: string,
  heliusApiKey: string,
  tokenMetadata: Map<string, { symbol: string; name?: string; priceUsd: number; decimals: number }>,
) {
  const url = new URL(
    `https://api-mainnet.helius-rpc.com/v0/addresses/${address}/transactions`,
  );
  url.searchParams.set("api-key", heliusApiKey);
  url.searchParams.set("limit", "20");
  url.searchParams.set("sort-order", "desc");
  url.searchParams.set("commitment", "confirmed");

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Helius debug fetch failed with ${response.status}`);
  }

  const json = (await response.json()) as HeliusEnhancedTransaction[];

  return json.slice(0, 10).map<HeliusDebugEntry>((tx) => {
    const parsed = parseHeliusTrade(tx, address, tokenMetadata);
    return {
      signature: tx.signature || "",
      type: tx.type,
      description: tx.description,
      timestamp: tx.timestamp,
      tokenTransfers: (tx.tokenTransfers || []).map((item) => ({
        mint: item.mint,
        fromUserAccount: item.fromUserAccount,
        toUserAccount: item.toUserAccount,
        tokenAmount: item.tokenAmount,
      })),
      nativeTransfers: (tx.nativeTransfers || []).map((item) => ({
        fromUserAccount: item.fromUserAccount,
        toUserAccount: item.toUserAccount,
        amount: item.amount,
      })),
      parsed: parsed
        ? {
            token: parsed.token,
            action: parsed.action,
            amount: parsed.amount,
            value: parsed.value,
          }
        : null,
    };
  });
}

async function solanaRpc<T>(
  rpcUrl: string,
  method: string,
  params: unknown[],
  rpcApiKey?: string,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (rpcApiKey) {
    requestHeaders["x-api-key"] = rpcApiKey;
    requestHeaders.Authorization = `Bearer ${rpcApiKey}`;
  }

  let response: Response;
  try {
    response = await fetch(rpcUrl, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      }),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error(`Solana RPC ${method} timed out`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    if (
      (response.status === 401 || response.status === 403) &&
      !rpcApiKey &&
      rpcUrl.includes("tatum")
    ) {
      throw new Error(
        "Your custom Solana RPC rejected the request. Tatum-style gateways require SOLANA_RPC_API_KEY in .env.local.",
      );
    }
    throw new Error(`Solana RPC ${method} failed with ${response.status}`);
  }

  const json = (await response.json()) as { result?: T; error?: { message?: string } };
  if (json.error) {
    throw new Error(json.error.message || `Solana RPC ${method} failed`);
  }

  if (json.result === undefined || json.result === null) {
    throw new Error(`Solana RPC ${method} returned no result`);
  }

  return json.result as T;
}

function parseTrade(
  tx: SolanaRpcTransactionResponse["result"] | null,
  address: string,
  signature: string,
  tokenMetadata: Map<string, { symbol: string; name?: string; priceUsd: number; decimals: number }>,
): ParsedTrade | null {
  if (!tx?.meta || tx.meta.err) {
    return null;
  }

  const accountKeys =
    tx.transaction?.message?.accountKeys?.map((key) =>
      typeof key === "string" ? key : key.pubkey || "",
    ) || [];
  const ownerIndex = accountKeys.findIndex((key) => key === address);
  const tokenDeltas = buildTokenDeltas(tx, address, tokenMetadata);
  const solDelta = buildSolDelta(tx, ownerIndex);

  if (Math.abs(solDelta.quoteUsd) > 0.01) {
    tokenDeltas.push(solDelta);
  }

  const positive = tokenDeltas
    .filter((delta) => delta.delta > 0)
    .sort((a, b) => b.quoteUsd - a.quoteUsd);
  const negative = tokenDeltas
    .filter((delta) => delta.delta < 0)
    .sort((a, b) => b.quoteUsd - a.quoteUsd);

  if (positive.length === 0 || negative.length === 0) {
    return null;
  }

  const buyCandidate =
    positive.find((delta) => !isQuoteToken(delta.symbol)) || positive[0];
  const sellCandidate =
    negative.find((delta) => isQuoteToken(delta.symbol)) || negative[0];

  let focus = buyCandidate;
  let action: "buy" | "sell" = "buy";
  let valueUsd = sellCandidate.quoteUsd || buyCandidate.quoteUsd;

  if (isQuoteToken(buyCandidate.symbol) && negative.length > 0) {
    focus =
      negative.find((delta) => !isQuoteToken(delta.symbol)) ||
      negative[0];
    action = "sell";
    valueUsd = buyCandidate.quoteUsd || focus.quoteUsd;
  }

  if (isQuoteToken(focus.symbol) && positive.length > 1) {
    const alt = positive.find((delta) => !isQuoteToken(delta.symbol));
    if (alt) {
      focus = alt;
      valueUsd = sellCandidate.quoteUsd || alt.quoteUsd;
    }
  }

  if (Math.abs(focus.delta) <= 0) {
    return null;
  }

  const blockTime = tx.blockTime ? tx.blockTime * 1000 : Date.now();

  return {
    id: signature,
    token: formatTokenLabel(focus.symbol, focus.name, focus.mint),
    tokenDetail: focus.name || focus.symbol,
    tokenSymbol: focus.symbol,
    action,
    amount: formatCompact(Math.abs(focus.delta)),
    value: formatCurrency(valueUsd),
    subtitle: `${relativeTime(new Date(blockTime).toISOString())} · ${signature.slice(0, 6)}...${signature.slice(-4)}`,
    color: colorForSymbol(focus.symbol),
    tokenValueUsd: valueUsd,
    timestamp: blockTime,
  };
}

function parseHeliusTrade(
  tx: HeliusEnhancedTransaction,
  address: string,
  tokenMetadata: Map<string, { symbol: string; name?: string; priceUsd: number; decimals: number }>,
): ParsedTrade | null {
  const signature = tx.signature || "";

  if (!signature) {
    return null;
  }

  const transferTrade = parseHeliusTransferFallback(tx, address, tokenMetadata);
  if (transferTrade) {
    return transferTrade;
  }

  const swap = tx.events?.swap;
  if (swap) {
    const swapTrade = parseHeliusSwapEvent(tx, tokenMetadata);
    if (swapTrade) {
      return swapTrade;
    }
  }

  return null;
}

function parseHeliusSwapEvent(
  tx: HeliusEnhancedTransaction,
  tokenMetadata: Map<string, { symbol: string; name?: string; priceUsd: number; decimals: number }>,
): ParsedTrade | null {
  const swap = tx.events?.swap;
  const signature = tx.signature || "";

  if (!swap || !signature) {
    return null;
  }

  const inputToken = selectHeliusTokenCandidate(
    swap.tokenInputs || [],
    tokenMetadata,
    false,
  );
  const outputToken = selectHeliusTokenCandidate(
    swap.tokenOutputs || [],
    tokenMetadata,
    true,
  );

  const nativeInputUsd = normalizeHeliusNativeAmount(swap.nativeInput?.amount) * 140;
  const nativeOutputUsd = normalizeHeliusNativeAmount(swap.nativeOutput?.amount) * 140;

  let action: "buy" | "sell" = "buy";
  let focus = outputToken || inputToken;
  let counterValueUsd = nativeInputUsd || nativeOutputUsd || 0;

  if (outputToken && isQuoteToken(outputToken.symbol) && inputToken) {
    action = "sell";
    focus = inputToken;
    counterValueUsd = outputToken.quoteUsd || nativeOutputUsd || inputToken.quoteUsd;
  } else if (inputToken && isQuoteToken(inputToken.symbol) && outputToken) {
    action = "buy";
    focus = outputToken;
    counterValueUsd = inputToken.quoteUsd || nativeInputUsd || outputToken.quoteUsd;
  } else if (inputToken && !outputToken) {
    action = "sell";
    focus = inputToken;
    counterValueUsd = inputToken.quoteUsd || nativeOutputUsd;
  } else if (outputToken && !inputToken) {
    action = "buy";
    focus = outputToken;
    counterValueUsd = outputToken.quoteUsd || nativeInputUsd;
  }

  if (!focus) {
    return null;
  }

  const timestampMs = (tx.timestamp || Math.floor(Date.now() / 1000)) * 1000;

  return {
    id: signature,
    token: formatTokenLabel(focus.symbol, focus.name, focus.mint),
    tokenDetail: focus.name || focus.symbol,
    tokenSymbol: focus.symbol,
    action,
    amount: formatCompact(focus.tokenAmount),
    value: formatCurrency(counterValueUsd || focus.quoteUsd || 0),
    subtitle: `${relativeTime(new Date(timestampMs).toISOString())} · ${signature.slice(0, 6)}...${signature.slice(-4)}`,
    color: colorForSymbol(focus.symbol),
    tokenValueUsd: counterValueUsd || focus.quoteUsd || 0,
    timestamp: timestampMs,
  };
}

function parseHeliusTransferFallback(
  tx: HeliusEnhancedTransaction,
  address: string,
  tokenMetadata: Map<string, { symbol: string; name?: string; priceUsd: number; decimals: number }>,
): ParsedTrade | null {
  const signature = tx.signature || "";
  const transfers = tx.tokenTransfers || [];
  const nativeTransfers = tx.nativeTransfers || [];

  if (!signature || (transfers.length === 0 && nativeTransfers.length === 0)) {
    return null;
  }

  const incoming = transfers
    .filter((item) => item.toUserAccount === address)
    .map((item) => mapHeliusTransfer(item, tokenMetadata))
    .filter((item): item is HeliusTransferCandidate => item !== null)
    .sort((a, b) => b.quoteUsd - a.quoteUsd);
  const outgoing = transfers
    .filter((item) => item.fromUserAccount === address)
    .map((item) => mapHeliusTransfer(item, tokenMetadata))
    .filter((item): item is HeliusTransferCandidate => item !== null)
    .sort((a, b) => b.quoteUsd - a.quoteUsd);

  if (incoming.length === 0 && outgoing.length === 0) {
    return null;
  }

  const quoteIncoming = incoming.find((item) => isQuoteToken(item.symbol));
  const quoteOutgoing = outgoing.find((item) => isQuoteToken(item.symbol));
  const assetIncoming = incoming.find((item) => !isQuoteToken(item.symbol));
  const assetOutgoing = outgoing.find((item) => !isQuoteToken(item.symbol));
  const nativeIncomingUsd =
    nativeTransfers
      .filter((item) => item.toUserAccount === address)
      .reduce((sum, item) => sum + ((item.amount || 0) / 1_000_000_000) * 140, 0);
  const nativeOutgoingUsd =
    nativeTransfers
      .filter((item) => item.fromUserAccount === address)
      .reduce((sum, item) => sum + ((item.amount || 0) / 1_000_000_000) * 140, 0);

  let action: "buy" | "sell" | null = null;
  let focus: ReturnType<typeof mapHeliusTransfer> | null = null;
  let valueUsd = 0;

  if (
    assetIncoming &&
    (quoteOutgoing || nativeOutgoingUsd > 0 || outgoing.length > 0)
  ) {
    action = "buy";
    focus = assetIncoming;
    valueUsd =
      quoteOutgoing?.quoteUsd ||
      nativeOutgoingUsd ||
      assetIncoming.quoteUsd;
  } else if (
    assetOutgoing &&
    (quoteIncoming || nativeIncomingUsd > 0 || incoming.length > 0)
  ) {
    action = "sell";
    focus = assetOutgoing;
    valueUsd =
      quoteIncoming?.quoteUsd ||
      nativeIncomingUsd ||
      assetOutgoing.quoteUsd;
  }

  if (!action || !focus) {
    return null;
  }

  const timestampMs = (tx.timestamp || Math.floor(Date.now() / 1000)) * 1000;

  return {
    id: signature,
    token: formatTokenLabel(focus.symbol, focus.name, focus.mint),
    tokenDetail: focus.name || focus.symbol,
    tokenSymbol: focus.symbol,
    action,
    amount: formatCompact(focus.tokenAmount),
    value: formatCurrency(valueUsd || focus.quoteUsd || 0),
    subtitle: `${relativeTime(new Date(timestampMs).toISOString())} · ${signature.slice(0, 6)}...${signature.slice(-4)}`,
    color: colorForSymbol(focus.symbol),
    tokenValueUsd: valueUsd || focus.quoteUsd || 0,
    timestamp: timestampMs,
  };
}

function mapHeliusTransfer(
  item: HeliusTokenTransfer,
  tokenMetadata: Map<string, { symbol: string; name?: string; priceUsd: number; decimals: number }>,
): HeliusTransferCandidate | null {
  const mint = item.mint || "";
  const identity = resolveTokenIdentity(mint, tokenMetadata);
  const symbol = normalizeSymbol(identity.symbol);
  const name = identity.name;
  const tokenAmount = item.tokenAmount || 0;
  const priceUsd = estimateTokenPrice(mint, symbol, tokenMetadata);

  if (tokenAmount <= 0) {
    return null;
  }

  return {
    mint,
    symbol,
    name,
    tokenAmount,
    quoteUsd: tokenAmount * priceUsd,
  };
}

function selectHeliusTokenCandidate(
  items: HeliusSwapTokenAmount[],
  tokenMetadata: Map<string, { symbol: string; name?: string; priceUsd: number; decimals: number }>,
  preferNonQuote: boolean,
) {
  const normalized = items
    .map((item) => {
      const mint = item.mint || "";
      const metadata = tokenMetadata.get(mint);
      const decimals = item.rawTokenAmount?.decimals ?? metadata?.decimals ?? 0;
      const raw =
        item.rawTokenAmount?.tokenAmountUi ??
        normalizeRawTokenAmount(item.rawTokenAmount?.tokenAmount, decimals);
      const symbol = normalizeSymbol(
        metadata?.symbol || (mint ? shortenAddress(mint) : "TOKEN"),
      );
      const name = metadata?.name;
      const priceUsd = estimateTokenPrice(mint, symbol, tokenMetadata);
      return {
        mint,
        symbol,
        name,
        tokenAmount: raw,
        quoteUsd: raw * priceUsd,
      };
    })
    .filter((item) => item.tokenAmount > 0);

  const preferred = normalized
    .filter((item) =>
      preferNonQuote ? !isQuoteToken(item.symbol) : isQuoteToken(item.symbol),
    )
    .sort((a, b) => b.quoteUsd - a.quoteUsd);

  if (preferred.length > 0) {
    return preferred[0];
  }

  return normalized.sort((a, b) => b.quoteUsd - a.quoteUsd)[0];
}

function normalizeRawTokenAmount(amount?: string, decimals = 0) {
  if (!amount) {
    return 0;
  }

  return Number(amount) / 10 ** decimals;
}

function normalizeHeliusNativeAmount(amount?: string) {
  if (!amount) {
    return 0;
  }

  return Number(amount) / 1_000_000_000;
}

function buildTokenDeltas(
  tx: SolanaRpcTransactionResponse["result"],
  address: string,
  tokenMetadata: Map<string, { symbol: string; name?: string; priceUsd: number; decimals: number }>,
) {
  const map = new Map<string, TokenDelta>();
  const pre = tx?.meta?.preTokenBalances || [];
  const post = tx?.meta?.postTokenBalances || [];

  for (const item of pre) {
    if (item.owner !== address || !item.mint) continue;
    const identity = resolveTokenIdentity(item.mint, tokenMetadata);
    map.set(item.mint, {
      mint: item.mint,
      symbol: identity.symbol,
      name: identity.name,
      delta: -(item.uiTokenAmount?.uiAmount || 0),
      priceUsd: 0,
      quoteUsd: 0,
    });
  }

  for (const item of post) {
    if (item.owner !== address || !item.mint) continue;
    const identity = resolveTokenIdentity(item.mint, tokenMetadata);
    const current = map.get(item.mint) || {
      mint: item.mint,
      symbol: identity.symbol,
      name: identity.name,
      delta: 0,
      priceUsd: 0,
      quoteUsd: 0,
    };
    current.delta += item.uiTokenAmount?.uiAmount || 0;
    map.set(item.mint, current);
  }

  return Array.from(map.values())
    .filter((item) => Math.abs(item.delta) > 0)
    .map((item) => ({
      ...item,
      symbol: normalizeSymbol(item.symbol),
      priceUsd: estimateTokenPrice(
        item.mint,
        normalizeSymbol(item.symbol),
        tokenMetadata,
      ),
      quoteUsd:
        Math.abs(item.delta) *
        estimateTokenPrice(item.mint, normalizeSymbol(item.symbol), tokenMetadata),
    }))
    .filter((item) => item.quoteUsd > 0 || Math.abs(item.delta) > 1);
}

function buildSolDelta(
  tx: SolanaRpcTransactionResponse["result"],
  ownerIndex: number,
): TokenDelta {
  if (ownerIndex < 0) {
    return {
      mint: "SOL",
      symbol: "SOL",
      delta: 0,
      priceUsd: 0,
      quoteUsd: 0,
    };
  }

  const pre = tx?.meta?.preBalances?.[ownerIndex] || 0;
  const post = tx?.meta?.postBalances?.[ownerIndex] || 0;
  const delta = (post - pre) / 1_000_000_000;
  const priceUsd = 140;

  return {
    mint: "SOL",
    symbol: "SOL",
    delta,
    priceUsd,
    quoteUsd: Math.abs(delta) * priceUsd,
  };
}

function normalizeSymbol(symbol: string) {
  return symbol.length <= 12 ? symbol : `${symbol.slice(0, 4)}...`;
}

function estimateTokenPrice(
  mint: string,
  symbol: string,
  tokenMetadata: Map<string, { symbol: string; name?: string; priceUsd: number; decimals: number }>,
) {
  if (mint === WRAPPED_SOL_MINT) {
    return 140;
  }

  const fromMetadata = tokenMetadata.get(mint)?.priceUsd || 0;
  if (fromMetadata > 0) {
    return fromMetadata;
  }

  const known: Record<string, number> = {
    SOL: 140,
    USDC: 1,
    USDT: 1,
    TRUMP: 12,
    BONK: 0.00002,
    WIF: 1.7,
    PENGU: 0.006,
    ARC: 0.059,
  };

  return known[symbol] || 0;
}

function formatTokenLabel(symbol: string, name?: string, mint?: string) {
  const trimmedName = name?.trim();
  const normalizedSymbol = symbol.trim();

  if (trimmedName && isHumanReadableTokenName(trimmedName, normalizedSymbol)) {
    return trimmedName;
  }

  if (normalizedSymbol && !looksLikeSolanaAddress(normalizedSymbol)) {
    return normalizedSymbol;
  }

  return mint ? shortenAddress(mint) : normalizedSymbol;
}

function isHumanReadableTokenName(name: string, symbol: string) {
  if (!name) {
    return false;
  }

  if (looksLikeSolanaAddress(name)) {
    return false;
  }

  if (name.length > 2 && !/\.\.\./.test(name)) {
    return true;
  }

  return name.toUpperCase() !== symbol.toUpperCase();
}

function colorForSymbol(symbol: string) {
  const index = Math.abs(hashCode(symbol)) % palette.length;
  return palette[index];
}

function hashCode(value: string) {
  return Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function aggregateTradesByToken(trades: ParsedTrade[]) {
  const map = new Map<string, number>();

  for (const trade of trades) {
    map.set(trade.token, (map.get(trade.token) || 0) + trade.tokenValueUsd);
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value }));
}


function buildTradeInsight({
  recentTrades,
  memeTrades,
  topSymbols,
  totalValue,
  chainCount,
}: {
  recentTrades: ParsedTrade[];
  memeTrades: ParsedTrade[];
  topSymbols: string[];
  totalValue: number;
  chainCount: number;
}) {
  if (recentTrades.length === 0) {
    return chainCount > 0 || totalValue > 0
      ? `该地址当前仍以资产画像为主。最近没有解析到明确 swap，但持仓主要集中在 ${topSymbols.slice(0, 3).join("、") || "主流资产"}，估值约为 ${formatCurrency(totalValue)}。`
      : "当前没有拿到足够的 recent trades，暂时无法判断其交易风格。";
  }

  const recentSymbols = Array.from(
    new Set(recentTrades.slice(0, 6).map((trade) => trade.token)),
  );
  const hasRotation = memeTrades.length >= 2 && recentSymbols.length >= 2;
  const dominantAction =
    recentTrades.filter((trade) => trade.action === "buy").length >=
    recentTrades.filter((trade) => trade.action === "sell").length
      ? "买入"
      : "卖出";

  if (hasRotation) {
    return `该地址最近在持续交易 meme 币，已识别 ${memeTrades.length} 笔 meme 相关操作，覆盖 ${recentSymbols.slice(0, 4).join("、")} 等资产。整体更像在做 meme rotation，节奏偏高频，风险较高，不适合满仓复制。`;
  }

  return `该地址最近共有 ${recentTrades.length} 笔可解析交易，最近行为以${dominantAction}为主，主要涉及 ${recentSymbols.slice(0, 4).join("、")}。当前更适合继续观察其后续买卖节奏，再决定是否进入模拟跟单。`;
}

function buildFollowDecision({
  recentTrades,
  memeTrades,
  buyCount,
  sellCount,
  hasTradeDegraded,
}: {
  recentTrades: ParsedTrade[];
  memeTrades: ParsedTrade[];
  buyCount: number;
  sellCount: number;
  hasTradeDegraded: boolean;
}) {
  if (hasTradeDegraded) {
    return {
      verdict: "watch" as const,
      label: "先观察",
      summary:
        "最近交易抓取还不完整，先不要直接跟单。建议先把 RPC 和交易覆盖率稳定下来，再根据真实买卖节奏做判断。",
    };
  }

  if (recentTrades.length < 4) {
    return {
      verdict: "watch" as const,
      label: "先观察",
      summary:
        "可解析交易还偏少，样本不够稳定。先继续看它是否持续交易 meme，再决定是否进入模拟跟单。",
    };
  }

  if (memeTrades.length >= 3 && sellCount > 0) {
    return {
      verdict: "follow" as const,
      label: "可小仓模拟跟单",
      summary:
        "这个地址已经表现出持续的 meme 交易行为，而且有卖出/止盈动作。更适合小仓位、限额的模拟跟单，而不是满仓复制。",
    };
  }

  if (buyCount > 0 && sellCount === 0) {
    return {
      verdict: "watch" as const,
      label: "观察卖出节奏",
      summary:
        "目前主要看到连续买入，还缺少卖出与止盈样本。先观察它是否能形成完整交易闭环，再决定是否跟单。",
    };
  }

  return {
    verdict: "avoid" as const,
    label: "暂不跟单",
    summary:
      "这类地址目前没有表现出足够稳定的 meme 轮动和止盈能力，暂时不建议直接进入跟单流程。",
  };
}

function formatCompact(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  if (value >= 1) {
    return value.toFixed(2);
  }
  return value.toFixed(4);
}

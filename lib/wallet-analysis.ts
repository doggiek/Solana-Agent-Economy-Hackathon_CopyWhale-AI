import { formatDistanceToNow } from "date-fns";

export type AnalysisMode = "demo" | "live";

export interface AnalysisListItem {
  id: string;
  token: string;
  action?: "buy" | "sell";
  amount: string;
  value: string;
  subtitle: string;
  color: string;
}

export interface AnalysisStat {
  label: string;
  value: string;
  tone?: "profit" | "neutral" | "warning";
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

const demoTransactions: AnalysisListItem[] = [
  {
    id: "1",
    token: "PEPE",
    action: "buy",
    amount: "2.5M",
    value: "$4,250",
    subtitle: "2 分钟前",
    color: "#10b981",
  },
  {
    id: "2",
    token: "ARB",
    action: "sell",
    amount: "15,000",
    value: "$18,750",
    subtitle: "15 分钟前",
    color: "#8b5cf6",
  },
  {
    id: "3",
    token: "DOGE",
    action: "buy",
    amount: "500,000",
    value: "$85,000",
    subtitle: "1 小时前",
    color: "#f59e0b",
  },
  {
    id: "4",
    token: "SHIB",
    action: "sell",
    amount: "1.2B",
    value: "$12,400",
    subtitle: "3 小时前",
    color: "#ef4444",
  },
  {
    id: "5",
    token: "WIF",
    action: "buy",
    amount: "25,000",
    value: "$62,500",
    subtitle: "5 小时前",
    color: "#06b6d4",
  },
  {
    id: "6",
    token: "BONK",
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

  // https://goldrush.dev/docs/api-reference/foundational-api/cross-chain/get-address-activity
  const activityUrl = `https://api.covalenthq.com/v1/address/${encodedAddress}/activity/?testnets=false`;
  const isSolanaAddress = looksLikeSolanaAddress(address);
  const balancesUrl = isSolanaAddress
    ? `https://api.covalenthq.com/v1/solana-mainnet/address/${encodedAddress}/balances_v2/?quote-currency=USD&no-spam=true`
    : null;

  const [activityResult, balancesRes] = await Promise.all([
    fetch(activityUrl, { headers, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return {
            ok: false as const,
            status: response.status,
            json: null,
          };
        }

        return {
          ok: true as const,
          status: response.status,
          json: (await response.json()) as
            | CovalentActivityResponse
            | { data?: never },
        };
      })
      .catch(() => ({
        ok: false as const,
        status: 0,
        json: null,
      })),
    balancesUrl
      ? fetch(balancesUrl, { headers, cache: "no-store" })
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
  if (balancesRes) {
    if (!balancesRes.ok) {
      throw new Error(
        `GoldRush balances request failed with ${balancesRes.status}`,
      );
    }
    const parsed = (await balancesRes.json()) as
      | CovalentBalancesResponse
      | { data?: never };
    if ("error" in parsed && parsed.error) {
      throw new Error(parsed.error_message || "Failed to load token balances");
    }
    balancesJson = parsed;
  }

  if (!balancesJson && !activityJson) {
    throw new Error("GoldRush returned no usable live data for this address.");
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
  const topChains = activityItems
    .slice()
    .sort(
      (a, b) =>
        new Date(b.last_seen_at || 0).getTime() -
        new Date(a.last_seen_at || 0).getTime(),
    )
    .slice(0, 6);

  const listItems: AnalysisListItem[] =
    topHoldings.length > 0
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

  const chartData =
    topHoldings.length > 0
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

  const tag = inferTag(totalValue, activityItems.length);
  const notices: string[] = ["Live 模式数据来自 Covalent GoldRush。"];

  if (!activityResult.ok) {
    notices.push(
      `跨链 activity 接口未返回有效结果（HTTP ${activityResult.status || "network"}），当前页面已回退为仅展示可用的持仓数据。`,
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

  const topSymbols = topHoldings
    .slice(0, 3)
    .map(
      (item) =>
        item.contract_ticker_symbol ||
        item.contract_display_name ||
        item.contract_name,
    )
    .filter(Boolean);

  const insightParts = [
    activityItems.length > 0
      ? `该地址最近活跃在 ${activityItems.length} 条链上`
      : "该地址近期链上活跃度有限",
    topSymbols.length > 0
      ? `当前主要持仓集中在 ${topSymbols.join("、")}`
      : "当前没有拿到可估值的主仓位",
    totalValue > 0
      ? `Covalent 估算的 Solana 持仓总价值约为 ${formatCurrency(totalValue)}`
      : "需要更多链上数据后才能继续做收益判断",
  ];

  return {
    mode: "live",
    source: "Covalent GoldRush",
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
    insight: `${insightParts.join("。")}。`,
    stats: [
      {
        label: "活跃链数",
        value: `${activityItems.length}`,
        tone: activityItems.length >= 3 ? "profit" : "neutral",
      },
      {
        label: "可见持仓数",
        value: `${balanceItems.length}`,
        tone: balanceItems.length > 0 ? "profit" : "warning",
      },
      {
        label: "最新同步",
        value: relativeTime(
          balancesJson?.data?.updated_at ||
            activityJson?.data?.updated_at ||
            new Date().toISOString(),
        ),
        tone: "neutral",
      },
    ],
    listTitle: topHoldings.length > 0 ? "真实持仓" : "跨链活跃",
    listItems,
    chartTitle: topHoldings.length > 0 ? "Top Holdings (USD)" : "Active Chains",
    chartData,
    chartValuePrefix: topHoldings.length > 0 ? "$" : "",
    notices,
    updatedAtLabel: relativeTime(
      balancesJson?.data?.updated_at ||
        activityJson?.data?.updated_at ||
        new Date().toISOString(),
    ),
  };
}

function inferTag(totalValue: number, chainCount: number) {
  if (totalValue >= 100000 || chainCount >= 5) {
    return "Whale";
  }
  if (totalValue >= 5000 || chainCount >= 2) {
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

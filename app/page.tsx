"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/dashboard/glass-card";
import {
  Brain,
  Copy,
  TrendingUp,
  Search,
  Sparkles,
  ArrowRight,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConnectButton } from "@/components/wallet/wallet-connect";
import Link from "next/link";

const exampleWallets = [
  { label: "vitalik.eth", address: "vitalik.eth" },
  {
    label: "0xd8dA...6045",
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  },
  { label: "punk6529.eth", address: "punk6529.eth" },
  { label: "tetranode.eth", address: "tetranode.eth" },
];

const features = [
  {
    icon: TrendingUp,
    title: "追踪聪明钱",
    description: "实时监控顶级交易员的链上活动，发现高价值交易机会",
  },
  {
    icon: Brain,
    title: "AI 智能洞察",
    description: "AI 深度分析钱包行为模式，预测市场趋势和潜在机会",
  },
  {
    icon: Copy,
    title: "自动跟单交易",
    description: "一键复制成功交易员的策略，自动执行跟单操作",
  },
];

export default function LandingPage() {
  const [walletInput, setWalletInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const router = useRouter();

  const handleAnalyze = () => {
    const trimmed = walletInput.trim();

    if (trimmed) {
      router.push(`/wallet/${encodeURIComponent(trimmed)}?mode=${mode}`);
      return;
    }

    if (mode === "demo") {
      router.push("/wallet/vitalik.eth?mode=demo");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-neon-purple/30 blur-[150px]" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-neon-blue/25 blur-[150px]" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-profit/15 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="border-b border-glass-border bg-glass/50 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue">
                <Sparkles className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                CopyWhale AI
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/copy-trading">
                <Button
                  variant="ghost"
                  className="gap-2 text-muted-foreground transition-all duration-300 hover:bg-neon-purple/10 hover:text-foreground"
                >
                  <Bot className="h-4 w-4" />
                  交易面板
                </Button>
              </Link>
              <ConnectButton />
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-balance bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
                AI 驱动的链上分析
              </h1>
              <div className="inline-flex items-center gap-1 rounded-full border border-glass-border bg-glass/60 p-1 backdrop-blur-sm">
                <button
                  onClick={() => setMode("demo")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    mode === "demo"
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Demo
                </button>
                <button
                  onClick={() => setMode("live")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    mode === "live"
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Live
                </button>
              </div>
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
              追踪聪明钱流向，获取 AI 智能洞察，自动跟单顶级交易员
            </p>
          </div>

          {/* Main Input Section */}
          <GlassCard
            className="mx-auto mt-12 max-w-2xl p-6 sm:p-8"
            hover={false}
          >
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={
                    mode === "live"
                      ? "输入 Solana 钱包地址"
                      : "输入钱包地址或 ENS 域名"
                  }
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  className="h-14 rounded-xl border-glass-border bg-secondary/50 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-neon-purple/50 focus:ring-neon-purple/20"
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                />
              </div>

              <Button
                onClick={handleAnalyze}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-base font-medium text-foreground transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {mode === "live" ? "分析聪明钱（实时）" : "查看 Demo 分析"}
                  <ArrowRight
                    className={`h-4 w-4 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
                  />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Button>
            </div>

            {/* Example Wallets */}
            <div className="mt-6">
              <p className="mb-3 text-center text-sm text-muted-foreground">
                试试这些热门钱包
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {exampleWallets.map((wallet) => (
                  <button
                    key={wallet.address}
                    onClick={() => {
                      setWalletInput(wallet.address);
                      setMode("demo");
                    }}
                    className="rounded-lg border border-glass-border bg-secondary/30 px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:border-neon-purple/50 hover:bg-neon-purple/10 hover:text-foreground"
                  >
                    {wallet.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Feature Cards */}
          <div className="mt-16 grid gap-6 sm:mt-20 sm:grid-cols-3">
            {features.map((feature, index) => (
              <GlassCard key={index} className="group p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 transition-all duration-300 group-hover:from-neon-purple/30 group-hover:to-neon-blue/30">
                  <feature.icon className="h-6 w-6 text-neon-purple transition-colors duration-300 group-hover:text-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-glass-border bg-glass/30 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
            <p className="text-center text-sm text-muted-foreground">
              CopyWhale AI - Web3 AI 跟单助手
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

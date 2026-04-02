"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const CopyTradingClient = dynamic(() => import("./copy-trading-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#050816] text-foreground">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-glass-border bg-glass-bg px-8 py-10 text-center backdrop-blur-xl">
          <Loader2 className="h-8 w-8 animate-spin text-[#6f63ff]" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">正在初始化跟单控制台</p>
            <p className="text-sm text-foreground-muted">
              正在准备实时信号与模拟仓位视图...
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
});

export default function CopyTradingPage() {
  return <CopyTradingClient />;
}

"use client"

import { Bell, Menu, Search, Settings } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-glass-border bg-glass backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue">
              <span className="text-sm font-bold text-foreground">N</span>
            </div>
            <span className="hidden text-lg font-bold text-foreground sm:block">NexTrade</span>
          </div>
        </div>

        <div className="hidden flex-1 justify-center px-8 md:flex">
          <div
            className={`relative w-full max-w-md transition-all duration-300 ${
              searchFocused ? "max-w-xl" : ""
            }`}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索代币或交易对..."
              className="h-10 w-full rounded-xl border border-glass-border bg-secondary/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple/50"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-profit" />
          </button>
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Settings className="h-5 w-5" />
          </button>
          <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon-blue">
            <span className="text-sm font-medium text-foreground">A</span>
          </div>
        </div>
      </div>
    </header>
  )
}

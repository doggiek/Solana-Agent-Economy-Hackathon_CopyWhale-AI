# 页面结构（v0 prompt）

## 全局风格 Prompt

让整体风格统一👇

Design a modern crypto trading dashboard UI.

Style:

- Dark mode
- Glassmorphism cards
- Neon accents (green for profit, red for loss, purple/blue gradients)
- Clean, minimal, Web3 style
- Smooth hover animations

Tech:

- React + Tailwind CSS
- Responsive layout

Components:

- Rounded cards (2xl)
- Subtle shadows
- Animated buttons
- Loading skeletons

Tone:

- Looks like a mix of Binance, Zerion, and a futuristic AI dashboard

## 页面1：首页（入口页）

👉 用于：输入地址 + 连接钱包

Create a landing dashboard for a Web3 AI trading assistant.

Main features:

- Top navbar with logo "CopyWhale AI"
- Connect Wallet button (top right)

Main section:

- Large centered input box:
  placeholder: "Enter wallet address or ENS"
- Primary button: "Analyze Smart Money"

Below input:

- Example wallet suggestions (clickable tags)

Bottom section:

- 3 feature cards:
  1. "Track Smart Money"
  2. "AI-powered Insights"
  3. "Auto Copy Trading"

Design:

- Dark mode
- Gradient background
- Glass cards
- Smooth hover effects

Add subtle animation to the main button

## 页面2：分析页（核心页面）

👉 这个页面是你“能不能赢”的关键

Create a crypto wallet analytics dashboard.

Header:

- Wallet address display
- Tag badge (Smart Money / Whale / Degen)
- Profit indicator (+12.4%)

Main layout:
Two columns

Left column:

- Recent transactions list
  Each item:
  token icon
  action (buy/sell)
  amount
  timestamp

Right column:

- AI Summary card:
  Title: "AI Insight"
  Text: "This wallet is consistently buying meme coins with a 78% win rate..."
- Performance stats:
  - Win rate
  - Total profit
  - Last 7 days PnL

Below:

- Button: "Enable Auto Copy Trading"

Design:

- Cards with glass effect
- Highlight profit in green
- Clean data visualization

Optional:

- Add a small line chart for PnL

## 页面3：跟单控制台（最重要）

👉 这个页面是你命中 Bitget 赛道的核心

Create a copy trading control dashboard for a crypto AI agent.

Header:

- Status badge: "Running" / "Stopped"
- Connected wallet address

Main controls:

- Toggle switch: "Auto Copy Trading"
- Slider: "Copy Percentage" (10% - 100%)
- Risk level selector:
  Low / Medium / High

Stats section:

- Total profit
- Daily profit
- Active trades

Transaction history:

- List of trades:
  Buy/Sell
  Token
  Amount
  Profit/Loss

Right side panel:

- Agent Activity Log:
  "Detected whale buying BONK"
  "Executed buy order"
  "Sold with +12% profit"

Design:

- Dark UI
- Neon highlights
- Smooth toggle animations
- Real-time feel (blinking status dot)

## 页面4：数据源说明（打 Covalent 用，加分页面，还没写）

Create a simple page showing data sources for a crypto analytics app.

Sections:

- "Powered by Covalent"
- API data explanation
- Chain coverage
- Real-time data badge

Add logos and clean layout

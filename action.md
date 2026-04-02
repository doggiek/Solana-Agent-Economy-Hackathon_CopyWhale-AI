# 🐋 CopyWhale AI — Hackathon Implementation Plan

## 📌 项目定位

**CopyWhale AI = Web3 智能跟单助手**

核心流程：

```
用户连接钱包 →
选择 smart money →
链上数据分析 →
AI 生成策略 →
自动/模拟跟单 →
收益展示
```

---

# 🏗️ 技术架构

## Frontend

- React / Next.js
- Tailwind CSS
- 钱包：
  - Bitget Wallet（必须）
  - Phantom（Solana）
  - MetaMask（可选）

## Backend（可选但推荐）

- Node.js (TypeScript)
- 用于：
  - 调用 Covalent API
  - AI 分析（调用 LLM）
  - 模拟交易逻辑

## 数据层

- Covalent GoldRush API（必须）
- Streaming API（推荐用于实时性）

## AI

- OpenAI / Claude
- 用于：
  - wallet 行为分析
  - 生成交易建议

---

# 🔌 Covalent（GoldRush）接入

## 是否用 Streaming API？

👉 建议：

- ❌ 初期不要用 streaming（复杂）
- ✅ 先用 REST API（快速跑通）

---

## 推荐接入方式（第一版）

### Step 1：安装 SDK

```bash
npm install @covalenthq/client-sdk
```

---

### Step 2：初始化

```ts
import { CovalentClient } from "@covalenthq/client-sdk";

const client = new CovalentClient("YOUR_API_KEY");
```

---

### Step 3：获取钱包数据（核心）

```ts
const resp = await client.BaseService.getAddressActivity(
  "solana-mainnet",
  walletAddress,
);

console.log(resp.data);
```

---

👉 你需要的数据：

- token 余额
- 最近交易
- 交互协议

---

# 🧠 AI Agent 设计（简单版）

## 不要复杂 Agent Framework

👉 用 LLM + Prompt 即可

---

## 输入数据

```json
{
  "transactions": [...],
  "profit": "...",
  "tokens": [...]
}
```

---

## Prompt 模板

```text
You are a crypto trading AI.

Analyze this wallet:

- Recent transactions: {data}
- Token holdings: {tokens}
- Activity pattern: {summary}

Answer:
1. Is this a smart money wallet?
2. What strategy is it using?
3. Should we copy trade it?
4. Risk level (Low / Medium / High)
```

---

## 输出示例

```json
{
  "isSmartMoney": true,
  "strategy": "Meme coin rotation",
  "suggestion": "Follow trades",
  "risk": "High"
}
```

---

# 📊 跟单策略（简化版）

## 核心逻辑

```
如果目标钱包买入 token：
→ 我们买入

如果目标钱包卖出：
→ 我们卖出
```

---

## 风控规则

- 最大仓位：20%
- 最多跟踪 3 个 token
- 忽略小额交易

---

# 💰 模拟交易系统（推荐）

## 为什么用模拟？

- 避免真实资金风险
- hackathon 更稳定
- 容易演示

---

## 模拟账户

```ts
balance = 1000 USDC
positions = []
```

---

## 买入逻辑

```ts
buy(token, amount):
  balance -= amount
  positions.push(...)
```

---

## 卖出逻辑

```ts
sell(token):
  calculate profit
  update balance
```

---

## 收益计算

```ts
PnL = 当前资产 - 初始资金;
```

---

# 🔁 实时更新（进阶）

## 可选（加分项）

- 使用 Streaming API
- 或 setInterval 轮询

```ts
setInterval(fetchWalletData, 10000);
```

---

# 🧩 页面对应功能

## 首页

- 输入钱包地址
- Connect Wallet

---

## 分析页

- 展示：
  - 交易记录
  - token 分布
  - AI 分析

---

## 跟单页

- 开关：
  - 自动跟单

- 参数：
  - 仓位比例

- 展示：
  - 收益
  - 历史交易

---

# 🏆 Hackathon 策略

## Bitget 赛道

- 强调：
  - 钱包连接
  - 自动交易
  - 收益展示

---

## Covalent 赛道

- 必须：
  - 使用 API
  - 展示链上数据分析

---

## Demo Mode（推荐）

```
Mode:
[ Demo Mode ]（默认）
[ Live Mode ]（可选）
```

---

# 🎥 Demo 录制脚本（简版）

1. 连接 Bitget Wallet
2. 输入 smart money 地址
3. 展示 AI 分析
4. 开启自动跟单
5. 展示收益变化

---

# ✅ 当前开发优先级

## P0（必须完成）

- [ ] 接 Covalent API
- [ ] 展示交易数据
- [ ] AI 分析
- [ ] 模拟跟单

## P1（加分）

- [ ] 实时更新
- [ ] x402 支付
- [ ] Agent 钱包

## P2（锦上添花）

- [ ] 真实交易
- [ ] Token 发行（Metaplex）

---

# 🚀 一句话目标

> 做一个“看起来已经可以自动帮你赚钱”的 AI 跟单产品

# CopyWhale AI

## 项目一句话

CopyWhale AI 是一个面向 Solana meme 交易场景的 AI 跟单代理：  
它会识别高频 smart money 地址，分析其最近交易行为，并把可执行的跟单信号送入自动跟单控制台。

---

## 对应黑客松赛道

### 赛道 1：Bitget Wallet

我们的产品核心就是一个基于 Solana 的 meme AI trading agent，用户通过 Bitget Wallet 连接钱包，查看 smart money 分析，并进入自动跟单控制台。

这与赛道 1 的要求高度匹配：

- 使用 Bitget Wallet 作为用户钱包入口
- 聚焦 Solana meme coin 交易场景
- 强调 AI 交易代理与自动跟单能力

### 赛道 2：Metaplex / x402

我们增加了一个轻量级的 premium intelligence endpoint，用来演示 agent 的可收费能力：

- `/api/premium/copy-plan?wallet=...`
- 未支付时返回 `402 Payment Required`
- 已支付后返回 premium copy plan，包括：
  - 是否建议跟单
  - 推荐风险等级
  - 推荐跟单比例
  - 止盈止损建议
  - 最近信号摘要

这与赛道 2 鼓励的 agent identity / x402-compatible API 方向一致：

- agent 不只是分析面板，而是可以对外提供 premium intelligence
- 高级 copy plan 可以通过 x402 风格的支付流程解锁
- 钱包执行与 premium 数据访问被清晰拆分

---

## 我们解决的问题

在 Solana meme 交易场景里，用户最大的痛点不是“找不到币”，而是：

- 找不到真正值得跟踪的 smart money
- 看不懂高频钱包到底在做什么
- 缺少一个把链上信号转成执行动作的 agent

市场上像 GMGN、Nansen 可以展示大量数据，但普通用户仍然需要自己判断：

- 这个地址是不是持续交易 meme
- 是不是只会买不会卖
- 是不是应该跟单
- 跟单以后要怎么控制风险

CopyWhale AI 的目标就是把这条链路简化成：

连接钱包 -> 输入/发现 smart money 地址 -> AI 分析 -> 跟单判断 -> 自动跟单控制台

---

## 产品流程

### 1. 钱包连接

用户使用 Bitget Wallet 或 Phantom 连接钱包。

### 2. Smart Money 分析

输入一个 Solana 地址后，系统会返回：

- 最近交易
- meme 交易数
- 买卖比
- round-trip 交易配对
- AI 风格判断
- 是否适合继续观察 / 小仓模拟跟单

### 3. 地址筛选

我们提供 smart wallet finder，用来批量筛选候选地址，而不是让用户手动一个个试。

### 4. 跟单控制台

当用户点击“开启自动跟单”后，会跳转到 copy trading 控制台：

- 选择 demo / live 模式
- 绑定来源 smart money 地址
- 调整跟单比例
- 设置风险等级

---

## 当前技术架构

### 钱包层

- Bitget Wallet
- Phantom

### 数据层

- Covalent GoldRush
  - 钱包持仓
  - 持仓估值
  - 地址画像基础层

- Helius Enhanced Transactions
  - recent trades
  - swap 交易还原
  - 高频交易行为识别

- Solana RPC fallback
  - 当增强交易数据不可用时，使用 raw RPC 做基础兜底

- x402-compatible premium endpoint
  - premium copy plan
  - 付费后解锁高级跟单建议

### 产品层

- Wallet analysis 页面
- Smart wallet finder 页面
- Copy trading 控制台

---

## 为什么这个方案适合赛道 1 + 2

### 对 Bitget Wallet 赛道的价值

Bitget Wallet 赛道要求的不只是接入钱包，而是做出一个真正围绕钱包使用场景的代理产品。

CopyWhale AI 的入口就是钱包，目标也是让用户基于自己的钱包直接执行跟单行为，因此非常符合 Bitget Wallet 赛道的应用层要求。

### 对 Metaplex / x402 方向的价值

赛道 2 更强调 agent identity 与可收费能力。我们的处理方式是把高级情报能力拆成单独的 premium API，而不把支付流程和真实交易执行耦死在一起。

我们的路径是：

- 用 Bitget Wallet 完成真实交易执行
- 用 premium copy plan endpoint 演示 x402-compatible access
- 用分析结果返回可付费的风险/仓位建议

这不是单纯的数据看板，而是一个：

`链上数据 -> AI 判断 -> premium intelligence -> 钱包执行`

的 agent 闭环。

---

## 当前已经完成的部分

- Bitget / Phantom 钱包连接
- demo / live 双模式
- smart money 地址分析页
- recent trades 基础解析
- meme token 识别规则
- AI 洞察文案
- smart wallet finder 批量候选筛选
- wallet 分析页跳转 copy trading 控制台
- copy trading 控制台支持 demo / live 区分
- premium copy plan API（x402 demo）

---

## 当前仍在增强的部分

为了让“是否跟单”更可靠，我们正在继续增强：

- 使用 Helius Enhanced Transactions 提升高频交易识别能力
- 用 round-trip 交易配对替代单纯 raw swaps 列表
- 提升 token naming，让展示更接近 GMGN/Nansen
- 增加更稳定的收益判断与风险判断

---

## Demo 亮点

如果在 Demo 中向评委展示，我们建议突出这几点：

1. 用户连接 Bitget Wallet
2. 输入一个 smart money 地址
3. 系统识别其 meme 高频交易行为
4. AI 给出一句话判断
5. 点击“开启自动跟单”
6. 跳转到 copy trading 控制台
7. 展示 demo / live 模式切换
8. 打开 premium / x402 入口，展示未支付返回 402、已支付返回 premium copy plan

这样评委能快速理解：

- 这是一个真实可交互的 agent 产品
- 不是单纯的链上浏览器
- 也不是只有数据没有执行入口的分析面板
- 同时具备 premium intelligence 的收费能力

---

## 我们的核心叙事

CopyWhale AI is an AI-powered Solana meme copy-trading agent.

It combines:

- Bitget Wallet as the user wallet entry
- Covalent GoldRush as the wallet intelligence layer
- Helius / Solana transaction parsing as the trade signal layer
- x402-compatible premium copy-plan access as the monetization layer

to turn on-chain whale behavior into actionable copy-trading decisions.

---

## 如何演示 x402 Premium Copy Plan

建议在 demo 里单独展示这一段：

1. 在钱包分析页右侧的 `Premium / x402` 卡片里点击 `查看 402 响应`
2. 新窗口会打开：

   - `/api/premium/copy-plan?wallet=<wallet>`

3. 接口返回 `402 Payment Required`，表示高级 copy plan 需要付费解锁
4. 再点击 `演示已支付结果`
5. 新窗口会打开：

   - `/api/premium/copy-plan?wallet=<wallet>&demo_paid=1`

6. 接口会返回 premium copy plan，包括：

   - 是否建议跟单
   - 推荐跟单比例
   - 风险等级
   - 止盈止损
   - 最近信号摘要

这部分的目的不是做完整支付系统，而是向评委明确展示：

- CopyWhale AI 不只是分析页面
- 它已经具备对外提供 premium intelligence 的 agent 形态
- 高级情报可以通过 x402-compatible API 访问

---

## 后续计划

- 把 live copy trading 面板接成真实信号队列
- 增加胜率 / realized PnL / hold duration 指标
- 把跟单建议从“行为判断”升级为“收益 + 行为”的综合判断
- 进一步贴近 GMGN/Nansen 的交易视图体验

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

### 赛道 3：Covalent GoldRush

我们的 agent 依赖 Covalent GoldRush 提供链上钱包画像与持仓估值能力，并将这些数据作为 smart money 分析、地址筛选和交易决策的基础层。

这与赛道 3 推荐方向高度匹配：

- 构建鲸鱼追踪信息流
- 监控地址行为并生成信号
- 将链上数据连接到一个可执行动作的代理

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

### 产品层

- Wallet analysis 页面
- Smart wallet finder 页面
- Copy trading 控制台

---

## 为什么这个方案适合赛道 1 + 3

### 对 Bitget Wallet 赛道的价值

Bitget Wallet 赛道要求的不只是接入钱包，而是做出一个真正围绕钱包使用场景的代理产品。

CopyWhale AI 的入口就是钱包，目标也是让用户基于自己的钱包直接执行跟单行为，因此非常符合 Bitget Wallet 赛道的应用层要求。

### 对 Covalent 赛道的价值

Covalent 赛道鼓励把 GoldRush 数据连接到一个能执行动作的 agent。

我们的路径正是：

- 用 GoldRush 做钱包画像与持仓估值
- 用链上交易数据识别 smart money 的交易行为
- 把这些结果转成跟单建议和控制台执行入口

这不是单纯的数据看板，而是一个“数据 -> 判断 -> 动作”的闭环。

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

这样评委能快速理解：

- 这是一个真实可交互的 agent 产品
- 不是单纯的链上浏览器
- 也不是只有数据没有执行入口的分析面板

---

## 我们的核心叙事

CopyWhale AI is an AI-powered Solana meme copy-trading agent.

It combines:

- Bitget Wallet as the user wallet entry
- Covalent GoldRush as the wallet intelligence layer
- Helius / Solana transaction parsing as the trade signal layer

to turn on-chain whale behavior into actionable copy-trading decisions.

---

## 后续计划

- 把 live copy trading 面板接成真实信号队列
- 增加胜率 / realized PnL / hold duration 指标
- 把跟单建议从“行为判断”升级为“收益 + 行为”的综合判断
- 进一步贴近 GMGN/Nansen 的交易视图体验

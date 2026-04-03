# CopyWhale AI

一个面向 Solana meme 交易场景的聪明钱跟单代理。

这次黑客松里，我想解决的问题其实很直接：

**链上“聪明钱”数据已经很多了，但普通用户依然很难真正用起来。**

大家常见的痛点不是“看不到数据”，而是：

- 不知道哪个地址值得跟
- 看不懂一个地址最近到底在做什么
- 不知道该不该跟、怎么跟、跟多少
- 钱包连接以后，也没有真正进入执行链路

所以我做了 **CopyWhale AI**。

它不是一个单纯的数据面板，而是一个面向 Solana meme 交易的 AI 跟单代理：

**聪明地址分析 -> AI 跟单判断 -> 跟单任务池 -> 模拟执行 -> 真实执行**

---

## 我做了什么

### 1. Smart Money 钱包分析

输入一个 Solana 地址后，系统会分析：

- 最近交易
- Meme 交易数
- 买卖比
- Most Traded Tokens
- AI 洞察
- 是否适合继续观察 / 跟单

重点不是只做“钱包画像”，而是尽量还原一个地址最近到底在做什么。

【插图 1：钱包分析页全图】

---

### 2. 跟单判断

在钱包分析页里，我直接把“是否跟单”的判断前置了。

用户可以看到：

- AI 跟单判断
- 风险等级建议
- 跟单比例
- 单币仓位上限
- 模拟止损 / 模拟止盈

也就是说，用户不是进入交易面板之后才开始想“怎么跟”，而是在分析页就完成了决策。

【插图 2：跟单判断模块特写】

---

### 3. 跟单控制台

当用户点击“加入自动跟单池”后，会进入跟单控制台。

这里可以看到：

- 控制台概览
- 跟单任务
- 当前模拟持仓
- 链上执行摘要
- 执行记录
- 活动日志

这部分更像一个 agent runtime console，而不只是展示页面。

【插图 3：交易面板 / 控制台截图】

---

### 4. 真实执行

我没有让钱包只是停留在“连接成功”的层面。

在交易面板里，用户可以直接点：

**真实执行**

然后通过 Bitget Wallet 发起真实交易。

这对我来说很关键，因为：

- 钱包不是摆设
- agent 不是纯模拟器
- 产品具备真实执行入口

【插图 4：真实执行按钮 + 钱包交易成功截图】

---

### 5. Premium / x402 风格的高级情报接口

除了分析和执行，我还做了一个轻量级 premium endpoint：

`/api/premium/copy-plan?wallet=...`

它的行为是：

- 未支付时返回 `402 Payment Required`
- 已支付 demo 时返回 premium copy plan

返回内容包括：

- 是否建议跟单
- 推荐风险等级
- 推荐跟单比例
- 止盈止损
- 最近信号摘要

这部分不是完整支付系统，而是一个 **x402-compatible demo flow**。  
我想表达的是：

> CopyWhale AI 不只是一个前端页面，它还可以把高级跟单情报作为 agent API 对外开放。

【插图 5：402 响应截图】
【插图 6：已支付 premium copy plan 响应截图】

---

## 技术栈

### 钱包层

- Bitget Wallet
- Phantom

### 链上 intelligence 层

- Covalent GoldRush
  - 钱包画像
  - 持仓估值
  - 基础链上情报

- Helius Enhanced Transactions
  - recent trades
  - 高频交易识别
  - 交易行为恢复

- Solana RPC fallback
  - 在增强交易数据不可用时做基础兜底

### 产品层

- 首页
- 钱包分析页
- 地址雷达
- 跟单控制台
- Premium intelligence endpoint

---

## 为什么这个项目有意思

我觉得很多链上产品的问题是：

- 要么停留在“看数据”
- 要么停留在“讲策略”
- 要么只是一个连接钱包按钮

而我更想做的是一条完整链路：

**链上行为 -> AI 判断 -> 跟单建议 -> 执行控制台 -> 钱包真实执行**

也就是把“看懂聪明钱”真正变成“可以跟单的动作”。

---

## 适配赛道

### @BitgetWallet

这个项目里，Bitget Wallet 不是一个摆设入口，而是真正承担了：

- 钱包连接
- 交易确认
- 真实执行

这更接近一个真正的 Solana meme trading agent。

### Premium / x402 方向

我额外做了一个 premium copy plan endpoint，用来展示 agent intelligence 的收费能力：

- 未支付：返回 402
- 已支付 demo：解锁高级 copy plan

这让项目不只是“一个分析工具”，而更像一个可以对外输出 premium intelligence 的 agent。

---

## 当前完成了什么

目前已经完成：

- Bitget / Phantom 钱包连接
- Live 钱包分析
- Smart money 行为识别
- Meme 交易解析
- AI 洞察
- 跟单判断
- 地址筛选
- 跟单任务池
- 模拟执行控制台
- 真实执行按钮
- Premium / x402 demo endpoint

---

## Demo 路线

我会这样给评委演示：

1. 首页输入一个 live 地址
2. 查看钱包分析页
3. 展示 AI 洞察和跟单判断
4. 把地址加入自动跟单池
5. 打开交易面板
6. 展示模拟执行和真实执行
7. 最后点开 premium / x402 入口，展示 402 和 premium 返回

---

## Links

- GitHub: [替换]
- Demo: [替换]
- Premium endpoint demo: [替换]
- X Article: [本篇]

@trendsdotfun  
@solana_devs  
@BitgetWallet  
#AgentTalentShow

# Solana 钱包交易分析 - 数据流程 & UI映射

## 1️⃣ 数据来源

| 数据类型                 | 数据源           | 说明                                  | 可用接口 / 示例           |
| ------------------------ | ---------------- | ------------------------------------- | ------------------------- |
| 持仓 / 资产余额          | Covalent         | 获取钱包代币余额、总估值、资产比例    | `balances_v2`             |
| 交易流 / Swap / 大额买入 | Solscan / Helius | 获取最近交易、买入/卖出记录、交易哈希 | Solscan API 或 Helius API |

---

## 2️⃣ 数据处理流程

```text
[钱包地址]
     │
     ├─> Covalent -> 获取 balances -> 资产总览
     │
     └─> Solscan/Helius -> 获取 recent trades -> 交易过滤 & 格式化
                 ├─ 过滤特定代币（TRUMP, BONK, PENGU, WIF…）
                 ├─ 提取交易金额 & 时间 & tx hash
                 └─ 转换时间格式（xx 分钟前 / 日期）
```

3️⃣ UI / 分析映射

| UI区域       | 数据来源                       | 展示内容                      | 说明                              |
| ------------ | ------------------------------ | ----------------------------- | --------------------------------- |
| 左侧主列表   | Solscan / Helius recent trades | Buy TRUMP 276.32, Sell BONK … | 时间 + 金额 + tx hash             |
| 右侧资产总览 | Covalent balances              | 持仓比例、总估值              | 补充用户画像 / 顶部概览           |
| AI 分析面板  | recent trades                  | 高频短线、偏好资产、风险提示  | 输出交易策略 & meme rotation 特征 |

4️⃣ 分析逻辑

- 交易偏好识别：
  - 高频短线 → 交易频率高
  - 偏好资产 → 主要买卖的 meme 代币
  - 风险提示 → 波动大资产、短线操作 → 不适合满仓复制

- 数据更新策略：
  - Covalent balances：每 N 分钟刷新一次
  - Solscan / Helius trades：实时或近实时抓取 recent trades

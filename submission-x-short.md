# CopyWhale AI

CopyWhale AI is a Solana meme smart-money trading agent built around three layers:

- **Bitget Wallet** for wallet connection and real trade execution
- **Covalent GoldRush** for wallet intelligence, balances, and on-chain context
- **Helius / Solana parsing** for recent trade reconstruction and copy-trading signals

## What it does

Users can:

1. connect a wallet,
2. inspect a smart-money wallet,
3. get an AI copy-trading verdict,
4. add that wallet into a copy-trading task pool,
5. simulate execution,
6. and trigger a real trade through Bitget Wallet.

## Why it matters

Most Solana traders can see wallet data, but they still struggle to answer:

- Is this wallet really trading meme coins consistently?
- Is it buying only, or actually rotating and taking profit?
- Should I follow it, and with what size and risk?

CopyWhale AI turns raw on-chain behavior into:

`wallet analysis -> AI judgment -> copy plan -> execution console`

## Hackathon fit

### Bitget Wallet

We use Bitget Wallet as the execution entry:

- wallet connection
- real transaction confirmation
- real trade submission from the copy-trading console

### x402 / agent monetization

We expose a lightweight premium endpoint:

- `/api/premium/copy-plan?wallet=...`

It returns:

- `402 Payment Required` when unpaid
- a premium copy plan when paid

This shows how CopyWhale AI can monetize premium intelligence for agents and users.

## Demo highlights

- Smart-money wallet analysis in live mode
- AI follow / watch / avoid decision
- Copy-trading task pool
- Simulated positions + execution feed
- Real trade execution via Bitget Wallet
- Premium copy-plan API with x402-style payment gating

## Core story

CopyWhale AI is not just an analytics dashboard.

It is a Solana trading agent that:

- reads whale behavior,
- converts it into actionable copy plans,
- lets users simulate strategies,
- and executes real trades through Bitget Wallet.

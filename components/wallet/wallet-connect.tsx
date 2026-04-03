"use client";

import {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { VersionedTransaction } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/dashboard/glass-card";
import { Wallet, X, Check, ExternalLink, Copy, LogOut } from "lucide-react";

// Wallet types
type WalletType = "metamask" | "phantom" | "bitget";

interface WalletState {
  address: string;
  walletType: WalletType | null;
  isConnected: boolean;
  isConnecting: boolean;
}

interface WalletContextType extends WalletState {
  connect: (type: WalletType) => Promise<boolean>;
  disconnect: () => void;
  canExecuteSolanaTrades: boolean;
  sendSolanaTransaction: (
    serializedTransactionBase64: string,
  ) => Promise<{ signature?: string; note?: string }>;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface EvmProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<string[]>;
  isMetaMask?: boolean;
  isBitKeep?: boolean;
  isBitget?: boolean;
  isPhantom?: boolean;
}

interface SolanaProvider {
  connect: () => Promise<unknown>;
  signAndSendTransaction?: (
    transaction: VersionedTransaction,
  ) => Promise<{ signature?: string } | string>;
  signTransaction?: (
    transaction: VersionedTransaction,
  ) => Promise<VersionedTransaction>;
  publicKey?: { toString: () => string } | string;
  address?: string;
  account?: string;
  accounts?: string[];
  selectedAddress?: string;
  isPhantom?: boolean;
  isBitKeep?: boolean;
  isBitget?: boolean;
}

function extractSolanaTransactionSignature(result: unknown) {
  if (typeof result === "string") {
    return result;
  }

  if (!result || typeof result !== "object") {
    return "";
  }

  const record = result as Record<string, unknown>;
  const direct =
    record.signature ||
    record.txid ||
    record.txHash ||
    record.hash ||
    record.transactionSignature ||
    record.result;

  return typeof direct === "string" ? direct : "";
}

function formatWalletError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as Record<string, unknown>;
    return {
      message:
        typeof maybeError.message === "string"
          ? maybeError.message
          : "Unknown wallet error",
      code: maybeError.code,
      name: maybeError.name,
      reason: maybeError.reason,
      data: maybeError.data,
      error,
    };
  }

  return { message: String(error) };
}

function getInjectedEvmProviders() {
  const providers: EvmProvider[] = [];

  if (window.bitkeep?.ethereum) {
    providers.push(window.bitkeep.ethereum);
  }

  if (window.bitget?.ethereum) {
    providers.push(window.bitget.ethereum);
  }

  if (window.ethereum?.providers?.length) {
    providers.push(...window.ethereum.providers);
  } else if (window.ethereum) {
    providers.push(window.ethereum);
  }

  return Array.from(new Set(providers));
}

function getBitgetProvider() {
  return getInjectedEvmProviders().find(
    (provider) => provider.isBitKeep || provider.isBitget,
  );
}

function getBitgetSolanaProvider() {
  const providers: SolanaProvider[] = [];

  if (window.bitkeep?.solana) {
    providers.push(window.bitkeep.solana);
  }

  if (window.bitget?.solana) {
    providers.push(window.bitget.solana);
  }

  if (
    window.solana &&
    !window.solana.isPhantom &&
    (window.solana.isBitKeep || window.solana.isBitget)
  ) {
    providers.push(window.solana);
  }

  return providers[0];
}

function extractSolanaAddress(response: unknown) {
  if (typeof response === "string") {
    return response;
  }

  if (!response || typeof response !== "object") {
    return "";
  }

  const result = response as Record<string, unknown>;

  if (
    result.publicKey &&
    typeof result.publicKey === "object" &&
    typeof (result.publicKey as { toString?: () => string }).toString ===
      "function"
  ) {
    return (result.publicKey as { toString: () => string }).toString();
  }

  if (typeof result.address === "string") {
    return result.address;
  }

  if (
    Array.isArray(result.accounts) &&
    typeof result.accounts[0] === "string"
  ) {
    return result.accounts[0];
  }

  if (typeof result.account === "string") {
    return result.account;
  }

  if (typeof result.selectedAddress === "string") {
    return result.selectedAddress;
  }

  return "";
}

function decodeBase64ToUint8Array(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeUint8ArrayToBase64(value: Uint8Array) {
  let binary = "";

  for (const byte of value) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function serializeSignedTransaction(
  signedTransaction: VersionedTransaction | Uint8Array | ArrayBuffer | unknown,
) {
  if (
    signedTransaction &&
    typeof signedTransaction === "object" &&
    "serialize" in signedTransaction &&
    typeof (signedTransaction as { serialize: () => Uint8Array }).serialize ===
      "function"
  ) {
    return (signedTransaction as { serialize: () => Uint8Array }).serialize();
  }

  if (signedTransaction instanceof Uint8Array) {
    return signedTransaction;
  }

  if (signedTransaction instanceof ArrayBuffer) {
    return new Uint8Array(signedTransaction);
  }

  throw new Error("钱包返回了无法广播的签名交易格式。");
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}

// Wallet Provider
export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: "",
    walletType: null,
    isConnected: false,
    isConnecting: false,
  });

  const connect = useCallback(async (type: WalletType) => {
    setState((prev) => ({ ...prev, isConnecting: true }));

    try {
      let address = "";

      if (type === "metamask") {
        // MetaMask - 检查是否是真正的 MetaMask（不是其他钱包注入的）
        const ethereum = window.ethereum;
        if (
          ethereum?.isMetaMask &&
          !ethereum.isBitKeep &&
          !ethereum.isBitget &&
          !ethereum.isPhantom
        ) {
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });
          address = accounts[0];
        } else if (ethereum?.providers) {
          // 多钱包环境，找到 MetaMask provider
          const metamaskProvider = ethereum.providers.find(
            (p: EvmProvider) => p.isMetaMask && !p.isBitKeep && !p.isBitget,
          );
          if (metamaskProvider) {
            const accounts = await metamaskProvider.request({
              method: "eth_requestAccounts",
            });
            address = accounts[0];
          } else {
            window.open("https://metamask.io/download/", "_blank");
            throw new Error("MetaMask not installed");
          }
        } else {
          window.open("https://metamask.io/download/", "_blank");
          throw new Error("MetaMask not installed");
        }
      } else if (type === "phantom") {
        // Phantom - Solana 链
        const phantom = window.phantom?.solana || window.solana;
        if (phantom?.isPhantom) {
          const resp = await phantom.connect();
          address = extractSolanaAddress(resp);
        } else {
          window.open("https://phantom.app/download", "_blank");
          throw new Error("Phantom not installed");
        }
      } else if (type === "bitget") {
        const bitgetSolanaProvider = getBitgetSolanaProvider();

        if (bitgetSolanaProvider) {
          const resp = await bitgetSolanaProvider.connect();
          address =
            extractSolanaAddress(resp) ||
            extractSolanaAddress(bitgetSolanaProvider);

          if (!address) {
            console.error("Bitget Solana connect response:", resp);
            console.error(
              "Bitget Solana provider snapshot:",
              Object.getOwnPropertyNames(bitgetSolanaProvider).reduce<
                Record<string, unknown>
              >((acc, key) => {
                acc[key] = (
                  bitgetSolanaProvider as unknown as Record<string, unknown>
                )[key];
                return acc;
              }, {}),
            );
          }
        } else {
          const bitgetProvider = getBitgetProvider();

          if (bitgetProvider) {
            throw new Error(
              "Bitget EVM provider detected, but Solana provider is unavailable. Please switch Bitget Wallet to Solana or enable its Solana wallet.",
            );
          }

          window.open("https://web3.bitget.com/en/wallet-download", "_blank");
          throw new Error("Bitget Wallet not installed");
        }
      }

      if (!address) {
        throw new Error("Wallet returned no account");
      }

      setState({
        address,
        walletType: type,
        isConnected: true,
        isConnecting: false,
      });
      return true;
    } catch (error) {
      console.error("Wallet connection error:", formatWalletError(error));
      setState((prev) => ({ ...prev, isConnecting: false }));
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: "",
      walletType: null,
      isConnected: false,
      isConnecting: false,
    });
  }, []);

  const sendSolanaTransaction = useCallback(
    async (serializedTransactionBase64: string) => {
      const provider =
        state.walletType === "bitget"
          ? getBitgetSolanaProvider()
          : window.phantom?.solana || window.solana;

      if (!provider || !state.isConnected) {
        throw new Error("请先连接支持 Solana 的钱包。");
      }

      const transaction = VersionedTransaction.deserialize(
        decodeBase64ToUint8Array(serializedTransactionBase64),
      );

      if (provider.signAndSendTransaction) {
        try {
          const result = await provider.signAndSendTransaction(transaction);
          const signature = extractSolanaTransactionSignature(result);

          if (!signature) {
            console.warn(
              "Wallet signAndSendTransaction completed without a parseable signature.",
              result,
            );
            return {
              signature: "",
              note: "钱包已提交交易，但未返回可解析的签名。",
            };
          }

          return { signature };
        } catch (error) {
          console.warn(
            "Wallet signAndSendTransaction failed, falling back to signTransaction + broadcast.",
            formatWalletError(error),
          );
        }
      }

      if (provider.signTransaction) {
        const signedTransaction = await provider.signTransaction(transaction);
        const signedBase64 = encodeUint8ArrayToBase64(
          serializeSignedTransaction(signedTransaction),
        );
        const response = await fetch("/api/solana-broadcast", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction: signedBase64,
          }),
        });
        const json = (await response.json()) as {
          signature?: string;
          error?: string;
        };

        if (!response.ok || !json.signature) {
          throw new Error(json.error || "广播签名交易失败。");
        }

        return { signature: json.signature };
      }

      throw new Error("当前钱包不支持发送 Solana 交易。");
    },
    [state.isConnected, state.walletType],
  );

  const canExecuteSolanaTrades =
    state.isConnected &&
    (state.walletType === "bitget" || state.walletType === "phantom");

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        canExecuteSolanaTrades,
        sendSolanaTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// Wallet config
const wallets = [
  {
    id: "bitget" as WalletType,
    name: "Bitget Wallet",
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6">
        <rect width="32" height="32" rx="8" fill="#00D4AA" />
        <path d="M8 16L16 8L24 16L16 24L8 16Z" fill="white" />
      </svg>
    ),
    color: "from-emerald-500 to-cyan-500",
  },
  {
    id: "phantom" as WalletType,
    name: "Phantom",
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6">
        <rect width="32" height="32" rx="8" fill="#AB9FF2" />
        <path
          d="M21.5 16C21.5 19.0376 19.0376 21.5 16 21.5C12.9624 21.5 10.5 19.0376 10.5 16C10.5 12.9624 12.9624 10.5 16 10.5C19.0376 10.5 21.5 12.9624 21.5 16Z"
          fill="white"
        />
      </svg>
    ),
    color: "from-purple-500 to-indigo-500",
  },
  // {
  //   id: "metamask" as WalletType,
  //   name: "MetaMask",
  //   icon: (
  //     <svg viewBox="0 0 32 32" className="h-6 w-6">
  //       <rect width="32" height="32" rx="8" fill="#F6851B" />
  //       <path d="M16 10L22 16L16 22L10 16L16 10Z" fill="white" />
  //     </svg>
  //   ),
  //   color: "from-orange-500 to-amber-500",
  // },
];

// Connect Modal
interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, isConnecting } = useWallet();
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  const handleConnect = async (type: WalletType) => {
    const connected = await connect(type);
    if (connected) {
      onClose();
    }
  };

  if (!isOpen || !portalRoot) return null;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <GlassCard className="p-6" hover={false}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">连接钱包</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={isConnecting}
                className="group flex w-full items-center gap-4 rounded-xl border border-glass-border bg-secondary/30 p-4 transition-all duration-300 hover:border-neon-purple/50 hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${wallet.color}`}
                >
                  {wallet.icon}
                </div>
                <span className="flex-1 text-left font-medium text-foreground">
                  {wallet.name}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            连接钱包即表示您同意我们的服务条款和隐私政策
          </p>
        </GlassCard>
      </div>
    </div>
  );

  return createPortal(modalContent, portalRoot);
}

// Connect Button
export function ConnectButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, disconnect } = useWallet();

  // Fix hydration mismatch - useEffect only runs on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const shortenAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <GlassCard className="flex items-center gap-3 px-4 py-2" hover={false}>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-profit/20">
            <Check className="h-3 w-3 text-profit" />
          </div>
          <span className="text-sm font-medium text-foreground">
            {shortenAddress(address)}
          </span>
          <button
            onClick={copyAddress}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-profit" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </GlassCard>
        <Button
          variant="ghost"
          size="icon"
          onClick={disconnect}
          className="h-9 w-9 text-muted-foreground hover:bg-loss/10 hover:text-loss"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="outline"
        className="gap-2 border-glass-border bg-glass/50 text-foreground backdrop-blur-sm"
        disabled
      >
        <Wallet className="h-4 w-4" />
        连接钱包
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleOpenModal}
        variant="outline"
        className="gap-2 border-glass-border bg-glass/50 text-foreground backdrop-blur-sm transition-all duration-300 hover:border-neon-purple/50 hover:bg-neon-purple/10"
      >
        <Wallet className="h-4 w-4" />
        连接钱包
      </Button>
      <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}

// TypeScript declarations for wallet providers
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<string[]>;
      isMetaMask?: boolean;
      isBitKeep?: boolean;
      isBitget?: boolean;
      isPhantom?: boolean;
      providers?: EvmProvider[];
    };
    solana?: {
      isPhantom?: boolean;
      isBitKeep?: boolean;
      isBitget?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      signAndSendTransaction?: SolanaProvider["signAndSendTransaction"];
      signTransaction?: SolanaProvider["signTransaction"];
    };
    phantom?: {
      solana?: SolanaProvider;
    };
    bitkeep?: {
      ethereum: EvmProvider;
      solana?: SolanaProvider;
    };
    bitget?: {
      ethereum: EvmProvider;
      solana?: SolanaProvider;
    };
  }
}

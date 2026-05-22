"use client";

import React from "react";
import {
    SmilePlus,
    Send,
    MoreHorizontal,
    CheckCheck,
    Bot,
    Loader2,
    ArrowRight,
    CheckCircle,
    XCircle,
    ExternalLink,
    AlertTriangle,
    Coins
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { InteractiveRobotSpline } from "@/components/ui/interactive-3d-robot";
import { useAccount, useSendTransaction, usePublicClient, useSwitchChain } from "wagmi";
import { parseUnits, formatUnits, erc20Abi, encodeFunctionData, getAddress, isAddress } from "viem";

const BASE_TOKENS: Record<string, { address: `0x${string}`; decimals: number; symbol: string; logo: string }> = {
  ETH: { address: "0x0000000000000000000000000000000000000000", decimals: 18, symbol: "ETH", logo: "⟠" },
  WETH: { address: "0x4200000000000000000000000000000000000006", decimals: 18, symbol: "WETH", logo: "⟠" },
  USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6, symbol: "USDC", logo: "◎" },
  DEGEN: { address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", decimals: 18, symbol: "DEGEN", logo: "🎩" },
  AERO: { address: "0x94018130Dd388f9C212046182e56c05C29b4e2C0", decimals: 18, symbol: "AERO", logo: "✈" }
};

interface ActionData {
  type: "transfer" | "swap";
  to?: string;
  amount: string;
  symbol?: string;
  fromToken?: string;
  toToken?: string;
}

interface OnchainActionExecutorProps {
  messageId: string;
  actionData: ActionData;
  onActionComplete?: (messageId: string, status: 'success' | 'rejected', txHash?: string) => void;
}

function OnchainActionExecutor({ messageId, actionData, onActionComplete }: OnchainActionExecutorProps) {
  const { address, isConnected, chainId } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();

  const [status, setStatus] = React.useState<'idle' | 'quoting' | 'approving' | 'sending' | 'success' | 'failed' | 'rejected'>('idle');
  const [txHash, setTxHash] = React.useState<string>("");
  const [errorMsg, setErrorMsg] = React.useState<string>("");
  const [swapQuote, setSwapQuote] = React.useState<{ estimatedOut: string; priceImpact: string; gas: string } | null>(null);
  const [quoteData, setQuoteData] = React.useState<any>(null);

  React.useEffect(() => {
    if (actionData.type !== 'swap') return;
    
    const fetchSwapQuote = async () => {
      setStatus('quoting');
      try {
        const fromSym = (actionData.fromToken || "ETH").toUpperCase();
        const toSym = (actionData.toToken || "USDC").toUpperCase();
        
        const fromTokenDetails = BASE_TOKENS[fromSym] || BASE_TOKENS.ETH;
        const toTokenDetails = BASE_TOKENS[toSym] || BASE_TOKENS.USDC;
        
        const amountIn = parseUnits(actionData.amount, fromTokenDetails.decimals).toString();
        
        const res = await fetch("https://api.odos.xyz/sor/quote/v2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chainId: 8453,
            inputTokens: [{
              tokenAddress: fromTokenDetails.address === "0x0000000000000000000000000000000000000000" 
                ? "0x0000000000000000000000000000000000000000" 
                : getAddress(fromTokenDetails.address),
              amount: amountIn
            }],
            outputTokens: [{
              tokenAddress: toTokenDetails.address === "0x0000000000000000000000000000000000000000" 
                ? "0x0000000000000000000000000000000000000000" 
                : getAddress(toTokenDetails.address),
              proportion: 1
            }],
            slippageLimitPercent: 1.0,
            userAddr: address ? getAddress(address) : "0x0000000000000000000000000000000000000001",
            disableBancor: true,
            compact: true
          })
        });
        
        const data = await res.json();
        if (data.pathId) {
          setQuoteData(data);
          const estOut = formatUnits(BigInt(data.outAmounts[0]), toTokenDetails.decimals);
          setSwapQuote({
            estimatedOut: parseFloat(estOut).toFixed(6),
            priceImpact: (data.priceImpact || 0).toFixed(2) + "%",
            gas: "$" + (data.gasEstimateValue || 0.05).toFixed(4),
          });
          setStatus('idle');
        } else {
          throw new Error("Unable to build routing path");
        }
      } catch (err: any) {
        console.error("Quote fetching failed:", err);
        setErrorMsg("Failed to construct Odos routing quote.");
        setStatus('failed');
      }
    };
    
    fetchSwapQuote();
  }, [actionData, address]);

  const executeAction = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first.");
      return;
    }
    
    if (chainId !== 8453) {
      if (switchChain) {
        switchChain({ chainId: 8453 });
      } else {
        alert("Please switch your wallet to Base network.");
      }
      return;
    }
    
    try {
      if (actionData.type === 'transfer') {
        setStatus('sending');
        const tokenSym = (actionData.symbol || "ETH").toUpperCase();
        const tokenDetails = BASE_TOKENS[tokenSym];
        
        if (!tokenDetails) {
          throw new Error(`Unsupported token symbol: ${tokenSym}`);
        }
        
        if (!actionData.to || !isAddress(actionData.to)) {
          throw new Error("Invalid recipient address.");
        }
        
        let hash = "";
        
        if (tokenDetails.address === "0x0000000000000000000000000000000000000000") {
          hash = await sendTransactionAsync({
            to: getAddress(actionData.to),
            value: parseUnits(actionData.amount, 18)
          });
        } else {
          const amountInBigInt = parseUnits(actionData.amount, tokenDetails.decimals);
          const txData = encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: [getAddress(actionData.to), amountInBigInt]
          });
          hash = await sendTransactionAsync({
            to: getAddress(tokenDetails.address),
            data: txData
          });
        }
        
        setTxHash(hash);
        setStatus('success');
        if (onActionComplete) {
          onActionComplete(messageId, 'success', hash);
        }
      } else if (actionData.type === 'swap') {
        if (!quoteData || !address || !publicClient) return;
        setStatus('sending');
        
        const assembleRes = await fetch("https://api.odos.xyz/sor/assemble", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAddr: getAddress(address),
            pathId: quoteData.pathId,
            simulate: false
          })
        });
        const assembleData = await assembleRes.json();
        const tx = assembleData.transaction;
        if (!tx) throw new Error(assembleData.message || "Trade assembly failed");
        
        const fromSym = (actionData.fromToken || "ETH").toUpperCase();
        const fromTokenDetails = BASE_TOKENS[fromSym] || BASE_TOKENS.ETH;
        
        if (fromTokenDetails.address !== "0x0000000000000000000000000000000000000000") {
          const amountIn = parseUnits(actionData.amount, fromTokenDetails.decimals);
          const allowance = await publicClient.readContract({
            address: getAddress(fromTokenDetails.address),
            abi: erc20Abi,
            functionName: 'allowance',
            args: [getAddress(address), getAddress(tx.to)]
          });
          
          if (allowance < amountIn) {
            setStatus('approving');
            const approveData = encodeFunctionData({
              abi: erc20Abi,
              functionName: 'approve',
              args: [getAddress(tx.to), amountIn]
            });
            await sendTransactionAsync({
              to: getAddress(fromTokenDetails.address),
              data: approveData
            });
            
            alert(`Token approved successfully! Please click 'Sign & Swap' once again to finalise.`);
            setStatus('idle');
            return;
          }
        }
        
        setStatus('sending');
        const hash = await sendTransactionAsync({
          to: getAddress(tx.to),
          data: tx.data as `0x${string}`,
          value: BigInt(tx.value)
        });
        
        setTxHash(hash);
        setStatus('success');
        if (onActionComplete) {
          onActionComplete(messageId, 'success', hash);
        }
      }
    } catch (err: any) {
      console.error("Onchain action failed:", err);
      const isUserReject = err?.message?.toLowerCase().includes("user rejected") || err?.shortMessage?.toLowerCase().includes("user rejected");
      if (isUserReject) {
        setStatus('rejected');
        if (onActionComplete) {
          onActionComplete(messageId, 'rejected');
        }
      } else {
        setErrorMsg(err.shortMessage || err.message || "Transaction failed");
        setStatus('failed');
      }
    }
  };

  const handleReject = () => {
    setStatus('rejected');
    if (onActionComplete) {
      onActionComplete(messageId, 'rejected');
    }
  };

  return (
    <div className="mt-4 p-5 rounded-2xl bg-white/[0.01] backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(255,215,0,0.02)] relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 p-3 opacity-20">
        <Coins className="w-8 h-8 text-yellow-500 animate-pulse" />
      </div>
      
      <div className="absolute -inset-px bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {status === 'quoting' && (
        <div className="flex items-center gap-3 py-6 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Querying Odos Smart Routing...</span>
        </div>
      )}
      
      {(status === 'idle' || status === 'quoting') && actionData.type === 'transfer' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
            <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Queue Onchain Transfer</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Asset Amount</p>
              <p className="font-black text-white text-base">{actionData.amount} {actionData.symbol}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 overflow-hidden">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Recipient Address</p>
              <p className="font-mono text-white text-xs truncate">{actionData.to}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleReject}
              className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 rounded-xl text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={executeAction}
              className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-yellow-500 text-black hover:bg-yellow-400 rounded-xl transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)]"
            >
              Execute
            </button>
          </div>
        </div>
      )}

      {status === 'idle' && actionData.type === 'swap' && swapQuote && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
            <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Queue Token Swap</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">You Swap</p>
              <p className="font-black text-white text-base">{actionData.amount} {actionData.fromToken}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">You Receive (Estimated)</p>
              <p className="font-black text-yellow-500 text-base">≈ {swapQuote.estimatedOut} {actionData.toToken}</p>
            </div>
          </div>

          <div className="flex justify-between px-2 text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
            <span>Price Impact: <strong className="text-emerald-400">{swapQuote.priceImpact}</strong></span>
            <span>Est. Gas: <strong className="text-white">{swapQuote.gas}</strong></span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleReject}
              className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 rounded-xl text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={executeAction}
              className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-yellow-500 text-black hover:bg-yellow-400 rounded-xl transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)]"
            >
              Sign & Swap
            </button>
          </div>
        </div>
      )}

      {status === 'approving' && (
        <div className="py-4 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mx-auto mb-3" />
          <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">Approval Requested</h4>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Confirm the token spending approval in your wallet</p>
        </div>
      )}

      {status === 'sending' && (
        <div className="py-4 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mx-auto mb-3" />
          <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">Submitting Transaction</h4>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Confirm signature in your browser wallet...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-4 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Transaction Success</h4>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-4">Your transaction has been securely submitted on Base L2</p>
          
          <a 
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400 text-black text-[9px] font-black uppercase tracking-widest hover:bg-emerald-300 transition-colors mx-auto"
          >
            Verify on BaseScan <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {(status === 'failed' || status === 'rejected') && (
        <div className="py-4 text-center bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
          <XCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">
            {status === 'rejected' ? "Transaction Cancelled" : "Execution Failed"}
          </h4>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-4">
            {status === 'rejected' ? "You declined the request in your wallet." : (errorMsg || "An unexpected error occurred during execution.")}
          </p>
          
          <button 
            onClick={() => setStatus('idle')}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest text-white transition-colors"
          >
            Retry Execution
          </button>
        </div>
      )}
    </div>
  );
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

interface RuixenMonoChatProps {
    chatName?: string;
    messages: ChatMessage[];
    input: string;
    setInput: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    onClear?: () => void;
    suggestions?: { label: string; icon: React.ElementType }[];
    onActionComplete?: (messageId: string, status: 'success' | 'rejected', txHash?: string) => void;
}

export default function RuixenMonoChat({
    chatName = "Neural Agent Link",
    messages,
    input,
    setInput,
    onSubmit,
    isLoading,
    onClear,
    suggestions = [],
    onActionComplete
}: RuixenMonoChatProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const participants = [
        {
            name: "AI Agent",
            avatar: "https://images.unsplash.com/photo-1593376893114-1aed528d80cf?q=80&w=200&h=200&auto=format&fit=crop",
            isOnline: true,
            role: "assistant"
        },
        {
            name: "You",
            avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&h=200&auto=format&fit=crop",
            isOnline: true,
            role: "user"
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto p-2 md:p-6 bg-white dark:bg-black rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col h-full border border-gray-200 dark:border-white/10 transition-all">
            {/* Header */}
            <header className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                        <Bot className="w-7 h-7 text-black" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white">
                            {chatName}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                Neural Sync Protocol Active
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onClear && (
                        <button
                            onClick={onClear}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                            Purge
                        </button>
                    )}
                    <button
                        aria-label="More options"
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition"
                    >
                        <MoreHorizontal className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
            </header>

            {/* Body */}
            <main className="flex flex-1 overflow-hidden rounded-3xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                {/* Interactive 3D Robot Sidebar */}
                <aside 
                    className="hidden lg:block w-80 border-r border-gray-100 dark:border-white/5 relative overflow-hidden bg-gray-50/30 dark:bg-black/20"
                >
                    <div className="absolute top-6 left-6 z-10">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-500 mb-1">Live Interface</p>
                        <h3 className="text-xs font-black uppercase tracking-tight text-black dark:text-white">Whobee v2.0</h3>
                    </div>

                    <div className="absolute inset-0 z-0">
                        <InteractiveRobotSpline 
                            scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"
                            className="w-full h-full"
                        />
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 z-10">
                        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Neural Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-white uppercase">Cognitive Link Stable</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Messages */}
                <section 
                    ref={scrollRef}
                    data-lenis-prevent
                    className="flex-1 p-2 md:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6 min-h-0 scroll-smooth"
                >
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                            <Bot className="w-16 h-16 mb-4" />
                            <p className="text-sm font-black uppercase tracking-[0.3em]">No synpatic data yet</p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isAssistant = message.role === "assistant";
                            const participant = participants.find(p => p.role === message.role);
                            
                            // Parse action if present in assistant message
                            let parsedAction: ActionData | null = null;
                            let cleanContent = message.content;
                            
                            if (isAssistant && message.content.includes("<onchain_action>")) {
                              const match = message.content.match(/<onchain_action>([\s\S]*?)<\/onchain_action>/);
                              if (match) {
                                try {
                                  parsedAction = JSON.parse(match[1].trim());
                                  cleanContent = message.content.replace(/<onchain_action>[\s\S]*?<\/onchain_action>/, "").trim();
                                } catch (e) {
                                  console.warn("Failed to parse action json:", e);
                                }
                              }
                            }
                            
                            return (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex gap-4 group max-w-[85%]",
                                        !isAssistant && "ml-auto flex-row-reverse"
                                    )}
                                >
                                    <Image
                                        src={participant?.avatar || ""}
                                        alt={message.role}
                                        width={40}
                                        height={40}
                                        className="rounded-xl h-10 w-10 flex-shrink-0 shadow-md ring-2 ring-gray-100 dark:ring-white/10"
                                    />
                                    <div className={cn(
                                        "flex flex-col gap-2",
                                        !isAssistant && "items-end"
                                    )}>
                                        <div className={cn(
                                            "p-4 md:p-6 rounded-[2rem] shadow-sm transition-all",
                                            isAssistant 
                                                ? "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-tl-none animate-in fade-in-50 duration-300" 
                                                : "bg-black dark:bg-white text-white dark:text-black rounded-tr-none"
                                        )}>
                                            <div className={cn(
                                                "prose prose-sm max-w-none prose-p:leading-relaxed",
                                                !isAssistant ? "prose-invert dark:prose-neutral" : "dark:prose-invert"
                                            )}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {cleanContent}
                                                </ReactMarkdown>
                                            </div>
                                            
                                            {parsedAction && (
                                                <OnchainActionExecutor 
                                                    messageId={message.id}
                                                    actionData={parsedAction}
                                                    onActionComplete={onActionComplete}
                                                />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 px-2">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isAssistant && message.content && (
                                                <CheckCheck className="w-3 h-3 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    
                    {isLoading && (
                        <div className="flex gap-4 max-w-[80%] animate-pulse">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/20">
                                <Bot className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-[2rem] rounded-tl-none flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Synthesizing Alpha...</span>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <div className="mt-4 flex flex-col gap-3">
                {/* Embedded Suggestions */}
                {suggestions.length > 0 && messages.length < 5 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 px-1 custom-scrollbar scrollbar-hide no-scrollbar">
                        {suggestions.map((s, i) => {
                            const IconComponent = s.icon as any;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setInput(`Please ${s.label.toLowerCase()}...`)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 whitespace-nowrap hover:border-yellow-500/30 transition-all group"
                                >
                                    <IconComponent className="w-3.5 h-3.5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{s.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                <form 
                    onSubmit={onSubmit}
                    className="flex items-center gap-3 md:gap-4"
                >
                <button
                    type="button"
                    aria-label="Add emoji"
                    className="p-3 md:p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-400"
                >
                    <SmilePlus className="w-6 h-6" />
                </button>
                <div className="flex-1 relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Neural Uplink Command..."
                        disabled={isLoading}
                        className={cn(
                            "w-full px-6 py-3 md:py-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm transition-all",
                            "bg-gray-50 dark:bg-white/5 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500",
                            "focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                        )}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-3 md:p-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all shadow-xl"
                >
                    <Send className="w-6 h-6" />
                </button>
            </form>
            </div>
        </div>
    );
}

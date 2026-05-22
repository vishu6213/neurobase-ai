"use client";

import { useState } from "react";
import { Zap, Shield, TrendingUp, Sparkles } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { usePortfolioStore } from "@/hooks/use-portfolio-store";
import RuixenMonoChat from "@/components/ui/ruixen-mono-chat";

export default function ChatPage() {
  const { messages, addMessage, clearMessages, updateLastAssistantMessage } = useChatStore();
  const { totalValue, tokens, nativeBalances, connectedAddress } = usePortfolioStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    addMessage({ role: "user", content: userMessage });
    setIsLoading(true);

    // Add empty assistant message immediately so updateLastAssistantMessage targets it
    addMessage({ role: "assistant", content: "" });

    try {
      const state = usePortfolioStore.getState();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, { role: "user", content: userMessage }],
          walletContext: {
            connectedAddress: state.connectedAddress,
            totalValue: state.totalValue,
            tokens: state.tokens,
            nativeBalances: state.nativeBalances
          }
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || `Server error ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) updateLastAssistantMessage(chunk);
        }
      }
      
    } catch (error) {
      console.error("Chat error:", error);
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      updateLastAssistantMessage(`\n⚠️ *${errMsg}. Please try again.*`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionComplete = async (messageId: string, status: 'success' | 'rejected', txHash?: string) => {
    setIsLoading(true);
    const notificationText = status === 'success' 
      ? `[System Notification: Transaction successfully executed. Hash: ${txHash}. Prompt the user celebrating the successful onchain transaction!]`
      : `[System Notification: The user has declined/cancelled the transaction. Prompt the user asking if they want to make any adjustments or try again.]`;
      
    addMessage({ role: "user", content: notificationText });
    addMessage({ role: "assistant", content: "" });
    
    try {
      const state = usePortfolioStore.getState();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, { role: "user", content: notificationText }],
          walletContext: {
            connectedAddress: state.connectedAddress,
            totalValue: state.totalValue,
            tokens: state.tokens,
            nativeBalances: state.nativeBalances
          }
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || `Server error ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) updateLastAssistantMessage(chunk);
        }
      }
    } catch (error) {
      console.error("Action completion feed error:", error);
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      updateLastAssistantMessage(`\n⚠️ *${errMsg}*`);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { label: "Analyze ETH Node", icon: Zap },
    { label: "Base Ecosystem Trends", icon: TrendingUp },
    { label: "Portfolio Risk Synthesis", icon: Shield },
    { label: "Check Onchain Alpha", icon: Sparkles },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] md:h-[calc(100vh-160px)]">
      <RuixenMonoChat 
        messages={messages}
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onClear={clearMessages}
        suggestions={suggestions}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
}

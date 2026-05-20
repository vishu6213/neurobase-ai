import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  clearMessages: () => void;
  updateLastAssistantMessage: (content: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I am your NeuroBase AI assistant. How can I help you navigate the Base ecosystem today?",
          timestamp: Date.now(),
        },
      ],
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: Math.random().toString(36).substring(7),
              timestamp: Date.now(),
            },
          ],
        })),
      clearMessages: () => set({ messages: [] }),
      updateLastAssistantMessage: (content) =>
        set((state) => {
          const newMessages = [...state.messages];
          const lastAssistantIndex = [...newMessages].reverse().findIndex(m => m.role === "assistant");
          if (lastAssistantIndex !== -1) {
            const actualIndex = newMessages.length - 1 - lastAssistantIndex;
            newMessages[actualIndex] = {
              ...newMessages[actualIndex],
              content: newMessages[actualIndex].content + content,
            };
          }
          return { messages: newMessages };
        }),
    }),
    {
      name: "neurobase-chat-storage",
    }
  )
);

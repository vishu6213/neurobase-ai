import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton client for browser use
let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

export const supabase = getSupabaseClient();

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type UserProfile = {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
};

export type WalletRecord = {
  id: string;
  user_id: string;
  address: string;
  chain_id: number;
  label?: string;
  is_primary: boolean;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type SwapRecord = {
  id: string;
  user_id: string;
  wallet_address: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount?: string;
  status: "pending" | "confirmed" | "failed";
  created_at: string;
};

export type WatchlistItem = {
  id: string;
  user_id: string;
  token_symbol: string;
  token_address?: string;
  token_name?: string;
};

export type AIInsight = {
  id: string;
  type: "market" | "portfolio" | "token" | "risk" | "alpha";
  title: string;
  content: string;
  confidence_score?: number;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

// ============================================================
// HELPER QUERIES
// ============================================================

export async function getAIInsights(type?: AIInsight["type"]) {
  const query = supabase
    .from("ai_insights")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (type) query.eq("type", type);
  return query;
}

export async function getUserWatchlist(userId: string) {
  return supabase
    .from("watchlists")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
}

export async function addToWatchlist(userId: string, token: Omit<WatchlistItem, "id" | "user_id">) {
  return supabase.from("watchlists").insert({ user_id: userId, ...token });
}

export async function removeFromWatchlist(userId: string, tokenSymbol: string) {
  return supabase
    .from("watchlists")
    .delete()
    .eq("user_id", userId)
    .eq("token_symbol", tokenSymbol);
}

export async function getUserNotifications(userId: string) {
  return supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
}

export async function markNotificationRead(notificationId: string) {
  return supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
}

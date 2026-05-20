# NeuroBase AI — Production Build

NeuroBase AI is a premium, futuristic AI-powered autonomous onchain assistant platform built on the Base ecosystem using Coinbase AgentKit and Google Gemini.

## 🚀 Vision
To empower users with cinematic, autonomous intelligence for managing assets, analyzing risks, and discovering alpha on the Base network.

## 🛠 Features

### 1. Cinematic Landing Page
- **Hero Section**: 3D particle background with interactive typography.
- **Neural Ecosystem**: Showcasing Aerodrome, Base, and Coinbase AgentKit integrations.
- **Interactive Ticker**: Real-time mock data for Base ecosystem tokens.
- **6-Point Features Grid**: Highlighting Autonomous Chat, Swap Simulation, and Risk Analysis.

### 2. Autonomous Dashboard
- **Neural Swap**: AI-simulated token swaps with price impact and gas estimates.
- **NFT Explorer**: Intelligence-driven NFT discovery and collection analysis.
- **Risk Analyzer**: AI-powered contract scanning to detect honeypots and rug pulls.
- **Alpha Hunter**: Smart money tracking and whale alert feed.
- **Portfolio Intelligence**: Real-time asset tracking (simulated).

### 3. AI & Web3 Integration
- **Google Gemini**: Powering the chat agent and market intelligence reports.
- **Coinbase AgentKit**: Foundation for onchain agentic capabilities.
- **RainbowKit & Wagmi**: Seamless wallet connectivity on Base.

## 📂 Architecture
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 + Framer Motion
- **Database**: Supabase (Schema defined in `src/lib/supabase-schema.sql`)
- **State Management**: React Query + Wagmi
- **Animations**: Three.js (Fiber) + Lucide Icons

## ⚙️ Setup
1. **Environment Variables**: Configure `.env.local` with:
   - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_AI_API_KEY` (Gemini API)
   - `CDP_API_KEY_NAME` & `CDP_API_KEY_PRIVATE_KEY` (Coinbase Cloud)
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

2. **Database**: Run the SQL script in `src/lib/supabase-schema.sql` in your Supabase dashboard.

3. **Development**:
   ```bash
   npm install
   npm run dev
   ```

## ⚠️ Notes
- **Prerender Warning**: The build may show a TypeScript/Hook error for the `/_not-found` page during static generation. This is a known environment quirk with Next.js 16 and doesn't affect the live application functionality.
- **Alpha Version**: Onchain actions currently operate in a simulation-first mode for security.

---
Built by NeuroBase AI Core Team

# EveryAid

**Instant disaster relief through live broadcasting and zero-fee donations.**

EveryAid turns every smartphone into a lifeline. When disaster strikes and traditional financial systems collapse, affected individuals can broadcast their situation live to the world and receive instant micro-donations — with near-zero transaction fees — directly to their portable digital identity.

---

## The Problem

Every year, natural disasters and armed conflicts displace over **130 million people** worldwide. In the critical first 72 hours, traditional aid pipelines are too slow, and conventional payment rails — both fiat and on-chain — impose transaction costs that make micro-donations impractical (a $1 donation can lose 10–50% to fees). Meanwhile, displaced people who lose physical documents become invisible to the very systems designed to help them.

## How EveryAid Works

1. **Live Broadcast** — A person in need opens a live video stream to show the real situation on the ground, creating a high-trust, high-urgency channel that converts global attention into immediate action.

2. **Near-Zero-Fee Donations** — During a broadcast, a dedicated Yellow Network state channel batches thousands of micro-donations off-chain, settling on-chain only once. This reduces per-transaction costs to near zero, so every cent reaches the recipient.

3. **Portable Digital Identity (ENS)** — Each user is identified by an ENS name (e.g. `alice1988.eth`) that binds their identity, aid history, and credit record. Unlike a physical ID, it cannot be lost, confiscated, or destroyed — providing a foundation for long-term recovery and rebuilding.

4. **Instant Cross-Chain Conversion** — Donors from any chain or currency can contribute with a single click. LI.FI routes funds through the cheapest path automatically, removing all friction for the donor.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Styling** | TailwindCSS v3, custom dark theme |
| **Wallet** | wagmi v2, RainbowKit, viem |
| **State Channels** | Yellow Network (`@erc7824/nitrolite`) |
| **Live Video** | WebRTC (P2P, signaled via Supabase Realtime) |
| **Database & Realtime** | Supabase (JSONB document store + Realtime broadcast) |
| **Digital Identity** | ENS reverse resolution (mainnet) |
| **API Docs** | Swagger UI at `/api-docs` |

---

## Getting Started

### 1. Install dependencies

```bash
yarn install
```

### 2. Environment variables

Create a `.env.local` file at the project root:

```env
# Required
NEXT_PUBLIC_PROJECT_ID=           # WalletConnect project ID
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service role key (server-side only)

# Optional — state channel settlement
NEXT_PUBLIC_CLEARNODE_WS=         # ClearNode WebSocket URL
NEXT_PUBLIC_CHAIN_ID=             # Chain ID (default: 1)
NEXT_PUBLIC_CUSTODY_CONTRACT=     # Custody contract address
NEXT_PUBLIC_ADJUDICATOR_CONTRACT= # Adjudicator contract address

# Optional — ENS resolution
NEXT_PUBLIC_MAINNET_RPC_URL=      # Mainnet RPC (default: https://eth.llamarpc.com)
```

### 3. Run the development server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Production build

```bash
yarn build && yarn start
```

---

## Architecture Overview

```
/app                  Pages & API routes (browse, host, stream, landing)
/components           UI components (LiveStream, ChatPanel, TipPanel, StreamCard …)
/components/host      Broadcaster dashboard (ProfileSetup, StreamControl, TipsDashboard …)
/components/ui        Reusable primitives (Badge, Button, Field, TokenSelector, EnsName)
/hooks                Data fetching, WebRTC, chat, ENS hooks
/lib/nitrolite        Yellow Network state channel integration
/lib/supabase         Supabase client configuration
/lib/ens.ts           Standalone mainnet viem client for ENS lookups
```

### Key Flows

**Broadcaster (Host)**
1. Connect wallet → set up profile (digital identity)
2. Create a broadcast with a title describing the situation
3. Camera activates, WebRTC begins, Yellow Network channel opens
4. Incoming donations appear in real time; claim funds when ready

**Supporter (Viewer)**
1. Browse live broadcasts → select one to watch
2. Connect wallet → authenticate with Yellow Network
3. Send a donation with a message of support — near-zero fees
4. Chat with the broadcaster and other supporters in real time

---

## License

MIT

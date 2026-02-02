# Yellow Live Tipping MVP

A minimal **Next.js + TailwindCSS** MVP that demonstrates how to build a  
**live streaming tipping interface** using **Yellow Network (Nitrolite)**,  
with wallet connectivity powered by **wagmi + RainbowKit**.

This project focuses on **frontend architecture, layout, and state flow**.  
Business logic, real transfers, and settlement can be layered in later.

---

## ✨ Features

- Next.js App Router (`app/`)
- Tailwind CSS v3 (dark theme)
- wagmi v2 + RainbowKit wallet connection
- Yellow Nitrolite (ClearNode + state channel auth flow)
- Parent-managed session state
- Layout-only Live Stream UI
- Modular, extensible component structure

---

## 🧱 Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: TailwindCSS v3
- **Wallet**: wagmi, RainbowKit, viem
- **State Channels**: `@erc7824/nitrolite`
- **Package Manager**: Yarn

---



## 🚀 Getting Started

### 1. Install dependencies

```bash
yarn install
```

### 2. Environment variables

Create a .env.local file at the project root:

```.env
NEXT_PUBLIC_PROJECT_ID=
```

Contract addresses are required only when enabling real channel creation
and settlement.

### 3. Run the development server
```bash
yarn dev
```

Open: http://localhost:3000
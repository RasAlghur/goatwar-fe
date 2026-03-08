# GOAT WARS — Messi vs Ronaldo on Solana

A dark-stadium-aesthetic prediction game on Solana Devnet.

## Quick Start

```bash
npm install
npm run dev
```

## ⚙️ Configuration (REQUIRED)

Before running, open `src/utils/constants.js` and replace the token mint addresses:

```js
export const MINT_A = new PublicKey('YOUR_MESSI_TOKEN_MINT');  // Messi token mint
export const MINT_B = new PublicKey('YOUR_RONALDO_TOKEN_MINT'); // Ronaldo token mint
```

These must match the mints you passed to `initialize_round` on devnet.

## Features

- **9 wallets supported**: Phantom, Solflare, Backpack, Brave, Coinbase, Ledger, Torus, Trust, Nightly
- **Live arena**: Real-time bid totals, pool percentages, top bidder display
- **Countdown timer**: Auto-updates every second showing bidding phase
- **Round history**: Scans up to 20 rounds from chain, shows winners/pools/prizes
- **Claims panel**: Auto-detects unclaimed returns for connected wallet, one-click claim
- **User stats bar**: SOL balance, token balances, current bids per team
- **TX toasts**: Real-time feedback on all transactions

## Architecture

```
src/
├── idl/                   # Anchor IDL + Program ID
├── utils/
│   ├── constants.js       # Program ID, Mint addresses, team config
│   └── program.js         # PDA derivations, formatters
├── hooks/
│   └── useGame.js         # Main game state hook (polling every 15s)
├── components/
│   ├── Header             # Sticky nav + wallet connect
│   ├── CountdownTimer     # Animated per-second countdown
│   ├── TeamCard           # Messi / Ronaldo card with bid form
│   ├── UserStatsBar       # Wallet info bar
│   ├── RoundHistory       # On-chain round table
│   ├── ClaimsPanel        # Winner claim interface
│   └── TxToast            # Transaction status notifications
└── styles/
    └── global.css         # CSS variables + animations
```

## Notes

- The program is deployed at `HGUohqJ9kykNHLvegZ9vphvRMSztP1d1Xaz3khLxxqCb` on Devnet
- `settle_round` and `fulfill_random_winner` are operator-only — build a separate admin UI or call via CLI
- Losing side bidders do NOT get a return (only winning side); losing side has a random winner for 30%
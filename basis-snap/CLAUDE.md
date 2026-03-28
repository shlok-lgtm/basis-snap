# Basis Risk Intelligence Snap — Claude Code Context

## What This Is

A MetaMask Snap that shows stablecoin SII scores and wallet risk profiles in the transaction confirmation window. Built against the Basis Protocol API.

## Architecture

```
packages/
  snap/          # The MetaMask Snap (npm: @basis-protocol/snap)
    src/
      index.tsx  # Entry points: onTransaction, onHomePage, onInstall, onCronjob
      api.ts     # Basis API client (fetch + retry)
      cache.ts   # snap_manageState wrapper
      config.ts  # Contract registry, thresholds, constants
      decoder.ts # ERC-20 calldata parser
      types.ts   # TypeScript interfaces
      ui/        # JSX components for MetaMask Snaps UI
  site/          # Companion dApp for one-click install
```

## Key Constraints

- **Never use deprecated function-based UI** (panel(), text()). JSX only.
- **No private key access**. The snap uses NO key management permissions.
- **All data is read-only** from the public Basis API.
- **Never block transactions** — if API is down and cache is empty, show info message only.
- **API base**: `https://basis-deploy-guide.replit.app`

## Stablecoin Contract Registry

Hardcoded in `config.ts`. Ethereum mainnet only (V1). Multi-chain in V2+.

## Cache Strategy

- Scores: 6-hour TTL, refreshed by cronjob
- Wallet profiles: 1-hour TTL, max 50 (LRU eviction)
- If API down + cache < 24h old: show cached data with "Using cached data" banner
- If API down + no cache: show "API unavailable" (never critical/blocking)

## Grade Display Convention

- A/B: plain
- C/D: prefix "⚠ "
- F: prefix "🔴 "

## Running Locally

```bash
yarn install
yarn start   # starts MetaMask Flask dev server on port 8080
yarn test    # run unit tests
```

## Publishing

```bash
yarn build:snap
npm publish --provenance
```

Then submit to MetaMask Snaps Directory with the allowlisting form.

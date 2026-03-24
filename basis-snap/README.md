# Basis Risk Intelligence Snap

A MetaMask Snap that surfaces stablecoin quality intelligence and wallet risk profiles at the point of financial decision.

## What It Does

**At transaction time:**
- Shows the Stablecoin Integrity Index (SII) score and grade for any stablecoin involved in the transaction
- Profiles the counterparty wallet's risk exposure (concentration, coverage quality, dominant asset)
- Warns when asset quality drops below configurable thresholds
- Sets critical severity for MetaMask to surface a modal warning when SII < 50 or counterparty risk < 50

**On the Snap home page:**
- Displays your own wallet's risk profile (score, grade, holdings breakdown)
- Shows the SII leaderboard for top 10 stablecoins
- Displays your 30-day risk score history

**In the background:**
- Refreshes stablecoin scores every 6 hours via cronjob
- Sends in-app notifications when a stablecoin's score drops below your warning threshold

## Permissions Used

| Permission | Purpose |
|---|---|
| `endowment:transaction-insight` | Display risk data in transaction confirmation window |
| `endowment:page-home` | Wallet risk dashboard in Snaps menu |
| `endowment:network-access` | Fetch data from Basis API (HTTPS) |
| `endowment:ethereum-provider` | Read connected wallet address for home page |
| `endowment:lifecycle-hooks` | Welcome dialog on install |
| `endowment:cronjob` | Periodic score cache refresh (every 6 hours) |
| `snap_manageState` | Cache scores and wallet profiles locally |
| `snap_dialog` | Welcome dialog on install |
| `snap_notify` | Alert when monitored stablecoin drops below threshold |

**No key management permissions are used.** The Snap does not access, derive, or store any private keys. It reads only public on-chain data via the Basis API.

## API

All data flows through the public Basis REST API at `https://basis-deploy-guide.replit.app`:

- `GET /api/scores` — all stablecoin SII scores
- `GET /api/scores/{coin}` — detailed score breakdown
- `GET /api/wallets/{address}` — wallet risk profile
- `GET /api/wallets/{address}/history` — daily risk history
- `GET /api/health` — system status

## Supported Stablecoins (Ethereum Mainnet)

USDC, USDT, DAI, FRAX, PYUSD, FDUSD, TUSD, USDD, USDe, USD1

## Installation

Install via the MetaMask Snaps directory or the companion site:

```
npm:@basis-protocol/snap
```

Or visit the companion site to install with one click.

## Development

```bash
# Install dependencies
yarn install

# Build the snap
yarn build:snap

# Start local development server
yarn start

# Run tests
yarn test
```

## Privacy

- The Snap reads your public wallet address (already visible on-chain) and sends it to the Basis API.
- Queried addresses may be logged for rate limiting and abuse prevention only.
- Local state (cached scores, settings) is encrypted by MetaMask via `snap_manageState`.
- The Snap never requests, accesses, or transmits your private keys.

## License

MIT

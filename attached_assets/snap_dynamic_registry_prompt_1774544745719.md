Make the stablecoin contract registry dynamic instead of hardcoded.

Currently `packages/snap/src/config.ts` has a hardcoded `STABLECOIN_CONTRACTS` map with 10 contracts. The system now scores 14+ stablecoins and auto-promotes new ones continuously. The Snap needs to pick up new stablecoins without code changes.

The `/api/scores` endpoint at `https://basis-deploy-guide.replit.app/api/scores` already returns a `token_contract` field for each scored stablecoin. Use this.

## Changes needed:

### 1. `packages/snap/src/types.ts`
- Add `token_contract?: string` to the `StablecoinScore` interface
- Add `contractRegistry: Record<string, string> | null` to the `CachedState` interface

### 2. `packages/snap/src/cache.ts`
- Bump `CACHE_VERSION` to `"1.1.0"`
- Add `contractRegistry: null` to `defaultState()`
- Add two new exported functions:
  - `getContractRegistry()` — reads `state.contractRegistry` from snap state
  - `setContractRegistry(registry)` — writes it

### 3. `packages/snap/src/config.ts`
- Rename `STABLECOIN_CONTRACTS` to `STATIC_STABLECOIN_CONTRACTS`
- Add a comment: "Static fallback — used before first onCronjob refresh"

### 4. `packages/snap/src/index.tsx`
- Import `STATIC_STABLECOIN_CONTRACTS` instead of `STABLECOIN_CONTRACTS`
- Import `getContractRegistry` and `setContractRegistry` from cache
- Make `findStablecoinId` async: read dynamic registry from snap state first, fall back to static map
- Update both calls to `findStablecoinId` in `onTransaction` to use `await`
- In `onCronjob`, after `await setCachedScores(fresh)`, add a block that:
  - Loops through `fresh.stablecoins`
  - Builds a `Record<string, string>` mapping `coin.token_contract.toLowerCase()` → `coin.id` for every coin that has a `token_contract`
  - Calls `await setContractRegistry(newRegistry)` if the map is non-empty

## How it works after these changes:
- `onInstall` / first transaction: uses the 10 static contracts (immediate functionality)
- `onCronjob` (every 6h): fetches scores, extracts contract addresses, writes dynamic map to snap state
- `onTransaction`: reads dynamic registry first, falls back to static
- New auto-promoted stablecoins appear within 6 hours without code changes

## Do NOT:
- Add any new API endpoints or fetch calls — the data is already in `/api/scores`
- Remove the static fallback — it's needed for first install before first cron run
- Change any other files

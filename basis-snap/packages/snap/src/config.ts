export const API_BASE = "https://basis-deploy-guide.replit.app";
export const API_TIMEOUT = 10_000;
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 1_000;

export const DEFAULT_WARNING_THRESHOLD = 70;
export const DEFAULT_CRITICAL_THRESHOLD = 50;

export const SNAP_VERSION = "1.0.0";
export const FORMULA_VERSION = "SII v1.0.0";

export const STABLECOIN_CONTRACTS: Record<string, string> = {
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "usdc",
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "usdt",
  "0x6b175474e89094c44da98b954eedeac495271d0f": "dai",
  "0x853d955acef822db058eb8505911ed77f175b99e": "frax",
  "0x6c3ea9036406852006290770bedfcaba0e23a0e8": "pyusd",
  "0xc5f0f7b66764f6ec8c8dff7ba683102295e16409": "fdusd",
  "0x0000000000085d4780b73119b644ae5ecd22b376": "tusd",
  "0x0c10bf8fcb7bf5412187a595ab97a3609160b5c6": "usdd",
  "0x4c9edd5852cd905f086c759e8383e09bff1e68b3": "usde",
  "0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d": "usd1",
};

export const SCORES_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
export const WALLET_CACHE_TTL_MS = 1 * 60 * 60 * 1000;
export const MAX_CACHED_WALLETS = 50;
export const SCORES_STALE_MAX_MS = 24 * 60 * 60 * 1000;

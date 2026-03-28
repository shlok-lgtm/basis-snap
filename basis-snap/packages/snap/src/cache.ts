import type { CachedState, ScoresResponse, WalletProfile } from "./types";
import {
  DEFAULT_CRITICAL_THRESHOLD,
  DEFAULT_WARNING_THRESHOLD,
  MAX_CACHED_WALLETS,
  SCORES_CACHE_TTL_MS,
  WALLET_CACHE_TTL_MS,
} from "./config";

const CACHE_VERSION = "1.0.0";

function defaultState(): CachedState {
  return {
    scores: null,
    walletProfiles: {},
    settings: {
      warningThreshold: DEFAULT_WARNING_THRESHOLD,
      criticalThreshold: DEFAULT_CRITICAL_THRESHOLD,
    },
    version: CACHE_VERSION,
  };
}

export async function getState(): Promise<CachedState> {
  const raw = await snap.request({
    method: "snap_manageState",
    params: { operation: "get" },
  });
  if (!raw) return defaultState();
  const state = raw as CachedState;
  if (!state.version || !state.settings) return defaultState();
  return state;
}

export async function setState(state: CachedState): Promise<void> {
  await snap.request({
    method: "snap_manageState",
    params: { operation: "update", newState: state as Record<string, unknown> },
  });
}

export async function getCachedScores(): Promise<{
  data: ScoresResponse;
  isStale: boolean;
} | null> {
  const state = await getState();
  if (!state.scores) return null;
  const age = Date.now() - state.scores.fetchedAt;
  const isStale = age > SCORES_CACHE_TTL_MS;
  return { data: state.scores.data, isStale };
}

export async function setCachedScores(data: ScoresResponse): Promise<void> {
  const state = await getState();
  state.scores = { data, fetchedAt: Date.now() };
  await setState(state);
}

export async function isCachedScoresFresh(): Promise<boolean> {
  const state = await getState();
  if (!state.scores) return false;
  return Date.now() - state.scores.fetchedAt < SCORES_CACHE_TTL_MS;
}

export async function getCachedWalletProfile(
  address: string,
): Promise<WalletProfile | null> {
  const state = await getState();
  const key = address.toLowerCase();
  const cached = state.walletProfiles[key];
  if (!cached) return null;
  if (Date.now() - cached.fetchedAt > WALLET_CACHE_TTL_MS) return null;
  return cached.data;
}

export async function setCachedWalletProfile(
  address: string,
  data: WalletProfile,
): Promise<void> {
  const state = await getState();
  const key = address.toLowerCase();
  state.walletProfiles[key] = { data, fetchedAt: Date.now() };

  const entries = Object.entries(state.walletProfiles);
  if (entries.length > MAX_CACHED_WALLETS) {
    entries.sort((a, b) => a[1].fetchedAt - b[1].fetchedAt);
    const toRemove = entries.slice(0, entries.length - MAX_CACHED_WALLETS);
    for (const [k] of toRemove) {
      delete state.walletProfiles[k];
    }
  }

  await setState(state);
}

export async function getSettings(): Promise<{
  warningThreshold: number;
  criticalThreshold: number;
}> {
  const state = await getState();
  return state.settings;
}

export async function getPreviousScoreMap(): Promise<
  Record<string, number>
> {
  const cached = await getCachedScores();
  if (!cached) return {};
  return Object.fromEntries(
    cached.data.stablecoins.map((s) => [s.id, s.score]),
  );
}

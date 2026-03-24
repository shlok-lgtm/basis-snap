import {
  API_BASE,
  MAX_RETRIES,
  RETRY_DELAY,
} from "./config";
import type {
  ScoresResponse,
  StablecoinScore,
  WalletProfile,
  WalletHistory,
  HealthResponse,
} from "./types";

async function apiFetch<T>(path: string): Promise<T | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return (await response.json()) as T;
    } catch (_error) {
      if (attempt < MAX_RETRIES) {
        await new Promise((r) =>
          setTimeout(r, RETRY_DELAY * (attempt + 1)),
        );
        continue;
      }
      return null;
    }
  }
  return null;
}

export async function fetchScores(): Promise<ScoresResponse | null> {
  return apiFetch<ScoresResponse>("/api/scores");
}

export async function fetchScoreDetail(
  coin: string,
): Promise<StablecoinScore | null> {
  return apiFetch<StablecoinScore>(`/api/scores/${coin}`);
}

export async function fetchWalletProfile(
  address: string,
): Promise<WalletProfile | null> {
  return apiFetch<WalletProfile>(
    `/api/wallets/${address.toLowerCase()}`,
  );
}

export async function fetchWalletHistory(
  address: string,
  limit: number = 30,
): Promise<WalletHistory | null> {
  return apiFetch<WalletHistory>(
    `/api/wallets/${address.toLowerCase()}/history?limit=${limit}`,
  );
}

export async function fetchHealth(): Promise<HealthResponse | null> {
  return apiFetch<HealthResponse>("/api/health");
}

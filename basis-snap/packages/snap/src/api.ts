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
  PsiScore,
  CqiResult,
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

export async function fetchPsiScore(protocolSlug: string): Promise<PsiScore | null> {
  try {
    const response = await fetch(`${API_BASE}/api/psi/scores/${protocolSlug}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0];
      return { score: entry.score ?? entry.overall_score, grade: entry.grade };
    }
    if (data.score ?? data.overall_score) {
      return { score: data.score ?? data.overall_score, grade: data.grade };
    }
    return null;
  } catch {
    return null;
  }
}

export function computeCqi(siiScore: number, psiScore: number): CqiResult {
  const cqi = Math.round(Math.sqrt(siiScore * psiScore) * 10) / 10;

  let grade: string;
  if (cqi >= 90) grade = "A+";
  else if (cqi >= 85) grade = "A";
  else if (cqi >= 80) grade = "A-";
  else if (cqi >= 75) grade = "B+";
  else if (cqi >= 70) grade = "B";
  else if (cqi >= 65) grade = "B-";
  else if (cqi >= 60) grade = "C+";
  else if (cqi >= 55) grade = "C";
  else if (cqi >= 50) grade = "C-";
  else if (cqi >= 45) grade = "D+";
  else if (cqi >= 40) grade = "D";
  else if (cqi >= 35) grade = "D-";
  else grade = "F";

  return { score: cqi, grade };
}

export async function fetchHealth(): Promise<HealthResponse | null> {
  return apiFetch<HealthResponse>("/api/health");
}

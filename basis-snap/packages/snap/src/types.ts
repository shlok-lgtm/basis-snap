export interface StablecoinScore {
  id: string;
  name: string;
  symbol: string;
  issuer: string;
  score: number;
  grade: string;
  price: number;
  market_cap: number;
  daily_change: number;
  categories: {
    peg: number;
    liquidity: number;
    flows: number;
    distribution: number;
    structural: number;
  };
  computed_at: string;
  token_contract?: string;
}

export interface ScoresResponse {
  stablecoins: StablecoinScore[];
  count: number;
  formula_version: string;
}

export interface WalletInfo {
  address: string;
  total_stablecoin_value: number;
  size_tier: string;
  is_contract: boolean;
  label: string | null;
  last_indexed_at: string;
}

export interface WalletRisk {
  risk_score: number;
  risk_grade: string;
  concentration_hhi: number;
  concentration_grade: string;
  unscored_pct: number;
  coverage_quality: string;
  num_scored_holdings: number;
  num_unscored_holdings: number;
  num_total_holdings: number;
  dominant_asset: string;
  dominant_asset_pct: number;
  total_stablecoin_value: number;
  formula_version: string;
  computed_at: string;
}

export interface WalletHolding {
  symbol: string;
  balance: number;
  value_usd: number;
  is_scored: boolean;
  sii_score: number | null;
  sii_grade: string | null;
  pct_of_wallet: number;
}

export interface WalletProfile {
  wallet: WalletInfo;
  risk: WalletRisk;
  holdings: WalletHolding[];
}

export interface WalletHistoryEntry {
  date: string;
  risk_score: number;
  risk_grade: string;
}

export interface WalletHistory {
  address: string;
  history: WalletHistoryEntry[];
}

export interface HealthResponse {
  status: string;
}

export interface CachedScores {
  data: ScoresResponse;
  fetchedAt: number;
}

export interface CachedWalletProfile {
  data: WalletProfile;
  fetchedAt: number;
}

export interface CachedSettings {
  warningThreshold: number;
  criticalThreshold: number;
}

export interface CachedState {
  scores: CachedScores | null;
  walletProfiles: Record<string, CachedWalletProfile>;
  settings: CachedSettings;
  contractRegistry: Record<string, string> | null;
  version: string;
}

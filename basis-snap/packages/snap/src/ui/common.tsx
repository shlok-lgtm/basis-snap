import type { StablecoinScore } from "../types";

export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function formatUSD(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function gradePrefix(grade: string): string {
  const upper = grade.toUpperCase();
  if (upper.startsWith("A") || upper.startsWith("B")) return "";
  if (upper.startsWith("C") || upper.startsWith("D")) return "⚠ ";
  if (upper === "F") return "🔴 ";
  return "";
}

export function formatGrade(grade: string): string {
  return `${gradePrefix(grade)}${grade}`;
}

export function formatScoreWithGrade(score: number, grade: string): string {
  return `${gradePrefix(grade)}${formatScore(score)} (${grade})`;
}

export function formatCoverageQuality(quality: string): string {
  switch (quality) {
    case "full":
      return "Full coverage";
    case "high":
      return "High coverage";
    case "partial":
      return "⚠ Partial coverage";
    case "low":
      return "⚠ Low coverage — significant unscored exposure";
    default:
      return quality;
  }
}

export function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toUTCString().replace(" GMT", " UTC");
  } catch {
    return iso;
  }
}

export function formatDate(iso: string): string {
  try {
    return iso.slice(0, 10);
  } catch {
    return iso;
  }
}

export function findScoreById(
  stablecoins: StablecoinScore[],
  id: string,
): StablecoinScore | undefined {
  return stablecoins.find((s) => s.id === id);
}

export function isCritical(
  siiScore: number | null,
  walletRiskScore: number | null,
  criticalThreshold: number,
): boolean {
  if (siiScore !== null && siiScore < criticalThreshold) return true;
  if (walletRiskScore !== null && walletRiskScore < criticalThreshold)
    return true;
  return false;
}

export function isWarning(
  siiScore: number | null,
  coverageQuality: string | null,
  warningThreshold: number,
): boolean {
  if (siiScore !== null && siiScore < warningThreshold) return true;
  if (coverageQuality === "low") return true;
  return false;
}

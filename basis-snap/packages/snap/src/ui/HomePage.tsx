import {
  Box,
  Divider,
  Heading,
  Row,
  Text,
  Bold,
  Link,
} from "@metamask/snaps-sdk/jsx";
import type {
  ScoresResponse,
  WalletHistory,
  WalletProfile,
} from "../types";
import {
  formatCoverageQuality,
  formatDate,
  formatGrade,
  formatScore,
  formatScoreWithGrade,
  formatTimestamp,
  formatUSD,
  shortenAddress,
} from "./common";
import { Warning } from "./Warning";

type Props = {
  address: string | null;
  profile: WalletProfile | null;
  scores: ScoresResponse | null;
  history: WalletHistory | null;
  warningThreshold: number;
};

export function HomePage({
  address,
  profile,
  scores,
  history,
  warningThreshold,
}: Props) {
  return (
    <Box>
      <Bold>BASIS RISK INTELLIGENCE</Bold>
      <Text>Asset quality intelligence for every transaction</Text>
      <Divider />

      {!address ? (
        <Box>
          <Text>Connect your wallet to view your risk profile.</Text>
        </Box>
      ) : profile ? (
        <Box>
          <Heading>Your Wallet Risk Profile</Heading>
          <Row label="Address">
            <Text>{shortenAddress(address)}</Text>
          </Row>
          <Row label="Risk Score">
            <Text>
              {formatScoreWithGrade(
                profile.risk.risk_score,
                profile.risk.risk_grade,
              )}
            </Text>
          </Row>
          <Row label="Size Tier">
            <Text>{profile.wallet.size_tier}</Text>
          </Row>
          <Row label="Total Value">
            <Text>{formatUSD(profile.risk.total_stablecoin_value)}</Text>
          </Row>
          <Row label="Concentration HHI">
            <Text>
              {profile.risk.concentration_hhi.toFixed(0)} (
              {profile.risk.concentration_grade})
            </Text>
          </Row>
          <Row label="Coverage">
            <Text>
              {formatCoverageQuality(profile.risk.coverage_quality)}
            </Text>
          </Row>
          <Row label="Dominant Asset">
            <Text>
              {profile.risk.dominant_asset} (
              {profile.risk.dominant_asset_pct.toFixed(0)}%)
            </Text>
          </Row>
          <Row label="Unscored Exposure">
            <Text>{profile.risk.unscored_pct.toFixed(1)}%</Text>
          </Row>
          <Row label="Holdings">
            <Text>
              {profile.risk.num_scored_holdings} scored /{" "}
              {profile.risk.num_total_holdings} total
            </Text>
          </Row>
          <Row label="Last Indexed">
            <Text>{formatTimestamp(profile.wallet.last_indexed_at)}</Text>
          </Row>

          {profile.risk.risk_score < warningThreshold && (
            <Warning
              severity={profile.risk.risk_score < 50 ? "critical" : "warning"}
              message={`Your risk score ${formatScore(profile.risk.risk_score)} is below threshold (${warningThreshold})`}
            />
          )}

          <Divider />
          <Heading>Your Holdings</Heading>
          {profile.holdings
            .slice()
            .sort((a, b) => b.value_usd - a.value_usd)
            .map((h) => (
              <Row label={h.symbol}>
                <Text>
                  {formatUSD(h.value_usd)} ({h.pct_of_wallet.toFixed(1)}%)
                  {h.is_scored && h.sii_score !== null && h.sii_grade !== null
                    ? ` | SII: ${formatScoreWithGrade(h.sii_score, h.sii_grade)}`
                    : " | —"}
                </Text>
              </Row>
            ))}
        </Box>
      ) : (
        <Box>
          <Text>
            Wallet {shortenAddress(address ?? "")} is not in the Basis index.
          </Text>
          <Text>
            Only wallets with significant stablecoin holdings are indexed.
          </Text>
        </Box>
      )}

      <Divider />

      {scores ? (
        <Box>
          <Heading>SII Leaderboard — Top Stablecoins</Heading>
          <Row label="#">
            <Text>Symbol | Score | Grade | 24h Change</Text>
          </Row>
          {scores.stablecoins
            .slice()
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((s, i) => (
              <Row label={`${i + 1}. ${s.symbol}`}>
                <Text>
                  {formatScore(s.score)} {formatGrade(s.grade)}{" "}
                  {s.daily_change >= 0
                    ? `+${s.daily_change.toFixed(1)}`
                    : s.daily_change.toFixed(1)}
                </Text>
              </Row>
            ))}
          <Text>Formula: {scores.formula_version}</Text>
        </Box>
      ) : (
        <Box>
          <Text>SII scores unavailable — check back later.</Text>
        </Box>
      )}

      {history && history.history.length > 0 && (
        <Box>
          <Divider />
          <Heading>Risk Score History (Last 30 Days)</Heading>
          <Row label="Date">
            <Text>Score | Grade</Text>
          </Row>
          {history.history.slice(0, 30).map((entry) => (
            <Row label={formatDate(entry.date)}>
              <Text>
                {formatScore(entry.risk_score)} | {entry.risk_grade}
              </Text>
            </Row>
          ))}
        </Box>
      )}

      <Divider />
      <Link href="https://basisprotocol.xyz">
        View full dashboard →
      </Link>
    </Box>
  );
}

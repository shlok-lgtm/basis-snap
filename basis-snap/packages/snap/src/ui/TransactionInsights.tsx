import {
  Box,
  Bold,
  Divider,
  Heading,
  Row,
  Text,
} from "@metamask/snaps-sdk/jsx";
import type { StablecoinScore, WalletProfile } from "../types";
import {
  formatCoverageQuality,
  formatScore,
  formatScoreWithGrade,
  formatTimestamp,
  shortenAddress,
} from "./common";
import { Warning } from "./Warning";

type Props = {
  assetScore: StablecoinScore | null;
  walletRisk: WalletProfile | null;
  counterparty: string;
  warningThreshold: number;
  cachedAt?: number;
  apiUnavailable?: boolean;
};

export function TransactionInsights({
  assetScore,
  walletRisk,
  counterparty,
  warningThreshold,
  cachedAt,
  apiUnavailable,
}: Props) {
  const showCachedBanner = cachedAt !== undefined;

  return (
    <Box>
      <Box>
        <Text>BASIS RISK INTELLIGENCE</Text>
        <Text>v1.0.0</Text>
      </Box>
      <Divider />

      {apiUnavailable && !cachedAt && (
        <Box>
          <Text>
            Basis API is currently unavailable. Scores could not be retrieved.
          </Text>
        </Box>
      )}

      {showCachedBanner && (
        <Warning
          severity="warning"
          message={`Using cached data — API unreachable (cached ${formatTimestamp(new Date(cachedAt!).toISOString())})`}
        />
      )}

      {assetScore ? (
        <Box>
          <Heading>Asset: {assetScore.symbol}</Heading>
          <Row label="SII Score">
            <Text>{formatScoreWithGrade(assetScore.score, assetScore.grade)}</Text>
          </Row>
          <Row label="Peg Stability">
            <Text>{formatScore(assetScore.categories.peg)}</Text>
          </Row>
          <Row label="Liquidity">
            <Text>{formatScore(assetScore.categories.liquidity)}</Text>
          </Row>
          <Row label="Distribution">
            <Text>{formatScore(assetScore.categories.distribution)}</Text>
          </Row>
          <Row label="Flows">
            <Text>{formatScore(assetScore.categories.flows)}</Text>
          </Row>
          <Row label="Structural">
            <Text>{formatScore(assetScore.categories.structural)}</Text>
          </Row>
          <Row label="Issuer">
            <Text>{assetScore.issuer}</Text>
          </Row>
          <Row label="Computed">
            <Text>{formatTimestamp(assetScore.computed_at)}</Text>
          </Row>
          {assetScore.score < warningThreshold && (
            <Warning
              severity={assetScore.score < 50 ? "critical" : "warning"}
              message={`${assetScore.symbol} SII ${formatScore(assetScore.score)} is below threshold (${warningThreshold})`}
            />
          )}
        </Box>
      ) : (
        !apiUnavailable && (
          <Box>
            <Text>Non-stablecoin transaction — no Basis asset data available</Text>
          </Box>
        )
      )}

      <Divider />

      <Heading>Counterparty: {shortenAddress(counterparty)}</Heading>
      {walletRisk ? (
        <Box>
          <Row label="Risk Score">
            <Text>
              {formatScoreWithGrade(
                walletRisk.risk.risk_score,
                walletRisk.risk.risk_grade,
              )}
            </Text>
          </Row>
          <Row label="Concentration HHI">
            <Text>{walletRisk.risk.concentration_hhi.toFixed(0)}</Text>
          </Row>
          <Row label="Coverage">
            <Text>{formatCoverageQuality(walletRisk.risk.coverage_quality)}</Text>
          </Row>
          <Row label="Dominant Asset">
            <Text>
              {walletRisk.risk.dominant_asset} (
              {walletRisk.risk.dominant_asset_pct.toFixed(0)}%)
            </Text>
          </Row>
          <Row label="Unscored Exposure">
            <Text>{walletRisk.risk.unscored_pct.toFixed(1)}%</Text>
          </Row>
          {walletRisk.risk.risk_score < 50 && (
            <Warning
              severity="critical"
              message={`Counterparty risk score ${formatScore(walletRisk.risk.risk_score)} is critically low`}
            />
          )}
          {walletRisk.risk.coverage_quality === "low" &&
            walletRisk.risk.risk_score >= 50 && (
              <Warning
                severity="warning"
                message="Counterparty has low coverage quality — significant unscored exposure"
              />
            )}
        </Box>
      ) : (
        <Text>Counterparty not in Basis index</Text>
      )}

      <Divider />
      <Text>basisprotocol.xyz | {`SII v1.0.0`}</Text>
    </Box>
  );
}

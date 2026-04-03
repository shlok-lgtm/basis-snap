import {
  Box,
  Bold,
  Divider,
  Heading,
  Row,
  Text,
} from "@metamask/snaps-sdk/jsx";
import type { StablecoinScore, WalletProfile, PsiScore, CqiResult } from "../types";
import { computeCqi } from "../api";
import { CQI_WARNING_GAP } from "../config";
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
  protocolName?: string;
  psiScore?: PsiScore | null;
  walletHoldings?: Array<{ symbol: string; siiScore: number | null }>;
};

export function TransactionInsights({
  assetScore,
  walletRisk,
  counterparty,
  warningThreshold,
  cachedAt,
  apiUnavailable,
  protocolName,
  psiScore,
  walletHoldings,
}: Props) {
  const showCachedBanner = cachedAt !== undefined;

  // Compute CQI entries for all scored holdings when PSI is available
  const cqiEntries: Array<{ symbol: string; sii: number; cqi: CqiResult; gap: number }> = [];
  if (psiScore && walletHoldings) {
    for (const h of walletHoldings) {
      if (h.siiScore !== null) {
        const cqi = computeCqi(h.siiScore, psiScore.score);
        cqiEntries.push({
          symbol: h.symbol,
          sii: h.siiScore,
          cqi,
          gap: h.siiScore - cqi.score,
        });
      }
    }
  }

  return (
    <Box>
      <Box>
        <Text>BASIS RISK INTELLIGENCE</Text>
        <Text>v2.0.0</Text>
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

      {psiScore && protocolName && (
        <Box>
          <Divider />
          <Heading>Protocol: {protocolName}</Heading>
          <Row label="PSI Score">
            <Text>{formatScoreWithGrade(psiScore.score, psiScore.grade)}</Text>
          </Row>
        </Box>
      )}

      {cqiEntries.length > 0 && (
        <Box>
          <Divider />
          <Heading>Composed Risk (CQI)</Heading>
          {cqiEntries.map((entry) => (
            <Box>
              <Row label={`${entry.symbol} CQI`}>
                <Text>
                  {`SII ${formatScore(entry.sii)} → CQI ${formatScoreWithGrade(entry.cqi.score, entry.cqi.grade)}`}
                </Text>
              </Row>
              {entry.gap > CQI_WARNING_GAP && (
                <Warning
                  severity="warning"
                  message={`Protocol risk is reducing ${entry.symbol} quality by ${entry.gap.toFixed(0)} points`}
                />
              )}
            </Box>
          ))}
        </Box>
      )}

      <Divider />
      <Text>basisprotocol.xyz | {`SII v1.0.0 · CQI v1.0.0`}</Text>
    </Box>
  );
}

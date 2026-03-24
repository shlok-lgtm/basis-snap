import { Box, Divider, Heading, Row, Text, Bold } from "@metamask/snaps-sdk/jsx";
import type { WalletProfile as WalletProfileType } from "../types";
import {
  formatCoverageQuality,
  formatScoreWithGrade,
  formatTimestamp,
  formatUSD,
  shortenAddress,
} from "./common";

type Props = {
  profile: WalletProfileType;
  showHoldings?: boolean;
};

export function WalletProfileComponent({ profile, showHoldings = true }: Props) {
  const { wallet, risk, holdings } = profile;

  return (
    <Box>
      <Heading>Wallet: {shortenAddress(wallet.address)}</Heading>
      <Row label="Risk Score">
        <Text>{formatScoreWithGrade(risk.risk_score, risk.risk_grade)}</Text>
      </Row>
      <Row label="Size Tier">
        <Text>{wallet.size_tier}</Text>
      </Row>
      <Row label="Total Value">
        <Text>{formatUSD(risk.total_stablecoin_value)}</Text>
      </Row>
      <Row label="Concentration HHI">
        <Text>{risk.concentration_hhi.toFixed(0)} ({risk.concentration_grade})</Text>
      </Row>
      <Row label="Coverage">
        <Text>{formatCoverageQuality(risk.coverage_quality)}</Text>
      </Row>
      <Row label="Dominant Asset">
        <Text>{risk.dominant_asset} ({risk.dominant_asset_pct.toFixed(0)}%)</Text>
      </Row>
      <Row label="Unscored Exposure">
        <Text>{risk.unscored_pct.toFixed(1)}%</Text>
      </Row>
      <Row label="Holdings">
        <Text>{risk.num_scored_holdings} scored / {risk.num_total_holdings} total</Text>
      </Row>
      <Row label="Computed">
        <Text>{formatTimestamp(risk.computed_at)}</Text>
      </Row>

      {showHoldings && holdings.length > 0 && (
        <Box>
          <Divider />
          <Heading>Holdings</Heading>
          {holdings.map((h) => (
            <Row label={h.symbol}>
              <Text>
                {formatUSD(h.value_usd)} ({h.pct_of_wallet.toFixed(1)}%)
                {h.is_scored && h.sii_score !== null && h.sii_grade !== null
                  ? ` | SII: ${formatScoreWithGrade(h.sii_score, h.sii_grade)}`
                  : " | Unscored"}
              </Text>
            </Row>
          ))}
        </Box>
      )}
    </Box>
  );
}

import type {
  OnCronjobHandler,
  OnHomePageHandler,
  OnInstallHandler,
  OnTransactionHandler,
} from "@metamask/snaps-sdk";
import { Box, Bold, Divider, Link, Text } from "@metamask/snaps-sdk/jsx";
import {
  fetchScores,
  fetchWalletProfile,
  fetchWalletHistory,
} from "./api";
import {
  getCachedScores,
  getCachedWalletProfile,
  getSettings,
  getState,
  getPreviousScoreMap,
  setCachedScores,
  setCachedWalletProfile,
} from "./cache";
import {
  STABLECOIN_CONTRACTS,
  SCORES_STALE_MAX_MS,
} from "./config";
import { decodeERC20Transfer } from "./decoder";
import { TransactionInsights } from "./ui/TransactionInsights";
import { HomePage } from "./ui/HomePage";
import type { StablecoinScore, WalletProfile, ScoresResponse } from "./types";

function findStablecoinId(address: string): string | undefined {
  return STABLECOIN_CONTRACTS[address.toLowerCase()];
}

interface ResolvedScores {
  scores: ScoresResponse | null;
  cachedAt?: number;
  apiUnavailable?: boolean;
}

async function resolveScores(): Promise<ResolvedScores> {
  const fresh = await fetchScores();
  if (fresh) {
    await setCachedScores(fresh);
    return { scores: fresh };
  }

  const state = await getState();
  if (state.scores) {
    const age = Date.now() - state.scores.fetchedAt;
    if (age < SCORES_STALE_MAX_MS) {
      return { scores: state.scores.data, cachedAt: state.scores.fetchedAt };
    }
  }

  return { scores: null, apiUnavailable: true };
}

export const onTransaction: OnTransactionHandler = async ({
  transaction,
}) => {
  const settings = await getSettings();
  const { warningThreshold, criticalThreshold } = settings;

  const toAddress: string = (transaction.to as string | undefined) ?? "";
  const data: string = (transaction.data as string | undefined) ?? "";

  let stablecoinId: string | undefined = findStablecoinId(toAddress);
  let counterparty: string = toAddress;

  if (data && data !== "0x") {
    const decoded = decodeERC20Transfer(data);
    if (decoded) {
      if (!stablecoinId) {
        stablecoinId = findStablecoinId(toAddress);
      }
      counterparty = decoded.recipient;
    }
  }

  const { scores, cachedAt, apiUnavailable } = await resolveScores();

  let assetScore: StablecoinScore | null = null;
  if (stablecoinId && scores) {
    assetScore =
      scores.stablecoins.find((s) => s.id === stablecoinId) ?? null;
  }

  let walletRisk: WalletProfile | null = null;
  if (counterparty) {
    const cachedWallet = await getCachedWalletProfile(counterparty);
    if (cachedWallet) {
      walletRisk = cachedWallet;
    } else {
      const fetched = await fetchWalletProfile(counterparty);
      if (fetched) {
        walletRisk = fetched;
        await setCachedWalletProfile(counterparty, fetched);
      }
    }
  }

  const criticalCondition =
    (assetScore !== null && assetScore.score < criticalThreshold) ||
    (walletRisk !== null && walletRisk.risk.risk_score < criticalThreshold);

  const severity = criticalCondition ? "critical" : undefined;

  const content = (
    <TransactionInsights
      assetScore={assetScore}
      walletRisk={walletRisk}
      counterparty={counterparty}
      warningThreshold={warningThreshold}
      cachedAt={cachedAt}
      apiUnavailable={apiUnavailable}
    />
  );

  return { content, severity };
};

export const onHomePage: OnHomePageHandler = async () => {
  const settings = await getSettings();

  const accounts = (await ethereum.request<string[]>({
    method: "eth_accounts",
  })) as string[] | null;

  const address = accounts && accounts.length > 0 ? accounts[0] : null;

  let profile: WalletProfile | null = null;
  let history = null;

  if (address) {
    const cachedWallet = await getCachedWalletProfile(address);
    if (cachedWallet) {
      profile = cachedWallet;
    } else {
      const fetched = await fetchWalletProfile(address);
      if (fetched) {
        profile = fetched;
        await setCachedWalletProfile(address, fetched);
      }
    }
    history = await fetchWalletHistory(address, 30);
  }

  const { scores } = await resolveScores();

  const content = (
    <HomePage
      address={address ?? null}
      profile={profile}
      scores={scores}
      history={history}
      warningThreshold={settings.warningThreshold}
    />
  );

  return { content };
};

export const onInstall: OnInstallHandler = async () => {
  await snap.request({
    method: "snap_dialog",
    params: {
      type: "alert",
      content: (
        <Box>
          <Bold>Basis Risk Intelligence — Installed</Bold>
          <Divider />
          <Text>
            You now have asset quality intelligence in every transaction.
          </Text>
          <Divider />
          <Text>What this Snap does:</Text>
          <Text>
            {"• Shows stablecoin integrity scores (SII) when you transact"}
          </Text>
          <Text>
            {"• Profiles counterparty wallet risk exposure"}
          </Text>
          <Text>
            {"• Alerts you when asset quality drops below your threshold"}
          </Text>
          <Divider />
          <Text>Your risk dashboard is in the Snaps menu.</Text>
          <Divider />
          <Link href="https://basisprotocol.xyz">
            View methodology → basisprotocol.xyz
          </Link>
          <Divider />
          <Text>
            Basis never accesses your private keys or signs transactions.
          </Text>
        </Box>
      ),
    },
  });
};

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  if (request.method !== "refreshScores") return;

  const previousScores = await getPreviousScoreMap();
  const settings = await getSettings();
  const { warningThreshold } = settings;

  const fresh = await fetchScores();
  if (!fresh) return;

  const dropped: string[] = [];
  for (const coin of fresh.stablecoins) {
    const prev = previousScores[coin.id];
    if (
      prev !== undefined &&
      prev >= warningThreshold &&
      coin.score < warningThreshold
    ) {
      dropped.push(
        `${coin.symbol} SII dropped from ${prev.toFixed(1)} to ${coin.score.toFixed(1)} (Grade: ${coin.grade})`,
      );
    }
  }

  await setCachedScores(fresh);

  for (const msg of dropped) {
    await snap.request({
      method: "snap_notify",
      params: {
        type: "inApp",
        message: msg,
      },
    });
  }
};

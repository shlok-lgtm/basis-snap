import { useState } from "react";

const SNAP_ID = "npm:@basis-protocol/snap";
const SNAP_VERSION = "^2.0.0";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export default function App() {
  const [status, setStatus] = useState<string>("");
  const [installed, setInstalled] = useState(false);

  async function installSnap() {
    if (!window.ethereum) {
      setStatus("MetaMask is not installed. Please install MetaMask first.");
      return;
    }
    try {
      setStatus("Installing Basis Risk Intelligence Snap...");
      await window.ethereum.request({
        method: "wallet_requestSnaps",
        params: [
          {
            [SNAP_ID]: {
              version: SNAP_VERSION,
            },
          },
        ],
      });
      setInstalled(true);
      setStatus("Snap installed successfully! You can now view it in the Snaps menu inside MetaMask.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus(`Error: ${message}`);
    }
  }

  return (
    <div
      style={{
        fontFamily: "monospace",
        maxWidth: 640,
        margin: "80px auto",
        padding: "0 24px",
        color: "#0a0a0a",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
        BASIS RISK INTELLIGENCE
      </h1>
      <p style={{ color: "#555", marginTop: 0, marginBottom: 32 }}>
        Asset quality scores and wallet risk profiles at the point of transaction.
      </p>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Install the Snap</h2>
        <p style={{ fontSize: 14, color: "#444" }}>
          The Basis Snap shows stablecoin integrity scores (SII) and counterparty
          wallet risk profiles directly in your MetaMask transaction confirmation
          window.
        </p>
        <ul style={{ fontSize: 14, color: "#444", paddingLeft: 20 }}>
          <li>Stablecoin quality scores (SII) for any supported token</li>
          <li>Counterparty wallet risk assessment</li>
          <li>Real-time alerts when scores drop below thresholds</li>
          <li>Your personal wallet risk dashboard in the Snaps menu</li>
        </ul>
        <button
          onClick={installSnap}
          style={{
            background: "#0a0a0a",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 20px",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "monospace",
          }}
        >
          {installed ? "✓ Installed" : "Install Basis Snap"}
        </button>
        {status && (
          <p
            style={{
              marginTop: 12,
              fontSize: 13,
              color: status.startsWith("Error") ? "#c00" : "#006600",
            }}
          >
            {status}
          </p>
        )}
      </div>

      <div style={{ fontSize: 13, color: "#888" }}>
        <p>
          Basis never accesses your private keys or signs transactions. All data
          is read-only from the public Basis API.
        </p>
        <p>
          <a
            href="https://basisprotocol.xyz"
            style={{ color: "#0066cc" }}
          >
            View full dashboard →
          </a>{" "}
          ·{" "}
          <a
            href="https://basisprotocol.xyz/methodology"
            style={{ color: "#0066cc" }}
          >
            Methodology
          </a>
        </p>
      </div>
    </div>
  );
}

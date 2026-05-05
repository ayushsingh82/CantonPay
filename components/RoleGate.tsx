"use client";

import { useState } from "react";
import { useCantonAuth } from "@/contexts/canton-auth";
import { NetworkSelector } from "@/components/NetworkSelector";
import { WalletConnectModal } from "@/components/WalletConnectModal";

interface RoleGateProps {
  children: React.ReactNode;
}

export function RoleGate({ children }: RoleGateProps) {
  const { partyId, networkId, network, switchNetwork } = useCantonAuth();
  const [open, setOpen] = useState(false);

  if (partyId) return <>{children}</>;

  return (
    <div className="role-gate">
      <div className="role-gate-card">
        <div className="role-gate-logo">CantonPay</div>
        <p className="role-gate-subtitle">
          Canton ledger · party login (JSON API)
        </p>
        <p className="role-gate-desc">
          Allocate or reconnect a Daml party via the {network.label} JSON API.
          What each party sees follows signatories and observers in the Daml
          model.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "20px 0 16px",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--text-tertiary)",
            }}
          >
            Network
          </span>
          <NetworkSelector active={networkId} onChange={switchNetwork} />
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            justifyContent: "center",
            fontSize: "14px",
            padding: "12px 24px",
            marginTop: 8,
          }}
        >
          Connect wallet
        </button>

        <div
          className="network-badge"
          style={{ justifyContent: "center", marginTop: "16px" }}
        >
          <div className="network-dot" />
          {network.label} · {network.currency}
        </div>
      </div>
      <WalletConnectModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}

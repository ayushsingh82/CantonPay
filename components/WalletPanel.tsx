"use client";

import { useState } from "react";
import { Copy, LogOut, Wallet } from "lucide-react";
import { useCantonAuth } from "@/contexts/canton-auth";
import { shortParty } from "@/lib/canton";
import { WalletConnectModal } from "@/components/WalletConnectModal";

interface WalletPanelProps {
  /** When true, renders inline (e.g. landing page) instead of inside the sidebar. */
  variant?: "sidebar" | "inline";
}

export function WalletPanel({ variant = "sidebar" }: WalletPanelProps) {
  const { partyId, network, networkId, logout, isDemo } = useCantonAuth();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!partyId) return;
    try {
      await navigator.clipboard.writeText(partyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  const compact = variant === "sidebar";

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: compact ? 10 : 16,
          border: "1px solid var(--border-hairline)",
          borderRadius: 12,
          background: "var(--bg-elevated)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--text-tertiary)",
            }}
          >
            <Wallet size={12} />
            Wallet
          </span>
          <div
            style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
          >
            {isDemo && (
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid #f87171",
                  background: "rgba(248,113,113,0.08)",
                  color: "#f87171",
                }}
                title="Demo party — JSON API was unreachable; real ledger calls will fail."
              >
                Demo
              </span>
            )}
            <span
              style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                padding: "2px 8px",
                borderRadius: 999,
                border: "1px solid var(--border-hairline)",
                color: network.testnet ? "#fbbf24" : "var(--text-tertiary)",
                background: network.testnet
                  ? "rgba(251, 191, 36, 0.08)"
                  : "transparent",
              }}
              title={`${networkId} · ${network.jsonApiUrl}`}
            >
              {network.shortLabel}
            </span>
          </div>
        </div>

        {partyId ? (
          <>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: compact ? 11 : 13,
                color: "var(--text-primary)",
                wordBreak: "break-all",
                lineHeight: 1.35,
              }}
              title={partyId}
            >
              {shortParty(partyId, compact ? 12 : 16, compact ? 6 : 10)}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={onCopy}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  fontSize: 11,
                  border: "1px solid var(--border-hairline)",
                  borderRadius: 8,
                  background: "transparent",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <Copy size={11} />
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(true)}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  fontSize: 11,
                  border: "1px solid var(--border-hairline)",
                  borderRadius: 8,
                  background: "transparent",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                Manage
              </button>
              <button
                type="button"
                onClick={logout}
                title="Disconnect"
                style={{
                  padding: "6px 8px",
                  fontSize: 11,
                  border: "1px solid var(--border-hairline)",
                  borderRadius: 8,
                  background: "transparent",
                  color: "var(--text-tertiary)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <LogOut size={11} />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              padding: "10px 12px",
              fontSize: 12,
              fontWeight: 600,
              border: "1px solid var(--accent)",
              borderRadius: 10,
              background: "var(--accent)",
              color: "var(--bg-base)",
              cursor: "pointer",
            }}
          >
            Connect wallet
          </button>
        )}
      </div>
      <WalletConnectModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}

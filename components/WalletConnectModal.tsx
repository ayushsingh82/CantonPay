"use client";

import { useState } from "react";
import { Loader2, LogOut, Wallet, X } from "lucide-react";
import { useCantonAuth } from "@/contexts/canton-auth";
import { shortParty } from "@/lib/canton";
import { NetworkSelector } from "@/components/NetworkSelector";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectModal({
  isOpen,
  onClose,
}: WalletConnectModalProps) {
  const {
    accounts,
    networkId,
    network,
    partyId,
    switchAccount,
    switchNetwork,
    removeAccount,
    login,
  } = useCantonAuth();
  const [hint, setHint] = useState("Employer");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!isOpen) return null;

  // login() auto-falls back to a deterministic demo party when the JSON
  // API is unreachable, so this call rarely throws — only on real
  // protocol-level errors (auth, malformed response, etc.).
  const onConnect = async () => {
    setBusy(true);
    setErr(null);
    try {
      await login(hint.trim() || "Employer");
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const networkAccounts = accounts.filter((a) => a.networkId === networkId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <div className="modal-header">
          <Wallet size={18} />
          <div>
            <div className="modal-title">Wallet</div>
            <div className="modal-subtitle">
              Canton party · {network.label}
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--text-tertiary)",
              }}
            >
              Network
            </span>
            <NetworkSelector active={networkId} onChange={switchNetwork} />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--text-tertiary)",
              }}
            >
              Saved accounts on {network.shortLabel}
            </span>
            {networkAccounts.length === 0 && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-tertiary)",
                  fontFamily: "var(--font-mono)",
                  margin: 0,
                }}
              >
                No accounts on this network yet — connect one below.
              </p>
            )}
            {networkAccounts.map((a) => {
              const active = a.partyId === partyId;
              return (
                <div
                  key={`${a.networkId}::${a.partyId}`}
                  style={{
                    border: "1px solid",
                    borderColor: active
                      ? "var(--accent)"
                      : "var(--border-hairline)",
                    background: active
                      ? "var(--accent-dim)"
                      : "var(--bg-elevated)",
                    borderRadius: 12,
                    padding: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {a.label ?? a.hint}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--text-tertiary)",
                        wordBreak: "break-all",
                      }}
                    >
                      {shortParty(a.partyId, 14, 10)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {!active && (
                      <button
                        type="button"
                        className="modal-btn-secondary"
                        onClick={() => switchAccount(a.partyId, a.networkId)}
                        style={{ padding: "6px 10px", fontSize: 11 }}
                      >
                        Use
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAccount(a.partyId, a.networkId)}
                      title="Forget this account"
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border-hairline)",
                        borderRadius: 8,
                        padding: 6,
                        cursor: "pointer",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <LogOut size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border-hairline)",
              paddingTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--text-tertiary)",
              }}
            >
              Connect new party (hint)
            </span>
            <input
              className="form-input"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Employer / Bob / Operator"
              spellCheck={false}
              disabled={busy}
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border-hairline)",
                color: "var(--text-primary)",
                padding: "10px 12px",
                borderRadius: 10,
                fontFamily: "var(--font-mono)",
                fontSize: 13,
              }}
            />
            {err && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: 12,
                  margin: 0,
                  lineHeight: 1.5,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {err}
              </p>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConnect}
              disabled={busy}
              style={{ justifyContent: "center" }}
            >
              {busy ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Connecting…
                </>
              ) : (
                "Connect party"
              )}
            </button>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-tertiary)",
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              If the JSON API at <code className="mono">{network.jsonApiUrl}</code>{" "}
              is reachable, the party is allocated on-ledger. Otherwise the
              wallet falls back to a deterministic <strong>demo party</strong>{" "}
              so you can tour the UI offline.
            </p>
          </div>

          {network.faucet?.url && (
            <a
              href={network.faucet.url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 12,
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {network.faucet.hint}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

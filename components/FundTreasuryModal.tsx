"use client";

import { useState } from "react";
import { Loader2, X, Wallet } from "lucide-react";

interface FundTreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Add `addAmount` to the existing treasury balance (FundTreasury choice). */
  onFund: (addAmount: string) => Promise<void>;
  /** Replace treasury balance (UpdateTreasuryFromEmployer). */
  onSetBalance: (newBalance: string) => Promise<void>;
  currency: string;
  currentBalance?: string;
}

export function FundTreasuryModal({
  isOpen,
  onClose,
  onFund,
  onSetBalance,
  currency,
  currentBalance,
}: FundTreasuryModalProps) {
  const [mode, setMode] = useState<"add" | "set">("add");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!isOpen) return null;

  const submit = async () => {
    if (!amount.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      if (mode === "add") {
        await onFund(amount.trim());
      } else {
        await onSetBalance(amount.trim());
      }
      setAmount("");
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal add-employee-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <Wallet size={18} />
          <div>
            <div className="modal-title">Treasury balance</div>
            <div className="modal-subtitle">
              PayrollOrganization · {currency}
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-form">
          {currentBalance && (
            <p
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)",
                margin: "0 0 12px",
                fontFamily: "var(--font-mono)",
              }}
            >
              Current balance: {currentBalance}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 12,
              padding: 4,
              background: "var(--bg-base)",
              borderRadius: 10,
              border: "1px solid var(--border-hairline)",
            }}
          >
            {(["add", "set"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                disabled={busy}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    mode === m ? "var(--accent-dim)" : "transparent",
                  color:
                    mode === m
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                {m === "add" ? "Top up (FundTreasury)" : "Set absolute"}
              </button>
            ))}
          </div>

          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              margin: "0 0 12px",
            }}
          >
            {mode === "add"
              ? "Adds to current treasuryBalance. Archives + recreates the org contract via the FundTreasury choice."
              : "Replaces treasuryBalance with the given value (UpdateTreasuryFromEmployer)."}
          </p>

          <div className="input-group">
            <label>{mode === "add" ? "Amount to add" : "New balance"}</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000.00"
              disabled={busy}
            />
          </div>
          {err && (
            <p
              style={{
                color: "#f87171",
                fontSize: 12,
                marginTop: 8,
                fontFamily: "var(--font-mono)",
              }}
            >
              {err}
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn-secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="modal-btn-primary"
            onClick={submit}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 className="animate-spin" size={16} />{" "}
                {mode === "add" ? "Funding…" : "Updating…"}
              </>
            ) : mode === "add" ? (
              "Fund treasury"
            ) : (
              "Set balance"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

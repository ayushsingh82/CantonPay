"use client";

import { useState } from "react";
import { Loader2, X, Wallet } from "lucide-react";

interface FundTreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFund: (newBalance: string) => Promise<void>;
}

export function FundTreasuryModal({ isOpen, onClose, onFund }: FundTreasuryModalProps) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!isOpen) return null;

  const submit = async () => {
    if (!amount.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await onFund(amount.trim());
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
      <div className="modal add-employee-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <Wallet size={18} />
          <div>
            <div className="modal-title">Treasury balance</div>
            <div className="modal-subtitle">Update PayrollOrganization (Daml Decimal)</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-form">
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: 12 }}>
            Sets <code className="mono">treasuryBalance</code> via{" "}
            <code>UpdateTreasuryFromEmployer</code>. No ERC-20 transfer — Canton ledger only.
          </p>
          <div className="input-group">
            <label>New balance (decimal string)</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000.00"
              disabled={busy}
            />
          </div>
          {err && (
            <p style={{ color: "#f87171", fontSize: "12px", marginTop: 8 }}>{err}</p>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="modal-btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="modal-btn-primary" onClick={submit} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Updating…
              </>
            ) : (
              "Update treasury"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

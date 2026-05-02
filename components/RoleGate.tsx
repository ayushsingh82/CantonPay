"use client";

import { useCantonAuth } from "@/contexts/canton-auth";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface RoleGateProps {
  children: React.ReactNode;
}

export function RoleGate({ children }: RoleGateProps) {
  const { partyId, login } = useCantonAuth();
  const [hint, setHint] = useState("Employer");
  const [busy, setBusy] = useState(false);

  if (partyId) return <>{children}</>;

  return (
    <div className="role-gate">
      <div className="role-gate-card">
        <div className="role-gate-logo">CantonPay</div>
        <p className="role-gate-subtitle">
          Canton Ledger · party login (JSON API)
        </p>
        <p className="role-gate-desc">
          Allocate or reconnect a Daml party via the sandbox JSON API. What each
          party sees follows signatories and observers in your Daml model.
        </p>
        <label className="form-label" style={{ marginBottom: 8, display: "block" }}>
          Party hint
        </label>
        <input
          className="input-field"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Employer / Employee / Operator"
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            setBusy(true);
            try {
              await login(hint.trim() || "Employer");
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          style={{
            width: "100%",
            justifyContent: "center",
            fontSize: "14px",
            padding: "12px 24px",
            marginTop: 16,
          }}
        >
          {busy ? (
            <>
              <Loader2 className="inline h-4 w-4 animate-spin" /> Connecting…
            </>
          ) : (
            "Connect party"
          )}
        </button>
        <div
          className="network-badge"
          style={{ justifyContent: "center", marginTop: "16px" }}
        >
          <div className="network-dot" />
          Canton JSON API · Daml parties
        </div>
      </div>
    </div>
  );
}

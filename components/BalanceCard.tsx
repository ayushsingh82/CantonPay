"use client";

import { Wallet, Send } from "lucide-react";

interface BalanceCardProps {
  walletAddress: string;
  onSendClick: () => void;
}

export function BalanceCard({ walletAddress, onSendClick }: BalanceCardProps) {
  const short =
    walletAddress.length > 24
      ? `${walletAddress.slice(0, 14)}…${walletAddress.slice(-10)}`
      : walletAddress;

  return (
    <div className="balance-card">
      <div className="balance-info">
        <div className="balance-label">
          <Wallet size={14} style={{ marginRight: "8px", opacity: 0.5 }} />
          Active party
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "14px",
            color: "var(--text-primary)",
            wordBreak: "break-all",
          }}
        >
          {short || "—"}
        </div>
      </div>
      <div className="balance-actions">
        <button type="button" className="send-action-btn" onClick={onSendClick}>
          <Send size={14} style={{ marginRight: "8px" }} />
          Transfers info
        </button>
      </div>
    </div>
  );
}

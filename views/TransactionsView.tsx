"use client";

import { FileText } from "lucide-react";

interface TransactionsViewProps {
  contractAddress: string;
}

export function TransactionsView({ contractAddress }: TransactionsViewProps) {
  return (
    <div
      className="content-body"
      style={{
        flex: 1,
        padding: "48px 24px",
        color: "var(--text-secondary)",
        textAlign: "center",
      }}
    >
      <FileText size={32} style={{ marginBottom: 16, opacity: 0.4 }} />
      <p style={{ maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
        Etherscan-style event history was removed with the EVM stack. Stream Canton
        transaction trees from the <code className="mono">/v1/stream</code> JSON API
        or your participant indexer — wire here when ready.
      </p>
      <p className="mono" style={{ fontSize: "11px", marginTop: 16, wordBreak: "break-all" }}>
        Org: {contractAddress.slice(0, 20)}…
      </p>
    </div>
  );
}

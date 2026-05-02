"use client";

import { X } from "lucide-react";

interface SendTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderAddress: string;
}

export function SendTokensModal({
  isOpen,
  onClose,
  senderAddress,
}: SendTokensModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Transfers</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            On-chain token transfers are not part of the Canton Daml demo. Wire Canton Coin /
            registry transfers via your participant operator when integrated.
          </p>
          <p className="mono" style={{ fontSize: "11px", marginTop: 12, wordBreak: "break-all" }}>
            Party: {senderAddress}
          </p>
        </div>
      </div>
    </div>
  );
}

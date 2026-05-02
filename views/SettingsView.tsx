"use client";

import { useCantonAuth } from "@/contexts/canton-auth";
import { Copy, LogOut, Wallet } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

interface SettingsViewProps {
  address: string;
  role: "Employer" | "Employee";
  orgContractId: string;
}

export function SettingsView({ address, role, orgContractId }: SettingsViewProps) {
  const { logout } = useCantonAuth();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/org/${orgContractId}`
      : "";

  return (
    <div
      className="content-body"
      style={{
        flex: 1,
        padding: "40px",
        maxWidth: "1000px",
        margin: "0 auto",
        width: "100%",
        overflowY: "auto",
      }}
    >
      <h2
        style={{
          fontSize: "32px",
          fontWeight: 800,
          marginBottom: "32px",
          color: "var(--text-primary)",
        }}
      >
        Settings
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
          marginBottom: "40px",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              letterSpacing: "0.1em",
              marginBottom: "16px",
              fontWeight: 600,
            }}
          >
            Invite link
          </h3>
          <div
            style={{
              background: "var(--accent-dim)",
              border: "1px solid rgba(73, 136, 196, 0.2)",
              borderRadius: "var(--radius)",
              padding: "32px",
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "16px",
                borderRadius: "12px",
                alignSelf: "center",
                width: "fit-content",
                marginBottom: 16,
              }}
            >
              <QRCodeSVG value={inviteLink || "canton"} size={140} level="H" />
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Share this URL so employees open the same PayrollOrganization contract id after logging in with their party.
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: 16 }}>
              <div
                style={{
                  flex: 1,
                  background: "var(--bg-root)",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  border: "1px solid var(--border-hairline)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {inviteLink}
              </div>
              <button
                type="button"
                className="reveal-btn"
                onClick={() => copyToClipboard(inviteLink)}
              >
                {copied ? "✓" : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              letterSpacing: "0.1em",
              marginBottom: "16px",
              fontWeight: 600,
            }}
          >
            Session
          </h3>
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius)",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <Wallet size={18} />
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Role</div>
                <div style={{ fontWeight: 600 }}>{role}</div>
              </div>
            </div>
            <p className="mono" style={{ fontSize: "11px", wordBreak: "break-all", marginBottom: 16 }}>
              {address}
            </p>
            <button type="button" className="btn btn-secondary" onClick={() => logout()} style={{ width: "100%" }}>
              <LogOut size={14} style={{ marginRight: 8 }} />
              Log out party
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

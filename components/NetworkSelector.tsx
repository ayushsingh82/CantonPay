"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { listNetworks, type NetworkId } from "@/lib/canton";

interface NetworkSelectorProps {
  active: NetworkId;
  onChange: (id: NetworkId) => void;
  compact?: boolean;
}

export function NetworkSelector({
  active,
  onChange,
  compact,
}: NetworkSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const networks = listNetworks();
  const current = networks.find((n) => n.id === active) ?? networks[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="network-badge"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: compact ? "6px 10px" : "8px 12px",
          border: "1px solid var(--border-hairline)",
          borderRadius: 999,
          background: "var(--bg-elevated)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          cursor: "pointer",
        }}
        aria-expanded={open}
      >
        <Globe size={12} />
        <span style={{ whiteSpace: "nowrap" }}>
          {compact ? current.shortLabel : current.label}
        </span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 260,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-hairline)",
            borderRadius: 12,
            padding: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            zIndex: 60,
          }}
        >
          {networks.map((n) => {
            const isActive = n.id === active;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  onChange(n.id);
                  setOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid",
                  borderColor: isActive
                    ? "var(--accent)"
                    : "transparent",
                  background: isActive
                    ? "var(--accent-dim)"
                    : "transparent",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <span>{n.label}</span>
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: n.testnet ? "#fbbf24" : "var(--text-tertiary)",
                    }}
                  >
                    {n.testnet ? "testnet" : "local"}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-tertiary)",
                    wordBreak: "break-all",
                  }}
                >
                  {n.jsonApiUrl}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

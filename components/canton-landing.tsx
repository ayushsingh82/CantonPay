"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useCantonAuth } from "@/contexts/canton-auth";
import { allocateParty, createPayrollOrganization } from "@/lib/canton";
import { WalletPanel } from "@/components/WalletPanel";
import { NetworkSelector } from "@/components/NetworkSelector";

export function CantonLanding() {
  const router = useRouter();
  const {
    networkId,
    network,
    apiUrl,
    partyId,
    token,
    switchNetwork,
    isHydrated,
  } = useCantonAuth();

  const [orgIdInput, setOrgIdInput] = useState("");
  const [orgLabel, setOrgLabel] = useState("Acme Demo Co.");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const ledgerReady = Boolean(apiUrl?.trim());

  const onJoin = () => {
    if (!orgIdInput.trim()) return;
    router.push(`/org/${encodeURIComponent(orgIdInput.trim())}`);
  };

  const onSpawnDemo = async () => {
    if (!ledgerReady) {
      setErr("Configure a Canton JSON API URL first (network selector).");
      return;
    }
    if (!token || !partyId) {
      setErr("Connect your wallet (employer party) first.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const operatorParty = await allocateParty("Operator", {
        apiUrl,
        networkId,
      });
      const cid = await createPayrollOrganization(
        token,
        {
          employerParty: partyId,
          operatorParty,
          orgLabel: orgLabel.trim() || "CantonPay Demo",
          currency: network.currency,
        },
        { apiUrl, networkId },
      );
      router.push(`/org/${encodeURIComponent(cid)}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg overflow-x-hidden text-ice/90">
      <nav className="sticky top-0 z-50 border-b border-line backdrop-blur-2xl bg-bg/70">
        <div
          className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4"
          style={{ maxWidth: "80rem", margin: "0 auto", width: "100%" }}
        >
          <Link
            href="/"
            className="font-mono font-semibold text-base leading-7 tracking-tight text-ice"
          >
            Canton<span className="text-sky">Pay</span>
          </Link>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <NetworkSelector
              active={networkId}
              onChange={switchNetwork}
              compact
            />
            <Link
              href="/dashboard"
              className="btn-primary inline-flex items-center font-mono font-semibold text-sm leading-7 px-6 py-2.5 rounded-lg"
            >
              demo dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative px-4 sm:px-6 py-16 sm:py-20 flex flex-col items-center justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-halftone opacity-50 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent_75%)]"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[900px] h-[900px] rounded-full glow-orb pointer-events-none"
        />

        <div className="relative mx-auto w-full max-w-6xl text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-edge bg-panel/60 backdrop-blur-md mb-8 sm:mb-10 animate-fade-up">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ice/60">
              employer payroll on canton · {network.shortLabel}
            </span>
          </div>

          <h1 className="font-display text-[clamp(34px,7.5vw,86px)] leading-tight tracking-[-0.02em] mb-6 animate-fade-up [animation-delay:120ms]">
            <span className="block text-ice-gradient">CantonPay</span>
            <span className="block">
              <em className="font-display italic text-brand-gradient">
                payroll control center
              </em>
            </span>
            <span className="block text-ice-gradient">
              for employers and employees.
            </span>
          </h1>

          <p
            className="font-sans text-sm sm:text-base md:text-lg text-ice/60 leading-8 max-w-2xl mx-auto animate-fade-up [animation-delay:240ms]"
          >
            Daml-backed payroll on Canton: allocate parties, fund a treasury in
            Canton Coin, run cooldown-protected batch payouts. Switch between
            local sandbox and Canton Coin DevNet without leaving the page.
          </p>
        </div>
      </section>

      <section
        className="relative px-4 sm:px-6 pb-16"
        style={{ maxWidth: "72rem", margin: "0 auto", width: "100%" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 320px)",
            gap: 24,
          }}
          className="landing-grid"
        >
          <div
            style={{
              background: "var(--bg-elevated, rgba(15,18,30,0.6))",
              border: "1px solid var(--border-hairline, rgba(255,255,255,0.08))",
              borderRadius: 18,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              backdropFilter: "blur(18px)",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  margin: 0,
                  color: "var(--text-primary, #fff)",
                }}
              >
                Open a payroll org
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 13,
                  color: "var(--text-secondary, rgba(255,255,255,0.65))",
                  lineHeight: 1.55,
                }}
              >
                Paste a <code className="mono">PayrollOrganization</code>{" "}
                contract id, or spawn a fresh demo org from the connected
                wallet party.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="form-label" style={{ fontSize: 11 }}>
                Existing PayrollOrganization contract id
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="form-input"
                  value={orgIdInput}
                  onChange={(e) => setOrgIdInput(e.target.value)}
                  placeholder="00abc…:Payroll:PayrollOrganization"
                  spellCheck={false}
                  style={{
                    flex: 1,
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid var(--border-hairline, rgba(255,255,255,0.08))",
                    color: "var(--text-primary, #fff)",
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                />
                <button
                  type="button"
                  onClick={onJoin}
                  disabled={!orgIdInput.trim()}
                  className="btn btn-primary"
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: orgIdInput.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  Open
                </button>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--border-hairline, rgba(255,255,255,0.08))",
                paddingTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <label className="form-label" style={{ fontSize: 11 }}>
                Or spawn a demo org (employer = active wallet party)
              </label>
              <input
                className="form-input"
                value={orgLabel}
                onChange={(e) => setOrgLabel(e.target.value)}
                placeholder="Org label"
                spellCheck={false}
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid var(--border-hairline, rgba(255,255,255,0.08))",
                  color: "var(--text-primary, #fff)",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                }}
              />
              <button
                type="button"
                onClick={onSpawnDemo}
                disabled={busy || !ledgerReady || !partyId}
                className="btn btn-primary"
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor:
                    busy || !ledgerReady || !partyId
                      ? "not-allowed"
                      : "pointer",
                  opacity: !ledgerReady || !partyId ? 0.6 : 1,
                }}
              >
                {busy ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Allocating + creating…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Spawn demo org on {network.shortLabel}
                  </>
                )}
              </button>
              {!isHydrated ? null : !ledgerReady ? (
                <p style={{ fontSize: 12, color: "#fbbf24", margin: 0 }}>
                  No JSON API URL configured for {network.label}. Set{" "}
                  <code className="mono">
                    NEXT_PUBLIC_CANTON_JSON_API_URL
                  </code>{" "}
                  (sandbox) or{" "}
                  <code className="mono">
                    NEXT_PUBLIC_CANTON_TESTNET_JSON_API_URL
                  </code>{" "}
                  (CC DevNet) in <code className="mono">.env.local</code>.
                </p>
              ) : !partyId ? (
                <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0 }}>
                  Connect a wallet on the right to designate the employer party.
                </p>
              ) : null}
              {err && (
                <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>
                  {err}
                </p>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <WalletPanel variant="inline" />
            <div
              style={{
                background: "var(--bg-elevated, rgba(15,18,30,0.6))",
                border: "1px solid var(--border-hairline, rgba(255,255,255,0.08))",
                borderRadius: 14,
                padding: 16,
                fontSize: 12,
                color: "var(--text-secondary, rgba(255,255,255,0.65))",
                lineHeight: 1.55,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary, rgba(255,255,255,0.45))",
                  marginBottom: 6,
                }}
              >
                {network.shortLabel} · {network.currency}
              </div>
              <p style={{ margin: 0 }}>{network.description}</p>
              {network.faucet?.url && (
                <a
                  href={network.faucet.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: 10,
                    fontSize: 11,
                    color: "var(--accent, #62b8ff)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  faucet & docs ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 backdrop-blur-md">
        <div
          className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-[11px] font-mono text-ice/40"
          style={{ maxWidth: "80rem", margin: "0 auto", width: "100%" }}
        >
          <span>© CantonPay · payroll on Canton</span>
          <span>
            {network.label} · {network.jsonApiUrl}
          </span>
        </div>
      </footer>
    </main>
  );
}

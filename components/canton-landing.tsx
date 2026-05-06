"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Coins,
  Layers,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
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
    isDemo,
  } = useCantonAuth();

  const [orgIdInput, setOrgIdInput] = useState("");
  const [orgLabel, setOrgLabel] = useState("Northwind Treasury Group");
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
    if (isDemo) {
      setErr(
        "Active wallet is a demo party — spawning an org needs a real Canton JSON API. Start a sandbox at " +
          apiUrl +
          " and reconnect.",
      );
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
          orgLabel: orgLabel.trim() || "CantonPay Org",
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
              dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative px-4 sm:px-6 pt-32 pb-32 flex flex-col items-center justify-center overflow-hidden">
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
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-edge bg-panel/60 backdrop-blur-md mb-10 sm:mb-12 animate-fade-up">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ice/60">
              employer payroll on canton · {network.shortLabel}
            </span>
          </div>

          <h1 className="font-display text-[clamp(34px,7.5vw,86px)] leading-tight tracking-[-0.02em] mb-8 sm:mb-10 animate-fade-up [animation-delay:120ms]">
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

          <p className="font-sans text-sm sm:text-base md:text-lg text-ice/60 leading-8 max-w-2xl mx-auto animate-fade-up [animation-delay:240ms]">
            Daml-backed payroll on Canton: allocate parties, fund a treasury in
            Canton Coin, run cooldown-protected batch payouts. Switch between
            local sandbox and Canton Coin DevNet without leaving the page.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 36,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
            className="animate-fade-up [animation-delay:320ms]"
          >
            <Link
              href="/dashboard"
              className="btn-primary inline-flex items-center font-mono font-semibold text-sm leading-7 px-6 py-3 rounded-lg"
              style={{ gap: 8 }}
            >
              Open dashboard
              <ArrowRight size={14} />
            </Link>
            <a
              href="#open-org"
              className="btn-ghost inline-flex items-center font-mono font-semibold text-sm leading-7 px-6 py-3 rounded-lg"
              style={{ gap: 8 }}
            >
              Connect a real org
            </a>
          </div>

          <div
            className="animate-fade-up [animation-delay:400ms]"
            style={{
              marginTop: 56,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              width: "100%",
              maxWidth: 960,
            }}
          >
            {[
              {
                icon: <Users size={18} />,
                title: "Multi-party visibility",
                body: "Daml signatories and observers control who sees salary fields on each EmploymentContract.",
              },
              {
                icon: <Coins size={18} />,
                title: "Treasury in Canton Coin",
                body: "Fund the org once, then RunPayroll fans out PaySlip contracts to every active employee.",
              },
              {
                icon: <ShieldCheck size={18} />,
                title: "Cooldown enforced",
                body: "Each org sets a payout cooldown (24h default) — re-runs are rejected on the ledger.",
              },
              {
                icon: <Layers size={18} />,
                title: "Sandbox or DevNet",
                body: "Same UI against a local Canton sandbox or the public Canton Coin DevNet — switch in the navbar.",
              },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  textAlign: "left",
                  padding: 18,
                  background: "rgba(15,18,30,0.55)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  backdropFilter: "blur(10px)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    width: 32,
                    height: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    background: "rgba(73,136,196,0.14)",
                    color: "#bde8f5",
                    marginBottom: 10,
                  }}
                >
                  {f.icon}
                </span>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#bde8f5",
                    marginBottom: 6,
                  }}
                >
                  {f.title}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    lineHeight: 1.55,
                    color: "rgba(189,232,245,0.55)",
                  }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative px-4 sm:px-6 pt-32 pb-32"
        style={{ maxWidth: "76rem", margin: "0 auto", width: "100%" }}
        id="open-org"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 32,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--text-tertiary, rgba(255,255,255,0.45))",
                marginBottom: 8,
              }}
            >
              Step 01 · Connect & open
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(22px, 3vw, 30px)",
                fontWeight: 600,
                color: "var(--text-primary, #fff)",
                letterSpacing: "-0.01em",
              }}
            >
              Open a payroll org
            </h2>
          </div>
          <p
            style={{
              margin: 0,
              maxWidth: 460,
              fontSize: 13,
              lineHeight: 1.55,
              color: "var(--text-secondary, rgba(255,255,255,0.6))",
            }}
          >
            Connect a wallet party, then either join an existing
            <code className="mono"> PayrollOrganization</code> contract or
            spawn a fresh org on {network.shortLabel}.
          </p>
        </div>

        <div className="landing-grid">
          <div
            style={{
              background: "var(--bg-elevated, rgba(15,18,30,0.6))",
              border: "1px solid var(--border-hairline, rgba(255,255,255,0.08))",
              borderRadius: 18,
              padding: "28px 28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 28,
              backdropFilter: "blur(18px)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label className="form-label" style={{ fontSize: 11 }}>
                Existing PayrollOrganization contract id
              </label>
              <div
                style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
              >
                <input
                  className="form-input"
                  value={orgIdInput}
                  onChange={(e) => setOrgIdInput(e.target.value)}
                  placeholder="00abc…:Payroll:PayrollOrganization"
                  spellCheck={false}
                  style={{
                    flex: "1 1 240px",
                    minWidth: 0,
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid var(--border-hairline, rgba(255,255,255,0.08))",
                    color: "var(--text-primary, #fff)",
                    padding: "12px 14px",
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
                    padding: "12px 22px",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: orgIdInput.trim() ? "pointer" : "not-allowed",
                    opacity: orgIdInput.trim() ? 1 : 0.55,
                  }}
                >
                  Open
                </button>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
              aria-hidden="true"
            >
              <span
                style={{
                  flex: 1,
                  height: 1,
                  background:
                    "var(--border-hairline, rgba(255,255,255,0.08))",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary, rgba(255,255,255,0.4))",
                }}
              >
                or
              </span>
              <span
                style={{
                  flex: 1,
                  height: 1,
                  background:
                    "var(--border-hairline, rgba(255,255,255,0.08))",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label className="form-label" style={{ fontSize: 11 }}>
                Spawn a new org · employer = active wallet party
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
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                }}
              />
              <button
                type="button"
                onClick={onSpawnDemo}
                disabled={busy || !ledgerReady || !partyId || isDemo}
                className="btn btn-primary"
                style={{
                  padding: "14px 18px",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor:
                    busy || !ledgerReady || !partyId || isDemo
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    !ledgerReady || !partyId || isDemo ? 0.55 : 1,
                }}
                title={
                  isDemo
                    ? "Active wallet is a demo party — start a Canton JSON API and reconnect to spawn a real org."
                    : undefined
                }
              >
                {busy ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Allocating + creating…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Spawn org on {network.shortLabel}
                  </>
                )}
              </button>
              {!isHydrated ? null : !ledgerReady ? (
                <p
                  style={{
                    fontSize: 12,
                    color: "#fbbf24",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
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
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-tertiary)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Connect a wallet on the right to designate the employer
                  party.
                </p>
              ) : isDemo ? (
                <p
                  style={{
                    fontSize: 12,
                    color: "#f87171",
                    margin: 0,
                    lineHeight: 1.55,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Live ledger required. The active wallet is a{" "}
                  <strong>demo party</strong> (JSON API at{" "}
                  <code>{apiUrl}</code> wasn&apos;t reachable when you
                  connected). Start a Canton sandbox there, then disconnect
                  and reconnect the wallet to allocate a real party.
                </p>
              ) : null}
              {err && (
                <p
                  style={{
                    color: "#f87171",
                    fontSize: 12,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {err}
                </p>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <WalletPanel variant="inline" />
            <div
              style={{
                background: "var(--bg-elevated, rgba(15,18,30,0.6))",
                border: "1px solid var(--border-hairline, rgba(255,255,255,0.08))",
                borderRadius: 14,
                padding: 18,
                fontSize: 12,
                color: "var(--text-secondary, rgba(255,255,255,0.65))",
                lineHeight: 1.6,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary, rgba(255,255,255,0.45))",
                  marginBottom: 8,
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
                    marginTop: 12,
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

      <footer
        className="border-t backdrop-blur-md"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: "48px 24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
              alignItems: "center",
            }}
            className="footer-grid"
          >
            <div>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-primary, #fff)",
                  margin: "0 0 8px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Canton<span style={{ color: "var(--accent, #62b8ff)" }}>Pay</span>
              </p>
              <p
                style={{
                  margin: 0,
                  maxWidth: 320,
                  fontSize: 13,
                  color: "var(--text-tertiary, rgba(255,255,255,0.55))",
                  lineHeight: 1.55,
                }}
              >
                Payroll on Canton — Daml templates + JSON API. Switch between
                local sandbox and Canton Coin DevNet from a single wallet.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 24,
                flexWrap: "wrap",
              }}
              className="footer-links"
            >
              <Link
                href="/dashboard"
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary, rgba(255,255,255,0.65))",
                  textDecoration: "none",
                }}
              >
                Dashboard
              </Link>
              <a
                href="#open-org"
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary, rgba(255,255,255,0.65))",
                  textDecoration: "none",
                }}
              >
                Open org
              </a>
              <a
                href="https://docs.daml.com/json-api/index.html"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary, rgba(255,255,255,0.65))",
                  textDecoration: "none",
                }}
              >
                Daml JSON API
              </a>
              <a
                href="https://docs.sync.global/app_dev/testnet_overview.html"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary, rgba(255,255,255,0.65))",
                  textDecoration: "none",
                }}
              >
                CC DevNet
              </a>
            </div>
          </div>
          <div
            style={{
              marginTop: 36,
              borderTop: "1px solid rgba(255,255,255,0.05)",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
            className="footer-baseline"
          >
            <p
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--text-tertiary, rgba(255,255,255,0.4))",
                margin: 0,
              }}
            >
              © {new Date().getFullYear()} CantonPay · Daml + Canton JSON API
            </p>
            <p
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--text-tertiary, rgba(255,255,255,0.4))",
                margin: 0,
              }}
            >
              {network.label} · {network.jsonApiUrl}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

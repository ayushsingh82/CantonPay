"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  allocateParty,
  partyToken,
  createContract,
  type PayrollOrganizationPayload,
} from "@/lib/canton";
import { Loader2 } from "lucide-react";

export function CantonLanding() {
  const router = useRouter();
  const [joinAddr, setJoinAddr] = useState("");
  const [joinErr, setJoinErr] = useState<string | null>(null);
  const [demoBusy, setDemoBusy] = useState(false);

  const hasApi = Boolean(process.env.NEXT_PUBLIC_CANTON_JSON_API_URL);

  const handleJoin = useCallback(() => {
    const trimmed = joinAddr.trim();
    if (trimmed.length < 8) {
      setJoinErr("Paste a PayrollOrganization contract id from your Canton sandbox.");
      return;
    }
    setJoinErr(null);
    router.push(`/org/${encodeURIComponent(trimmed)}`);
  }, [joinAddr, router]);

  const spawnDemoOrg = async () => {
    if (!hasApi) return;
    setDemoBusy(true);
    try {
      const employer = await allocateParty("Employer");
      const operator = await allocateParty("Operator");
      const tok = partyToken(employer);
      const { contractId } = await createContract<PayrollOrganizationPayload>(
        "PayrollOrganization",
        {
          employer,
          operator,
          currency: "CC",
          treasuryBalance: "0.0",
          payrollCooldownSeconds: 86400,
          lastPayrollRun: "",
          orgLabel: "Demo Org",
        },
        tok,
      );
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "canton_party",
          JSON.stringify({ partyId: employer, hint: "Employer" }),
        );
        window.location.href = `/org/${encodeURIComponent(contractId)}`;
      }
    } catch (e) {
      console.error(e);
      setJoinErr(e instanceof Error ? e.message : "Demo spawn failed");
    } finally {
      setDemoBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg overflow-x-hidden text-ice/90">
      <nav className="sticky top-0 z-50 border-b border-line backdrop-blur-2xl bg-bg/70">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="relative w-7 h-7 rounded-lg bg-brand-fade flex items-center justify-center text-bg font-bold text-sm shadow-[0_0_18px_rgba(73,136,196,0.5)]">
              ▲
            </span>
            <span className="font-mono font-semibold text-sm tracking-tight text-ice">
              canton<span className="text-sky">payroll</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="#how">how</NavLink>
            <NavLink href="#use">use cases</NavLink>
            <NavLink href="#stack">stack</NavLink>
          </div>
          <Link
            href="/dashboard"
            className="btn-primary inline-flex items-center gap-2 font-mono font-semibold text-xs px-4 py-2 rounded-lg"
          >
            dashboard
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>

      <section className="relative px-6 pt-24 pb-40 overflow-hidden">
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

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-edge bg-panel/60 backdrop-blur-md mb-8 animate-fade-up">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ice/60">
              powered by Daml · Canton ledger
            </span>
          </div>

          <h1 className="font-display text-[clamp(56px,9vw,128px)] leading-[0.95] tracking-[-0.02em] mb-8 animate-fade-up [animation-delay:120ms]">
            <span className="block text-ice-gradient">Payroll on</span>
            <span className="block">
              <em className="font-display italic text-brand-gradient">
                Canton network
              </em>
            </span>
            <span className="block text-ice-gradient">same UI, Daml core.</span>
          </h1>

          <p className="font-sans text-base md:text-lg text-ice/55 leading-relaxed max-w-xl mx-auto mb-10 animate-fade-up [animation-delay:240ms]">
            Dashboard shell for payroll operators and employees. Business logic lives in{" "}
            <code className="font-mono text-sky/90">daml/Payroll.daml</code> — parties,
            observers, and choices exercised through the Canton JSON API.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-20 animate-fade-up [animation-delay:360ms]">
            <Link
              href="/dashboard"
              className="btn-primary inline-flex items-center gap-2 font-mono font-semibold text-sm px-7 py-3.5 rounded-full"
            >
              open dashboard
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href="#how"
              className="btn-ghost inline-flex items-center gap-2 font-mono text-sm px-7 py-3.5 rounded-full"
            >
              how it works
            </a>
          </div>

          <div className="relative ">
            <div className="gradient-border rounded-2xl bg-panel/60 backdrop-blur-xl">
              <div className="grid grid-cols-3 divide-x divide-line">
                <HeroStat n="Daml" l="contracts" />
                <HeroStat n="CN" l="json api" highlight />
                <HeroStat n="UI" l="dashboard" />
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center gap-4 animate-fade-up [animation-delay:600ms]">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ice/30">
              stack
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 opacity-60">
              {["Next.js", "Daml SDK", "Canton", "JSON API", "TypeScript"].map(
                (n) => (
                  <span
                    key={n}
                    className="font-mono text-sm text-ice/60 tracking-tight"
                  >
                    {n}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <Divider />

      <section id="how" className="relative px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            n="01"
            kicker="model"
            title={
              <>
                Parties and templates —{" "}
                <em className="font-display italic text-brand-gradient">
                  one canonical ledger.
                </em>
              </>
            }
          />
          <div className="grid md:grid-cols-2 gap-4 mt-12">
            <Card variant="problem">
              <CardKicker tone="bad">typical silos</CardKicker>
              <h3 className="font-display text-3xl text-ice mb-6 leading-tight">
                Payroll truth scattered across spreadsheets and SaaS tools.
              </h3>
              <ul className="space-y-3">
                {[
                  "No single contract that both HR and finance can agree on",
                  "Weak audit trail for who approved salary or roster changes",
                  "Exports and emails instead of a participant-backed ledger",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 font-sans text-sm text-ice/55 leading-relaxed"
                  >
                    <span className="text-red-400/80 shrink-0 mt-1">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
            <Card variant="fix">
              <CardKicker tone="good">canton stack</CardKicker>
              <h3 className="font-display text-3xl text-ice mb-6 leading-tight">
                PayrollOrganization + EmploymentContract on your participant.
              </h3>
              <ul className="space-y-3">
                {[
                  "Ledger API / JSON API with JWT actAs party",
                  "Plain Decimal salaries — visibility via observers",
                  "Run payroll archive/create handled by your nodes",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 font-sans text-sm text-ice/70 leading-relaxed"
                  >
                    <span className="text-sky shrink-0 mt-1">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <Divider />

      <section id="use" className="relative px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            n="02"
            kicker="use cases"
            title={
              <>
                Treasury, roster,{" "}
                <em className="font-display italic text-brand-gradient">
                  run batch.
                </em>
              </>
            }
          />
          <div className="grid md:grid-cols-3 gap-4 mt-12">
            {[
              {
                n: "employer",
                p: "Fund treasury balance, add EmploymentContract rows, exercise RunPayroll.",
                tag: "admin",
              },
              {
                n: "employee",
                p: "Observer on own contract line — no org-wide read unless you add it in Daml.",
                tag: "privacy",
              },
              {
                n: "operator",
                p: "Optional automation party for exercises / workflows.",
                tag: "ops",
              },
            ].map((uc) => (
              <div
                key={uc.n}
                className="group relative rounded-2xl bg-panel/40 border border-line p-7 transition-all hover:border-edge hover:bg-panel/60 overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between gap-2 mb-5">
                  <span className="font-mono text-sm font-semibold text-ice">
                    {uc.n}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ice/40 border border-line px-2 py-0.5 rounded-full">
                    {uc.tag}
                  </span>
                </div>
                <p className="font-display italic text-xl text-ice/75 leading-snug">
                  &ldquo;{uc.p}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <section id="stack" className="relative px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            n="03"
            kicker="stack"
            title={
              <>
                Build DAR → configure{" "}
                <code className="font-mono text-sm text-sky/90">
                  NEXT_PUBLIC_DAML_PACKAGE_ID
                </code>
              </>
            }
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12">
            {[
              { t: "Daml", s: "Payroll.daml" },
              { t: "Canton", s: "participant + json-api" },
              { t: "Next.js", s: "app router" },
              { t: "JWT", s: "actAs party" },
            ].map((pill) => (
              <div
                key={pill.t}
                className="group rounded-xl bg-panel/40 border border-line px-5 py-4 transition-all hover:bg-raised/30 hover:border-edge"
              >
                <div className="font-sans text-sm font-semibold text-ice group-hover:text-sky transition-colors mb-1">
                  {pill.t}
                </div>
                <div className="font-mono text-[10px] text-ice/40 tracking-wider">
                  {pill.s}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <section
        id="join"
        className="relative px-6 py-36 text-center overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] glow-orb opacity-70"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-halftone opacity-30 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent_70%)]"
        />
        <div className="relative max-w-2xl mx-auto">
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ice/40 mb-6">
            // connect
          </div>
          <h2 className="font-display text-[clamp(40px,6vw,80px)] leading-[0.95] tracking-[-0.02em] mb-6">
            <span className="text-ice-gradient">Paste contract id,</span>
            <br />
            <em className="font-display italic text-brand-gradient">
              then log in as a party.
            </em>
          </h2>
          <p className="font-sans text-base text-ice/55 leading-relaxed mb-10 max-w-md mx-auto">
            Run{" "}
            <code className="font-mono text-xs">daml build</code> and{" "}
            <code className="font-mono text-xs">daml start</code>, set{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_CANTON_JSON_API_URL</code>{" "}
            (e.g. http://localhost:7575).
          </p>

          <div className="gradient-border rounded-2xl bg-panel/50 backdrop-blur-xl p-8 text-left max-w-md mx-auto mb-8">
            {!hasApi && (
              <p className="font-mono text-xs text-amber-400/90 mb-4">
                Set NEXT_PUBLIC_CANTON_JSON_API_URL to enable API + demo spawn.
              </p>
            )}
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-ice/40">
              PayrollOrganization contract id
            </label>
            <input
              className="input-field font-mono mb-3"
              placeholder="#package:hash:cid…"
              value={joinAddr}
              onChange={(e) => {
                setJoinAddr(e.target.value);
                setJoinErr(null);
              }}
            />
            {joinErr && (
              <p className="mb-3 font-mono text-xs text-red-400/90">{joinErr}</p>
            )}
            <button
              type="button"
              onClick={handleJoin}
              className="btn-primary mb-4 w-full rounded-lg py-3 font-mono text-sm font-semibold"
            >
              Go to dashboard →
            </button>
            <button
              type="button"
              onClick={spawnDemoOrg}
              disabled={!hasApi || demoBusy}
              className="btn-ghost w-full rounded-lg py-2.5 font-mono text-sm"
            >
              {demoBusy ? (
                <>
                  <Loader2 className="inline h-4 w-4 animate-spin" /> Creating…
                </>
              ) : (
                "Spawn demo org (Employer session)"
              )}
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-md bg-brand-fade flex items-center justify-center text-bg font-bold text-xs">
              ▲
            </span>
            <span className="text-ice/40 text-xs font-mono">
              cantonpayroll · {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-ice/50 hover:text-ice text-xs font-mono px-3 py-2 transition-colors"
    >
      {children}
    </a>
  );
}

function SectionHeader({
  n,
  kicker,
  title,
}: {
  n: string;
  kicker: string;
  title: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-xs text-sky">{n}</span>
        <span className="w-8 h-px bg-edge" />
        <span className="font-mono text-[10px] text-ice/40 tracking-[0.25em] uppercase">
          {kicker}
        </span>
      </div>
      <h2 className="font-display text-[clamp(36px,5vw,64px)] leading-[1.02] tracking-[-0.02em] text-ice">
        {title}
      </h2>
    </div>
  );
}

function Card({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "problem" | "fix";
}) {
  return (
    <div
      className={`relative rounded-2xl p-10 overflow-hidden ${
        variant === "fix"
          ? "gradient-border bg-panel/60 backdrop-blur-sm"
          : "border border-line bg-panel/30"
      }`}
    >
      {variant === "fix" && (
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 w-72 h-72 glow-orb opacity-50"
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

function CardKicker({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "good" | "bad";
}) {
  return (
    <span
      className={`inline-block font-mono text-[10px] tracking-[0.25em] uppercase mb-5 ${
        tone === "good" ? "text-sky" : "text-red-400/80"
      }`}
    >
      {children}
    </span>
  );
}

function Divider() {
  return (
    <div
      aria-hidden="true"
      className="h-px bg-gradient-to-r from-transparent via-edge to-transparent"
    />
  );
}

function HeroStat({
  n,
  l,
  highlight,
}: {
  n: string;
  l: string;
  highlight?: boolean;
}) {
  return (
    <div className="px-6 py-7">
      <div
        className={`font-display text-4xl leading-none mb-1 ${
          highlight ? "text-brand-gradient" : "text-ice"
        }`}
      >
        {n}
      </div>
      <div className="font-mono text-[10px] text-ice/40 uppercase tracking-[0.2em]">
        {l}
      </div>
    </div>
  );
}

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
        <div
          className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"
          style={{ maxWidth: "80rem", margin: "0 auto", width: "100%" }}
        >
          <Link href="/" className="font-mono font-semibold text-base leading-7 tracking-tight text-ice">
            Canton<span className="text-sky">Pay</span>
          </Link>
       
          <a
            href="/dashboard"
            className="btn-primary inline-flex items-center   font-mono font-semibold text-sm leading-7 px-10 py-2.5 rounded-lg"
          >
            dashboard
          
          </a>
        </div>
      </nav>

      <section className="relative px-4 sm:px-6 pt-14 sm:pt-20 lg:pt-24 pb-16 sm:pb-24 lg:pb-32 overflow-hidden">
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

        <div className="relative mx-auto w-full max-w-6xl text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-edge bg-panel/60 backdrop-blur-md mb-8 sm:mb-10 animate-fade-up">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ice/60">
              employer payroll on canton
            </span>
          </div>

          <h1 className="font-display text-[clamp(34px,8vw,96px)] leading-[0.98] tracking-[-0.02em] mb-8 sm:mb-10 animate-fade-up [animation-delay:120ms]">
            <span className="block text-ice-gradient">CantonPay</span>
            <span className="block">
              <em className="font-display italic text-brand-gradient">
                payroll control center
              </em>
            </span>
            <span className="block text-ice-gradient">for employers and employees.</span>
          </h1>

          <p className="font-sans text-sm sm:text-base md:text-lg text-ice/60 leading-8 max-w-3xl mx-auto mb-10 sm:mb-12 px-2 sm:px-0 animate-fade-up [animation-delay:240ms]">
            Run payroll with a single source of truth: treasury, roster, salary contracts,
            cooldown control, and batch execution. Business logic lives in{" "}
            <code className="font-mono text-sky/90">daml/Payroll.daml</code> with
            party-scoped visibility on Canton.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mb-12 sm:mb-20 animate-fade-up [animation-delay:360ms]">
            <a
              href="#join"
              className="btn-primary inline-flex items-center gap-2 font-mono font-semibold text-sm px-7 py-3.5 rounded-full"
            >
              open app
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="#how"
              className="btn-ghost inline-flex items-center gap-2 font-mono text-sm px-7 py-3.5 rounded-full"
            >
              how it works
            </a>
          </div>

          <div className="relative w-full max-w-5xl mx-auto mb-12 sm:mb-16">
            <div className="gradient-border rounded-2xl bg-panel/60 backdrop-blur-xl overflow-hidden shadow-[0_20px_80px_-35px_rgba(73,136,196,0.55)]">
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
                <HeroStat n="Roster" l="party-based access" />
                <HeroStat n="Payroll" l="single run flow" highlight />
                <HeroStat n="Treasury" l="controlled funding" />
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-14 flex flex-col items-center gap-5 animate-fade-up [animation-delay:600ms]">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ice/30">
              what you get
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-10 gap-y-3 opacity-70 max-w-3xl mx-auto">
              {["Party login", "Employee contracts", "Treasury updates", "Run payroll", "Audit-ready history"].map(
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

      <section id="how" className="relative px-4 sm:px-6 py-20 sm:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto w-full">
          <SectionHeader
            n="01"
            kicker="features"
            title={
              <>
                Built for real payroll operations —{" "}
                <em className="font-display italic text-brand-gradient">
                  not spreadsheet drift.
                </em>
              </>
            }
          />
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mt-10 sm:mt-14 items-stretch">
            <Card variant="problem">
              <CardKicker tone="bad">without cantonpay</CardKicker>
              <h3 className="font-display text-3xl text-ice mb-6 leading-tight text-center">
                Payroll data becomes fragmented and hard to verify.
              </h3>
              <ul className="space-y-3 max-w-md mx-auto text-left">
                {[
                  "Roster and salary updates live in separate tools",
                  "Approval trail is incomplete or manual",
                  "Treasury and payout actions are hard to reconcile",
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
              <CardKicker tone="good">with cantonpay</CardKicker>
              <h3 className="font-display text-3xl text-ice mb-6 leading-tight text-center">
                One workflow from funding to payroll execution.
              </h3>
              <ul className="space-y-3 max-w-md mx-auto text-left">
                {[
                  "Add and manage employees through EmploymentContract records",
                  "Control treasury balance before each payroll cycle",
                  "Execute payroll in a consistent, repeatable batch flow",
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

      <section id="use" className="relative px-4 sm:px-6 py-20 sm:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto w-full">
          <SectionHeader
            n="02"
            kicker="advantages"
            title={
              <>
                Clear ownership, stronger controls,{" "}
                <em className="font-display italic text-brand-gradient">
                  fewer payroll mistakes.
                </em>
              </>
            }
          />
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-14 items-stretch">
            {[
              {
                n: "employer",
                p: "Funds treasury, manages employee contracts, and triggers payroll runs.",
                tag: "control",
              },
              {
                n: "employee",
                p: "Sees only what their party is allowed to see from payroll records.",
                tag: "privacy",
              },
              {
                n: "operator",
                p: "Runs operational workflows and enforces payroll cadence.",
                tag: "ops",
              },
            ].map((uc) => (
              <div
                key={uc.n}
                className="group relative rounded-2xl bg-panel/40 border border-line p-8 sm:p-9 transition-all hover:border-edge hover:bg-panel/60 overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center justify-center gap-2 mb-5">
                  <span className="font-mono text-sm font-semibold text-ice text-center">
                    {uc.n}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ice/40 border border-line px-2 py-0.5 rounded-full">
                    {uc.tag}
                  </span>
                </div>
                <p className="font-display italic text-xl text-ice/75 leading-relaxed text-center">
                  &ldquo;{uc.p}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <section id="stack" className="relative px-4 sm:px-6 py-20 sm:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto w-full">
          <SectionHeader
            n="03"
            kicker="workflow"
            title={
              <>
                Fund treasury → maintain roster →{" "}
                <code className="font-mono text-sm text-sky/90">run payroll</code>
              </>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-10 sm:mt-14 items-stretch">
            {[
              { t: "1. Login", s: "Act as Employer, Employee, or Operator party" },
              { t: "2. Configure", s: "Create and maintain PayrollOrganization data" },
              { t: "3. Manage", s: "Add or remove EmploymentContract rows" },
              { t: "4. Execute", s: "Run payroll when treasury and cooldown allow" },
            ].map((pill) => (
              <div
                key={pill.t}
                className="group rounded-xl bg-panel/40 border border-line px-5 py-4 transition-all hover:bg-raised/30 hover:border-edge"
              >
                <div className="font-sans text-sm font-semibold text-ice group-hover:text-sky transition-colors mb-1 text-center">
                  {pill.t}
                </div>
                <div className="font-mono text-[10px] text-ice/40 tracking-wider text-center">
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
        className="relative px-4 sm:px-6 py-20 sm:py-24 lg:py-32 text-center overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] glow-orb opacity-70"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-halftone opacity-30 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent_70%)]"
        />
        <div className="relative max-w-2xl mx-auto w-full text-center">
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ice/40 mb-6">
            // start payroll
          </div>
          <h2 className="font-display text-[clamp(28px,7vw,70px)] leading-[0.96] tracking-[-0.02em] mb-5 sm:mb-6">
            <span className="text-ice-gradient">Paste organization id,</span>
            <br />
            <em className="font-display italic text-brand-gradient">
              then log in as a party.
            </em>
          </h2>
          <p className="font-sans text-sm sm:text-base text-ice/60 leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto px-2 sm:px-0">
            Open an existing payroll organization directly, or spawn a demo org
            and start operating payroll in minutes.
          </p>

          <div className="gradient-border rounded-2xl bg-panel/50 backdrop-blur-xl p-6 sm:p-8 text-left max-w-xl mx-auto mb-8">
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
              Open app →
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
        <div
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ maxWidth: "80rem", margin: "0 auto", width: "100%" }}
        >
          <div className="text-ice/40 text-xs font-mono">
            CantonPay · {new Date().getFullYear()}
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
      className="text-ice/50 hover:text-ice text-sm leading-7 font-mono px-3 py-2.5 transition-colors"
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
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="font-mono text-xs text-sky">{n}</span>
        <span className="w-8 h-px bg-edge" />
        <span className="font-mono text-[10px] text-ice/40 tracking-[0.25em] uppercase">
          {kicker}
        </span>
      </div>
      <h2 className="font-display text-[clamp(28px,5vw,60px)] leading-[1.04] tracking-[-0.02em] text-ice max-w-4xl mx-auto">
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
      className={`relative rounded-2xl p-8 sm:p-10 lg:p-12 overflow-hidden ${
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
      <div className="relative h-full text-center">{children}</div>
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
    <div className="px-6 py-5 sm:py-7 text-center sm:text-left">
      <div
        className={`font-display text-3xl sm:text-4xl leading-none mb-1 ${
          highlight ? "text-brand-gradient" : "text-ice"
        }`}
      >
        {n}
      </div>
      <div className="font-mono text-[10px] text-ice/40 uppercase tracking-[0.16em]">
        {l}
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { decodeEventLog, formatEther, isAddress } from "viem";
import { FACTORY_ABI, FACTORY_ADDRESS } from "@/lib/contracts";
import { useWallet } from "@/hooks/useWallet";
import { Loader2 } from "lucide-react";

/** Landing matches agent-corn/web/src/app/page.tsx layout & typography; copy is payroll-focused. */
export function CantonLanding() {
  const router = useRouter();
  const { address, isConnected, connect, isConnecting, chain, switchChain } =
    useWallet();
  const isWrongNetwork = isConnected && chain?.id !== 11155111;

  const [joinAddr, setJoinAddr] = useState("");
  const [joinErr, setJoinErr] = useState<string | null>(null);

  const { writeContractAsync, data: txHash } = useWriteContract();
  const { isLoading: isConfirming, data: receipt } =
    useWaitForTransactionReceipt({ hash: txHash });

  const { data: deploymentFee } = useReadContract({
    address: FACTORY_ADDRESS || undefined,
    abi: FACTORY_ABI,
    functionName: "deploymentFee",
    query: { enabled: Boolean(FACTORY_ADDRESS) },
  });

  const handleJoin = useCallback(() => {
    const trimmed = joinAddr.trim();
    if (!isAddress(trimmed)) {
      setJoinErr("Enter a valid 0x payroll contract address.");
      return;
    }
    setJoinErr(null);
    router.push(`/org/${trimmed}`);
  }, [joinAddr, router]);

  const handleCreateOrg = async () => {
    if (!deploymentFee || !FACTORY_ADDRESS) return;
    try {
      await writeContractAsync({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "createPayroll",
        value: deploymentFee as bigint,
      });
    } catch (err) {
      console.error("[CantonLanding] Deployment failed:", err);
    }
  };

  useEffect(() => {
    if (!receipt || !FACTORY_ADDRESS) return;
    const log = receipt.logs.find(
      (l) => l.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase(),
    );
    if (!log) return;
    try {
      const decoded = decodeEventLog({
        abi: FACTORY_ABI,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "PayrollCreated") {
        const { payrollContract } = decoded.args as {
          payrollContract?: `0x${string}`;
        };
        if (payrollContract) router.push(`/org/${payrollContract}`);
      }
    } catch (e) {
      console.error("Failed to decode deployment log", e);
    }
  }, [receipt, router]);

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
            href="#join"
            className="btn-primary inline-flex items-center gap-2 font-mono font-semibold text-xs px-4 py-2 rounded-lg"
          >
            launch
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
              powered by
            </span>
            <span className="font-mono text-xs font-semibold tracking-tight text-ice/90">
              Canton · Sepolia
            </span>
          </div>

          <h1 className="font-display text-[clamp(56px,9vw,128px)] leading-[0.95] tracking-[-0.02em] mb-8 animate-fade-up [animation-delay:120ms]">
            <span className="block text-ice-gradient">Confidential</span>
            <span className="block">
              <em className="font-display italic text-brand-gradient">
                payroll rails
              </em>
            </span>
            <span className="block text-ice-gradient">for teams.</span>
          </h1>

          <p className="font-sans text-base md:text-lg text-ice/55 leading-relaxed max-w-xl mx-auto mb-10 animate-fade-up [animation-delay:240ms]">
            Same dashboard layout as Nzuzo — treasury, roster, encrypted salaries,
            payslip NFTs — with AgentCorn ice-and-navy styling. Dev on Ethereum
            Sepolia + Zama FHE; Canton ledger integration per plan.md.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-20 animate-fade-up [animation-delay:360ms]">
            <Link
              href="#join"
              className="btn-primary inline-flex items-center gap-2 font-mono font-semibold text-sm px-7 py-3.5 rounded-full"
            >
              open payroll
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
                <HeroStat n="FHE" l="salary inputs" />
                <HeroStat n="100%" l="nzuzo layout" highlight />
                <HeroStat n="ice" l="agentcorn theme" />
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center gap-4 animate-fade-up [animation-delay:600ms]">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ice/30">
              powered by
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 opacity-60">
              {["wagmi", "viem", "Zama", "Next.js", "Nzuzo contracts"].map(
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

      <section className="relative px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            n="01"
            kicker="threat model"
            title={
              <>
                Public payroll leaks identity.
                <br />
                <em className="font-display italic text-brand-gradient">
                  Precision privacy fixes that.
                </em>
              </>
            }
          />
          <div className="grid md:grid-cols-2 gap-4 mt-12">
            <Card variant="problem">
              <CardKicker tone="bad">the problem</CardKicker>
              <h3 className="font-display text-3xl text-ice mb-6 leading-tight">
                Salary data and counterparties exposed on-chain.
              </h3>
              <ul className="space-y-3">
                {[
                  "Transparent balances reveal org burn rate",
                  "Employee wallets linkable across protocols",
                  "Legacy payroll SaaS is not verifiable by employees",
                  "No single UX that matches institutional ops tools",
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
              <CardKicker tone="good">the fix</CardKicker>
              <h3 className="font-display text-3xl text-ice mb-6 leading-tight">
                Encrypted inputs, confidential treasury, Nzuzo-grade dashboard.
              </h3>
              <ul className="space-y-3">
                {[
                  "FHE-encrypted salary commitments on deploy",
                  "Employer / employee role gates in-app",
                  "Payslip NFT trail without plaintext salaries",
                  "AgentCorn visual system for parity with your cron product",
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

      <section id="how" className="relative px-6 py-28">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-halftone opacity-30 [mask-image:linear-gradient(180deg,transparent,black_30%,black_70%,transparent)]"
        />
        <div className="relative max-w-6xl mx-auto">
          <SectionHeader
            n="02"
            kicker="execution flow"
            title={
              <>
                Fund → roster → run.
                <br />
                <span className="text-ice/40">No leaked salaries in the happy path.</span>
              </>
            }
          />

          <div className="grid md:grid-cols-2 gap-4 mt-12">
            {[
              {
                n: "01",
                t: "fund treasury",
                d: "Deposit confidential stablecoin into the payroll contract treasury handle.",
                badge: "treasury",
              },
              {
                n: "02",
                t: "add employees",
                d: "Encrypt salary amounts client-side; only handles + proofs hit the chain.",
                badge: "zama fhe",
              },
              {
                n: "03",
                t: "run payroll batch",
                d: "Employer triggers runPayroll; NFT payslips mint per employee policy.",
                badge: "settlement",
              },
              {
                n: "04",
                t: "canton handoff",
                d: "Swap RPC + contract bindings for Canton participant APIs — same UI shell.",
                badge: "roadmap",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="group relative gradient-border rounded-2xl bg-panel/40 backdrop-blur-sm p-7 transition-all hover:bg-panel/60 hover:-translate-y-0.5"
              >
                <div className="flex items-baseline justify-between mb-5">
                  <span className="font-display text-5xl text-brand-gradient leading-none">
                    {step.n}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-sky bg-sky/10 border border-sky/20 px-2.5 py-1 rounded-full">
                    {step.badge}
                  </span>
                </div>
                <h3 className="font-sans text-lg font-semibold text-ice mb-2">
                  {step.t}
                </h3>
                <p className="font-sans text-sm text-ice/55 leading-relaxed">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <section id="use" className="relative px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            n="03"
            kicker="use cases"
            title={
              <>
                What teams are{" "}
                <em className="font-display italic text-brand-gradient">
                  running
                </em>
                .
              </>
            }
            sub="treasury · compliance · remote payroll."
          />

          <div className="grid md:grid-cols-3 gap-4 mt-12">
            {[
              {
                n: "dao payroll",
                p: "If contributor counts swing weekly, pay from a shared treasury without exposing individual rates on-chain.",
                tag: "treasury",
              },
              {
                n: "contractor grid",
                p: "If invoices batch monthly, lock amounts in FHE and release on a single payroll run.",
                tag: "batch",
              },
              {
                n: "pilot → canton",
                p: "Prove the Nzuzo dashboard UX on Sepolia, then port signers to Canton parties.",
                tag: "migration",
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
            n="04"
            kicker="stack"
            title={
              <>
                Same contracts as Nzuzo.
                <br />
                <em className="font-display italic text-brand-gradient">
                  AgentCorn-grade presentation.
                </em>
              </>
            }
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12">
            {[
              { t: "Next.js", s: "app router" },
              { t: "wagmi / viem", s: "wallet + rpc" },
              { t: "Zama FHE", s: "encrypt / decrypt" },
              { t: "Nzuzo ABIs", s: "payroll + nft" },
              { t: "Sepolia", s: "dev network" },
              { t: "Canton", s: "target ledger" },
              { t: "Tailwind v4", s: "agentcorn tokens" },
              { t: "TypeScript", s: "end-to-end" },
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
            // open organization
          </div>
          <h2 className="font-display text-[clamp(40px,6vw,80px)] leading-[0.95] tracking-[-0.02em] mb-6">
            <span className="text-ice-gradient">Paste contract,</span>
            <br />
            <em className="font-display italic text-brand-gradient">
              launch dashboard.
            </em>
          </h2>
          <p className="font-sans text-base text-ice/55 leading-relaxed mb-10 max-w-md mx-auto">
            Connect on Sepolia for factory deploy. Shortcuts mirror the Nzuzo
            flow — only styling follows AgentCron.
          </p>

          <div className="gradient-border rounded-2xl bg-panel/50 backdrop-blur-xl p-8 text-left max-w-md mx-auto mb-8">
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-ice/40">
              payroll contract (0x…)
            </label>
            <input
              className="input-field font-mono mb-3"
              placeholder="0x…"
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
              className="btn-primary mb-6 w-full rounded-lg py-3 font-mono text-sm font-semibold"
            >
              Go to dashboard →
            </button>

            {!isConnected ? (
              <button
                type="button"
                onClick={() => connect()}
                disabled={isConnecting}
                className="btn-ghost mb-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-mono text-sm"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    connecting…
                  </>
                ) : (
                  "Connect wallet (factory deploy)"
                )}
              </button>
            ) : (
              <p className="mb-4 font-mono text-xs text-ice/45">
                {address?.slice(0, 6)}…{address?.slice(-4)}
              </p>
            )}

            {FACTORY_ADDRESS && deploymentFee !== undefined && isConnected && (
              <div className="border-t border-line pt-6">
                <p className="mb-3 font-mono text-xs text-ice/50">
                  Factory deploy fee {formatEther(deploymentFee as bigint)} ETH
                </p>
                {isWrongNetwork ? (
                  <button
                    type="button"
                    onClick={() => switchChain()}
                    className="btn-primary w-full rounded-lg py-2.5 font-mono text-sm"
                  >
                    Switch to Sepolia
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateOrg}
                    disabled={isConfirming}
                    className="btn-primary w-full rounded-lg py-2.5 font-mono text-sm font-semibold disabled:opacity-50"
                  >
                    {isConfirming ? "Confirming…" : "Deploy new payroll"}
                  </button>
                )}
              </div>
            )}
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
          <div className="flex items-center gap-6">
            <span className="text-ice/40 text-xs font-mono">
              nzuzo layout · agentcorn theme
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
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
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
  sub,
}: {
  n: string;
  kicker: string;
  title: ReactNode;
  sub?: string;
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
      {sub && (
        <p className="font-mono text-xs text-ice/40 mt-3 tracking-wider">
          {sub}
        </p>
      )}
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

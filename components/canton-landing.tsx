"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  allocateParty,
  partyToken,
  createContract,
  toDamlDecimalString,
  type PayrollOrganizationPayload,
} from "@/lib/canton";
import { cantonJsonApiConfigured } from "@/lib/canton/env";

export function CantonLanding() {
  const router = useRouter();

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
          <Link
            href="/dashboard"
            className="btn-primary inline-flex items-center font-mono font-semibold text-sm leading-7 px-10 py-2.5 rounded-lg"
          >
            dashboard
          </Link>
        </div>
      </nav>

      <section className="relative px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] overflow-hidden">
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
              employer payroll on canton
            </span>
          </div>

          <h1 className="font-display text-[clamp(34px,8vw,96px)] leading-tight tracking-[-0.02em] mb-8 sm:mb-10 animate-fade-up [animation-delay:120ms]">
            <span className="block text-ice-gradient">CantonPay</span>
            <span className="block">
              <em className="font-display italic text-brand-gradient">
                payroll control center
              </em>
            </span>
            <span className="block text-ice-gradient">for employers and employees.</span>
          </h1>

          <div className="max-w-2xl mx-auto flex justify-center w-full pl-0 sm:pl-8">
            <p className="font-sans text-right sm:text-center text-sm sm:text-base md:text-lg text-ice/60 leading-8 animate-fade-up [animation-delay:240ms]">
              A premium fund management and governance analytics platform built on the Canton Network.
              Canton Analytics leverages Daml smart contracts to enforce multi-party voting,
              secure treasury operations, and real-time execution pipelines with party-scoped privacy.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 backdrop-blur-md">
        <div
          className="max-w-7xl mx-auto flex items-center justify-center gap-4"
          style={{ maxWidth: "80rem", margin: "0 auto", width: "100%" }}
        >

        </div>
      </footer>
    </main>
  );
}

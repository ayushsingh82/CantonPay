"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { usePayroll } from "@/hooks/usePayroll";
import { useCantonAuth } from "@/contexts/canton-auth";
import { RoleGate } from "@/components/RoleGate";
import { Sidebar } from "@/components/Sidebar";
import { AddEmployeeModal } from "@/components/AddEmployeeModal";
import { PayrollTerminal } from "@/components/PayrollTerminal";
import { PayrollConfirmationModal } from "@/components/PayrollConfirmationModal";
import { BalanceCard } from "@/components/BalanceCard";
import { SendTokensModal } from "@/components/SendTokensModal";
import { FundTreasuryModal } from "@/components/FundTreasuryModal";

import { DashboardView } from "@/views/DashboardView";
import { EmployeesView } from "@/views/EmployeesView";
import { TransactionsView } from "@/views/TransactionsView";
import { SettingsView } from "@/views/SettingsView";
import { NotAuthorized } from "@/views/NotAuthorized";
import { PayslipsView } from "@/views/PayslipsView";
import { Loader2 } from "lucide-react";
import { damlPackageConfigured } from "@/lib/canton/config";

function isLikelyOrgId(id: string) {
  return id.length >= 8;
}

export function PayrollApp() {
  const params = useParams<{ contractAddress: string }>();
  const orgContractId = params.contractAddress as string;
  const { partyId, token, logout, network } = useCantonAuth();

  const payroll = usePayroll(orgContractId);

  const isEmployer = useMemo(
    () => !!(partyId && payroll.organization?.payload.employer === partyId),
    [partyId, payroll.organization],
  );

  const isEmployee = useMemo(
    () =>
      !!(
        partyId &&
        payroll.employmentRows.some((r) => r.payload.employee === partyId)
      ),
    [partyId, payroll.employmentRows],
  );

  const [treasuryBalance, setTreasuryBalance] = useState("••••••");
  const [isTreasuryRevealed, setIsTreasuryRevealed] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isPayrollConfirmOpen, setIsPayrollConfirmOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleRunPayroll = async () => {
    if (!isEmployer || payroll.isPending) return;
    setIsPayrollConfirmOpen(true);
  };

  const executePayroll = async () => {
    try {
      setIsTerminalOpen(true);
      await payroll.runPayroll();
    } catch (err) {
      console.error("[PayrollApp] Run payroll failed:", err);
      throw err;
    }
  };

  const handleRevealTreasury = useCallback(() => {
    if (payroll.treasuryBalanceDisplay) {
      setTreasuryBalance(payroll.treasuryBalanceDisplay);
      setIsTreasuryRevealed(true);
    }
  }, [payroll.treasuryBalanceDisplay]);

  const handleHideTreasury = useCallback(() => {
    setTreasuryBalance("••••••");
    setIsTreasuryRevealed(false);
  }, []);

  if (!isLikelyOrgId(orgContractId)) {
    return <NotAuthorized message="Invalid organization contract id" />;
  }

  if (!payroll.hasLedger) {
    return (
      <NotAuthorized
        message={`No JSON API URL for ${network.label}. Set NEXT_PUBLIC_CANTON_JSON_API_URL (sandbox) or NEXT_PUBLIC_CANTON_TESTNET_JSON_API_URL (CC DevNet) in .env.local.`}
      />
    );
  }

  if (!token || !partyId) {
    return <RoleGate>{null}</RoleGate>;
  }

  if (
    payroll.isLoading &&
    !payroll.organization &&
    payroll.employmentRows.length === 0
  ) {
    return (
      <div
        className="app-layout"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div className="lock-grid-bg" />
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            color: "var(--text-tertiary)",
          }}
        >
          <Loader2 className="animate-spin" size={24} />
          <span>Loading ledger…</span>
        </div>
      </div>
    );
  }

  if (payroll.isDemo) {
    return (
      <NotAuthorized
        message={`Active wallet is a demo party. The Canton JSON API at ${network.jsonApiUrl} wasn't reachable when you connected, so no real org can be loaded. Start a sandbox there, then disconnect and reconnect the wallet from the landing page.`}
      />
    );
  }

  if (!isEmployer && !isEmployee) {
    return (
      <NotAuthorized message="Your party is not part of this payroll organization" />
    );
  }

  return (
    <div className="app-layout">
      <div className="lock-grid-bg" />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        partyId={partyId}
        onLogout={logout}
        isEmployer={isEmployer}
      />

      <main className="main-content">
        {!damlPackageConfigured() ? (
          <div
            className="w-full border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-[13px] text-amber-200/90"
            role="status"
          >
            <strong className="text-amber-300">Daml package id not set.</strong>{" "}
            Add{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">
              NEXT_PUBLIC_DAML_PACKAGE_ID
            </code>{" "}
            to <code className="font-mono text-xs">.env.local</code> after{" "}
            <code className="font-mono text-xs">daml build</code> — without it,
            template IDs won&apos;t match the sandbox JSON API.
          </div>
        ) : null}
        <div className="main-content-panel">
          {activeTab === "dashboard" && (
            <DashboardView
              treasuryBalance={treasuryBalance}
              isTreasuryRevealed={isTreasuryRevealed}
              isDecryptingTreasury={false}
              employeeCount={payroll.employeeAddresses.length}
              lastPayroll={
                payroll.organization?.payload.lastPayrollRun
                  ? "Recorded"
                  : "—"
              }
              onRevealTreasury={handleRevealTreasury}
              onHideTreasury={handleHideTreasury}
              isEmployer={isEmployer}
              onRunPayroll={handleRunPayroll}
              onAddEmployee={() => setIsAddModalOpen(true)}
              onFundTreasury={() => setIsFundModalOpen(true)}
              isPayrollRunning={payroll.isPending}
              orgContractId={orgContractId}
              payrollCooldown={payroll.payrollCooldown}
              lastPayrollRun={payroll.lastPayrollRun}
            />
          )}

          {activeTab === "employees" && (
            <EmployeesView
              employmentRows={payroll.employmentRows}
              addresses={payroll.employeeAddresses}
              isEmployer={isEmployer}
              onRemove={payroll.removeEmployee}
              isLoading={payroll.isLoading}
              walletAddress={partyId || ""}
              orgContractId={orgContractId}
              onAddClick={() => setIsAddModalOpen(true)}
              onRunPayroll={handleRunPayroll}
              payrollCooldown={payroll.payrollCooldown}
              lastPayrollRun={payroll.lastPayrollRun}
            />
          )}

          {activeTab === "transactions" && (
            <TransactionsView orgContractId={orgContractId} />
          )}

          {activeTab === "settings" && (
            <SettingsView
              address={partyId || ""}
              role={isEmployer ? "Employer" : "Employee"}
              orgContractId={orgContractId}
            />
          )}

          {activeTab === "payslips" && <PayslipsView />}
        </div>

        <BalanceCard
          walletAddress={partyId || ""}
          onSendClick={() => setIsSendModalOpen(true)}
        />
      </main>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (hint, sal) => {
          await payroll.addEmployee(hint, Number(sal));
        }}
        isLive={payroll.hasLedger}
      />

      <PayrollTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        ledgerSummary={payroll.lastLedgerResponse}
        isLive={true}
      />

      <SendTokensModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        senderAddress={partyId || ""}
      />

      <FundTreasuryModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        onFund={async (amt) => {
          await payroll.fundTreasury(amt);
        }}
        onSetBalance={async (bal) => {
          await payroll.updateTreasuryBalance(bal);
        }}
        currency={
          payroll.organization?.payload.currency ?? network.currency
        }
        currentBalance={payroll.treasuryBalanceDisplay ?? undefined}
      />

      <PayrollConfirmationModal
        isOpen={isPayrollConfirmOpen}
        onClose={() => setIsPayrollConfirmOpen(false)}
        onConfirm={executePayroll}
        employeeCount={payroll.employeeAddresses.length}
        isProcessing={payroll.isPending}
      />
    </div>
  );
}

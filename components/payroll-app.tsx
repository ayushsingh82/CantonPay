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

function isLikelyOrgId(id: string) {
  return id.length >= 8;
}

export function PayrollApp() {
  const params = useParams<{ contractAddress: string }>();
  const orgContractId = params.contractAddress as string;
  const { partyId, token, login, logout } = useCantonAuth();

  const payroll = usePayroll(orgContractId);

  const isEmployer = useMemo(
    () =>
      !!(partyId && payroll.rawOrg?.payload.employer === partyId),
    [partyId, payroll.rawOrg],
  );

  const isEmployee = useMemo(
    () =>
      !!(partyId &&
        payroll.employmentRows.some((r) => r.payload.employee === partyId)),
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
    if (!isEmployer || payroll.isTxPending) return;
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
      <NotAuthorized message="Set NEXT_PUBLIC_CANTON_JSON_API_URL to your Canton JSON API (e.g. http://localhost:7575)." />
    );
  }

  if (!token || !partyId) {
    return <RoleGate>{null}</RoleGate>;
  }

  if (payroll.isLoadingEmployees && !payroll.rawOrg && payroll.employmentRows.length === 0) {
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

  if (!isEmployer && !isEmployee) {
    return <NotAuthorized message="Your party is not part of this payroll organization" />;
  }

  return (
    <div className="app-layout">
      <div className="lock-grid-bg" />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        wallet={{
          address: partyId ?? undefined,
          isConnected: !!partyId,
          isConnecting: false,
          connect: () => login("Employer"),
          disconnect: logout,
        }}
        isEmployer={isEmployer}
      />

      <main className="main-content">
        {activeTab === "dashboard" && (
          <DashboardView
            treasuryBalance={treasuryBalance}
            isTreasuryRevealed={isTreasuryRevealed}
            isDecryptingTreasury={false}
            employeeCount={payroll.employeeAddresses.length}
            lastPayroll={
              payroll.rawOrg?.payload.lastPayrollRun
                ? "Recorded"
                : "—"
            }
            onRevealTreasury={handleRevealTreasury}
            onHideTreasury={handleHideTreasury}
            isEmployer={isEmployer}
            onRunPayroll={handleRunPayroll}
            onAddEmployee={() => setIsAddModalOpen(true)}
            onFundTreasury={() => setIsFundModalOpen(true)}
            isPayrollRunning={payroll.isTxPending}
            contractAddress={orgContractId as `0x${string}`}
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
            isLoading={payroll.isLoadingEmployees}
            walletAddress={partyId || ""}
            contractAddress={orgContractId}
            onAddClick={() => setIsAddModalOpen(true)}
            onRunPayroll={handleRunPayroll}
            payrollCooldown={payroll.payrollCooldown}
            lastPayrollRun={payroll.lastPayrollRun}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionsView contractAddress={orgContractId as `0x${string}`} />
        )}

        {activeTab === "settings" && (
          <SettingsView
            address={partyId || ""}
            role={isEmployer ? "Employer" : "Employee"}
            contractAddress={orgContractId as `0x${string}`}
          />
        )}

        {activeTab === "payslips" && (
          <PayslipsView />
        )}

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
        txHash={payroll.txHash}
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
        onFund={async (bal) => {
          await payroll.updateTreasuryBalance(bal);
        }}
      />

      <PayrollConfirmationModal
        isOpen={isPayrollConfirmOpen}
        onClose={() => setIsPayrollConfirmOpen(false)}
        onConfirm={executePayroll}
        employeeCount={payroll.employeeAddresses.length}
        isProcessing={payroll.isTxPending}
      />
    </div>
  );
}

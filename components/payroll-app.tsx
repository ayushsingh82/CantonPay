"use client";

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAccount, useReadContract } from "wagmi";
import { useParams } from "next/navigation";
import { isAddress } from "viem";
import { usePayroll } from "@/hooks/usePayroll";
import { useFhevm } from "@/hooks/useFhevm";
import { useFaucet } from "@/hooks/useFaucet";
import { useWallet } from "@/hooks/useWallet";
import { RoleGate } from "@/components/RoleGate";
import { Sidebar } from "@/components/Sidebar";
import { AddEmployeeModal } from "@/components/AddEmployeeModal";
import { PayrollTerminal } from "@/components/PayrollTerminal";
import { PayrollConfirmationModal } from "@/components/PayrollConfirmationModal";
import { BalanceCard } from "@/components/BalanceCard";
import { SendTokensModal } from "@/components/SendTokensModal";
import { FundTreasuryModal } from "@/components/FundTreasuryModal";
import { PAYROLL_ABI } from "@/lib/contracts";

import { DashboardView } from "@/views/DashboardView";
import { EmployeesView } from "@/views/EmployeesView";
import { TransactionsView } from "@/views/TransactionsView";
import { SettingsView } from "@/views/SettingsView";
import { NotAuthorized } from "@/views/NotAuthorized";
import { PayslipsView } from "@/views/PayslipsView";
import { Loader2 } from "lucide-react";

export function PayrollApp() {
  const params = useParams<{ contractAddress: string }>();
  const contractAddress = params.contractAddress as string;
  const wallet = useAccount();
  const { connect, disconnect } = useWallet();
  const {
    requestMUSDC,
    isLoading: isFaucetLoading,
    status: faucetStatus,
    message: faucetMessage,
  } = useFaucet();

  const fhevm = useFhevm();
  const hasDecryptedRef = useRef(false);

  const isValidOrg = useMemo(() => {
    return !!(contractAddress && isAddress(contractAddress));
  }, [contractAddress]);

  const payroll = usePayroll(contractAddress as `0x${string}`);

  const { data: isEmployeeRecord, isLoading: isLoadingEmployeeCheck } =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: PAYROLL_ABI,
      functionName: "isEmployee",
      args: [wallet.address as `0x${string}`],
      query: { enabled: !!wallet.address && !!isValidOrg },
    });

  const isEmployer = useMemo(() => {
    if (!wallet.address || !payroll.employer) return false;
    return wallet.address.toLowerCase() === payroll.employer.toLowerCase();
  }, [wallet.address, payroll.employer]);

  const isEmployee = isEmployeeRecord === true;

  const [isTreasuryRevealed, setIsTreasuryRevealed] = useState(false);
  const [treasuryBalance, setTreasuryBalance] = useState<string>("••••••");
  const [isDecryptingTreasury, setIsDecryptingTreasury] = useState(false);

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

  const handleRevealTreasury = useCallback(async () => {
    if (isTreasuryRevealed || isDecryptingTreasury) return;

    setTreasuryBalance("Syncing...");
    setIsDecryptingTreasury(true);
    hasDecryptedRef.current = false;

    try {
      await payroll.syncTreasuryAllowance();
    } catch (err) {
      console.error("[PayrollApp] Sync failed:", err);
      setTreasuryBalance("Error");
      setIsDecryptingTreasury(false);
    }
  }, [payroll, isTreasuryRevealed, isDecryptingTreasury]);

  const handleHideTreasury = useCallback(() => {
    setTreasuryBalance("••••••");
    setIsTreasuryRevealed(false);
    hasDecryptedRef.current = false;
  }, []);

  useEffect(() => {
    if (isDecryptingTreasury && payroll.isConfirmed && !hasDecryptedRef.current) {
      hasDecryptedRef.current = true;
      (async () => {
        try {
          const { data: freshHandle } = await payroll.refetchTreasury();
          if (!freshHandle) throw new Error("Failed to fetch fresh treasury handle");
          const clear = await fhevm.decryptPublic(freshHandle as bigint);
          setTreasuryBalance(`${clear.toLocaleString()} USDC`);
          setIsTreasuryRevealed(true);
        } catch (err) {
          console.error("[PayrollApp] Public decryption error:", err);
          setTreasuryBalance("Error");
        } finally {
          setIsDecryptingTreasury(false);
        }
      })();
    }
  }, [
    isDecryptingTreasury,
    payroll.isConfirmed,
    payroll.refetchTreasury,
    fhevm.decryptPublic,
  ]);

  if (!isValidOrg) {
    return <NotAuthorized message="Invalid organization address" />;
  }

  if (!wallet.isConnected) {
    return <RoleGate>{null}</RoleGate>;
  }

  if (isLoadingEmployeeCheck || !payroll.employer) {
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
          <span>Verifying credentials...</span>
        </div>
      </div>
    );
  }

  if (!isEmployer && !isEmployee) {
    return <NotAuthorized message="You are not part of this organization" />;
  }

  return (
    <div className="app-layout">
      <div className="lock-grid-bg" />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        wallet={{
          address: wallet.address,
          isConnected: wallet.isConnected,
          isConnecting: wallet.isConnecting,
          connect,
          disconnect,
        }}
        isEmployer={isEmployer}
      />

      <main className="main-content">
        {activeTab === "dashboard" && (
          <DashboardView
            treasuryBalance={treasuryBalance}
            isTreasuryRevealed={isTreasuryRevealed}
            isDecryptingTreasury={isDecryptingTreasury}
            employeeCount={payroll.employeeAddresses.length}
            lastPayroll={payroll.isConfirmed ? "Just now" : "Synced"}
            onRevealTreasury={handleRevealTreasury}
            onHideTreasury={handleHideTreasury}
            isEmployer={isEmployer}
            onRunPayroll={handleRunPayroll}
            onAddEmployee={() => setIsAddModalOpen(true)}
            onFundTreasury={() => setIsFundModalOpen(true)}
            isPayrollRunning={payroll.isTxPending || payroll.isConfirming}
            contractAddress={contractAddress as `0x${string}`}
            payrollCooldown={payroll.payrollCooldown}
            lastPayrollRun={payroll.lastPayrollRun}
            faucetRequest={requestMUSDC}
            isFaucetLoading={isFaucetLoading}
            faucetStatus={faucetStatus}
            faucetMessage={faucetMessage}
          />
        )}

        {activeTab === "employees" && (
          <EmployeesView
            addresses={payroll.employeeAddresses}
            isEmployer={isEmployer}
            onRemove={payroll.removeEmployee}
            isLoading={payroll.isLoadingEmployees}
            walletAddress={wallet.address || ""}
            contractAddress={contractAddress as `0x${string}`}
            nftAddress={payroll.nftAddress}
            onAddClick={() => setIsAddModalOpen(true)}
            onRunPayroll={handleRunPayroll}
            payrollCooldown={payroll.payrollCooldown}
            lastPayrollRun={payroll.lastPayrollRun}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionsView contractAddress={contractAddress as `0x${string}`} />
        )}

        {activeTab === "settings" && (
          <SettingsView
            address={wallet.address || ""}
            role={isEmployer ? "Employer" : "Employee"}
            contractAddress={contractAddress as `0x${string}`}
          />
        )}

        {activeTab === "payslips" && payroll.nftAddress && (
          <PayslipsView nftAddress={payroll.nftAddress} />
        )}

        <BalanceCard
          walletAddress={wallet.address || ""}
          onSendClick={() => setIsSendModalOpen(true)}
        />
      </main>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (addr, sal) => {
          await payroll.addEmployee(addr, Number(sal), wallet.address!);
        }}
        isLive={true}
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
        senderAddress={wallet.address || ""}
      />

      <FundTreasuryModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        contractAddress={contractAddress as `0x${string}`}
        walletAddress={wallet.address as `0x${string}`}
        onSuccess={async () => {
          await payroll.refetchTreasury();
        }}
        syncTreasury={payroll.syncTreasuryAllowance}
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

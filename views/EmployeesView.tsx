"use client";

import type { EmploymentContractPayload } from "@/lib/canton";
import { EmployeeList } from "@/components/EmployeeList";
import { Plus } from "lucide-react";

interface EmployeesViewProps {
  employmentRows: { cid: string; payload: EmploymentContractPayload }[];
  addresses: string[];
  isEmployer: boolean;
  onRemove: (employmentCid: string) => Promise<void>;
  isLoading: boolean;
  walletAddress: string;
  orgContractId: string;
  onAddClick: () => void;
  onRunPayroll: () => void;
  payrollCooldown?: bigint;
  lastPayrollRun?: bigint;
}

export function EmployeesView({
  employmentRows,
  addresses,
  isEmployer,
  onRemove,
  isLoading,
  walletAddress,
  orgContractId,
  onAddClick,
  onRunPayroll,
  payrollCooldown,
  lastPayrollRun,
}: EmployeesViewProps) {
  const isCooldownActive = !!(
    payrollCooldown &&
    lastPayrollRun &&
    BigInt(Math.floor(Date.now() / 1000)) < lastPayrollRun + payrollCooldown
  );

  const getRemainingTime = () => {
    if (!isCooldownActive) return "";
    const nextTime =
      Number(lastPayrollRun ?? BigInt(0)) +
      Number(payrollCooldown ?? BigInt(0));
    const diff = nextTime - Math.floor(Date.now() / 1000);
    if (diff <= 0) return "";

    const hours = Math.floor(diff / 3600);
    const minutes = Math.ceil((diff % 3600) / 60);

    if (hours > 0) return ` (${hours}h ${minutes}m)`;
    return ` (${minutes}m)`;
  };
  return (
    <div
      className="content-body"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "24px 24px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
          Team roster
        </h2>
        <div style={{ display: "flex", gap: "12px" }}>
          {isEmployer && (
            <>
              <button
                type="button"
                className="send-action-btn"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-hairline)",
                  color: "var(--text-primary)",
                  opacity: isCooldownActive ? 0.6 : 1,
                }}
                onClick={onRunPayroll}
                disabled={isCooldownActive}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="14"
                  height="14"
                  style={{ marginRight: "6px" }}
                >
                  <polygon points="5,3 19,12 5,21 5,3" />
                </svg>
                {isCooldownActive
                  ? `Cooldown${getRemainingTime()}`
                  : "Run payroll"}
              </button>
              <button type="button" className="send-action-btn" onClick={onAddClick}>
                <Plus size={14} style={{ marginRight: "6px" }} />
                Add employee
              </button>
            </>
          )}
        </div>
      </div>
      <EmployeeList
        employmentRows={employmentRows}
        addresses={addresses}
        isEmployer={isEmployer}
        onRemove={onRemove}
        isLoading={isLoading}
        walletAddress={walletAddress}
        orgContractId={orgContractId}
      />
    </div>
  );
}

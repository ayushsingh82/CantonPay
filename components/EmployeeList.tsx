"use client";

import type { EmploymentContractPayload } from "@/lib/canton";
import { EmployeeTable } from "./EmployeeTable";

interface EmployeeListProps {
  employmentRows: { cid: string; payload: EmploymentContractPayload }[];
  addresses: string[];
  isEmployer: boolean;
  onRemove: (employmentCid: string) => Promise<void>;
  isLoading: boolean;
  walletAddress: string;
  orgContractId: string;
}

export function EmployeeList({
  employmentRows,
  addresses,
  isEmployer,
  onRemove,
  isLoading,
  walletAddress,
  orgContractId,
}: EmployeeListProps) {
  const handleFire = async (employmentCid: string) => {
    try {
      await onRemove(employmentCid);
    } catch (err) {
      console.error("Failed to remove employee:", err);
    }
  };

  return (
    <div className="employee-list-root">
      <EmployeeTable
        employmentRows={employmentRows}
        addresses={addresses}
        isEmployer={isEmployer}
        isLoading={isLoading}
        onFire={handleFire}
        walletAddress={walletAddress}
        orgContractId={orgContractId}
      />
    </div>
  );
}

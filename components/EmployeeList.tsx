"use client";

import type { EmploymentContractPayload } from "@/lib/payroll-types";
import { EmployeeTable } from "./EmployeeTable";

interface EmployeeListProps {
  employmentRows: { cid: string; payload: EmploymentContractPayload }[];
  addresses: string[];
  isEmployer: boolean;
  onRemove: (employmentCid: string) => Promise<string>;
  isLoading: boolean;
  walletAddress: string;
  contractAddress: string;
}

export function EmployeeList({
  employmentRows,
  addresses,
  isEmployer,
  onRemove,
  isLoading,
  walletAddress,
  contractAddress,
}: EmployeeListProps) {
  const handleFire = async (employmentCid: string) => {
    try {
      await onRemove(employmentCid);
    } catch (err) {
      console.error("Failed to remove employee:", err);
    }
  };

  return (
    <EmployeeTable
      employmentRows={employmentRows}
      addresses={addresses}
      isEmployer={isEmployer}
      isLoading={isLoading}
      onFire={handleFire}
      walletAddress={walletAddress}
      contractAddress={contractAddress}
    />
  );
}

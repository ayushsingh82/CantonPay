"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createContract,
  exerciseChoice,
  fetchContract,
  queryContracts,
  allocateParty,
} from "@/lib/canton-client";
import type {
  EmploymentContractPayload,
  PayrollOrganizationPayload,
} from "@/lib/payroll-types";
import { useCantonAuth } from "@/contexts/canton-auth";

function hasJsonApi(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CANTON_JSON_API_URL);
}

function parseRunUnix(iso: string): bigint {
  if (!iso) return 0n;
  const t = Date.parse(iso);
  return BigInt(Number.isFinite(t) ? Math.floor(t / 1000) : 0);
}

/** Canton Ledger JSON API + Daml `Payroll` module (no wagmi / no FHEVM). */
export function usePayroll(orgContractId: string) {
  const { partyId, token } = useCantonAuth();

  const [org, setOrg] = useState<{
    cid: string;
    payload: PayrollOrganizationPayload;
  } | null>(null);
  const [employees, setEmployees] = useState<
    { cid: string; payload: EmploymentContractPayload }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [lastTxSummary, setLastTxSummary] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token || !orgContractId || !hasJsonApi()) {
      setOrg(null);
      setEmployees([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const allEmp = await queryContracts<EmploymentContractPayload>(
        "EmploymentContract",
        token,
      );
      const forOrg = allEmp.filter(
        (c) => c.payload.payrollOrgCid === orgContractId,
      );
      setEmployees(forOrg);

      const o = await fetchContract<PayrollOrganizationPayload>(
        "PayrollOrganization",
        orgContractId,
        token,
      );
      if (o) {
        setOrg({ cid: o.contractId, payload: o.payload });
      } else {
        setOrg(null);
        if (forOrg.length === 0) {
          setError(
            "No visibility to this org contract. Log in as employer/operator, or as an employee with a roster line.",
          );
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setOrg(null);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [token, orgContractId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const employerParty = org?.payload.employer;

  const employeePartyIds = useMemo(
    () => employees.map((e) => e.payload.employee),
    [employees],
  );

  const runPayroll = useCallback(async () => {
    if (!token || !org) throw new Error("Organization not loaded");
    setPending(true);
    try {
      const runAt = new Date().toISOString();
      const res = await exerciseChoice(
        "PayrollOrganization",
        org.cid,
        "RunPayroll",
        { runAt },
        token,
      );
      setLastTxSummary(JSON.stringify(res).slice(0, 120));
      await refresh();
    } finally {
      setPending(false);
    }
  }, [token, org, refresh]);

  const addEmployee = useCallback(
    async (employeeHint: string, salaryAmount: number) => {
      if (!token || !org) throw new Error("Organization not loaded");
      const employeeParty = employeeHint.includes("::")
        ? employeeHint
        : await allocateParty(employeeHint);
      setPending(true);
      try {
        await exerciseChoice(
          "PayrollOrganization",
          org.cid,
          "AddEmployee",
          {
            employee: employeeParty,
            salary: String(salaryAmount),
            payrollOrgCid: orgContractId,
          },
          token,
        );
        await refresh();
      } finally {
        setPending(false);
      }
    },
    [token, org, orgContractId, refresh],
  );

  const removeEmployee = useCallback(
    async (employmentContractId: string) => {
      if (!token) throw new Error("Not authenticated");
      setPending(true);
      try {
        await exerciseChoice(
          "EmploymentContract",
          employmentContractId,
          "RemoveEmployee",
          {},
          token,
        );
        await refresh();
      } finally {
        setPending(false);
      }
    },
    [token, refresh],
  );

  const syncTreasuryAllowance = useCallback(async () => {
    await refresh();
    return "ok";
  }, [refresh]);

  const updateTreasuryBalance = useCallback(
    async (newBalance: string) => {
      if (!token || !org) throw new Error("Organization not loaded");
      setPending(true);
      try {
        await exerciseChoice(
          "PayrollOrganization",
          org.cid,
          "UpdateTreasuryFromEmployer",
          { newBalance },
          token,
        );
        await refresh();
      } finally {
        setPending(false);
      }
    },
    [token, org, refresh],
  );

  const createOrganization = useCallback(
    async (input: {
      employerParty: string;
      operatorParty: string;
      orgLabel: string;
      currency?: string;
    }) => {
      if (!token) throw new Error("Login first");
      setPending(true);
      try {
        const result = await createContract<PayrollOrganizationPayload>(
          "PayrollOrganization",
          {
            employer: input.employerParty,
            operator: input.operatorParty,
            currency: input.currency ?? "CC",
            treasuryBalance: "0.0",
            payrollCooldownSeconds: 86400,
            lastPayrollRun: "",
            orgLabel: input.orgLabel,
          },
          token,
        );
        return result.contractId;
      } finally {
        setPending(false);
      }
    },
    [token],
  );

  return {
    employer: employerParty,
    operator: org?.payload.operator,
    tokenAddress: undefined as `0x${string}` | undefined,
    nftAddress: undefined as `0x${string}` | undefined,
    employeeAddresses: employeePartyIds,
    employmentRows: employees,
    isLoadingEmployees: loading,
    refetchEmployees: refresh,

    txHash: lastTxSummary as unknown as `0x${string}` | undefined,
    isTxPending: pending,
    isConfirming: false,
    isConfirmed: false,

    addEmployee,
    removeEmployee,
    runPayroll,
    grantSalaryAccess: async () => "",
    syncTreasuryAllowance,
    updateSalary: async () => "",
    payBonus: async () => "",
    setPayrollCooldown: async () => "",
    createOrganization,
    updateTreasuryBalance,

    payrollCooldown: org?.payload.payrollCooldownSeconds
      ? BigInt(org.payload.payrollCooldownSeconds)
      : undefined,
    lastPayrollRun: org?.payload.lastPayrollRun
      ? parseRunUnix(org.payload.lastPayrollRun)
      : undefined,

    treasuryHandle: undefined,
    refetchTreasury: refresh,

    rawOrg: org,
    contractAddress: orgContractId as `0x${string}`,
    isConfigured: !!org || employees.length > 0,
    error,
    hasLedger: hasJsonApi(),
    treasuryBalanceDisplay: org
      ? `${org.payload.treasuryBalance} ${org.payload.currency}`
      : null,
  };
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addEmployeeChoice,
  createPayrollOrganization,
  fundTreasuryChoice,
  loadPayrollState,
  parseLastPayrollInstant,
  removeEmployeeChoice,
  runPayrollChoice,
  sumRosterSalaries,
  updateTreasuryChoice,
  type EmploymentContractRow,
  type PayrollOrgContract,
} from "@/lib/canton";
import { useCantonAuth } from "@/contexts/canton-auth";

/**
 * React state + actions for the payroll org identified by `orgContractId` (ledger contract id).
 * Domain logic lives in `lib/canton/payroll-ledger.ts`.
 */
export function usePayroll(orgContractId: string) {
  const { token, apiUrl, networkId, network, isDemo } = useCantonAuth();

  const [organization, setOrganization] = useState<PayrollOrgContract | null>(
    null,
  );
  const [employmentRows, setEmploymentRows] = useState<
    EmploymentContractRow[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [lastLedgerResponse, setLastLedgerResponse] = useState<string | null>(
    null,
  );

  const ledgerOpts = useMemo(
    () => ({ apiUrl, networkId }),
    [apiUrl, networkId],
  );

  const hasLedger = useMemo(() => Boolean(apiUrl?.trim()), [apiUrl]);

  const requireRealLedger = useCallback(() => {
    if (isDemo) {
      throw new Error(
        "Active wallet is a demo party — start a Canton JSON API and reconnect to make ledger calls.",
      );
    }
  }, [isDemo]);

  const refresh = useCallback(async () => {
    if (!token || !orgContractId || !hasLedger) {
      setOrganization(null);
      setEmploymentRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { organization: org, employments } = await loadPayrollState(
        token,
        orgContractId,
        ledgerOpts,
      );
      setEmploymentRows(employments);
      if (org) {
        setOrganization(org);
      } else {
        setOrganization(null);
        if (employments.length === 0) {
          setError(
            "No visibility to this org contract. Log in as employer/operator, or as an employee with a roster line.",
          );
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setOrganization(null);
      setEmploymentRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, orgContractId, hasLedger, ledgerOpts]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const employeePartyIds = useMemo(
    () => employmentRows.map((e) => e.payload.employee),
    [employmentRows],
  );

  const totalPayroll = useMemo(
    () => sumRosterSalaries(employmentRows),
    [employmentRows],
  );

  const runPayroll = useCallback(async () => {
    requireRealLedger();
    if (!token || !organization) throw new Error("Organization not loaded");
    setPending(true);
    try {
      const res = await runPayrollChoice(
        token,
        organization.cid,
        totalPayroll,
        ledgerOpts,
      );
      setLastLedgerResponse(JSON.stringify(res).slice(0, 160));
      await refresh();
    } finally {
      setPending(false);
    }
  }, [token, organization, totalPayroll, ledgerOpts, refresh, requireRealLedger]);

  const addEmployee = useCallback(
    async (employeeHint: string, salaryAmount: number) => {
      requireRealLedger();
      if (!token || !organization) throw new Error("Organization not loaded");
      setPending(true);
      try {
        await addEmployeeChoice(
          token,
          organization.cid,
          orgContractId,
          employeeHint,
          salaryAmount,
          ledgerOpts,
        );
        await refresh();
      } finally {
        setPending(false);
      }
    },
    [token, organization, orgContractId, ledgerOpts, refresh, requireRealLedger],
  );

  const removeEmployee = useCallback(
    async (employmentContractId: string) => {
      requireRealLedger();
      if (!token) throw new Error("Not authenticated");
      setPending(true);
      try {
        await removeEmployeeChoice(token, employmentContractId, ledgerOpts);
        await refresh();
      } finally {
        setPending(false);
      }
    },
    [token, ledgerOpts, refresh, requireRealLedger],
  );

  const updateTreasuryBalance = useCallback(
    async (newBalance: string) => {
      requireRealLedger();
      if (!token || !organization) throw new Error("Organization not loaded");
      setPending(true);
      try {
        await updateTreasuryChoice(
          token,
          organization.cid,
          newBalance,
          ledgerOpts,
        );
        await refresh();
      } finally {
        setPending(false);
      }
    },
    [token, organization, ledgerOpts, refresh, requireRealLedger],
  );

  const fundTreasury = useCallback(
    async (addAmount: string) => {
      requireRealLedger();
      if (!token || !organization) throw new Error("Organization not loaded");
      setPending(true);
      try {
        await fundTreasuryChoice(
          token,
          organization.cid,
          addAmount,
          ledgerOpts,
        );
        await refresh();
      } finally {
        setPending(false);
      }
    },
    [token, organization, ledgerOpts, refresh, requireRealLedger],
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
        return await createPayrollOrganization(
          token,
          { ...input, currency: input.currency ?? network.currency },
          ledgerOpts,
        );
      } finally {
        setPending(false);
      }
    },
    [token, network.currency, ledgerOpts],
  );

  return {
    orgContractId,

    organization,
    employmentRows,
    employeeAddresses: employeePartyIds,

    employer: organization?.payload.employer,
    operator: organization?.payload.operator,

    refetch: refresh,
    isLoading: loading,
    error,
    isPending: pending,
    lastLedgerResponse,
    isDemo,

    runPayroll,
    addEmployee,
    removeEmployee,
    updateTreasuryBalance,
    fundTreasury,
    createOrganization,

    totalPayroll,

    payrollCooldown: organization?.payload.payrollCooldownSeconds
      ? BigInt(organization.payload.payrollCooldownSeconds)
      : undefined,
    lastPayrollRun: organization?.payload.lastPayrollRun
      ? parseLastPayrollInstant(organization.payload.lastPayrollRun)
      : undefined,

    treasuryBalanceDisplay: organization
      ? `${organization.payload.treasuryBalance} ${organization.payload.currency}`
      : null,

    hasLedger,
  };
}

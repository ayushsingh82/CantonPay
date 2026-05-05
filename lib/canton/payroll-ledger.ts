/**
 * Payroll Daml operations over the JSON API — no React; use from hooks or server code.
 *
 * Every helper accepts an optional `apiUrl` so the wallet's active network can
 * route the request to the right participant.
 */
import type {
  EmploymentContractPayload,
  PayrollOrganizationPayload,
} from "./types";
import { toDamlDecimalString } from "./daml-decimal";
import {
  allocateParty,
  createContract,
  exerciseChoice,
  fetchContract,
  queryContracts,
} from "./json-api-client";
import type { NetworkId } from "./networks";

export type PayrollOrgContract = {
  cid: string;
  payload: PayrollOrganizationPayload;
};

export type EmploymentContractRow = {
  cid: string;
  payload: EmploymentContractPayload;
};

export type LedgerCallOpts = {
  apiUrl?: string;
  networkId?: NetworkId;
};

export function parseLastPayrollInstant(iso: string): bigint {
  if (!iso) return BigInt(0);
  const t = Date.parse(iso);
  return BigInt(Number.isFinite(t) ? Math.floor(t / 1000) : 0);
}

/** Sum of salaries across visible employment rows (Decimal as Number — fine for demo amounts). */
export function sumRosterSalaries(rows: EmploymentContractRow[]): number {
  return rows.reduce((acc, row) => {
    const n = parseFloat(row.payload.salary);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
}

export async function loadPayrollState(
  token: string,
  orgContractId: string,
  opts: LedgerCallOpts = {},
): Promise<{
  organization: PayrollOrgContract | null;
  employments: EmploymentContractRow[];
}> {
  const allEmp = await queryContracts<EmploymentContractPayload>(
    "EmploymentContract",
    token,
    opts.apiUrl,
  );
  const employments = allEmp
    .filter((c) => c.payload.payrollOrgCid === orgContractId)
    .map((c) => ({ cid: c.contractId, payload: c.payload }));

  const raw = await fetchContract<PayrollOrganizationPayload>(
    "PayrollOrganization",
    orgContractId,
    token,
    opts.apiUrl,
  );
  const organization = raw
    ? { cid: raw.contractId, payload: raw.payload }
    : null;

  return { organization, employments };
}

export async function runPayrollChoice(
  token: string,
  orgCid: string,
  totalAmount: number,
  opts: LedgerCallOpts = {},
): Promise<unknown> {
  const now = new Date();
  const runAt = now.toISOString();
  const runAtUnix = Math.floor(now.getTime() / 1000);
  return exerciseChoice(
    "PayrollOrganization",
    orgCid,
    "RunPayroll",
    {
      runAt,
      runAtUnix,
      totalAmount: toDamlDecimalString(totalAmount),
    },
    token,
    opts.apiUrl,
  );
}

export async function addEmployeeChoice(
  token: string,
  orgCid: string,
  orgContractId: string,
  employeeHintOrId: string,
  salaryAmount: number,
  opts: LedgerCallOpts = {},
): Promise<unknown> {
  const employeeParty = employeeHintOrId.includes("::")
    ? employeeHintOrId
    : await allocateParty(employeeHintOrId, {
        apiUrl: opts.apiUrl,
        networkId: opts.networkId,
      });
  return exerciseChoice(
    "PayrollOrganization",
    orgCid,
    "AddEmployee",
    {
      employee: employeeParty,
      salary: toDamlDecimalString(salaryAmount),
      payrollOrgCid: orgContractId,
    },
    token,
    opts.apiUrl,
  );
}

export async function removeEmployeeChoice(
  token: string,
  employmentCid: string,
  opts: LedgerCallOpts = {},
): Promise<unknown> {
  return exerciseChoice(
    "EmploymentContract",
    employmentCid,
    "RemoveEmployee",
    {},
    token,
    opts.apiUrl,
  );
}

export async function updateTreasuryChoice(
  token: string,
  orgCid: string,
  newBalance: string,
  opts: LedgerCallOpts = {},
): Promise<unknown> {
  return exerciseChoice(
    "PayrollOrganization",
    orgCid,
    "UpdateTreasuryFromEmployer",
    { newBalance: toDamlDecimalString(newBalance) },
    token,
    opts.apiUrl,
  );
}

export async function fundTreasuryChoice(
  token: string,
  orgCid: string,
  addAmount: string,
  opts: LedgerCallOpts = {},
): Promise<unknown> {
  return exerciseChoice(
    "PayrollOrganization",
    orgCid,
    "FundTreasury",
    { addAmount: toDamlDecimalString(addAmount) },
    token,
    opts.apiUrl,
  );
}

export async function createPayrollOrganization(
  token: string,
  input: {
    employerParty: string;
    operatorParty: string;
    orgLabel: string;
    currency?: string;
  },
  opts: LedgerCallOpts = {},
): Promise<string> {
  const result = await createContract<PayrollOrganizationPayload>(
    "PayrollOrganization",
    {
      employer: input.employerParty,
      operator: input.operatorParty,
      currency: input.currency ?? "CC",
      treasuryBalance: toDamlDecimalString(0),
      payrollCooldownSeconds: 86400,
      lastPayrollRun: "",
      lastPayrollRunUnix: 0,
      orgLabel: input.orgLabel,
    },
    token,
    opts.apiUrl,
  );
  return result.contractId;
}

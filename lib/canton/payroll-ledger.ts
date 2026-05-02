/**
 * Payroll Daml operations over the JSON API — no React; use from hooks or server code.
 */
import type {
  EmploymentContractPayload,
  PayrollOrganizationPayload,
} from "./types";
import {
  allocateParty,
  createContract,
  exerciseChoice,
  fetchContract,
  queryContracts,
} from "./json-api-client";

/** Active `PayrollOrganization` contract row from the ledger. */
export type PayrollOrgContract = {
  cid: string;
  payload: PayrollOrganizationPayload;
};

/** Active `EmploymentContract` contract row from the ledger. */
export type EmploymentContractRow = {
  cid: string;
  payload: EmploymentContractPayload;
};

export function cantonJsonApiConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CANTON_JSON_API_URL);
}

export function parseLastPayrollInstant(iso: string): bigint {
  if (!iso) return BigInt(0);
  const t = Date.parse(iso);
  return BigInt(Number.isFinite(t) ? Math.floor(t / 1000) : 0);
}

export async function loadPayrollState(
  token: string,
  orgContractId: string,
): Promise<{
  organization: PayrollOrgContract | null;
  employments: EmploymentContractRow[];
}> {
  const allEmp = await queryContracts<EmploymentContractPayload>(
    "EmploymentContract",
    token,
  );
  const employments = allEmp
    .filter((c) => c.payload.payrollOrgCid === orgContractId)
    .map((c) => ({ cid: c.contractId, payload: c.payload }));

  const raw = await fetchContract<PayrollOrganizationPayload>(
    "PayrollOrganization",
    orgContractId,
    token,
  );
  const organization = raw
    ? { cid: raw.contractId, payload: raw.payload }
    : null;

  return { organization, employments };
}

export async function runPayrollChoice(
  token: string,
  orgCid: string,
): Promise<unknown> {
  const runAt = new Date().toISOString();
  return exerciseChoice(
    "PayrollOrganization",
    orgCid,
    "RunPayroll",
    { runAt },
    token,
  );
}

export async function addEmployeeChoice(
  token: string,
  orgCid: string,
  orgContractId: string,
  employeeHintOrId: string,
  salaryAmount: number,
): Promise<unknown> {
  const employeeParty = employeeHintOrId.includes("::")
    ? employeeHintOrId
    : await allocateParty(employeeHintOrId);
  return exerciseChoice(
    "PayrollOrganization",
    orgCid,
    "AddEmployee",
    {
      employee: employeeParty,
      salary: String(salaryAmount),
      payrollOrgCid: orgContractId,
    },
    token,
  );
}

export async function removeEmployeeChoice(
  token: string,
  employmentCid: string,
): Promise<unknown> {
  return exerciseChoice(
    "EmploymentContract",
    employmentCid,
    "RemoveEmployee",
    {},
    token,
  );
}

export async function updateTreasuryChoice(
  token: string,
  orgCid: string,
  newBalance: string,
): Promise<unknown> {
  return exerciseChoice(
    "PayrollOrganization",
    orgCid,
    "UpdateTreasuryFromEmployer",
    { newBalance },
    token,
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
): Promise<string> {
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
}

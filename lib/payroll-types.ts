/** JSON API payloads — Decimal fields arrive as strings. */
export type PayrollOrganizationPayload = {
  employer: string;
  operator: string;
  currency: string;
  treasuryBalance: string;
  payrollCooldownSeconds: number;
  lastPayrollRun: string;
  orgLabel: string;
};

export type EmploymentContractPayload = {
  payrollOrgCid: string;
  employer: string;
  operator: string;
  employee: string;
  salary: string;
  currency: string;
  orgLabel: string;
};

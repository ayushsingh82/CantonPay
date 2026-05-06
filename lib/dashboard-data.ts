// Realistic dashboard data used when no live Canton ledger is connected.
// Treat numbers as Decimal CC (Canton Coin) values.

export const ORG = {
  name: "Northwind Treasury Group",
  contractId: "0042f9c1a8b3::Payroll:PayrollOrganization#7a2c",
  employerParty: "Treasury::participant-eu-1",
  operatorParty: "Operator::canton-coordinator",
  currency: "CC",
  treasuryBalance: 248_500,
  cooldownSeconds: 86_400,
  // ISO timestamp of the most recent successful RunPayroll exercise.
  lastPayrollRunUtc: "2026-05-01T09:14:22Z",
};

export interface DemoEmployee {
  id: string;
  name: string;
  role: string;
  party: string;
  salary: number;
  hiredAt: string;
  status: "active" | "pending" | "inactive";
}

export const EMPLOYEES: DemoEmployee[] = [
  {
    id: "emp-001",
    name: "Maya Okonkwo",
    role: "Lead Engineer",
    party: "MayaOkonkwo::participant-eu-1",
    salary: 9_200,
    hiredAt: "2024-08-12",
    status: "active",
  },
  {
    id: "emp-002",
    name: "Daniel Pereira",
    role: "Backend Engineer",
    party: "DanielPereira::participant-eu-1",
    salary: 7_400,
    hiredAt: "2024-11-04",
    status: "active",
  },
  {
    id: "emp-003",
    name: "Aiko Tanaka",
    role: "Product Designer",
    party: "AikoTanaka::participant-eu-1",
    salary: 6_900,
    hiredAt: "2025-01-21",
    status: "active",
  },
  {
    id: "emp-004",
    name: "Felix Bauer",
    role: "Solidity Engineer",
    party: "FelixBauer::participant-eu-1",
    salary: 8_100,
    hiredAt: "2025-02-09",
    status: "active",
  },
  {
    id: "emp-005",
    name: "Priya Iyer",
    role: "Compliance Lead",
    party: "PriyaIyer::participant-eu-1",
    salary: 7_800,
    hiredAt: "2025-03-03",
    status: "active",
  },
  {
    id: "emp-006",
    name: "Tomás Reyes",
    role: "DevOps Engineer",
    party: "TomasReyes::participant-eu-1",
    salary: 6_600,
    hiredAt: "2025-06-17",
    status: "active",
  },
  {
    id: "emp-007",
    name: "Hana Šimić",
    role: "Daml Modeler",
    party: "HanaSimic::participant-eu-1",
    salary: 7_100,
    hiredAt: "2025-09-08",
    status: "active",
  },
  {
    id: "emp-008",
    name: "Ravi Banerjee",
    role: "Treasury Analyst",
    party: "RaviBanerjee::participant-eu-1",
    salary: 5_400,
    hiredAt: "2026-01-13",
    status: "pending",
  },
];

export interface PayrollRun {
  id: string;
  runAtUtc: string;
  totalAmount: number;
  recipients: number;
  status: "settled" | "executing" | "failed";
  txHash: string;
}

export const PAYROLL_RUNS: PayrollRun[] = [
  {
    id: "run-2026-05-01",
    runAtUtc: "2026-05-01T09:14:22Z",
    totalAmount: 58_500,
    recipients: 7,
    status: "settled",
    txHash: "0xa31e7c…b94f",
  },
  {
    id: "run-2026-04-15",
    runAtUtc: "2026-04-15T09:12:08Z",
    totalAmount: 58_500,
    recipients: 7,
    status: "settled",
    txHash: "0x18cd5a…2071",
  },
  {
    id: "run-2026-04-01",
    runAtUtc: "2026-04-01T09:10:41Z",
    totalAmount: 51_400,
    recipients: 6,
    status: "settled",
    txHash: "0x9b22ee…d418",
  },
  {
    id: "run-2026-03-15",
    runAtUtc: "2026-03-15T09:09:55Z",
    totalAmount: 51_400,
    recipients: 6,
    status: "settled",
    txHash: "0x3f8810…1cae",
  },
  {
    id: "run-2026-03-01",
    runAtUtc: "2026-03-01T09:08:11Z",
    totalAmount: 44_800,
    recipients: 5,
    status: "settled",
    txHash: "0xe44b91…02f5",
  },
];

export interface ActivityEvent {
  id: string;
  kind: "payroll" | "fund" | "hire" | "transfer" | "config";
  at: string;
  title: string;
  meta: string;
  amount?: number;
}

export const ACTIVITY: ActivityEvent[] = [
  {
    id: "act-001",
    kind: "payroll",
    at: "2026-05-01T09:14:22Z",
    title: "RunPayroll exercised",
    meta: "7 recipients · settled in 3 blocks",
    amount: 58_500,
  },
  {
    id: "act-002",
    kind: "hire",
    at: "2026-04-30T17:02:11Z",
    title: "Employment contract created",
    meta: "Ravi Banerjee · Treasury Analyst",
  },
  {
    id: "act-003",
    kind: "fund",
    at: "2026-04-29T11:48:55Z",
    title: "FundTreasury exercised",
    meta: "Top-up from operator",
    amount: 75_000,
  },
  {
    id: "act-004",
    kind: "config",
    at: "2026-04-22T08:31:19Z",
    title: "Cooldown updated",
    meta: "86400s → 86400s (no change)",
  },
  {
    id: "act-005",
    kind: "payroll",
    at: "2026-04-15T09:12:08Z",
    title: "RunPayroll exercised",
    meta: "7 recipients · settled in 2 blocks",
    amount: 58_500,
  },
  {
    id: "act-006",
    kind: "transfer",
    at: "2026-04-12T14:05:02Z",
    title: "Operator transfer",
    meta: "Outbound · refund to participant-eu-2",
    amount: 1_200,
  },
];

// Treasury balance series, weekly samples (oldest → newest).
// Enough to drive a sparkline without being noisy.
export const TREASURY_SERIES = [
  198_400, 184_900, 226_400, 209_300, 251_900, 232_400, 248_500,
];

export interface Payslip {
  id: string;
  employeeName: string;
  employeeParty: string;
  period: string;
  amount: number;
  issuedAt: string;
  status: "issued" | "paid";
}

export const PAYSLIPS: Payslip[] = [
  {
    id: "ps-2026-05-01-001",
    employeeName: "Maya Okonkwo",
    employeeParty: "MayaOkonkwo::participant-eu-1",
    period: "2026-05-01",
    amount: 9_200,
    issuedAt: "2026-05-01T09:14:23Z",
    status: "paid",
  },
  {
    id: "ps-2026-05-01-002",
    employeeName: "Daniel Pereira",
    employeeParty: "DanielPereira::participant-eu-1",
    period: "2026-05-01",
    amount: 7_400,
    issuedAt: "2026-05-01T09:14:24Z",
    status: "paid",
  },
  {
    id: "ps-2026-05-01-003",
    employeeName: "Aiko Tanaka",
    employeeParty: "AikoTanaka::participant-eu-1",
    period: "2026-05-01",
    amount: 6_900,
    issuedAt: "2026-05-01T09:14:25Z",
    status: "paid",
  },
  {
    id: "ps-2026-05-01-004",
    employeeName: "Felix Bauer",
    employeeParty: "FelixBauer::participant-eu-1",
    period: "2026-05-01",
    amount: 8_100,
    issuedAt: "2026-05-01T09:14:26Z",
    status: "paid",
  },
  {
    id: "ps-2026-05-01-005",
    employeeName: "Priya Iyer",
    employeeParty: "PriyaIyer::participant-eu-1",
    period: "2026-05-01",
    amount: 7_800,
    issuedAt: "2026-05-01T09:14:27Z",
    status: "paid",
  },
  {
    id: "ps-2026-05-01-006",
    employeeName: "Tomás Reyes",
    employeeParty: "TomasReyes::participant-eu-1",
    period: "2026-05-01",
    amount: 6_600,
    issuedAt: "2026-05-01T09:14:28Z",
    status: "paid",
  },
  {
    id: "ps-2026-05-01-007",
    employeeName: "Hana Šimić",
    employeeParty: "HanaSimic::participant-eu-1",
    period: "2026-05-01",
    amount: 7_100,
    issuedAt: "2026-05-01T09:14:29Z",
    status: "paid",
  },
];

export const formatCC = (n: number): string =>
  `${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${ORG.currency}`;

export const formatRelative = (iso: string, now: Date = new Date()): string => {
  const then = new Date(iso).getTime();
  const diff = now.getTime() - then;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 14) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  return `${wk}w ago`;
};

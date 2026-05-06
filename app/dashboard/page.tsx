"use client";

import { useState, useCallback, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { StatsBar } from "@/components/StatsBar";
import { ActionZone } from "@/components/ActionZone";
import { BalanceCard } from "@/components/BalanceCard";
import { AddEmployeeModal } from "@/components/AddEmployeeModal";
import { PayrollTerminal } from "@/components/PayrollTerminal";
import { PayrollConfirmationModal } from "@/components/PayrollConfirmationModal";
import { FundTreasuryModal } from "@/components/FundTreasuryModal";
import { SendTokensModal } from "@/components/SendTokensModal";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import {
  ACTIVITY,
  EMPLOYEES,
  ORG,
  PAYROLL_RUNS,
  PAYSLIPS,
  TREASURY_SERIES,
  formatCC,
  formatRelative,
} from "@/lib/dashboard-data";

const SHORT_CONTRACT = `${ORG.contractId.slice(0, 14)}…${ORG.contractId.slice(-6)}`;

const ACTIVITY_ICON = {
  payroll: <CheckCircle2 size={14} />,
  fund: <ArrowDownRight size={14} />,
  hire: <UserPlus size={14} />,
  transfer: <ArrowUpRight size={14} />,
  config: <FileText size={14} />,
} as const;

function Sparkline({ values }: { values: number[] }) {
  const w = 240;
  const h = 56;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1);
  const pts = values
    .map(
      (v, i) =>
        `${pad + i * step},${pad + (1 - (v - min) / range) * (h - pad * 2)}`,
    )
    .join(" ");
  const last = values[values.length - 1];
  const lastX = pad + (values.length - 1) * step;
  const lastY = pad + (1 - (last - min) / range) * (h - pad * 2);
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label="Treasury balance trend"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(73,136,196,0.35)" />
          <stop offset="100%" stopColor="rgba(73,136,196,0)" />
        </linearGradient>
      </defs>
      <polyline
        points={`${pad},${h - pad} ${pts} ${w - pad},${h - pad}`}
        fill="url(#spark-fill)"
        stroke="none"
      />
      <polyline
        points={pts}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill="var(--accent)" />
    </svg>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [treasuryBalance, setTreasuryBalance] = useState(formatCC(ORG.treasuryBalance));
  const [isTreasuryRevealed, setIsTreasuryRevealed] = useState(true);
  const [copied, setCopied] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isPayrollConfirmOpen, setIsPayrollConfirmOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const [employees, setEmployees] = useState(EMPLOYEES);
  const [activity, setActivity] = useState(ACTIVITY);
  const [payrollRuns, setPayrollRuns] = useState(PAYROLL_RUNS);

  const monthlyOutflow = useMemo(
    () =>
      employees
        .filter((e) => e.status === "active")
        .reduce((sum, e) => sum + e.salary * 2, 0),
    [employees],
  );

  const numericTreasury = useMemo(() => {
    const m = treasuryBalance.match(/[\d,.]+/);
    if (!m) return ORG.treasuryBalance;
    return Number(m[0].replace(/,/g, "")) || ORG.treasuryBalance;
  }, [treasuryBalance]);

  const runwayMonths = monthlyOutflow > 0 ? numericTreasury / monthlyOutflow : 0;

  const handleRevealTreasury = useCallback(() => {
    setTreasuryBalance(formatCC(numericTreasury));
    setIsTreasuryRevealed(true);
  }, [numericTreasury]);

  const handleHideTreasury = useCallback(() => {
    setTreasuryBalance("••••••");
    setIsTreasuryRevealed(false);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(ORG.contractId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lastRunRelative = useMemo(
    () => formatRelative(ORG.lastPayrollRunUtc),
    [],
  );

  function renderTabContent() {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <StatsBar
              treasuryBalance={treasuryBalance}
              employeeCount={employees.filter((e) => e.status === "active").length}
              lastPayroll={lastRunRelative}
              onReveal={handleRevealTreasury}
              onHide={handleHideTreasury}
              revealed={isTreasuryRevealed}
              isDecrypting={false}
              isEmployer={true}
              onFund={() => setIsFundModalOpen(true)}
            />

            <div
              className="content-body"
              style={{
                flex: 1,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
                  gap: "16px",
                }}
              >
                <section
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-hairline)",
                    borderRadius: "var(--radius)",
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <header
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        Treasury position · last 8 weeks
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontFamily: "var(--font-mono)",
                          fontSize: 22,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {formatCC(numericTreasury)}
                      </div>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: "var(--accent)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      <TrendingUp size={14} />
                      +25.2% qoq
                    </span>
                  </header>
                  <Sparkline values={TREASURY_SERIES} />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 12,
                      paddingTop: 8,
                      borderTop: "1px solid var(--border-hairline)",
                    }}
                  >
                    {[
                      {
                        label: "Monthly outflow",
                        value: formatCC(monthlyOutflow),
                      },
                      {
                        label: "Runway",
                        value: `${runwayMonths.toFixed(1)} mo`,
                      },
                      {
                        label: "Cooldown",
                        value: `${ORG.cooldownSeconds / 3600}h`,
                      },
                    ].map((m) => (
                      <div key={m.label}>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          {m.label}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 14,
                            color: "var(--text-primary)",
                            marginTop: 2,
                          }}
                        >
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-hairline)",
                    borderRadius: "var(--radius)",
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    PayrollOrganization
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {ORG.name}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        wordBreak: "break-all",
                      }}
                    >
                      {SHORT_CONTRACT}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: "auto",
                    }}
                  >
                    <button
                      type="button"
                      className="reveal-btn"
                      onClick={handleCopy}
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      {copied ? "Copied!" : "Copy contract id"}
                    </button>
                    <button
                      type="button"
                      className="reveal-btn"
                      onClick={() => setIsFundModalOpen(true)}
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <Coins size={12} style={{ marginRight: 4 }} />
                      Fund
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      paddingTop: 10,
                      borderTop: "1px solid var(--border-hairline)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-tertiary)",
                    }}
                  >
                    <span>Operator · {ORG.operatorParty.split("::")[0]}</span>
                    <span>Currency · {ORG.currency} (Canton Coin)</span>
                  </div>
                </section>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
                  gap: "16px",
                }}
              >
                <section
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-hairline)",
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--border-hairline)",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Recent payroll runs
                    </h3>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {payrollRuns.length} on ledger
                    </span>
                  </div>
                  <table
                    className="employee-table"
                    style={{ tableLayout: "auto" }}
                  >
                    <thead>
                      <tr>
                        <th>Run</th>
                        <th>Recipients</th>
                        <th>Amount</th>
                        <th>Tx</th>
                        <th style={{ textAlign: "right" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollRuns.slice(0, 4).map((run) => (
                        <tr key={run.id}>
                          <td>
                            <div
                              style={{
                                fontSize: 13,
                                color: "var(--text-primary)",
                              }}
                            >
                              {new Date(run.runAtUtc).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                color: "var(--text-tertiary)",
                              }}
                            >
                              {formatRelative(run.runAtUtc)}
                            </div>
                          </td>
                          <td className="cipher-value">{run.recipients}</td>
                          <td className="cipher-value">
                            {formatCC(run.totalAmount)}
                          </td>
                          <td className="address-cell">{run.txHash}</td>
                          <td style={{ textAlign: "right" }}>
                            <span className="status-badge active">
                              <span className="status-dot" />
                              {run.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                <section
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-hairline)",
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--border-hairline)",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Activity
                    </h3>
                    <Clock size={14} style={{ color: "var(--text-tertiary)" }} />
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      maxHeight: 300,
                      overflowY: "auto",
                    }}
                  >
                    {activity.slice(0, 6).map((ev) => (
                      <li
                        key={ev.id}
                        style={{
                          display: "flex",
                          gap: 12,
                          padding: "12px 20px",
                          borderBottom: "1px solid var(--border-hairline)",
                        }}
                      >
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: "var(--accent-dim)",
                            color: "var(--accent)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {ACTIVITY_ICON[ev.kind]}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 8,
                              fontSize: 13,
                              color: "var(--text-primary)",
                            }}
                          >
                            <span>{ev.title}</span>
                            {ev.amount && (
                              <span
                                className="cipher-value"
                                style={{ flexShrink: 0 }}
                              >
                                {formatCC(ev.amount)}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              marginTop: 2,
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                              color: "var(--text-tertiary)",
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {ev.meta}
                            </span>
                            <span style={{ flexShrink: 0 }}>
                              {formatRelative(ev.at)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>

            <ActionZone
              onRunPayroll={() => setIsPayrollConfirmOpen(true)}
              onAddEmployee={() => setIsAddModalOpen(true)}
              isPayrollRunning={false}
              employeeCount={employees.length}
            />
          </>
        );

      case "employees":
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
                padding: "24px 24px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                  Team roster
                </h2>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 12,
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <Users
                    size={12}
                    style={{ verticalAlign: -2, marginRight: 6 }}
                  />
                  {employees.filter((e) => e.status === "active").length}{" "}
                  active · {employees.length} total · monthly outflow{" "}
                  {formatCC(monthlyOutflow)}
                </p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  className="send-action-btn"
                  onClick={() => setIsPayrollConfirmOpen(true)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="14"
                    height="14"
                    style={{ marginRight: 6 }}
                  >
                    <polygon points="5,3 19,12 5,21 5,3" />
                  </svg>
                  Run payroll
                </button>
                <button
                  type="button"
                  className="send-action-btn"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  + Add employee
                </button>
              </div>
            </div>

            <div className="table-container" style={{ flex: 1, padding: 0 }}>
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Salary</th>
                    <th>Hired</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--text-primary)",
                            fontWeight: 500,
                          }}
                        >
                          {emp.name}
                        </div>
                        <div className="address-cell" style={{ fontSize: 11 }}>
                          {emp.party}
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {emp.role}
                      </td>
                      <td className="cipher-value">
                        {formatCC(emp.salary)}
                      </td>
                      <td
                        style={{
                          color: "var(--text-secondary)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                        }}
                      >
                        {emp.hiredAt}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            emp.status === "pending" ? "pending" : "active"
                          }`}
                        >
                          <span className="status-dot" />
                          {emp.status === "pending" ? "Onboarding" : "Active"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="table-action-btn fire-btn"
                          onClick={() =>
                            setEmployees((prev) =>
                              prev.filter((e) => e.id !== emp.id),
                            )
                          }
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "transactions":
        return (
          <div
            className="content-body"
            style={{
              flex: 1,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                Ledger activity
              </h2>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-tertiary)",
                }}
              >
                {activity.length} events · last 30 days
              </span>
            </div>

            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-hairline)",
                borderRadius: "var(--radius)",
                overflow: "hidden",
              }}
            >
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Detail</th>
                    <th>Amount</th>
                    <th style={{ textAlign: "right" }}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((ev) => (
                    <tr key={ev.id}>
                      <td>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              background: "var(--accent-dim)",
                              color: "var(--accent)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {ACTIVITY_ICON[ev.kind]}
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              color: "var(--text-primary)",
                            }}
                          >
                            {ev.title}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 13,
                        }}
                      >
                        {ev.meta}
                      </td>
                      <td className="cipher-value">
                        {ev.amount ? formatCC(ev.amount) : "—"}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          color: "var(--text-tertiary)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                        }}
                      >
                        {formatRelative(ev.at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "payslips":
        return (
          <div
            className="content-body"
            style={{ flex: 1, padding: "24px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                Payslips · {PAYSLIPS[0]?.period}
              </h2>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-tertiary)",
                }}
              >
                {PAYSLIPS.length} issued · paid
              </span>
            </div>
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-hairline)",
                borderRadius: "var(--radius)",
                overflow: "hidden",
              }}
            >
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>Issued</th>
                    <th style={{ textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYSLIPS.map((ps) => (
                    <tr key={ps.id}>
                      <td>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--text-primary)",
                            fontWeight: 500,
                          }}
                        >
                          {ps.employeeName}
                        </div>
                        <div className="address-cell" style={{ fontSize: 11 }}>
                          {ps.employeeParty}
                        </div>
                      </td>
                      <td
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {ps.period}
                      </td>
                      <td className="cipher-value">{formatCC(ps.amount)}</td>
                      <td
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {formatRelative(ps.issuedAt)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className="status-badge active">
                          <span className="status-dot" />
                          {ps.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="content-body" style={{ flex: 1, padding: "24px" }}>
            <h2
              style={{ fontSize: 18, fontWeight: 700, margin: "0 0 24px" }}
            >
              Organization Settings
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {[
                { label: "Org name", value: ORG.name },
                { label: "Employer party", value: ORG.employerParty },
                { label: "Operator party", value: ORG.operatorParty },
                { label: "Contract id", value: ORG.contractId },
                { label: "Currency", value: `${ORG.currency} (Canton Coin)` },
                {
                  label: "Payroll cooldown",
                  value: `${ORG.cooldownSeconds} seconds (24h)`,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-hairline)",
                    borderRadius: "var(--radius)",
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                      wordBreak: "break-all",
                      textAlign: "right",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="app-layout">
      <div className="lock-grid-bg" />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        partyId={ORG.employerParty}
        onLogout={() => (window.location.href = "/")}
        isEmployer={true}
      />

      <main className="main-content">
        <div className="main-content-panel">{renderTabContent()}</div>

        <BalanceCard
          walletAddress={ORG.employerParty}
          onSendClick={() => setIsSendModalOpen(true)}
        />
      </main>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (hint, sal) => {
          const id = `emp-${(employees.length + 1).toString().padStart(3, "0")}`;
          const newEmp = {
            id,
            name: hint,
            role: "New hire",
            party: `${hint.replace(/\s+/g, "")}::participant-eu-1`,
            salary: Number(sal),
            hiredAt: new Date().toISOString().slice(0, 10),
            status: "pending" as const,
          };
          setEmployees((prev) => [...prev, newEmp]);
          setActivity((prev) => [
            {
              id: `act-${Date.now()}`,
              kind: "hire",
              at: new Date().toISOString(),
              title: "Employment contract created",
              meta: `${hint} · ${formatCC(Number(sal))}`,
            },
            ...prev,
          ]);
        }}
        isLive={true}
      />

      <PayrollTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        ledgerSummary="RunPayroll committed · 7 PaySlip contracts created"
        isLive={true}
      />

      <FundTreasuryModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        onFund={async (bal) => {
          const next = numericTreasury + Number(bal);
          setTreasuryBalance(formatCC(next));
          setIsTreasuryRevealed(true);
          setActivity((prev) => [
            {
              id: `act-${Date.now()}`,
              kind: "fund",
              at: new Date().toISOString(),
              title: "FundTreasury exercised",
              meta: "Top-up from operator",
              amount: Number(bal),
            },
            ...prev,
          ]);
        }}
        onSetBalance={async (bal) => {
          setTreasuryBalance(formatCC(Number(bal)));
          setIsTreasuryRevealed(true);
        }}
        currency={ORG.currency}
        currentBalance={formatCC(numericTreasury)}
      />

      <SendTokensModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        senderAddress={ORG.employerParty}
      />

      <PayrollConfirmationModal
        isOpen={isPayrollConfirmOpen}
        onClose={() => setIsPayrollConfirmOpen(false)}
        onConfirm={async () => {
          const total = employees
            .filter((e) => e.status === "active")
            .reduce((s, e) => s + e.salary, 0);
          const recipients = employees.filter(
            (e) => e.status === "active",
          ).length;
          const now = new Date();
          setPayrollRuns((prev) => [
            {
              id: `run-${now.toISOString().slice(0, 10)}-${Date.now()}`,
              runAtUtc: now.toISOString(),
              totalAmount: total,
              recipients,
              status: "settled",
              txHash: `0x${Math.random().toString(16).slice(2, 8)}…${Math.random()
                .toString(16)
                .slice(2, 6)}`,
            },
            ...prev,
          ]);
          setActivity((prev) => [
            {
              id: `act-${Date.now()}`,
              kind: "payroll",
              at: now.toISOString(),
              title: "RunPayroll exercised",
              meta: `${recipients} recipients · settled`,
              amount: total,
            },
            ...prev,
          ]);
          setTreasuryBalance(formatCC(numericTreasury - total));
          setIsTerminalOpen(true);
        }}
        employeeCount={employees.length}
        isProcessing={false}
      />
    </div>
  );
}

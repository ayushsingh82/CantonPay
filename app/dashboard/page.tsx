"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { StatsBar } from "@/components/StatsBar";
import { ActionZone } from "@/components/ActionZone";
import { BalanceCard } from "@/components/BalanceCard";
import { AddEmployeeModal } from "@/components/AddEmployeeModal";
import { PayrollTerminal } from "@/components/PayrollTerminal";
import { PayrollConfirmationModal } from "@/components/PayrollConfirmationModal";
import { FundTreasuryModal } from "@/components/FundTreasuryModal";
import { SendTokensModal } from "@/components/SendTokensModal";
import { Shield } from "lucide-react";

// ── Demo / Mock data ──
const DEMO_PARTY = "Employer::demo-participant";
const DEMO_ORG_ID = "demo-org-contract-001";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [treasuryBalance, setTreasuryBalance] = useState("••••••");
  const [isTreasuryRevealed, setIsTreasuryRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isPayrollConfirmOpen, setIsPayrollConfirmOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Demo employees
  const [employees, setEmployees] = useState<
    { party: string; salary: number }[]
  >([
    { party: "Alice::participant1", salary: 5000 },
    { party: "Bob::participant2", salary: 4200 },
    { party: "Charlie::participant3", salary: 3800 },
  ]);

  const handleRevealTreasury = useCallback(() => {
    setTreasuryBalance("25,000.00 CC");
    setIsTreasuryRevealed(true);
  }, []);

  const handleHideTreasury = useCallback(() => {
    setTreasuryBalance("••••••");
    setIsTreasuryRevealed(false);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(DEMO_ORG_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = `${DEMO_ORG_ID.slice(0, 10)}…${DEMO_ORG_ID.slice(-6)}`;

  // ── Render active tab content ──
  function renderTabContent() {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <StatsBar
              treasuryBalance={treasuryBalance}
              employeeCount={employees.length}
              lastPayroll="—"
              onReveal={handleRevealTreasury}
              onHide={handleHideTreasury}
              revealed={isTreasuryRevealed}
              isDecrypting={false}
              isEmployer={true}
              onFund={() => setIsFundModalOpen(true)}
            />

            <div className="content-body" style={{ flex: 1, padding: "24px" }}>
              <div
                className="info-card"
                style={{
                  background: "rgba(73, 136, 196, 0.04)",
                  border: "1px solid rgba(73, 136, 196, 0.12)",
                  borderRadius: "var(--radius)",
                  padding: "24px",
                  display: "flex",
                  gap: "20px",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "var(--accent-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent)",
                    flexShrink: 0,
                  }}
                >
                  <Shield size={24} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      color: "var(--text-primary)",
                    }}
                  >
                    Canton Payroll
                  </h3>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    Visibility follows Daml signatories and observers on the
                    Canton ledger. Salary fields are Decimal in the templates;
                    refine privacy in Daml as needed.
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "var(--radius)",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "var(--text-tertiary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      PayrollOrganization contract id
                    </h3>
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "18px",
                        fontWeight: 600,
                        fontFamily: "monospace",
                        color: "var(--text-primary)",
                      }}
                    >
                      {shortAddress}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      className="reveal-btn"
                      onClick={handleCopy}
                      style={{ minWidth: "80px" }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <span
                      className="reveal-btn"
                      style={{ opacity: 0.6, cursor: "default" }}
                    >
                      Canton JSON API
                      <Shield size={14} />
                    </span>
                  </div>
                </div>
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
                    style={{ marginRight: "6px" }}
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
                    <th>Party</th>
                    <th>Salary</th>
                    <th>Currency</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.party}>
                      <td className="address-cell">{emp.party}</td>
                      <td className="cipher-value">{emp.salary.toLocaleString()}</td>
                      <td style={{ color: "var(--text-secondary)" }}>CC</td>
                      <td>
                        <span className="status-badge active">
                          <span className="status-dot" />
                          Active
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="table-action-btn fire-btn"
                          onClick={() =>
                            setEmployees((prev) =>
                              prev.filter((e) => e.party !== emp.party)
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
          <div className="content-body" style={{ flex: 1, padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 16px" }}>
              Ledger activity
            </h2>
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-hairline)",
                borderRadius: "var(--radius)",
                padding: "40px",
                textAlign: "center",
                color: "var(--text-tertiary)",
              }}
            >
              <p style={{ fontSize: "13px", fontFamily: "var(--font-mono)" }}>
                Transaction log is populated from Canton JSON API event stream.
                <br />
                Connect a Canton participant to see live activity.
              </p>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="content-body" style={{ flex: 1, padding: "24px" }}>
            <h2
              style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 24px" }}
            >
              Organization Settings
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {[
                { label: "Party ID", value: DEMO_PARTY },
                { label: "Role", value: "Employer" },
                { label: "Contract ID", value: DEMO_ORG_ID },
                { label: "Currency", value: "CC (Canton Coin)" },
                { label: "Payroll Cooldown", value: "86400 seconds (24h)" },
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
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
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
                      fontSize: "13px",
                      color: "var(--text-primary)",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case "payslips":
        return (
          <div className="content-body" style={{ flex: 1, padding: "24px" }}>
            <h2
              style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 16px" }}
            >
              Payslips
            </h2>
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-hairline)",
                borderRadius: "var(--radius)",
                padding: "40px",
                textAlign: "center",
                color: "var(--text-tertiary)",
              }}
            >
              <p style={{ fontSize: "13px", fontFamily: "var(--font-mono)" }}>
                Payslip records are created after each RunPayroll exercise.
                <br />
                Connect to Canton to view your payslip history.
              </p>
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
        partyId={DEMO_PARTY}
        onLogout={() => (window.location.href = "/")}
        isEmployer={true}
      />

      <main className="main-content">
        <div className="main-content-panel">{renderTabContent()}</div>

        <BalanceCard
          walletAddress={DEMO_PARTY}
          onSendClick={() => setIsSendModalOpen(true)}
        />
      </main>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (hint, sal) => {
          setEmployees((prev) => [
            ...prev,
            { party: `${hint}::demo-participant`, salary: Number(sal) },
          ]);
        }}
        isLive={false}
      />

      <PayrollTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        ledgerSummary="Demo mode — no ledger connection"
        isLive={false}
      />

      <FundTreasuryModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        onFund={async (bal) => {
          setTreasuryBalance(`${bal} CC`);
          setIsTreasuryRevealed(true);
        }}
      />

      <SendTokensModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        senderAddress={DEMO_PARTY}
      />

      <PayrollConfirmationModal
        isOpen={isPayrollConfirmOpen}
        onClose={() => setIsPayrollConfirmOpen(false)}
        onConfirm={async () => {
          setIsTerminalOpen(true);
        }}
        employeeCount={employees.length}
        isProcessing={false}
      />
    </div>
  );
}

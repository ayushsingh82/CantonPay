"use client";

import type { EmploymentContractPayload } from "@/lib/canton";

interface EmployeeTableProps {
  employmentRows: { cid: string; payload: EmploymentContractPayload }[];
  addresses: string[];
  isEmployer: boolean;
  isLoading: boolean;
  onFire: (employmentCid: string) => void;
  walletAddress: string;
  orgContractId: string;
}

export function EmployeeTable({
  employmentRows,
  addresses,
  isEmployer,
  isLoading,
  onFire,
  walletAddress,
  orgContractId,
}: EmployeeTableProps) {
  if (isLoading) {
    return (
      <div className="table-container">
        <div className="table-header-bar">
          <span className="table-title">Employee roster</span>
          <span className="table-count">Loading…</span>
        </div>
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
          }}
        >
          Fetching Canton contracts…
        </div>
      </div>
    );
  }

  const rows =
    employmentRows.length > 0
      ? employmentRows
      : addresses.map((a) => ({
          cid: "",
          payload: {
            payrollOrgCid: orgContractId,
            employer: "",
            operator: "",
            employee: a,
            salary: "—",
            currency: "",
            orgLabel: "",
          },
        }));

  return (
    <div className="table-container">
      <div className="table-header-bar">
        <span className="table-title">Employee roster</span>
        <span className="table-count">{rows.length} records</span>
      </div>
      <table className="employee-table">
        <thead>
          <tr>
            <th>Party</th>
            <th>Salary</th>
            <th>Currency</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.cid || row.payload.employee}>
              <td className="address-cell">
                <span className="mono">{row.payload.employee}</span>
              </td>
              <td>{row.payload.salary}</td>
              <td>{row.payload.currency || "—"}</td>
              <td>
                <span className="status-badge active">
                  <span className="status-dot" />
                  active
                </span>
              </td>
              <td>
                {isEmployer && row.cid ? (
                  <button
                    type="button"
                    className="table-action-btn fire-btn"
                    onClick={() => onFire(row.cid)}
                  >
                    Remove
                  </button>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={5}
                style={{
                  textAlign: "center",
                  padding: "40px 24px",
                  color: "var(--text-tertiary)",
                }}
              >
                {isEmployer
                  ? "No employees yet. Use Add employee."
                  : "No employment line for your party on this org."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

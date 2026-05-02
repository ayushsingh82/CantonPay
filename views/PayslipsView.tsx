"use client";

export function PayslipsView() {
  return (
    <div
      className="content-body"
      style={{
        flex: 1,
        padding: "48px 24px",
        color: "var(--text-secondary)",
        textAlign: "center",
      }}
    >
      <p style={{ maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
        Model payslips as Daml templates (e.g.{" "}
        <code className="mono">PayslipRecord</code>) and query them via the JSON
        API. Wire a view here when your DAR defines the template.
      </p>
    </div>
  );
}

"use client";

interface PayslipsViewProps {
  nftAddress?: `0x${string}`;
}

export function PayslipsView({ nftAddress }: PayslipsViewProps) {
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
        Payslip NFTs were part of the Ethereum demo. On Canton, model payslips as
        separate Daml templates (e.g. <code className="mono">PayslipRecord</code>)
        and query them via the JSON API — not ERC-721.
      </p>
      {!nftAddress && (
        <p style={{ marginTop: 16, fontSize: "13px", opacity: 0.8 }}>
          No NFT contract — Canton payslip templates not wired yet.
        </p>
      )}
    </div>
  );
}

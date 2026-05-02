'use client';

import { useState } from 'react';
import { ActionZone } from '@/components/ActionZone';
import { StatsBar } from '@/components/StatsBar';
import { Shield } from 'lucide-react';

interface DashboardViewProps {
    treasuryBalance: string;
    isTreasuryRevealed: boolean;
    isDecryptingTreasury: boolean;
    employeeCount: number;
    lastPayroll: string;
    onRevealTreasury: () => void;
    onHideTreasury: () => void;
    isEmployer: boolean;
    onRunPayroll: () => void;
    onAddEmployee: () => void;
    onFundTreasury: () => void;
    isPayrollRunning: boolean;
    contractAddress: string;
    payrollCooldown?: bigint;
    lastPayrollRun?: bigint;
}

export function DashboardView({
    treasuryBalance,
    isTreasuryRevealed,
    isDecryptingTreasury,
    employeeCount,
    lastPayroll,
    onRevealTreasury,
    onHideTreasury,
    isEmployer,
    onRunPayroll,
    onAddEmployee,
    onFundTreasury,
    isPayrollRunning,
    contractAddress,
    payrollCooldown,
    lastPayrollRun,
}: DashboardViewProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(contractAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shortAddress = `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`;

    return (
        <>
            <StatsBar
                treasuryBalance={treasuryBalance}
                employeeCount={employeeCount}
                lastPayroll={lastPayroll}
                onReveal={onRevealTreasury}
                onHide={onHideTreasury}
                revealed={isTreasuryRevealed}
                isDecrypting={isDecryptingTreasury}
                isEmployer={isEmployer}
                onFund={onFundTreasury}
            />

            <div className="content-body" style={{ flex: 1, padding: '24px' }}>
                <div className="info-card" style={{
                    background: 'rgba(52, 211, 153, 0.03)',
                    border: '1px solid rgba(52, 211, 153, 0.1)',
                    borderRadius: 'var(--radius)',
                    padding: '24px',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'var(--accent-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        flexShrink: 0
                    }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Canton payroll</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Visibility follows Daml signatories and observers on the Canton ledger — not FHEVM or zk rollups on Ethereum.
                            Salary fields are plain Decimal in templates; privacy is party-based.
                        </p>
                    </div>
                </div>

                {isEmployer && (
                    <div style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-hairline)',
                        borderRadius: 'var(--radius)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PayrollOrganization contract id</h3>
                                <div style={{ marginTop: '8px', fontSize: '18px', fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                                    {shortAddress}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="reveal-btn" onClick={handleCopy} style={{ minWidth: '80px' }}>
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                                <span className="reveal-btn" style={{ opacity: 0.6, cursor: 'default' }}>
                                    Canton JSON API
                                    <Shield size={14} />
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isEmployer && (
                <ActionZone
                    onRunPayroll={onRunPayroll}
                    onAddEmployee={onAddEmployee}
                    isPayrollRunning={isPayrollRunning}
                    employeeCount={employeeCount}
                    payrollCooldown={payrollCooldown}
                    lastPayrollRun={lastPayrollRun}
                />
            )}
        </>
    );
}

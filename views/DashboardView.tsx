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
    contractAddress: `0x${string}`;
    payrollCooldown?: bigint;
    lastPayrollRun?: bigint;
    faucetRequest: (address: string) => void;
    isFaucetLoading: boolean;
    faucetStatus: 'idle' | 'success' | 'error';
    faucetMessage: string;
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
    faucetRequest,
    isFaucetLoading,
    faucetStatus,
    faucetMessage,
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

            {isEmployer && (!isTreasuryRevealed || treasuryBalance === '0 USDC') && (
                <div style={{
                    margin: '16px 24px 0',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px border-dashed var(--border-hairline)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                        Treasury is empty. Fund it to run payroll.
                    </span>
                    <button
                        onClick={() => faucetRequest(window.ethereum?.selectedAddress || '')}
                        disabled={isFaucetLoading}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent)',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '13px',
                            fontWeight: 600,
                            textDecoration: 'underline'
                        }}
                    >
                            {isFaucetLoading ? 'Minting...' : faucetStatus === 'success' ? '✅ Minted' : 'Need mUSDC? → Mint tokens'}
                    </button>
                </div>
            )}

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
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Privacy-Enabled Payroll</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Your financial data is protected by Fully Homomorphic Encryption. Only authorized parties can reveal
                            sensitive details after multi-party validation on the Zama Sepolia network.
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
                                <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization Address</h3>
                                <div style={{ marginTop: '8px', fontSize: '18px', fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                                    {shortAddress}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="reveal-btn" onClick={handleCopy} style={{ minWidth: '80px' }}>
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                                <a
                                    href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="reveal-btn"
                                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    Etherscan
                                    <Shield size={14} />
                                </a>
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

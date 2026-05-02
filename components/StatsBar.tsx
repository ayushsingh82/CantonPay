'use client';

import { useState, useCallback } from 'react';
import { CipherText } from './CipherText';
import { Eye, Lock } from 'lucide-react';

interface StatsBarProps {
    treasuryBalance: string;
    employeeCount: number;
    lastPayroll: string;
    onReveal?: () => void;
    onHide?: () => void;
    isDecrypting?: boolean;
    revealed?: boolean;
    isEmployer?: boolean;
    onFund?: () => void;
}

export function StatsBar({
    treasuryBalance,
    employeeCount,
    lastPayroll,
    onReveal,
    onHide,
    isDecrypting,
    revealed: externalRevealed,
    isEmployer,
    onFund
}: StatsBarProps) {
    const [internalRevealed, setInternalRevealed] = useState(false);
    const balanceRevealed = externalRevealed !== undefined ? externalRevealed : internalRevealed;

    const toggleBalance = useCallback(async () => {
        if (balanceRevealed) {
            if (onHide) onHide();
            setInternalRevealed(false);
        } else {
            if (onReveal) onReveal();
            setInternalRevealed(true);
        }
    }, [balanceRevealed, onReveal, onHide]);

    return (
        <div className="stats-bar">
            <div className="stat-card">
                <div className="stat-label">Treasury Balance</div>
                <div className="stat-value">
                    <CipherText
                        value={isDecrypting ? 'Decrypting...' : treasuryBalance}
                        revealed={balanceRevealed && !isDecrypting}
                        onToggle={toggleBalance}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                        {!isDecrypting && (
                            <button className="reveal-btn" onClick={toggleBalance}>
                                {balanceRevealed ? (
                                    <>
                                        <Lock size={12} style={{ marginRight: '4px' }} />
                                        Hide
                                    </>
                                ) : (
                                    <>
                                        <Eye size={12} style={{ marginRight: '4px' }} />
                                        Reveal
                                    </>
                                )}
                            </button>
                        )}
                        {isEmployer && (
                            <button
                                className="reveal-btn"
                                style={{ background: 'var(--accent)', color: 'white', border: 'none' }}
                                onClick={onFund}
                            >
                                Fund
                            </button>
                        )}
                    </div>
                </div>
                <div className="stat-meta">ConfidentialERC20 • mUSDC</div>
            </div>

            <div className="stat-card">
                <div className="stat-label">Active Employees</div>
                <div className="stat-value">
                    {employeeCount}
                    <span className="unit">registered</span>
                </div>
                <div className="stat-meta">FHE-encrypted salaries</div>
            </div>

            <div className="stat-card">
                <div className="stat-label">Last Payroll Run</div>
                <div className="stat-value" style={{ fontSize: '18px' }}>
                    {lastPayroll}
                </div>
                <div className="stat-meta">Auto-encrypted batch tx</div>
            </div>
        </div>
    );
}

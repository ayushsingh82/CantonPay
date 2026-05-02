'use client';

import { useDisconnect } from 'wagmi';
import { FACTORY_ADDRESS, TOKEN_ADDRESS } from '@/lib/contracts';
import { Copy, ExternalLink, LogOut, Wallet, Code, Calendar, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useMemo } from 'react';
import { usePayroll } from '@/hooks/usePayroll';
import { format } from 'date-fns';

interface SettingsViewProps {
    address: string;
    role: 'Employer' | 'Employee';
    contractAddress: `0x${string}`;
}

export function SettingsView({ address, role, contractAddress }: SettingsViewProps) {
    const { disconnect } = useDisconnect();
    const payroll = usePayroll(contractAddress);
    const [copied, setCopied] = useState(false);

    // -- Cooldown state --
    const [selectedCycle, setSelectedCycle] = useState<string>('custom');
    const [customDays, setCustomDays] = useState<string>('30');
    const [isSaving, setIsSaving] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const inviteLink = `${window.location.origin}/org/${contractAddress}`;

    return (
        <div className="content-body" style={{ flex: 1, padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '32px', color: 'var(--text-primary)' }}>Settings</h2>

            {role === 'Employer' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                    {/* Invite Section */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                            Invite Employees
                        </h3>
                        <div style={{
                            background: 'var(--accent-dim)',
                            border: '1px solid rgba(52, 211, 153, 0.2)',
                            borderRadius: 'var(--radius)',
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                            flex: 1
                        }}>
                            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', alignSelf: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                <QRCodeSVG value={inviteLink} size={140} level="H" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Organization Access Link</h4>
                                <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Share this private link with your employees to grant them access to their confidential payslips.
                                </p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{
                                        flex: 1,
                                        background: 'var(--bg-root)',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontFamily: 'var(--font-mono)',
                                        color: 'var(--text-secondary)',
                                        border: '1px solid var(--border-hairline)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {inviteLink}
                                    </div>
                                    <button
                                        className="reveal-btn"
                                        onClick={() => copyToClipboard(inviteLink)}
                                        style={{ width: '40px', background: 'var(--bg-elevated)' }}
                                    >
                                        {copied ? '✓' : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payroll Cycle Section */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                            Payroll Cycle
                        </h3>
                        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius)', padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>Frequency</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {[
                                        { id: 'weekly', label: 'Weekly' },
                                        { id: 'biweekly', label: 'Biweekly' },
                                        { id: 'monthly', label: 'Monthly' },
                                        { id: 'custom', label: 'Custom' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setSelectedCycle(opt.id)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid',
                                                borderColor: selectedCycle === opt.id ? 'var(--accent)' : 'var(--border-hairline)',
                                                background: selectedCycle === opt.id ? 'var(--accent-dim)' : 'var(--bg-root)',
                                                color: selectedCycle === opt.id ? 'var(--accent)' : 'var(--text-secondary)',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedCycle === 'custom' && (
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Custom days</label>
                                    <input
                                        type="number"
                                        className="terminal-input"
                                        value={customDays}
                                        onChange={(e) => setCustomDays(e.target.value)}
                                        placeholder="30"
                                        style={{ width: '100px' }}
                                    />
                                </div>
                            )}

                            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border-hairline)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-root)', border: '1px solid var(--border-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                                        <Calendar size={16} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Status</div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {!payroll.payrollCooldown || payroll.payrollCooldown === 0n ? 'Unrestricted' : (
                                                (() => {
                                                    const nextTime = Number(payroll.lastPayrollRun || 0n) + Number(payroll.payrollCooldown || 0n);
                                                    const diff = nextTime - Math.floor(Date.now() / 1000);
                                                    if (diff <= 0) return 'Available now';
                                                    return `Locked for ${Math.ceil(diff / 86400)} days`;
                                                })()
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="send-action-btn"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                    disabled={isSaving || payroll.isTxPending}
                                    onClick={async () => {
                                        setIsSaving(true);
                                        try {
                                            let seconds = 0;
                                            if (selectedCycle === 'weekly') seconds = 604800;
                                            else if (selectedCycle === 'biweekly') seconds = 1209600;
                                            else if (selectedCycle === 'monthly') seconds = 2592000;
                                            else seconds = Number(customDays) * 86400;

                                            await payroll.setPayrollCooldown(seconds);
                                        } catch (e) {
                                            console.error('Save cooldown failed', e);
                                        } finally {
                                            setIsSaving(false);
                                        }
                                    }}
                                >
                                    {isSaving ? 'Processing...' : 'Update Payroll Logic'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: role === 'Employer' ? '1fr 340px' : '1fr', gap: '32px' }}>
                {/* Account Section */}
                <div>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                        User Profile
                    </h3>
                    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius)', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Active Wallet</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Role: {role}</div>
                                </div>
                            </div>
                            <span className="status-badge active" style={{ borderRadius: '8px', padding: '6px 12px' }}>Active Session</span>
                        </div>

                        <div style={{
                            background: 'var(--bg-root)',
                            padding: '16px',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '32px',
                            border: '1px solid var(--border-hairline)'
                        }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{address}</span>
                            <button onClick={() => copyToClipboard(address)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <button
                            onClick={() => disconnect()}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'rgba(239, 68, 68, 0.05)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <LogOut size={18} />
                            Terminate Session
                        </button>
                    </div>
                </div>

                {/* Contracts & Resources Section */}
                <div>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                        Ecosystem & Resources
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Faucet Link */}
                        <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: 'var(--radius)', padding: '16px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Sepolia ETH Faucet</div>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.4 }}>Required for transaction gas fees on Sepolia.</p>
                            <a href="https://sepolia-faucet.pk910.de/" target="_blank" rel="noopener noreferrer" className="reveal-btn" style={{ width: '100%', justifyContent: 'center', fontSize: '12px', height: '32px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Get ETH <ExternalLink size={12} />
                            </a>
                        </div>

                        {[
                            { label: 'Payroll org', address: contractAddress },
                            { label: 'Factory', address: FACTORY_ADDRESS },
                            { label: 'mUSDC', address: TOKEN_ADDRESS }
                        ].map((contract) => (
                            <div key={contract.address} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{contract.label}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                                        {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => copyToClipboard(contract.address)} style={{ background: 'var(--bg-root)', border: '1px solid var(--border-hairline)', borderRadius: '6px', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '6px' }}>
                                        <Copy size={12} />
                                    </button>
                                    <a href={`https://sepolia.etherscan.io/address/${contract.address}`} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--bg-root)', border: '1px solid var(--border-hairline)', borderRadius: '6px', color: 'var(--text-tertiary)', padding: '6px' }}>
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

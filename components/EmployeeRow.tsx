'use client';

import { useState, useCallback, useEffect } from 'react';
import { PAYROLL_ABI, NFT_ABI } from '@/lib/contracts';
import { useReadContract, usePublicClient } from 'wagmi';
import { useFhevm } from '@/hooks/useFhevm';
import { CipherText } from './CipherText';
import { Loader2, UserMinus, Lock, Edit3, DollarSign, Send, FileText, ExternalLink } from 'lucide-react';
import { usePayroll } from '@/hooks/usePayroll';

interface EmployeeRowProps {
    address: string;
    isEmployer: boolean;
    onRemove: (address: string) => void;
    walletAddress: string;
    contractAddress: string;
    nftAddress?: `0x${string}`;
}

export function EmployeeRow({
    address: employeeAddress,
    isEmployer,
    onRemove,
    walletAddress,
    contractAddress,
    nftAddress
}: EmployeeRowProps) {
    const { decrypt64 } = useFhevm();
    const payroll = usePayroll(contractAddress as `0x${string}`);
    const [decryptedSalary, setDecryptedSalary] = useState<string | null>(null);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [error, setError] = useState(false);
    const client = usePublicClient();
    const [payslipDetails, setPayslipDetails] = useState<any[]>([]);

    // Modal states
    const [isEditSalaryOpen, setIsEditSalaryOpen] = useState(false);
    const [isPayBonusOpen, setIsPayBonusOpen] = useState(false);

    // Form states
    const [newSalary, setNewSalary] = useState('');
    const [bonusAmount, setBonusAmount] = useState('');
    const [bonusMemo, setBonusMemo] = useState('');
    const [isActionSubmitting, setIsActionSubmitting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // ── Read Salary Handle for this specific employee ──
    const { data: handle, isLoading: isLoadingHandle } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: PAYROLL_ABI,
        functionName: 'getSalaryHandle',
        args: [employeeAddress as `0x${string}`],
        query: { enabled: !!contractAddress && !!employeeAddress },
    });

    // ── Read Payslip IDs ──
    const { data: payslipIds, isLoading: isLoadingPayslips } = useReadContract({
        address: nftAddress,
        abi: NFT_ABI,
        functionName: 'getPayslipsByEmployee',
        args: [employeeAddress as `0x${string}`],
        query: { enabled: !!nftAddress && !!employeeAddress },
    });

    useEffect(() => {
        if (!isExpanded || !payslipIds || (payslipIds as any[]).length === 0 || !client || !nftAddress) return;

        const fetchDetails = async () => {
            try {
                const results = await Promise.all(
                    (payslipIds as bigint[]).map(async (id) => {
                        const data = await client.readContract({
                            address: nftAddress,
                            abi: [
                                {
                                    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
                                    name: 'payslips',
                                    outputs: [
                                        { internalType: 'address', name: 'employee', type: 'address' },
                                        { internalType: 'uint256', name: 'payrollDate', type: 'uint256' },
                                        { internalType: 'uint256', name: 'payPeriod', type: 'uint256' },
                                        { internalType: 'uint8', name: 'payslipType', type: 'uint8' },
                                        { internalType: 'string', name: 'memo', type: 'string' },
                                    ],
                                    stateMutability: 'view',
                                    type: 'function',
                                },
                            ] as const,
                            functionName: 'payslips',
                            args: [id],
                        }) as unknown as [string, bigint, bigint, number, string];

                        return {
                            id,
                            payrollDate: data[1],
                            payslipType: Number(data[3]),
                            memo: data[4],
                        };
                    })
                );
                setPayslipDetails(results);
            } catch (err) {
                console.error('[EmployeeRow] payslip detail fetch error:', err);
            }
        };

        fetchDetails();
    }, [isExpanded, payslipIds, client, nftAddress]);

    const handleReveal = useCallback(async () => {
        if (!handle || isDecrypting || decryptedSalary) return;

        setIsDecrypting(true);
        setError(false);

        try {
            console.log(`[EmployeeRow] Decrypting salary for ${employeeAddress}...`);
            const clearValue = await decrypt64(
                handle as bigint,
                contractAddress,
                walletAddress
            );

            setDecryptedSalary(`${clearValue.toLocaleString()} mUSDC`);
        } catch (err) {
            console.error(`[EmployeeRow] Decryption failed for ${employeeAddress}:`, err);
            setError(true);
        } finally {
            setIsDecrypting(false);
        }
    }, [handle, decrypt64, contractAddress, walletAddress, employeeAddress, isDecrypting, decryptedSalary]);

    const handleHide = useCallback(() => {
        setDecryptedSalary(null);
    }, []);

    const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <>
            <tr>
                <td>
                    <span className="address-cell" title={employeeAddress}>
                        {truncateAddress(employeeAddress)}
                    </span>
                </td>
                <td>
                    {decryptedSalary ? (
                        <div className="stat-value" style={{ fontSize: '13px', gap: '8px' }}>
                            <CipherText
                                value={decryptedSalary}
                                revealed={true}
                                onToggle={handleHide}
                            />
                            <button className="reveal-btn" onClick={handleHide} style={{ padding: '2px 6px' }}>
                                <Lock size={10} style={{ marginRight: '4px' }} />
                                Hide
                            </button>
                        </div>
                    ) : error ? (
                        <span className="cipher-value error">Error</span>
                    ) : isDecrypting ? (
                        <div className="decrypt-loading">
                            <Loader2 className="animate-spin" size={14} />
                            <span>Signing...</span>
                        </div>
                    ) : (
                        <CipherText
                            value="ENCRYPTED"
                            revealed={false}
                            onToggle={handleReveal}
                        />
                    )}
                </td>
                <td>
                    <span className="access-level">Employee</span>
                </td>
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="status-badge active">
                            <span className="status-dot" />
                            Active
                        </span>
                        {payslipIds && (payslipIds as any[]).length > 0 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                style={{
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    background: 'rgba(52, 211, 153, 0.1)',
                                    color: 'var(--accent)',
                                    border: '1px solid rgba(52, 211, 153, 0.2)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <FileText size={10} />
                                {(payslipIds as any[]).length} Payslips
                            </button>
                        )}
                    </div>
                </td>
                <td style={{ display: 'flex', gap: '6px' }}>
                    {isEmployer && (
                        <>
                            <button
                                className="table-action-btn"
                                onClick={() => setIsEditSalaryOpen(true)}
                                title="Edit Salary"
                                style={{ background: 'var(--bg-root)', border: '1px solid var(--border-hairline)', color: 'var(--text-secondary)' }}
                            >
                                <Edit3 size={14} />
                                Edit
                            </button>
                            <button
                                className="table-action-btn"
                                onClick={() => setIsPayBonusOpen(true)}
                                title="Pay Bonus"
                                style={{ background: 'var(--bg-root)', border: '1px solid var(--border-hairline)', color: 'var(--text-secondary)' }}
                            >
                                <DollarSign size={14} />
                                Bonus
                            </button>
                            <button
                                className="table-action-btn fire-btn"
                                onClick={() => onRemove(employeeAddress)}
                                title="Remove Employee"
                            >
                                <UserMinus size={14} />
                                Fire
                            </button>
                        </>
                    )}
                </td>

                {/* Edit Salary Modal */}
                {isEditSalaryOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '400px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Adjust Salary</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                                Update the monthly salary for employee {truncateAddress(employeeAddress)}.
                                The new amount will be encrypted before submission.
                            </p>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>New Monthly Salary (mUSDC)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        className="terminal-input"
                                        placeholder="0.00"
                                        value={newSalary}
                                        onChange={(e) => setNewSalary(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    className="fire-btn"
                                    style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)', color: 'var(--text-primary)' }}
                                    onClick={() => setIsEditSalaryOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="send-action-btn"
                                    style={{ flex: 1 }}
                                    disabled={!newSalary || isActionSubmitting}
                                    onClick={async () => {
                                        setIsActionSubmitting(true);
                                        try {
                                            await payroll.updateSalary(employeeAddress, Number(newSalary), walletAddress);
                                            setIsEditSalaryOpen(false);
                                            setNewSalary('');
                                        } catch (err) {
                                            console.error('Update salary failed', err);
                                        } finally {
                                            setIsActionSubmitting(false);
                                        }
                                    }}
                                >
                                    {isActionSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pay Bonus Modal */}
                {isPayBonusOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '400px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Send Bonus</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                                Send a one-time confidential bonus to {truncateAddress(employeeAddress)}.
                            </p>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Bonus Amount (mUSDC)</label>
                                <input
                                    type="number"
                                    className="terminal-input"
                                    placeholder="0.00"
                                    value={bonusAmount}
                                    onChange={(e) => setBonusAmount(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Memo (Plain Text)</label>
                                <input
                                    type="text"
                                    className="terminal-input"
                                    placeholder="e.g. Q1 Performance"
                                    value={bonusMemo}
                                    onChange={(e) => setBonusMemo(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    className="fire-btn"
                                    style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)', color: 'var(--text-primary)' }}
                                    onClick={() => setIsPayBonusOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="send-action-btn"
                                    style={{ flex: 1 }}
                                    disabled={!bonusAmount || isActionSubmitting}
                                    onClick={async () => {
                                        setIsActionSubmitting(true);
                                        try {
                                            await payroll.payBonus(employeeAddress, Number(bonusAmount), bonusMemo, walletAddress);
                                            setIsPayBonusOpen(false);
                                            setBonusAmount('');
                                            setBonusMemo('');
                                        } catch (err) {
                                            console.error('Pay bonus failed', err);
                                        } finally {
                                            setIsActionSubmitting(false);
                                        }
                                    }}
                                >
                                    {isActionSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Send Bonus'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </tr>
            {isExpanded && payslipDetails.length > 0 && (
                <tr style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                    <td colSpan={5} style={{ padding: '0 24px 24px' }}>
                        <div style={{
                            marginTop: '-8px',
                            padding: '16px',
                            background: 'var(--bg-root)',
                            borderRadius: '0 0 8px 8px',
                            border: '1px solid var(--border-hairline)',
                            borderTop: 'none',
                        }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FileText size={12} />
                                Payslip History
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {payslipDetails.map(({ id, payrollDate, payslipType, memo }) => {
                                    const date = new Date(Number(payrollDate) * 1000).toLocaleDateString();
                                    const isBonus = payslipType === 1;

                                    return (
                                        <div key={id.toString()} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            background: 'var(--bg-elevated)',
                                            borderRadius: '6px',
                                            fontSize: '13px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{date}</span>
                                                <span style={{
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    borderRadius: '8px',
                                                    background: isBonus ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    color: isBonus ? '#f59e0b' : '#10b981'
                                                }}>
                                                    {isBonus ? 'Bonus' : 'Salary'}
                                                </span>
                                                {memo && <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{memo}</span>}
                                            </div>
                                            <a
                                                href={`https://testnet.rarible.com/token/${nftAddress}:${id.toString()}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: 'var(--accent)', fontSize: '11px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                Rarible <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { TOKEN_ADDRESS, TOKEN_ABI, PAYROLL_ABI } from '@/lib/contracts';
import { useFhevm } from '@/hooks/useFhevm';
import { Loader2, X, Wallet } from 'lucide-react';

interface FundTreasuryModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractAddress: `0x${string}`;
    walletAddress: `0x${string}`;
    onSuccess: () => Promise<void>;
    syncTreasury: () => Promise<string>;
}

export function FundTreasuryModal({
    isOpen,
    onClose,
    contractAddress,
    walletAddress,
    onSuccess,
    syncTreasury
}: FundTreasuryModalProps) {
    const { encrypt64 } = useFhevm();
    const { writeContractAsync } = useWriteContract();
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState<'idle' | 'encrypting' | 'sending' | 'syncing' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
        query: {
            enabled: !!txHash,
        }
    });

    const handleFund = async () => {
        if (!amount || isNaN(Number(amount))) return;
        setStatus('encrypting');
        setError(null);

        try {
            // 1. Encrypt the amount for the mUSDC contract (the recipient of this transfer)
            const { inputHandle, inputProof } = await encrypt64(
                Number(amount),
                TOKEN_ADDRESS,
                walletAddress
            );

            setStatus('sending');
            // 2. Call transfer on MockUSDC to the payroll contract
            const hash = await writeContractAsync({
                address: TOKEN_ADDRESS,
                abi: TOKEN_ABI,
                functionName: 'transfer',
                args: [contractAddress, inputHandle, inputProof],
                gas: 6_000_000n, // Explicit safeguard for FHE operations
            });
            setTxHash(hash);

            // Note: waitForTransactionReceipt is handled by the hook
        } catch (err: any) {
            console.error('[FundModal] Error:', err);
            setError(err.message || 'Transaction failed');
            setStatus('error');
        }
    };

    // Watch for transaction confirmation to trigger sync
    useEffect(() => {
        const checkConfirmation = async () => {
            if (txHash && isConfirmed && status === 'sending') {
                setStatus('syncing');
                try {
                    await syncTreasury();
                    await onSuccess();
                    setStatus('idle');
                    onClose();
                } catch (err: any) {
                    setError('Sync failed: ' + err.message);
                    setStatus('error');
                }
            }
        };
        checkConfirmation();
    }, [isConfirmed, txHash, status, syncTreasury, onSuccess, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0 }}>Fund Treasury</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                    Send mUSDC to the organization's treasury. The amount will be encrypted during transfer.
                </p>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="terminal-label">Amount (mUSDC)</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="number"
                            className="terminal-input"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={status !== 'idle' && status !== 'error'}
                        />
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                            mUSDC
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{ color: '#ef4444', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {error}
                    </div>
                )}

                <button
                    className="send-action-btn"
                    style={{ width: '100%' }}
                    onClick={handleFund}
                    disabled={status !== 'idle' && status !== 'error'}
                >
                    {status === 'encrypting' && <><Loader2 size={16} className="animate-spin" style={{ marginRight: '8px' }} /> Encrypting...</>}
                    {status === 'sending' && <><Loader2 size={16} className="animate-spin" style={{ marginRight: '8px' }} /> Sending...</>}
                    {status === 'syncing' && <><Loader2 size={16} className="animate-spin" style={{ marginRight: '8px' }} /> Syncing...</>}
                    {(status === 'idle' || status === 'error') && 'Fund Treasury'}
                </button>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (address: string, salary: string) => void;
    isLive?: boolean;
}

export function AddEmployeeModal({ isOpen, onClose, onAdd, isLive }: AddEmployeeModalProps) {
    const [address, setAddress] = useState('');
    const [salary, setSalary] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (address.startsWith('0x') && address.length === 42 && salary) {
            setIsSubmitting(true);
            try {
                await onAdd(address, salary);
                setAddress('');
                setSalary('');
                onClose();
            } catch (err) {
                console.error('Failed to add employee:', err);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const isValid = address.startsWith('0x') && address.length === 42 && salary.length > 0;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Employee</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Employee Wallet Address</label>
                        <input
                            className="form-input"
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="0x..."
                            spellCheck={false}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Monthly Salary (mUSDC)</label>
                        <input
                            className="form-input"
                            type="text"
                            value={salary}
                            onChange={e => setSalary(e.target.value)}
                            placeholder="5000"
                            spellCheck={false}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--text-tertiary)',
                        padding: '12px',
                        background: 'var(--bg-root)',
                        border: '1px solid var(--border-hairline)',
                        borderRadius: 'var(--radius)',
                    }}>
                        <span style={{ color: 'var(--accent)' }}>
                            {isLive ? '🔐' : 'ℹ'}
                        </span>&nbsp;
                        {isLive
                            ? 'Salary will be encrypted using TFHE via fhevmjs before on-chain submission. Only the employer and employee will have decryption access.'
                            : 'Demo mode — connect your wallet to encrypt and submit on-chain. Salary will be stored locally only.'}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="m7 11 0-4a5 5 0 0 1 10 0l0 4" />
                        </svg>
                        {isSubmitting ? 'Encrypting...' : isLive ? 'Encrypt & Submit' : 'Add (Demo)'}
                    </button>
                </div>
            </div>
        </div>
    );
}

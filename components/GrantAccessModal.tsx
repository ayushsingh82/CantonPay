import { useState } from 'react';
import type { Employee } from './EmployeeTable';

interface GrantAccessModalProps {
    isOpen: boolean;
    employee: Employee | null;
    onClose: () => void;
    onGrant: (employeeAddr: string, thirdParty: string, duration: string) => void;
}

export function GrantAccessModal({ isOpen, employee, onClose, onGrant }: GrantAccessModalProps) {
    const [walletAddress, setWalletAddress] = useState('');
    const [duration, setDuration] = useState('24h');

    if (!isOpen || !employee) return null;

    const handleSubmit = () => {
        if (walletAddress.startsWith('0x') && walletAddress.length === 42) {
            onGrant(employee.address, walletAddress, duration);
            setWalletAddress('');
            onClose();
        }
    };

    const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Grant Salary Access</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        Employee: <span style={{ color: 'var(--accent)' }}>{truncateAddress(employee.address)}</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Third-party Wallet Address</label>
                        <input
                            className="form-input"
                            type="text"
                            value={walletAddress}
                            onChange={e => setWalletAddress(e.target.value)}
                            placeholder="0x..."
                            spellCheck={false}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Access Duration</label>
                        <div className="toggle-group">
                            {['24h', '7d', '30d'].map(opt => (
                                <button
                                    key={opt}
                                    className={`toggle-option ${duration === opt ? 'active' : ''}`}
                                    onClick={() => setDuration(opt)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!walletAddress.startsWith('0x') || walletAddress.length !== 42}
                    >
                        Grant Access
                    </button>
                </div>
            </div>
        </div>
    );
}

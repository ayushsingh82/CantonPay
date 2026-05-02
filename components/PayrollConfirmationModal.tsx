import { useState } from 'react';
import { Loader2, X, AlertTriangle } from 'lucide-react';

interface PayrollConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    employeeCount: number;
    isProcessing: boolean;
}

export function PayrollConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    employeeCount,
    isProcessing
}: PayrollConfirmationModalProps) {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (confirmText !== 'CONFIRM') return;
        setError(null);
        try {
            await onConfirm();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Payroll execution failed');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '440px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f59e0b' }}>
                        <AlertTriangle size={24} />
                        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Batch Payroll Confirmation</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px' }}>
                        You are about to run payroll for {employeeCount} employee{employeeCount !== 1 ? 's' : ''}.
                    </p>
                    <p style={{ margin: '8px 0 0', color: '#f59e0b', fontSize: '13px', fontWeight: 500 }}>
                        This action cannot be undone. All salaries will be calculated and transferred immediately.
                    </p>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="terminal-label">Type "CONFIRM" to proceed</label>
                    <input
                        type="text"
                        className="terminal-input"
                        placeholder="Type CONFIRM"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        disabled={isProcessing}
                        style={{ border: confirmText === 'CONFIRM' ? '1px solid var(--accent)' : '' }}
                    />
                </div>

                {error && (
                    <div style={{ color: '#ef4444', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="fire-btn"
                        style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)', color: 'var(--text-primary)' }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="send-action-btn"
                        style={{ flex: 2 }}
                        onClick={handleConfirm}
                        disabled={confirmText !== 'CONFIRM' || isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" style={{ marginRight: '8px' }} />
                                Running Payroll...
                            </>
                        ) : 'Run Payroll'}
                    </button>
                </div>
            </div>
        </div>
    );
}

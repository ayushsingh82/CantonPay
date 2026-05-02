'use client';

import { useState } from 'react';
import { useToken } from '@/hooks/useToken';
import { Send, Loader2, X, AlertTriangle, CheckCircle } from 'lucide-react';

interface SendTokensModalProps {
    isOpen: boolean;
    onClose: () => void;
    senderAddress: string;
}

export function SendTokensModal({ isOpen, onClose, senderAddress }: SendTokensModalProps) {
    const { sendTokens, isTxPending, isConfirming, isConfirmed, txHash } = useToken();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isTxPending || isConfirming) return;
        setError(null);

        try {
            console.log('[SendTokensModal] Sending', amount, 'tokens to', recipient);
            await sendTokens(recipient, Number(amount), senderAddress);
        } catch (err: any) {
            console.error('[SendTokensModal] Send failed:', err);
            setError(err.message || 'Transaction failed');
        }
    };

    const handleClose = () => {
        setRecipient('');
        setAmount('');
        setError(null);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content add-employee-modal">
                <div className="modal-header">
                    <div className="header-icon-wrap">
                        <Send className="header-icon" />
                    </div>
                    <div>
                        <h2 className="modal-title">Send Tokens</h2>
                        <p className="modal-subtitle">Confidential MockUSDC transfer (mUSDC)</p>
                    </div>
                    <button className="modal-close" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                {isConfirmed ? (
                    <div className="success-state">
                        <div className="success-icon-wrap">
                            <CheckCircle className="success-icon" />
                        </div>
                        <h3>Tokens Sent!</h3>
                        <p className="success-msg">Your transaction has been confirmed on the blockchain.</p>
                        <div className="tx-box">
                            <span className="tx-label">TX HASH</span>
                            <span className="tx-value">{txHash?.slice(0, 10)}...{txHash?.slice(-8)}</span>
                        </div>
                        <button className="modal-btn-primary" onClick={handleClose} style={{ marginTop: '24px' }}>
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="input-group">
                            <label htmlFor="recipient">Recipient Address</label>
                            <input
                                id="recipient"
                                type="text"
                                placeholder="0x..."
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                required
                                disabled={isTxPending || isConfirming}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="amount">Amount (mUSDC)</label>
                            <input
                                id="amount"
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                disabled={isTxPending || isConfirming}
                            />
                        </div>

                        <div className="warning-box">
                            <AlertTriangle size={16} className="warning-icon" />
                            <div className="warning-content">
                                <strong>Confidential Transaction</strong>
                                <p>MetaMask will show a large placeholder amount — this is expected for confidential transfers. The actual amount is encrypted.</p>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="modal-btn-secondary"
                                onClick={handleClose}
                                disabled={isTxPending || isConfirming}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="modal-btn-primary"
                                disabled={isTxPending || isConfirming || !recipient || !amount}
                            >
                                {isTxPending || isConfirming ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        {isConfirming ? 'Confirming...' : 'Sending...'}
                                    </>
                                ) : (
                                    'Send Tokens'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

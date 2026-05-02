import { useState, useCallback } from 'react';
import { useToken } from '@/hooks/useToken';
import { CipherText } from './CipherText';
import { Wallet, Eye, Lock, Send, Loader2 } from 'lucide-react';

interface BalanceCardProps {
    walletAddress: string;
    onSendClick: () => void;
}

export function BalanceCard({ walletAddress, onSendClick }: BalanceCardProps) {
    const { balanceHandle, revealBalance, isConfirming } = useToken();
    const [revealedBalance, setRevealedBalance] = useState<string>('••••••');
    const [isRevealed, setIsRevealed] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);

    const handleReveal = useCallback(async () => {
        if (isRevealed || isDecrypting || !balanceHandle) return;

        setIsDecrypting(true);
        try {
            console.log('[BalanceCard] Revealing balance for:', walletAddress);
            const clear = await revealBalance(walletAddress);
            console.log('[BalanceCard] Decrypted balance:', clear);
            setRevealedBalance(`${clear.toLocaleString()} mUSDC`);
            setIsRevealed(true);
        } catch (err) {
            console.error('[BalanceCard] Reveal failed:', err);
            setRevealedBalance('Error');
        } finally {
            setIsDecrypting(false);
        }
    }, [isRevealed, isDecrypting, balanceHandle, revealBalance, walletAddress]);

    const handleHide = useCallback(() => {
        setRevealedBalance('••••••');
        setIsRevealed(false);
    }, []);

    const toggleBalance = useCallback(() => {
        if (isRevealed) handleHide();
        else handleReveal();
    }, [isRevealed, handleHide, handleReveal]);

    return (
        <div className="balance-card">
            <div className="balance-info">
                <div className="balance-label">
                    <Wallet size={14} style={{ marginRight: '6px', color: 'var(--text-tertiary)' }} />
                    Your Balance
                </div>
                <div className="stat-value">
                    <CipherText
                        value={isDecrypting ? 'Decrypting...' : revealedBalance}
                        revealed={isRevealed && !isDecrypting}
                        onToggle={toggleBalance}
                    />
                    {!isDecrypting && (
                        <button className="reveal-btn" onClick={toggleBalance} disabled={!balanceHandle}>
                            {isRevealed ? (
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
                    {isDecrypting && (
                        <div className="decrypt-loading mini" style={{ marginLeft: '12px' }}>
                            <Loader2 className="animate-spin" size={14} />
                        </div>
                    )}
                </div>
            </div>

            <div className="balance-actions">
                <button className="send-action-btn" onClick={onSendClick}>
                    <Send size={14} style={{ marginRight: '6px' }} />
                    Send Tokens
                </button>
            </div>
        </div>
    );
}

import { useWallet } from '@/hooks/useWallet';

interface RoleGateProps {
    children: React.ReactNode;
}

export function RoleGate({ children }: RoleGateProps) {
    const { isConnected, isConnecting, connect, chain, switchChain } = useWallet();

    if (isConnected && chain?.id === 11155111) return <>{children}</>;

    return (
        <div className="role-gate">
            <div className="role-gate-card">
                <div className="role-gate-logo">
                    NZUZO<span>.</span>
                </div>
                <p className="role-gate-subtitle">Confidential Payroll on Ethereum Sepolia</p>
                <p className="role-gate-desc">
                    Connect your employer or employee wallet to access the dashboard.
                    All salary data is encrypted end-to-end using TFHE.
                </p>
                <button
                    className="btn btn-primary"
                    onClick={isConnected ? switchChain : connect}
                    disabled={isConnecting}
                    style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '12px 24px' }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {isConnected ? (
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        ) : (
                            <>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="m7 11 0-4a5 5 0 0 1 10 0l0 4" />
                            </>
                        )}
                    </svg>
                    {isConnecting ? 'Processing...' : isConnected ? 'Switch to Sepolia' : 'Connect Wallet'}
                </button>
                <div className="network-badge" style={{ justifyContent: 'center', marginTop: '16px' }}>
                    <div className="network-dot" />
                    Sepolia Testnet · FHE-powered
                </div>
            </div>
        </div>
    );
}

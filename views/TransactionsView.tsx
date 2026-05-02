import { useTransactionHistory, HistoryEvent } from '../hooks/useTransactionHistory';
import { RefreshCw, ExternalLink, ArrowRightLeft, UserPlus, UserMinus, Play, Loader2 } from 'lucide-react';

interface TransactionsViewProps {
    contractAddress: `0x${string}`;
}

export function TransactionsView({ contractAddress }: TransactionsViewProps) {
    const { events, isLoading, refresh } = useTransactionHistory(contractAddress);

    const getEventIcon = (type: HistoryEvent['type']) => {
        switch (type) {
            case 'EmployeeAdded': return <UserPlus size={16} />;
            case 'EmployeeRemoved': return <UserMinus size={16} />;
            case 'PayrollRun': return <Play size={16} />;
            case 'Transfer': return <ArrowRightLeft size={16} />;
        }
    };

    const formatTimestamp = (ts?: number) => {
        if (!ts) return 'Pending...';
        return new Date(ts * 1000).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncate = (str: string) => `${str.slice(0, 8)}...${str.slice(-6)}`;

    if (isLoading && events.length === 0) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                <Loader2 className="animate-spin" size={24} style={{ marginRight: '12px' }} />
                <span>Fetching blockchain events...</span>
            </div>
        );
    }

    return (
        <div className="content-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="table-container">
                <div className="table-header-bar">
                    <span className="table-title">On-chain History</span>
                    <button
                        className="reveal-btn"
                        onClick={refresh}
                        disabled={isLoading}
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)' }}
                    >
                        <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} style={{ marginRight: '6px' }} />
                        Refresh
                    </button>
                </div>

                {events.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        No on-chain activity found
                    </div>
                ) : (
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Event Type</th>
                                <th>Details</th>
                                <th>Amount</th>
                                <th>Time / Block</th>
                                <th>Transaction</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr key={event.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                                            <span style={{ color: 'var(--accent)' }}>{getEventIcon(event.type)}</span>
                                            {event.type.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {event.detail}
                                    </td>
                                    <td>
                                        {event.type === 'Transfer' ? (
                                            <span className="encrypted-badge mini">CONFIDENTIAL</span>
                                        ) : '-'}
                                    </td>
                                    <td style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                        {event.timestamp ? formatTimestamp(event.timestamp) : `Block #${event.blockNumber}`}
                                    </td>
                                    <td>
                                        <a
                                            href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="table-action-btn"
                                            style={{ color: 'var(--accent)', textDecoration: 'none' }}
                                        >
                                            {truncate(event.transactionHash)}
                                            <ExternalLink size={10} style={{ marginLeft: '4px' }} />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

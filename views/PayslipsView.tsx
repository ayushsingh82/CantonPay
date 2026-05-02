import { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useReadContract } from 'wagmi';
import { NFT_ABI } from '@/lib/contracts';
import { Loader2, ExternalLink, FileText, Lock } from 'lucide-react';

interface PayslipData {
    employee: `0x${string}`;
    payrollDate: bigint;
    payPeriod: bigint;
    payslipType: number;
    memo: string;
}

interface PayslipsViewProps {
    nftAddress: `0x${string}`;
}

export function PayslipsView({ nftAddress }: PayslipsViewProps) {
    const { address } = useAccount();
    const client = usePublicClient();
    const [payslips, setPayslips] = useState<{ id: bigint; data: PayslipData }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { data: tokenIds } = useReadContract({
        address: nftAddress,
        abi: NFT_ABI,
        functionName: 'getPayslipsByEmployee',
        args: [address as `0x${string}`],
        query: { enabled: !!nftAddress && !!address },
    });

    useEffect(() => {
        if (!tokenIds || tokenIds.length === 0 || !client) return;

        const fetchPayslips = async () => {
            setIsLoading(true);
            try {
                const results = await Promise.all(
                    tokenIds.map(async (id) => {
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
                            data: {
                                employee: data[0] as `0x${string}`,
                                payrollDate: data[1],
                                payPeriod: data[2],
                                payslipType: Number(data[3]),
                                memo: data[4],
                            } as PayslipData,
                        };
                    })
                );
                setPayslips(results);
            } catch (err) {
                console.error('[Payslips] fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayslips();
    }, [tokenIds, client, nftAddress]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-tertiary)' }}>
                <Loader2 className="animate-spin" size={32} style={{ marginBottom: '16px' }} />
                <p>Loading your payslips...</p>
            </div>
        );
    }

    if (!tokenIds || tokenIds.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border-hairline)' }}>
                <FileText size={48} style={{ margin: '0 auto 16px', color: 'var(--text-tertiary)', opacity: 0.5 }} />
                <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>No payslips yet</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Your payslips will appear here after your first payroll run.
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px' }}>
            {payslips.map(({ id, data: payslip }) => {
                const date = new Date(Number(payslip.payrollDate) * 1000).toLocaleDateString();
                const isBonus = payslip.payslipType === 1;

                return (
                    <div key={id.toString()} style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-hairline)',
                        borderRadius: 'var(--radius)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: isBonus ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: isBonus ? '#f59e0b' : '#10b981'
                            }}>
                                {isBonus ? 'Bonus' : 'Salary'}
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>#{id.toString()}</span>
                        </div>

                        <div>
                            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Payroll Date</div>
                            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{date}</div>
                        </div>

                        {payslip.memo && (
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>Memo</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{payslip.memo}</div>
                            </div>
                        )}

                        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                                <Lock size={14} />
                                Private 🔒
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <a
                                    href={`https://sepolia.etherscan.io/nft/${nftAddress}/${id.toString()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: '13px',
                                        color: 'var(--accent)',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 500
                                    }}
                                >
                                    Etherscan <ExternalLink size={14} />
                                </a>
                                <a
                                    href={`https://testnet.rarible.com/token/${nftAddress}:${id.toString()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: '13px',
                                        color: 'var(--accent)',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 500
                                    }}
                                >
                                    Rarible <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

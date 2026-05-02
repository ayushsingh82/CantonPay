import { useCallback, useEffect, useState, useRef } from 'react';
import { usePublicClient } from 'wagmi';
import { TOKEN_ADDRESS } from '../config/contracts';
import { parseAbiItem } from 'viem';

export type HistoryEvent = {
    id: string; // Unique identifier (txHash + type + logIndex)
    type: 'EmployeeAdded' | 'EmployeeRemoved' | 'PayrollRun' | 'Transfer' | 'SalaryUpdated' | 'BonusPaid';
    detail: string;
    blockNumber: bigint;
    transactionHash: string;
    timestamp?: number;
};

// Helper for delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export function useTransactionHistory(contractAddress: `0x${string}`) {
    const client = usePublicClient();
    const [events, setEvents] = useState<HistoryEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isFetching = useRef(false);

    const fetchHistory = useCallback(async () => {
        if (!client || !contractAddress || isFetching.current) return;

        isFetching.current = true;
        setIsLoading(true);
        setError(null);

        try {
            console.log('[History] Fetching logs for:', contractAddress);

            const latestBlock = await client.getBlockNumber();
            const fromBlock = latestBlock - 9999n;

            // Define ABIs explicitly to help viem inference
            const employeeAddedAbi = parseAbiItem('event EmployeeAdded(address indexed employee)');
            const employeeRemovedAbi = parseAbiItem('event EmployeeRemoved(address indexed employee)');
            const payrollRunAbi = parseAbiItem('event PayrollRun(uint256 timestamp, uint256 employeeCount)');
            const transferAbi = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 amount)');
            const salaryUpdatedAbi = parseAbiItem('event SalaryUpdated(address indexed employee, uint256 timestamp)');
            const bonusPaidAbi = parseAbiItem('event BonusPaid(address indexed employee, uint256 timestamp, string memo)');

            // Sequential fetching with increased delays to avoid 429
            await delay(250);
            const addedLogs = await client.getLogs({
                address: contractAddress,
                event: employeeAddedAbi,
                fromBlock,
                toBlock: latestBlock,
            });

            await delay(250);
            const removedLogs = await client.getLogs({
                address: contractAddress,
                event: employeeRemovedAbi,
                fromBlock,
                toBlock: latestBlock,
            });

            await delay(250);
            const payrollLogs = await client.getLogs({
                address: contractAddress,
                event: payrollRunAbi,
                fromBlock,
                toBlock: latestBlock,
            });

            await delay(250);
            const transferLogs = await client.getLogs({
                address: TOKEN_ADDRESS as `0x${string}`,
                event: transferAbi,
                fromBlock,
                toBlock: latestBlock,
            });

            await delay(250);
            const salaryLogs = await client.getLogs({
                address: contractAddress,
                event: salaryUpdatedAbi,
                fromBlock,
                toBlock: latestBlock,
            });

            await delay(250);
            const bonusLogs = await client.getLogs({
                address: contractAddress,
                event: bonusPaidAbi,
                fromBlock,
                toBlock: latestBlock,
            });

            // Map and merge
            const merged: HistoryEvent[] = [
                ...addedLogs.map(l => ({
                    id: `${l.transactionHash}-added-${l.logIndex}`,
                    type: 'EmployeeAdded' as const,
                    detail: (l as any).args.employee as string,
                    blockNumber: l.blockNumber,
                    transactionHash: l.transactionHash,
                })),
                ...removedLogs.map(l => ({
                    id: `${l.transactionHash}-removed-${l.logIndex}`,
                    type: 'EmployeeRemoved' as const,
                    detail: (l as any).args.employee as string,
                    blockNumber: l.blockNumber,
                    transactionHash: l.transactionHash,
                })),
                ...payrollLogs.map(l => ({
                    id: `${l.transactionHash}-payroll-${l.logIndex}`,
                    type: 'PayrollRun' as const,
                    detail: `${(l as any).args.employeeCount} employees`,
                    blockNumber: l.blockNumber,
                    transactionHash: l.transactionHash,
                })),
                ...transferLogs.map(l => ({
                    id: `${l.transactionHash}-transfer-${l.logIndex}`,
                    type: 'Transfer' as const,
                    detail: `${((l as any).args.from as string).slice(0, 6)}...${((l as any).args.from as string).slice(-4)} → ${((l as any).args.to as string).slice(0, 6)}...${((l as any).args.to as string).slice(-4)}`,
                    blockNumber: l.blockNumber,
                    transactionHash: l.transactionHash,
                })),
                ...salaryLogs.map(l => ({
                    id: `${l.transactionHash}-salary-${l.logIndex}`,
                    type: 'SalaryUpdated' as const,
                    detail: `Salary updated for ${(l as any).args.employee}`,
                    blockNumber: l.blockNumber,
                    transactionHash: l.transactionHash,
                })),
                ...bonusLogs.map(l => ({
                    id: `${l.transactionHash}-bonus-${l.logIndex}`,
                    type: 'BonusPaid' as const,
                    detail: `Bonus paid: ${(l as any).args.memo}`,
                    blockNumber: l.blockNumber,
                    transactionHash: l.transactionHash,
                })),
            ];

            // Sort by block number descending
            merged.sort((a, b) => Number(b.blockNumber - a.blockNumber));

            // Fetch timestamps for top 10 (reduced from 20 to save requests)
            const top10 = merged.slice(0, 10);
            const blockNumbers = Array.from(new Set(top10.map(e => e.blockNumber)));
            const blockMap = new Map<bigint, number>();

            for (const bn of blockNumbers) {
                try {
                    await delay(150); // Delay between block fetches
                    const block = await client.getBlock({ blockNumber: bn });
                    blockMap.set(bn, Number(block.timestamp));
                } catch (e: any) {
                    if (e.status === 429) {
                        console.warn('[History] Block fetch rate limited, stopping timestamp fetch');
                        break;
                    }
                }
            }

            const withTimestamps = merged.map(e => ({
                ...e,
                timestamp: blockMap.get(e.blockNumber)
            }));

            setEvents(withTimestamps);
            console.log(`[History] Fetched ${merged.length} events`);
        } catch (err: any) {
            console.error('[History] Fetch failed:', err);
            setError(err.message || 'Failed to fetch history');
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, [client, contractAddress]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { events, isLoading, error, refresh: fetchHistory };
}

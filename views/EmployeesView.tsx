import { EmployeeList } from '@/components/EmployeeList';
import { Plus } from 'lucide-react';

interface EmployeesViewProps {
    addresses: string[];
    isEmployer: boolean;
    onRemove: (address: string) => Promise<string>;
    isLoading: boolean;
    walletAddress: string;
    contractAddress: string;
    nftAddress?: `0x${string}`;
    onAddClick: () => void;
    onRunPayroll: () => void;
    payrollCooldown?: bigint;
    lastPayrollRun?: bigint;
}

export function EmployeesView({
    addresses,
    isEmployer,
    onRemove,
    isLoading,
    walletAddress,
    contractAddress,
    nftAddress,
    onAddClick,
    onRunPayroll,
    payrollCooldown,
    lastPayrollRun,
}: EmployeesViewProps) {
    const isCooldownActive = !!(payrollCooldown && lastPayrollRun &&
        (BigInt(Math.floor(Date.now() / 1000)) < lastPayrollRun + payrollCooldown));

    const getRemainingTime = () => {
        if (!isCooldownActive) return '';
        const nextTime = Number(lastPayrollRun || 0n) + Number(payrollCooldown || 0n);
        const diff = nextTime - Math.floor(Date.now() / 1000);
        if (diff <= 0) return '';

        const hours = Math.floor(diff / 3600);
        const minutes = Math.ceil((diff % 3600) / 60);

        if (hours > 0) return ` (${hours}h ${minutes}m)`;
        return ` (${minutes}m)`;
    };
    return (
        <div className="content-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Team Roster</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {isEmployer && (
                        <>
                            <button
                                className="send-action-btn"
                                style={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-hairline)',
                                    color: 'var(--text-primary)',
                                    opacity: isCooldownActive ? 0.6 : 1
                                }}
                                onClick={onRunPayroll}
                                disabled={isCooldownActive}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ marginRight: '6px' }}>
                                    <polygon points="5,3 19,12 5,21 5,3" />
                                </svg>
                                {isCooldownActive ? `Cooldown${getRemainingTime()}` : 'Run Payroll'}
                            </button>
                            <button className="send-action-btn" onClick={onAddClick}>
                                <Plus size={14} style={{ marginRight: '6px' }} />
                                Add Employee
                            </button>
                        </>
                    )}
                </div>
            </div>
            <EmployeeList
                addresses={addresses}
                isEmployer={isEmployer}
                onRemove={onRemove}
                isLoading={isLoading}
                walletAddress={walletAddress}
                contractAddress={contractAddress}
                nftAddress={nftAddress}
            />
        </div>
    );
}

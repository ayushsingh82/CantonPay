import { EmployeeRow } from './EmployeeRow';

export interface Employee {
    address: string;
    salary: string;          // formatted display value or 'ENCRYPTED'
    accessLevel: string;
    status: 'active' | 'pending' | 'inactive';
}

interface EmployeeTableProps {
    addresses: string[];
    isEmployer: boolean;
    isLoading: boolean;
    onFire: (address: string) => void;
    walletAddress: string;
    contractAddress: string;
    nftAddress?: `0x${string}`;
}

export function EmployeeTable({
    addresses,
    isEmployer,
    isLoading,
    onFire,
    walletAddress,
    contractAddress,
    nftAddress
}: EmployeeTableProps) {
    if (isLoading) {
        return (
            <div className="table-container">
                <div className="table-header-bar">
                    <span className="table-title">Employee Roster</span>
                    <span className="table-count">Loading...</span>
                </div>
                <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    Fetching on-chain data...
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="table-header-bar">
                <span className="table-title">Employee Roster</span>
                <span className="table-count">{addresses.length} records</span>
            </div>
            <table className="employee-table">
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Salary (mUSDC)</th>
                        <th>Access Level</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {addresses.map(addr => (
                        <EmployeeRow
                            key={addr}
                            address={addr}
                            isEmployer={isEmployer}
                            onRemove={onFire}
                            walletAddress={walletAddress}
                            contractAddress={contractAddress}
                            nftAddress={nftAddress}
                        />
                    ))}

                    {addresses.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-tertiary)' }}>
                                {isEmployer ? 'No employees registered yet. Click "Add Employee" to get started.' : 'You are not registered as an employee in this payroll contract.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

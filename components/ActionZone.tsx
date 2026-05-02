'use client';

interface ActionZoneProps {
    onRunPayroll: () => void;
    onAddEmployee: () => void;
    isPayrollRunning: boolean;
    employeeCount: number;
    payrollCooldown?: bigint;
    lastPayrollRun?: bigint;
}

export function ActionZone({
    onRunPayroll,
    onAddEmployee,
    isPayrollRunning,
    employeeCount,
    payrollCooldown,
    lastPayrollRun
}: ActionZoneProps) {
    const isCooldownActive = !!(payrollCooldown && lastPayrollRun &&
        (BigInt(Math.floor(Date.now() / 1000)) < lastPayrollRun + payrollCooldown));

    const getRemainingTime = () => {
        if (!isCooldownActive) return '';
        const nextTime = Number(lastPayrollRun || 0n) + Number(payrollCooldown || 0n);
        const diff = nextTime - Math.floor(Date.now() / 1000);
        if (diff <= 0) return '';

        const hours = Math.floor(diff / 3600);
        const minutes = Math.ceil((diff % 3600) / 60);

        if (hours > 0) return `${hours}h ${minutes}m left`;
        return `${minutes}m left`;
    };

    const remainingTime = getRemainingTime();

    return (
        <div className="action-zone">
            <button
                className="btn btn-primary"
                onClick={onRunPayroll}
                disabled={isPayrollRunning || employeeCount === 0 || !!isCooldownActive}
                style={{ opacity: isCooldownActive ? 0.6 : 1, position: 'relative' }}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5,3 19,12 5,21 5,3" />
                </svg>
                {isPayrollRunning ? 'Executing...' : isCooldownActive ? `Cooldown: ${remainingTime}` : 'Run Payroll'}
            </button>

            <button className="btn btn-secondary" onClick={onAddEmployee}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Employee
            </button>

            <div className="action-spacer" />

            <span className="action-status">
                {employeeCount > 0
                    ? `${employeeCount} employee${employeeCount !== 1 ? 's' : ''} • FHE batch ready`
                    : 'No employees registered'}
            </span>
        </div>
    );
}

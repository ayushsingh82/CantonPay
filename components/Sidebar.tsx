'use client';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    /** Logged-in Daml party (Canton JSON API session). */
    partyId: string | null;
    onLogout: () => void;
    isEmployer: boolean;
}

const NAV_ITEMS = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        id: 'employees',
        label: 'Employees',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        id: 'transactions',
        label: 'Transactions',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
                <polyline points="16,7 22,7 22,13" />
            </svg>
        ),
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
        ),
    },
];

const PAYSLIP_NAV_ITEM = {
    id: 'payslips',
    label: 'Payslips',
    icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    ),
};

const truncateParty = (id: string) =>
    id.length > 18 ? `${id.slice(0, 10)}…${id.slice(-6)}` : id;

export function Sidebar({ activeTab, onTabChange, partyId, onLogout, isEmployer }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>
                    CANTON<span>.</span>
                </h1>
                <div className="subtitle">Payroll · Daml</div>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map(item => (
                    <button
                        type="button"
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => onTabChange(item.id)}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
                {!isEmployer && (
                    <button
                        type="button"
                        key={PAYSLIP_NAV_ITEM.id}
                        className={`nav-item ${activeTab === PAYSLIP_NAV_ITEM.id ? 'active' : ''}`}
                        onClick={() => onTabChange(PAYSLIP_NAV_ITEM.id)}
                    >
                        {PAYSLIP_NAV_ITEM.icon}
                        {PAYSLIP_NAV_ITEM.label}
                    </button>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="network-badge" style={{ marginBottom: '8px' }}>
                    <div className="network-dot" />
                    Canton · JSON API
                </div>
                {partyId ? (
                    <button
                        type="button"
                        className="nav-item"
                        onClick={onLogout}
                        style={{ fontSize: '11px', padding: '6px 10px', width: '100%' }}
                        title={partyId}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', flexShrink: 0 }}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                        </svg>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{truncateParty(partyId)}</span>
                    </button>
                ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>No party session</span>
                )}
            </div>
        </aside>
    );
}

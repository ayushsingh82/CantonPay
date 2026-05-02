// ── Contract Addresses (set via Vite env vars after deployment) ──
export const FACTORY_ADDRESS = (import.meta.env.VITE_FACTORY_ADDRESS || '') as `0x${string}`;
export const TOKEN_ADDRESS = (import.meta.env.VITE_TOKEN_ADDRESS || '') as `0x${string}`;
export const FACTORY_DEPLOY_BLOCK = 10434411n;
export const PAYROLL_DEPLOY_BLOCK = 10433478n;

// ── PayrollFactory ABI ──
export const FACTORY_ABI = [
    {
        inputs: [
            { internalType: 'address', name: '_tokenAddress', type: 'address' },
            { internalType: 'address', name: '_feeCollector', type: 'address' },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'employer', type: 'address' },
            { indexed: true, internalType: 'address', name: 'payrollContract', type: 'address' },
            { indexed: true, internalType: 'address', name: 'nftContract', type: 'address' },
        ],
        name: 'PayrollCreated',
        type: 'event',
    },
    {
        inputs: [],
        name: 'createPayroll',
        outputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
        ],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'employer', type: 'address' }],
        name: 'getEmployerContracts',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'deploymentFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

// ── ConfidentialPayroll ABI ──
export const PAYROLL_ABI = [
    {
        inputs: [{ internalType: 'address', name: 'tokenAddress', type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }],
        name: 'EmployeeAdded',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }],
        name: 'EmployeeRemoved',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'employeeCount', type: 'uint256' },
        ],
        name: 'PayrollRun',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'employee', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        name: 'SalaryUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'employee', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
            { indexed: false, internalType: 'string', name: 'memo', type: 'string' },
        ],
        name: 'BonusPaid',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: 'uint256', name: 'cooldownInSeconds', type: 'uint256' }],
        name: 'CooldownUpdated',
        type: 'event',
    },
    {
        inputs: [
            { internalType: 'address', name: 'employee', type: 'address' },
            { internalType: 'einput', name: 'encryptedSalary', type: 'bytes32' },
            { internalType: 'bytes', name: 'inputProof', type: 'bytes' },
        ],
        name: 'addEmployee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'employee', type: 'address' }],
        name: 'removeEmployee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getEmployees',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'employeeCount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'employees',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'employer',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'employee', type: 'address' }],
        name: 'getSalaryHandle',
        outputs: [{ internalType: 'euint64', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'thirdParty', type: 'address' }],
        name: 'grantSalaryAccess',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'isEmployee',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'employee', type: 'address' },
            { internalType: 'einput', name: 'encryptedSalary', type: 'bytes32' },
            { internalType: 'bytes', name: 'inputProof', type: 'bytes' },
        ],
        name: 'updateSalary',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'employee', type: 'address' },
            { internalType: 'einput', name: 'encryptedBonus', type: 'bytes32' },
            { internalType: 'bytes', name: 'inputProof', type: 'bytes' },
            { internalType: 'string', name: 'memo', type: 'string' },
        ],
        name: 'payBonus',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'cooldownInSeconds', type: 'uint256' }],
        name: 'setPayrollCooldown',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'payrollCooldown',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'lastPayrollRun',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'runPayroll',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'token',
        outputs: [{ internalType: 'contract IConfidentialERC20', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getTreasuryHandle',
        outputs: [{ internalType: 'euint64', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'syncTreasuryAllowance',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'nft',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

// ── PayrollNFT ABI ──
export const NFT_ABI = [
    {
        inputs: [{ internalType: 'address', name: 'employee', type: 'address' }],
        name: 'getPayslipsByEmployee',
        outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
        name: 'payslips',
        outputs: [
            {
                components: [
                    { internalType: 'address', name: 'employee', type: 'address' },
                    { internalType: 'uint256', name: 'payrollDate', type: 'uint256' },
                    { internalType: 'uint256', name: 'payPeriod', type: 'uint256' },
                    { internalType: 'uint8', name: 'payslipType', type: 'uint8' },
                    { internalType: 'string', name: 'memo', type: 'string' },
                ],
                internalType: 'struct PayrollNFT.PayslipData',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

// ── MockUSDC ABI ──
export const TOKEN_ABI = [
    {
        inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint64', name: 'amount', type: 'uint64' },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'euint64', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'einput', name: 'encryptedAmount', type: 'bytes32' },
            { internalType: 'bytes', name: 'inputProof', type: 'bytes' },
        ],
        name: 'transfer',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'address', name: 'to', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'Transfer',
        type: 'event',
    },
] as const;

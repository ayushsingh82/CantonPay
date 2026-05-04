# Canton Payroll: How It Works

Canton Payroll is a specialized demonstration of the Canton Network's sub-transaction privacy capabilities combined with modern React (Next.js) frontends. Below is a breakdown of the business logic, the Daml smart contracts, and how the frontend orchestrates the state.

## 1. The Daml Logic (`Payroll.daml`)

The core business rules reside entirely on the Canton Network. Two primary templates control the state:

### `PayrollOrganization` Template
This is the root contract of the application. It acts as the "control center" and treasury.
- **Signatory**: The `employer` (who funds the treasury and triggers payroll).
- **Observer**: The `operator`.
- **State**: Holds the `treasuryBalance` (Decimal), a `payrollCooldownSeconds` lock, and `lastPayrollRun`.
- **Choices**:
  - `UpdateTreasuryFromEmployer`: Archives the current contract and reissues it with a new `treasuryBalance`.
  - `AddEmployee`: A non-consuming choice that generates a secondary `EmploymentContract` linked to this overarching organization.
  - `RunPayroll`: Acts as the trigger event that finalizes a batch disbursement.

### `EmploymentContract` Template
This defines individual employee salaries.
- **Signatory**: The `employer`.
- **Observers**: The `employee` and `operator`.
- **Privacy Model**: Because `employee` is an observer *only* on their own specific template, they are cryptographically locked out from viewing other `EmploymentContract`s within the same `PayrollOrganization`.
- **Choices**:
  - `UpdateSalary`: Allows the employer to change the employee's salary.
  - `RemoveEmployee`: Archives the contract, effectively firing the employee.

## 2. Next.js Frontend Integration (`canton-payroll`)

The frontend application uses a hybrid data model that bridges the ledger's JSON API with standard React hooks.

### Ledger Interaction (`lib/canton/index.ts`)
The `canton` library is a thin wrapper over the Canton JSON API (`POST /v1/create`, `POST /v1/exercise`, `POST /v1/query`).
- **Party Tokens**: For demo purposes, parties are dynamically allocated on the fly using the `allocateParty` function, and simulated JSON Web Tokens (JWTs) or bare requests are used to authorize as those parties.
- **Commands**: Components dispatch commands to the ledger. For instance, when an employer clicks "Add Employee", the frontend sends an HTTP request instructing the ledger to exercise the `AddEmployee` choice on the specific `PayrollOrganization` contract ID.

### State Visibility
Because Canton is a synchronized, distributed ledger:
- When the React hook queries the Canton API (`POST /v1/query`), the response returns only the contracts the currently authenticated party has the rights to read.
- This means the frontend logic does not have to filter the salaries—the Canton backend natively enforces data segregation before the JSON data even hits the browser.

## 3. Workflow Cycle

1. **Initialization:** The employer deploys the initial `PayrollOrganization` contract with zero capital.
2. **Setup:** The employer exercises the treasury funding choice to provide enough `CC` (Canton Coin / Splice Amulets equivalent) to cover salaries.
3. **Drafting:** The employer adds `EmploymentContract`s. The active contract set (ACS) expands.
4. **Execution:** The employer exercises `RunPayroll` on the `PayrollOrganization`. In a full smart-contract setup, this would trigger an atomic transaction transferring assets from the loaded treasury into the possession of the `employee` parties based on their `EmploymentContract` amounts.

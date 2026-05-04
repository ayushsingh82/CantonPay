# Canton Payroll Demo Walkthrough

This demo showcases a decentralized, party-scoped payroll system built on the Canton Network. It demonstrates how an Employer can securely manage treasury balances and employee rosters, while employees retain cryptographic privacy guarantees—meaning they can only view their own salary data, not their colleagues'.

## Getting Started

1. **Launch the Interface:**
   - Open the application in your browser (likely on `localhost:3000`).
   - The landing page provides access to the `PayrollOrganization` control center.

2. **Spawn a Demo Organization:**
   - Instead of manually compiling Daml and booting a sandbox, use the **Spawn demo org (Employer session)** button.
   - *Behind the scenes:* This uses your Canton JSON API to allocate an `Employer` party, an `Operator` party, and initializes a fresh `PayrollOrganization` Daml contract on the ledger.
   - You will automatically be authenticated into the Employer dashboard mapped to this newly created contract.

## Employer Flow (Operator perspective)

1. **Treasury Management & Visibility:**
   - In the dashboard, observe the current `Treasury Balance`.
   - Before executing a payroll, the Employer must fund the treasury.
   - Click the "Modify Balance" button to inject capital (e.g. `100000`). This exercises the `UpdateTreasuryFromEmployer` choice on the Canton ledger.

2. **Roster Maintenance (Adding Employees):**
   - Head over to the Employee Roster section.
   - Assign a unique Party alias for the new employee (e.g. `Bob`) and set their Salary.
   - Click to add them. This creates a distinct `EmploymentContract` in Daml between the Employer and that specific Employee.
   - You can update existing salaries (which archives and creates new `EmploymentContract`s) or remove employees (which simply exercises the `RemoveEmployee` choice).

3. **Batch Execution (Running Payroll):**
   - With the treasury funded and the roster populated, the Employer can trigger the payroll run.
   - Ensure the required Cooldown block (e.g., waiting 86400 seconds) has elapsed, or manually modify the cooldown parameter if supported.
   - Click **Run Payroll** to record the execution timeline onto the global state.

## Employee Privacy Flow (The Canton Advantage)

1. **Logging in as an Employee:**
   - Note the exact Party Id of an employee you just created (e.g. `Bob`).
   - Log out / reset the session, and paste the specific `PayrollOrganization` ID.
   - Rather than acting as the Employer, assume the Employee's party identity via the dev tools or login swap.

2. **Verifying Data Segregation:**
   - As `Bob`, you have `observer` rights over *only* your own `EmploymentContract`.
   - Your interface will correctly display your personal salary.
   - You will **not** be able to view the salaries of other employees in the organization—Canton's sub-transaction privacy ensures other `EmploymentContract` payloads are never even transmitted to your participant node.

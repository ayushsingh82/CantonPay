# CantonPay

## What we're building

**CantonPay** is a web frontend for **employer–employee payroll on Canton**:
a dashboard-style shell (sidebar, stats rail, roster table, action zone)
with an ice/navy visual theme. The **source of truth is Daml** on the
ledger, not an EVM chain.

Organizations and employment lines live in **`daml/Payroll.daml`**
(`PayrollOrganization`, `EmploymentContract`). This Next.js app talks to
your participant through the **Ledger JSON API**: create/query contracts,
exercise choices (`RunPayroll`, `AddEmployee`, `FundTreasury`, …), and
drive the UI from ledger state.

There is **no wagmi, viem, ethers, or FHEVM** stack here. Authentication
is **party-based** (JSON API JWT with `actAs`), aligned with how Canton
sandboxes and deployments expose HTTP APIs. A built-in **wallet** persists
party + network selections in `localStorage` so the UX feels familiar to
EVM users without pretending to custody anything. When the JSON API isn't
reachable the wallet offers a **demo-party fallback** so the UI can be
toured offline.

---

## End-to-end flow

```
┌─────────────────┐         ┌────────────────────────┐         ┌──────────────────────────┐
│   Browser UI    │         │  Browser-side library  │         │   Canton participant     │
│  (Next.js app)  │         │     (lib/canton/*)     │         │   + Daml ledger          │
└─────────────────┘         └────────────────────────┘         └──────────────────────────┘
        │                              │                                    │
  ① pick network ─────────────────────►│                                    │
  ② Connect wallet (hint)              │                                    │
        │  ───────────────────────────►│  POST /v1/parties/allocate          │
        │                              │   ─────────────────────────────────►│
        │                              │   ◄─── party identifier ────────── │
        │  ◄── partyId saved to ─────── │                                    │
        │     localStorage              │  partyToken(partyId, networkId)    │
        │                              │   → unsigned dev JWT                │
        │                                                                    │
  ③ Open or Spawn org ────────────────►│  POST /v1/create  PayrollOrganization
        │                              │   Authorization: Bearer <jwt>       │
        │                              │   ─────────────────────────────────►│
        │                              │   ◄─── contractId ──────────────── │
        │  ◄── route /org/<cid> ─────── │                                    │
        │                                                                    │
  ④ Dashboard mounts                                                         │
     usePayroll(cid):                                                        │
        │  ───────────────────────────►│  POST /v1/query  EmploymentContract
        │                              │  POST /v1/fetch  PayrollOrganization
        │                              │   ─────────────────────────────────►│
        │                              │   ◄─── ACS rows visible to party  │
        │                                                                    │
  ⑤ Actions (employer):                                                      │
        FundTreasury / AddEmployee / RunPayroll                              │
        │  ───────────────────────────►│  POST /v1/exercise <choice>         │
        │                              │   ─────────────────────────────────►│
        │                              │   ◄── new contract id / archive ── │
        │  ◄── refresh ──────────────── │                                    │
```

What the **landing page** maps to in this diagram:

| UI element | What it does |
|---|---|
| Network selector (navbar) | Switches `networkId` ⇒ swaps `apiUrl` + `ledgerId` for every subsequent request. |
| Wallet panel · **Connect wallet** | Steps ① + ② above; persists `(partyId, hint, networkId)` to `localStorage`. |
| **Open** (existing org) | Step ③ skipped — routes directly to `/org/<contractId>`. |
| **Spawn demo org on Sandbox** | Step ③: allocates `Operator`, creates `PayrollOrganization`, redirects. |
| **Use demo party (no ledger)** | Skips ② entirely, mints a deterministic mock party id locally. |

---

## Daml templates and on-ledger guarantees

`daml/Payroll.daml` has two templates.

### `PayrollOrganization`

- **Signatory:** `employer`. **Observer:** `operator`.
- **State:** `currency`, `treasuryBalance : Decimal`,
  `payrollCooldownSeconds : Int`, `lastPayrollRun : Text` (ISO),
  `lastPayrollRunUnix : Int`, `orgLabel : Text`.
- **Choices:**
  - `AddEmployee employee salary payrollOrgCid` — non-consuming, creates
    an `EmploymentContract`. Asserts `salary > 0`.
  - `FundTreasury addAmount` — additive top-up. Archives + recreates
    with `treasuryBalance + addAmount`.
  - `UpdateTreasuryFromEmployer newBalance` — replace the balance.
  - `SetPayrollCooldown seconds` — change the cooldown window.
  - `RunPayroll runAt runAtUnix totalAmount` — the real payroll trigger.
    Asserts:
    ```daml
    treasuryBalance >= totalAmount
    runAtUnix >= lastPayrollRunUnix + payrollCooldownSeconds
    ```
    then archives + recreates with treasury decremented and the run
    timestamps stamped. Cooldown is enforced **on-ledger**, not in the UI.

### `EmploymentContract`

- **Signatory:** `employer`. **Observers:** `employee, operator`.
- **State:** `payrollOrgCid`, `salary`, `currency`, `orgLabel`.
- **Choices:** `RemoveEmployee`, `UpdateSalary newSalary`.

The privacy story comes for free: an employee party is an observer only
on their own `EmploymentContract`, so `POST /v1/query` against their JWT
returns just their own row. Other employees' salaries are never sent to
their participant.

---

## Token flow

Every request the browser makes is signed with a **dev-style unsigned
JWT** built per active `(partyId, networkId)`:

```
Header   { "alg": "HS256", "typ": "JWT" }
Payload  {
           "https://daml.com/ledger-api": {
             "ledgerId":      "sandbox" | "participant1",
             "applicationId": "cantonpay",
             "actAs":         ["<partyId>"],
             "readAs":        ["<partyId>"]
           },
           "exp": now + 86400,
           "sub": "<partyId>"
         }
Signature  "unsigned"     ← swap for a signed JWT in production
```

Admin tokens (used by `allocateParty`'s `/v1/parties` lookup) replace the
`actAs/readAs` with `admin: true` and `sub: "admin"`.

The token is sent on every JSON API call as
`Authorization: Bearer <header>.<payload>.unsigned`. Switching networks
or accounts re-mints the JWT immediately.

`/tmp/cantonpay-token-probe.mjs` (in this repo's chat history; reproduce
locally if you want to re-run it) decodes both tokens and asserts the
shape — handy as a regression check when changing
`lib/canton/json-api-client.ts`.

---

## Wallet & networks

The wallet (`lib/canton/wallet.ts` + `contexts/canton-auth.tsx`) is a thin
party-management layer, not a custodian.

- **Per-network accounts.** Each saved account is keyed by
  `(networkId, partyId)`. Switching networks shows that network's saved
  accounts and clears the active session if there are none.
- **Persistent.** Stored under `cantonpay:wallet` in `localStorage`; up
  to 8 accounts per browser.
- **Multi-party flows.** Connect as `Employer` to spawn an org and run
  payroll; switch to `Bob` to see only Bob's `EmploymentContract` and
  verify Canton's privacy guarantees in DevTools.
- **Demo-party fallback.** If `Connect party` can't reach the JSON API
  (no sandbox running, wrong URL), the modal surfaces a clear error and
  a `Use demo party (no ledger)` button that mints a deterministic mock
  party id so you can browse the UI without a backend.
- **Dev JWTs.** The browser uses unsigned `actAs/readAs` JWTs.
  **Production deployments must swap in signed JWTs** from your IdP or
  participant — see `partyToken` / `adminToken` in
  `lib/canton/json-api-client.ts`.

Networks are presets in `lib/canton/networks.ts`:

| Preset | JSON API URL (env-overridable) | Currency | Use it for |
|---|---|---|---|
| `sandbox` | `NEXT_PUBLIC_CANTON_JSON_API_URL` (default `http://localhost:7575`) | `DEV` | Local Daml sandbox |
| `cc-testnet` | `NEXT_PUBLIC_CANTON_TESTNET_JSON_API_URL` (default `http://localhost:7585`) | `CC` | Your participant connected to the Splice Global Synchronizer DevNet |

> **CC DevNet caveat.** The Canton Network DevNet does **not** expose a
> single shared JSON API; `cc-testnet` points at *your* participant. The
> treasury balance on `PayrollOrganization` is a Daml `Decimal`, not a
> held Canton Coin Amulet. For real CC payouts, wire a Splice Amulets
> transfer in the operator backend and mirror the spent amount into the
> treasury via `FundTreasury` / `RunPayroll`.

---

## Repository structure

```text
app/
  layout.tsx              # Root layout, fonts, Providers
  page.tsx                # Landing (CantonLanding)
  globals.css             # Tailwind + theme tokens
  dashboard/page.tsx      # Standalone marketing/demo dashboard (no ledger)
  org/[contractAddress]/  # Dynamic org route → PayrollApp
    page.tsx

components/
  canton-landing.tsx      # Landing + spawn-org card + WalletPanel + NetworkSelector
  payroll-app.tsx         # Org dashboard shell, role-gating, modals
  Sidebar.tsx             # Sidebar with embedded WalletPanel
  WalletPanel.tsx         # Connected-party widget (sidebar + landing)
  WalletConnectModal.tsx  # Multi-account wallet manager + connect new party + demo fallback
  NetworkSelector.tsx     # Network dropdown
  RoleGate.tsx            # Pre-auth gate, opens WalletConnectModal
  FundTreasuryModal.tsx   # Top-up (FundTreasury) vs. set-absolute (UpdateTreasury)
  AddEmployeeModal.tsx, EmployeeList.tsx, EmployeeTable.tsx, …

contexts/
  canton-auth.tsx         # Wallet provider: partyId, network, JWT, accounts[], login + loginDemo

hooks/
  usePayroll.ts           # React state + actions; threads apiUrl + networkId

lib/canton/
  config.ts               # DAML package id, defaults, templateId()
  networks.ts             # Network presets (sandbox + cc-testnet)
  wallet.ts               # localStorage-backed wallet store
  env.ts                  # JSON API base URL resolution
  types.ts                # JSON API payload shapes
  daml-decimal.ts         # Number ↔ Daml Decimal string
  json-api-client.ts      # JWT helpers; create / query / exercise / fetch (apiUrl-aware)
  payroll-ledger.ts       # Payroll-specific ledger ops (apiUrl + networkId)
  index.ts                # Barrel exports

daml/
  Payroll.daml            # PayrollOrganization + EmploymentContract

styles/
  payroll-ui.css          # Dashboard shell tokens + landing-grid + footer-grid
```

**Dependency direction:** UI and hooks depend on `lib/canton`;
`payroll-ledger.ts` depends on `json-api-client.ts` and `types.ts`, not
on React. Ledger logic is portable and unit-testable.

---

## Prerequisites

- Node 20+
- Daml SDK 2.10.x (for `daml build` and the package id)
- A Canton participant with **JSON API** enabled (local sandbox or your
  own participant connected to DevNet)

---

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CANTON_JSON_API_URL` | Sandbox JSON API base (no `/v1` suffix). Default `http://localhost:7575`. |
| `CANTON_JSON_API_URL` | Server-side alias for the sandbox URL (optional). |
| `NEXT_PUBLIC_CANTON_TESTNET_JSON_API_URL` | JSON API for the `cc-testnet` preset — point at *your* DevNet-connected participant. Default `http://localhost:7585`. |
| `NEXT_PUBLIC_CANTON_TESTNET_LEDGER_ID` | Ledger id for the testnet preset. Default `participant1`. |
| `NEXT_PUBLIC_DAML_PACKAGE_ID` | **Required for real ledger calls.** Package hash from `daml build`; template ids resolve to `#packageId:Payroll:PayrollOrganization`. |
| `NEXT_PUBLIC_CANTON_LEDGER_ID` | Sandbox ledger id. Default `sandbox`. |
| `NEXT_PUBLIC_CANTON_APPLICATION_ID` | JWT `applicationId`. Default `cantonpay`. Must match what your participant expects. |
| `NEXT_PUBLIC_CANTON_NETWORK` | Default network the wallet boots into: `sandbox` or `cc-testnet`. |

Daml `Decimal` fields (`treasuryBalance`, `salary`, …) are sent to the
JSON API as **strings** — see `lib/canton/daml-decimal.ts`.

---

## Daml

- **Module:** `Payroll` (`daml/Payroll.daml`)
- **Templates:** `PayrollOrganization`, `EmploymentContract`
- **Build:**

  ```bash
  daml build
  # → Created .daml/dist/cantonpay-0.1.0.dar (package id: <hash>)
  ```

  Paste `<hash>` into `NEXT_PUBLIC_DAML_PACKAGE_ID` so the JSON API can
  match template ids.

- **Sandbox:** start a local Daml/Canton sandbox + JSON API per the Daml
  docs. The default URL is `http://localhost:7575`.

---

## Frontend

```bash
npm install
npm run dev
# → http://localhost:3000
```

On the landing page:

1. Pick a network in the navbar (Sandbox or CC DevNet).
2. **Connect wallet** → enter a hint (`Employer` for the demo). If the
   JSON API is unreachable you'll see a fallback `Use demo party
   (no ledger)` button that lets you tour the UI offline.
3. Either paste an existing `PayrollOrganization` contract id, or click
   **Spawn demo org** to allocate an Operator and create a fresh org.
   The redirect goes to `/org/<contract-id>`.

For the full step-by-step (with employee privacy verification and CC
DevNet notes), see [`demo.md`](./demo.md).

---

## Scripts

- `npm run dev` — Next.js dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint

---

## Security notes

- The dev JWT helpers in `json-api-client.ts` are **unsigned**. They work
  against sandboxes that accept any JWT with the right claims, but they
  are **not safe for production**. Replace `partyToken` / `adminToken`
  with calls to your IdP or participant's signed-token endpoint before
  deploying.
- The wallet stores party ids and hints — **no key material**. Canton's
  party-based auth means the participant + IdP are the actual security
  boundary; the browser wallet exists for UX, not custody.
- Demo-party mode mints local mock ids that are not registered with any
  participant. Any real ledger call will fail under a demo party — that's
  by design; the fallback is for UI tours, not for production.
- Currency strings (`DEV`, `CC`) on the org template are labels; real CC
  movement requires Splice Amulets handled outside this UI.

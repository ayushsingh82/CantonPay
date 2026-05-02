# canton-payroll

## What we’re building

**canton-payroll** is a web frontend for **employer–employee payroll on Canton**: a dashboard-style shell (sidebar, stats rail, roster table, action zone) with an ice/navy visual theme. The **source of truth is Daml** on the ledger, not an EVM chain.

You model organizations and employment lines in **`daml/Payroll.daml`** (`PayrollOrganization`, `EmploymentContract`). This Next.js app talks to your participant through the **Ledger JSON API**: create/query contracts, exercise choices (`RunPayroll`, `AddEmployee`, etc.), and drive the UI from ledger state.

There is **no wagmi, viem, ethers, or FHEVM** stack here; authentication is **party-based** (JSON API JWT with `actAs`), aligned with how Canton sandboxes and deployments expose HTTP APIs.

---

## How it works (end-to-end)

1. **Landing** (`/`) — Marketing-style page; user pastes a **PayrollOrganization** ledger contract id and opens `/org/[id]`, or spawns a **demo org** (allocate parties + create contract) when `NEXT_PUBLIC_CANTON_JSON_API_URL` is set.
2. **Org app** (`/org/[contractAddress]`) — Loads **`PayrollApp`**. Without JSON API URL configured, the user sees configuration guidance.
3. **Party login** — **`CantonAuthProvider`** resolves a party from a **hint** via `allocateParty` / reuse (sandbox JSON API). Session holds **party id** in `sessionStorage`; **`partyToken(partyId)`** builds the JWT used as **Bearer** on ledger calls (`actAs` + `readAs` that party).
4. **Data** — **`usePayroll(orgContractId)`** calls **`lib/canton/payroll-ledger.ts`**: query employment contracts for that org, fetch the org contract, expose treasury, roster, cooldowns, and mutation helpers.
5. **Actions** — Buttons exercise Daml choices (`RunPayroll`, `AddEmployee`, `RemoveEmployee`, `UpdateTreasuryFromEmployer`) through **`json-api-client`** (`/v1/exercise`, etc.).

---

## Repository structure

High-level map (only the parts that matter for Canton + UI):

```text
app/
  layout.tsx              # Root layout, fonts, Providers
  page.tsx                # Landing (CantonLanding)
  globals.css             # Tailwind + theme tokens
  org/[contractAddress]/  # Dynamic org route → PayrollApp
    page.tsx

components/               # UI: sidebar, stats, modals, tables, landing
contexts/
  canton-auth.tsx         # Party session + token for JSON API

hooks/
  usePayroll.ts           # React state + org roster; calls lib/canton

lib/canton/
  config.ts               # DAML package id, ledgerId, app id, templateId()
  types.ts                # JSON API payload shapes (Payroll module)
  json-api-client.ts      # JWT helpers; create / query / exercise / fetch
  payroll-ledger.ts       # Payroll-specific ledger operations (no React)
  index.ts                # Barrel exports

daml/                     # Daml sources (e.g. Payroll.daml)
styles/
  payroll-ui.css          # Dashboard shell (sidebar, stats, tables, modals)
```

**Dependency direction:** UI and hooks depend on **`lib/canton`**; **`payroll-ledger.ts`** depends on **`json-api-client.ts`** and **`types.ts`**, not on React. That keeps ledger logic testable and portable.

---

## Prerequisites

- Node 20+
- Daml SDK (for `daml build` and package id)
- A Canton participant with **JSON API** enabled (local sandbox or remote)

---

## Environment

Create `.env.local`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CANTON_JSON_API_URL` | Base URL of the Ledger JSON API (e.g. `http://localhost:7575`) |
| `NEXT_PUBLIC_DAML_PACKAGE_ID` | Package id from `daml build` / `.dar` metadata |
| `NEXT_PUBLIC_CANTON_LEDGER_ID` | Optional; defaults in `lib/canton/config.ts` if unset |
| `NEXT_PUBLIC_CANTON_APPLICATION_ID` | Optional application id for multi-app deployments |

The client uses **unsigned dev-style JWTs** in code paths suitable for sandbox demos. **Production** deployments should issue **properly signed** JWTs from your IdP or participant docs; swap or extend the helpers in `json-api-client.ts` when you harden auth.

---

## Daml

- **Module:** `Payroll` (`daml/Payroll.daml`)
- **Templates:** `PayrollOrganization`, `EmploymentContract`
- **Build:** `daml build`, then set **`NEXT_PUBLIC_DAML_PACKAGE_ID`** to the built package id so JSON API **template IDs** resolve correctly.

---

## Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000): landing page; join an org by pasting a **PayrollOrganization** contract id, or use **Spawn demo org** when the JSON API URL is configured.

---

## Scripts

- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm run lint` — ESLint

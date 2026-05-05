# CantonPay Demo Walkthrough

End-to-end demo of CantonPay running against a Canton Daml ledger via the
JSON API. The wallet, network selector, and payroll dashboard all share a
single source of truth: the `PayrollOrganization` and `EmploymentContract`
templates in `daml/Payroll.daml`.

The walkthrough covers two networks:

| Preset | When to use | Currency |
|---|---|---|
| **Local sandbox** | Daml SDK sandbox JSON API on `localhost:7575` | `DEV` |
| **Canton Coin · DevNet** | Your participant connected to the Splice Global Synchronizer DevNet | `CC` |

Switch between them at any time from the network selector in the navbar or
from the wallet modal — the wallet remembers parties per-network.

---

## 0. One-time setup

```bash
cd canton-payroll
cp .env.example .env.local
npm install
```

Edit `.env.local`:

```
# Sandbox JSON API (used by the "Local sandbox" network preset)
NEXT_PUBLIC_CANTON_JSON_API_URL=http://localhost:7575

# Canton Coin DevNet (used by the "Canton Coin · DevNet" preset).
# Point this at YOUR participant's JSON API; the global synchronizer does
# not expose a single shared JSON API.
NEXT_PUBLIC_CANTON_TESTNET_JSON_API_URL=http://localhost:7585
NEXT_PUBLIC_CANTON_TESTNET_LEDGER_ID=participant1

# Default network the wallet boots into: sandbox | cc-testnet
NEXT_PUBLIC_CANTON_NETWORK=sandbox
```

Build the Daml package once and copy the package id into `.env.local` so
the JSON API can resolve template ids:

```bash
daml build
# → "Created .daml/dist/cantonpay-0.1.0.dar (package id: <hash>)"
echo 'NEXT_PUBLIC_DAML_PACKAGE_ID=<hash>' >> .env.local
```

Start the app:

```bash
npm run dev
# → http://localhost:3000
```

---

## 1. Tour of the landing page

When you load `/`, you'll see two stacked sections:

**Hero** — title `CantonPay · payroll control center · for employers and
employees.`, with the active network badge above it
(`employer payroll on canton · Sandbox` or `· CC DevNet`).

**Step 01 · Connect & open** (the "Open a payroll org" panel). Two
columns:

```
┌───────────────────────────────────────┐  ┌────────────────────────┐
│ Open a payroll org                     │  │  Wallet · Sandbox       │
│                                        │  │                          │
│ Existing PayrollOrganization id        │  │  [ Connect wallet ]      │
│ ┌──────────────────────┐  ┌─────┐      │  └────────────────────────┘
│ │ 00abc…:Payroll:…     │  │Open │      │
│ └──────────────────────┘  └─────┘      │  ┌────────────────────────┐
│                                        │  │  Sandbox · DEV          │
│ ────────── or ──────────               │  │  Daml sandbox JSON API  │
│                                        │  │  for local development. │
│ Spawn a demo org · employer = wallet   │  │  Parties allocated on   │
│ ┌──────────────────────────────────┐   │  │  demand; treasury is an │
│ │ Acme Demo Co.                     │   │  │  off-asset Decimal on   │
│ └──────────────────────────────────┘   │  │  PayrollOrganization.   │
│ [ ✦ Spawn demo org on Sandbox ]        │  └────────────────────────┘
│                                        │
│ Connect a wallet on the right to       │
│ designate the employer party.          │
└───────────────────────────────────────┘
```

What each piece does:

- **Network selector (top-right of navbar).** Switches between Sandbox and
  CC DevNet. The wallet remembers per-network parties; switching surfaces
  any saved account on the new network.
- **Wallet card (right column).** `Connect wallet` opens the wallet modal
  which calls `POST /v1/parties/allocate` against the active network's
  JSON API (or finds an existing party matching the hint). The result is
  saved to `localStorage` under `cantonpay:wallet`. The minted JWT carries
  `actAs/readAs: [partyId]` for the active network's `ledgerId`.
- **Network description card (right column, below wallet).**
  Human-readable summary of the active preset (`Sandbox · DEV` or
  `CC DevNet · CC`) with a faucet/docs link on testnet.
- **"Existing PayrollOrganization contract id" field.** Paste a contract
  id from a previous `POST /v1/create` (yours or shared by the employer).
  Hitting **Open** routes to `/org/<contractId>`. The dashboard then
  queries that contract under the wallet's party JWT — if the party has
  no visibility (not the employer/operator/employee), the dashboard shows
  "No visibility to this org contract".
- **"Spawn a demo org" form.** Sets the `orgLabel` (default
  `Acme Demo Co.`). Clicking the button:
  1. Allocates an `Operator` party on the active network.
  2. Creates a `PayrollOrganization` via `POST /v1/create` with
     `employer = <connected wallet party>`, `operator = <Operator>`,
     `treasuryBalance = 0.00`, `payrollCooldownSeconds = 86 400`,
     `currency = DEV` (sandbox) or `CC` (testnet).
  3. Redirects to `/org/<contractId>`.

  The button is disabled until a wallet party is connected and the JSON
  API URL for the active network is set; you'll see a yellow inline
  warning explaining what's missing.

- **Footer.** Brand block on the left, navigation links + external docs
  on the right; below them, a copyright row plus the active network's
  JSON API origin so you can sanity-check at a glance which participant
  you're hitting.

---

## 2. Connect the employer wallet

1. Confirm the navbar network selector says **Sandbox**.
2. In the wallet card, click **Connect wallet**.
3. Type the hint `Employer` and click **Connect party**.

The wallet panel now shows the truncated party id (`Employer::…`) with the
network badge next to it (grey **Sandbox** or amber **CC DevNet**).

> **Switching networks:** open the wallet modal → pick the other network.
> If you've connected a party there before, the wallet auto-switches to
> it. Otherwise you'll see "No accounts on this network yet" and can
> connect a fresh one.

---

## 3. Spawn a demo PayrollOrganization

In the **Open a payroll org** card:

1. Optionally edit the **Org label** (default `Acme Demo Co.`).
2. Click **Spawn demo org on Sandbox** (or **on CC DevNet**).

Behind the scenes, the frontend allocates an `Operator` party, creates a
`PayrollOrganization` Daml contract, and redirects to `/org/<contract-id>`,
the dashboard for that org. If the **Daml package id not set** banner
appears, finish step 0 — the JSON API needs the package hash to match the
template id.

---

## 4. Fund the treasury

The dashboard's first card is the empty treasury.

1. Click **Need tokens? → Fund treasury** (or the Fund button in the top
   stats bar).
2. The fund modal has two modes:
   - **Top up (FundTreasury)** — additive. Calls the `FundTreasury`
     choice: archives + recreates with `treasuryBalance + addAmount`.
   - **Set absolute** — replaces the balance via
     `UpdateTreasuryFromEmployer`.
3. Pick **Top up**, enter `100000`, click **Fund treasury**.

The treasury card refreshes and shows `100000.00 DEV` (or `…CC` on
testnet).

> **CC DevNet note.** The treasury is a Daml `Decimal`, not a real Canton
> Coin holding. To do a real CC payout you'd wire a Splice Amulets
> transfer in the operator backend and mirror the spent amount via
> `FundTreasury`/`RunPayroll`. The faucet link in the wallet modal points
> at the Splice DevNet docs.

---

## 5. Add employees

1. Switch to the **Employees** tab in the sidebar.
2. Click **Add employee**, type a hint (`Bob`), salary `5000`, confirm.

The frontend allocates a party for `Bob` on the active network (or reuses
one matching that hint), then exercises the non-consuming `AddEmployee`
choice on `PayrollOrganization`, producing an `EmploymentContract` with
signatory `employer` and observers `employee, operator`. Repeat for
`Alice` and `Charlie`.

---

## 6. Run payroll

1. Click **Run payroll** (Dashboard's Action zone or Employees tab).
2. The confirmation modal shows the visible roster count and the total
   payout (sum of `salary` across visible rows).
3. Click **Confirm**.

`runPayroll` exercises the on-ledger `RunPayroll` choice with three args
(`runAt` ISO, `runAtUnix`, `totalAmount`):

```daml
assertMsg "treasury insufficient for payroll" (treasuryBalance >= totalAmount)
assertMsg "cooldown not elapsed" (runAtUnix >= lastPayrollRunUnix + payrollCooldownSeconds)
```

then archives the org and recreates it with the treasury **decremented**
by `totalAmount` and `lastPayrollRun*` stamped to now. Try it again
immediately — the choice fails with `cooldown not elapsed`.

---

## 7. Verify employee privacy

1. In the wallet panel, click **Manage** → **Connect new party** with the
   hint `Bob`.
2. The dashboard reloads under Bob's party.
3. The roster now shows *only* Bob's row; the treasury card says
   "No visibility to this org contract" (Bob isn't on the org's observer
   list).
4. Open DevTools → Network → filter for `/v1/query`. The JSON response
   contains only Bob's `EmploymentContract`. Alice's and Charlie's
   payloads are never transmitted to Bob's participant.

This is the cryptographic privacy guarantee of Canton: visibility is
enforced on the participant by signatory/observer rules in Daml, *before*
JSON ever reaches the browser.

---

## 8. (Optional) Try the same flow on CC DevNet

1. From the wallet modal, switch the network to **Canton Coin · DevNet**.
2. Connect a party there (`Employer-cc`) — make sure
   `NEXT_PUBLIC_CANTON_TESTNET_JSON_API_URL` points at your participant.
3. Run steps 3–7 again. Treasury balances now display in `CC` and
   reference your DevNet participant.
4. To fund the treasury with actual Canton Coin Amulets, follow the
   Splice DevNet validator faucet guide linked in the wallet modal. Then
   mirror the amount into the org via **Top up (FundTreasury)**.

---

## What to inspect when something goes wrong

| Symptom | First thing to check |
|---|---|
| `Daml package id not set` banner | `daml build`, paste the hash into `NEXT_PUBLIC_DAML_PACKAGE_ID`, restart `npm run dev`. |
| `treasury insufficient for payroll` | Top up the treasury until `treasuryBalance >= totalPayroll`. |
| `cooldown not elapsed` | Wait, or use Daml console to lower `payrollCooldownSeconds` for the demo. |
| `failed to allocate party` | The JSON API URL for the active network is wrong / your participant isn't running. |
| Employee logs in and sees nothing | Their party id was allocated against a different network. Switch the wallet to the network the org lives on. |
| Spawn button stays disabled | Either the wallet isn't connected (right column → Connect wallet) or no JSON API URL is set for the active network. |

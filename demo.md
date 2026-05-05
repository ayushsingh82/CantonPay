# CantonPay Demo Walkthrough

End-to-end demo of CantonPay running against a Canton Daml ledger via the JSON
API. The wallet, the network selector, and the payroll dashboard all share a
single source of truth: the `PayrollOrganization` and `EmploymentContract`
templates in `daml/Payroll.daml`.

This walkthrough covers two networks:

| Preset | When to use | Currency |
|---|---|---|
| **Local sandbox** | Daml SDK sandbox JSON API on `localhost:7575` | `DEV` |
| **Canton Coin · DevNet** | Your participant connected to the Splice Global Synchronizer DevNet | `CC` |

You can switch between them at any time from the network selector in the navbar
or from the wallet modal — the wallet remembers parties per-network.

---

## 0. One-time setup

```bash
cd canton-payroll
cp .env.example .env.local
npm install
```

Edit `.env.local`:

```
# Local sandbox (used by the "Local sandbox" network preset)
NEXT_PUBLIC_CANTON_JSON_API_URL=http://localhost:7575

# Canton Coin DevNet (used by the "Canton Coin · DevNet" preset).
# Point this at YOUR participant's JSON API; the global synchronizer does not
# expose a single shared JSON API.
NEXT_PUBLIC_CANTON_TESTNET_JSON_API_URL=http://localhost:7585
NEXT_PUBLIC_CANTON_TESTNET_LEDGER_ID=participant1

# Default network the wallet boots into: sandbox | cc-testnet
NEXT_PUBLIC_CANTON_NETWORK=sandbox
```

Build the Daml package once and copy the package id into `.env.local` so the
JSON API can resolve template ids:

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

## 1. Connect the employer wallet

1. Open `http://localhost:3000`.
2. In the top-right navbar, confirm the **network selector** says **Sandbox**
   (or switch to **CC DevNet** if you want to demo on testnet).
3. In the wallet panel on the right, click **Connect wallet**.
4. Type the hint `Employer` and click **Connect party**.
   The browser calls `POST /v1/parties/allocate` (or finds an existing party
   that matches the hint) on the active network's JSON API. The resulting
   party id, network, and hint are persisted to `localStorage` so refreshes
   don't lose the session.

The wallet panel now shows the truncated party id (`Employer::…`) with the
network badge next to it (`Sandbox` in grey, `CC DevNet` in amber when you're
on testnet).

> **Switching networks:** open the wallet modal → pick the other network. If
> you've connected a party there before, the wallet auto-switches to it;
> otherwise you'll see "No accounts on this network yet" and can connect a
> fresh one.

---

## 2. Spawn a demo PayrollOrganization

In the **Open a payroll org** card on the landing page:

1. Optionally edit the **Org label** (default: `Acme Demo Co.`).
2. Click **Spawn demo org on Sandbox** (or **on CC DevNet**).

What happens behind the scenes:

- The frontend allocates an `Operator` party on the active network.
- It creates a `PayrollOrganization` Daml contract via `POST /v1/create`,
  with the connected wallet's party as `employer`, the operator as
  `observer`, treasury balance `0.00`, cooldown `86 400 s`, and the
  network's currency code (`DEV` or `CC`).
- It redirects to `/org/<contract-id>`, the dashboard for that org.

If the **Daml package id not set** banner appears, finish step 0 — the JSON
API needs the package hash to match the template id.

---

## 3. Fund the treasury

The first thing the dashboard shows is the empty treasury card.

1. Click **Need tokens? → Fund treasury** (or the Fund button in the top
   stats bar).
2. The fund modal has two modes:
   - **Top up (FundTreasury)** — additive. Calls the `FundTreasury` choice on
     the org contract: archives + recreates the org with
     `treasuryBalance + addAmount`.
   - **Set absolute** — replaces the balance. Calls the
     `UpdateTreasuryFromEmployer` choice.
3. Pick **Top up**, enter `100000`, click **Fund treasury**.

The treasury card refreshes and shows `100000.00 DEV` (or `…CC` on testnet).

> **Why two modes?** During real ops you usually *fund* — adding what came in
> from invoicing/funding sources. The "set absolute" mode is for demo cleanup
> and reconciling. Both choices are gated by the `employer` controller.

> **CC DevNet note:** the treasury balance is a Daml `Decimal` on the
> PayrollOrganization template, not a real Canton Coin holding. To do a real
> CC payout you'd wire a Splice Amulets transfer in the operator backend, and
> mirror the spent amount via `FundTreasury`/`RunPayroll`. The faucet link in
> the wallet modal points at the Splice DevNet docs.

---

## 4. Add employees

1. Switch to the **Employees** tab in the sidebar.
2. Click **Add employee**.
3. In the modal, type a hint (e.g. `Bob`) and a salary (e.g. `5000`).
4. Click **Add employee**.

The frontend:

- Allocates a Daml party for `Bob` on the active network (or reuses one that
  already matches that hint).
- Calls the non-consuming `AddEmployee` choice on `PayrollOrganization`,
  producing a fresh `EmploymentContract` with signatory `employer` and
  observers `employee, operator`.
- Refreshes the roster.

Repeat for `Alice` and `Charlie`. The roster table shows party, salary,
currency, status, and a Remove action.

---

## 5. Run payroll

1. Still on the Employees tab (or the Dashboard's Action zone), click
   **Run payroll**.
2. The confirmation modal shows the visible roster count and the total
   payout (sum of all `salary` fields across the rows your party can see).
3. Click **Confirm**.

`runPayroll` exercises the on-ledger `RunPayroll` choice with three args
(`runAt` ISO, `runAtUnix`, `totalAmount`). The Daml choice asserts:

```daml
assertMsg "treasury insufficient for payroll" (treasuryBalance >= totalAmount)
assertMsg "cooldown not elapsed" (runAtUnix >= lastPayrollRunUnix + payrollCooldownSeconds)
```

then archives the org contract and recreates it with the treasury
**decremented** by `totalAmount` and `lastPayrollRun*` stamped to now. Try it
again immediately — the choice will fail with `cooldown not elapsed`. Open
the `Settings` tab (`Payroll Cooldown`) to see the current window (default
24 h).

---

## 6. Verify employee privacy (the Canton angle)

1. In the wallet panel, click **Manage** → switch to the **same network**
   the org lives on, then click **Connect new party** with the hint `Bob`.
2. The wallet activates Bob's party. The dashboard reloads.
3. The roster now contains *only* Bob's row. The treasury card shows
   `No visibility to this org contract` because Bob is an observer on his
   `EmploymentContract` but **not** on the `PayrollOrganization`.
4. Open the network browser DevTools → Network tab → filter for `/v1/query`.
   Notice the JSON response only includes Bob's `EmploymentContract` payload.
   Alice's and Charlie's salaries are never transmitted to Bob's participant.

This is the cryptographic privacy guarantee of Canton: visibility is enforced
on the participant by signatory/observer rules in Daml, *before* JSON ever
reaches the browser.

---

## 7. (Optional) Try the same flow on CC DevNet

1. From the wallet modal, switch the network to **Canton Coin · DevNet**.
2. Connect a party there (`Employer-cc`) — make sure your participant's JSON
   API URL is set in `NEXT_PUBLIC_CANTON_TESTNET_JSON_API_URL`.
3. Run steps 2–6 again. Treasury balances now display in `CC` and reference
   your DevNet participant.
4. To fund the treasury with *actual* Canton Coin Amulets, follow the Splice
   DevNet validator faucet guide linked in the wallet modal. Then mirror the
   amount into the org's treasury via **Top up (FundTreasury)**.

---

## What to inspect when something goes wrong

| Symptom | First thing to check |
|---|---|
| `Daml package id not set` banner | `daml build`, paste the hash into `NEXT_PUBLIC_DAML_PACKAGE_ID`, restart `npm run dev`. |
| Treasury choice returns `treasury insufficient for payroll` | Top up the treasury until `treasuryBalance >= totalPayroll`. |
| Run payroll fails with `cooldown not elapsed` | Wait, or use Daml console to lower `payrollCooldownSeconds` for the demo. |
| Spawn fails with `failed to allocate party` | The JSON API URL for the active network is wrong / your participant isn't running. |
| Employee logs in but sees nothing | Their party id was allocated against a different network. Switch the wallet to the network the org lives on. |

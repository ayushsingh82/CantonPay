# CantonPay Working Guide

This file is the practical runbook to complete CantonPay from local dev to deployed Daml contracts.

## 1) Project Goal

Build and operate payroll on Canton with:
- `PayrollOrganization` for org-level controls (treasury, cooldown, run payroll)
- `EmploymentContract` for employee salary records
- Next.js UI (`CantonPay`) using Canton JSON API

No EVM/wallet flow is required.

---

## 2) Current Architecture (what exists now)

- Daml model: `daml/Payroll.daml`
- Canton client/services: `lib/canton/*`
- UI + state: `components/*`, `views/*`, `hooks/usePayroll.ts`
- Party auth/session: `contexts/canton-auth.tsx`
- Org route: `/org/[contractAddress]`
- Landing route: `/`

---

## 3) Local Setup (end-to-end)

## A. Install prerequisites

- Node 20+
- Daml SDK
- Canton sandbox / participant with JSON API access

## B. Build Daml package

```bash
daml build
```

Then get package id (example):

```bash
daml damlc inspect-dar .daml/dist/*.dar
```

Copy the main package id into `.env.local`:

```bash
NEXT_PUBLIC_DAML_PACKAGE_ID=<your_package_id>
NEXT_PUBLIC_CANTON_JSON_API_URL=http://localhost:7575
NEXT_PUBLIC_CANTON_LEDGER_ID=sandbox
NEXT_PUBLIC_CANTON_APPLICATION_ID=cantonpay
```

## C. Start Canton + JSON API

Common local pattern:

1. Start Canton participant / sandbox
2. Start JSON API against ledger API

Example JSON API command:

```bash
daml json-api \
  --ledger-host localhost \
  --ledger-port 12011 \
  --http-port 7575 \
  --allow-insecure-tokens
```

## D. Start frontend

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## 4) How to use app locally

1. Open landing page.
2. Click dashboard or go to join section.
3. Either:
   - paste existing `PayrollOrganization` contract id, or
   - spawn demo org (when JSON API is configured).
4. Login with party hint (Employer/Employee/Operator).
5. Use dashboard:
   - fund treasury
   - add/remove employees
   - run payroll

---

## 5) Production Deployment Plan

## A. Daml / Canton

1. Build release DAR.
2. Upload DAR to target participant/domain setup.
3. Configure participant APIs:
   - Ledger API
   - JSON API (HTTP endpoint)
4. Configure auth:
   - replace unsigned dev JWT flow with signed JWT from your IdP
   - enforce claim mapping for `actAs` / `readAs`

## B. Frontend deployment

1. Build and deploy Next.js app (Vercel, Docker, VM, etc.).
2. Set environment variables in deployment platform:
   - `NEXT_PUBLIC_CANTON_JSON_API_URL`
   - `NEXT_PUBLIC_DAML_PACKAGE_ID`
   - `NEXT_PUBLIC_CANTON_LEDGER_ID`
   - `NEXT_PUBLIC_CANTON_APPLICATION_ID`
3. Validate app against production JSON API.

---

## 6) Minimum checklist to call project “complete”

- [ ] Daml contracts compile and DAR is versioned
- [ ] Org creation and employee lifecycle work
- [ ] Payroll run flow works with cooldown checks
- [ ] Party-scoped visibility verified (employer vs employee vs operator)
- [ ] Signed JWT auth integrated (no insecure tokens in production)
- [ ] Error handling and empty states polished
- [ ] Landing + dashboard copy finalized for CantonPay
- [ ] README + this runbook updated with final deployment URLs

---

## 7) Next enhancements (recommended)

- Add `PayslipRecord` template and real payslips view
- Add transaction stream view using JSON API streams
- Add audit/approval templates for payroll governance
- Add integration tests (API + UI happy path)
- Add admin setup page for org bootstrap (instead of manual id paste)

---

## 8) Useful references

- Daml JSON API docs: https://docs.daml.com/json-api/index.html
- Daml build docs: https://docs.daml.com/tools/assistant-build.html
- Canton + Daml SDK tutorial: https://docs.daml.com/canton/tutorials/use_daml_sdk.html
- Canton API configuration: https://docs.daml.com/canton/usermanual/apis.html
- Digital Asset JSON API config guide: https://docs.digitalasset.com/operate/3.5/howtos/configure/apis/json_api.html
- Canton Docker docs: https://docs.daml.com/canton/usermanual/docker.html

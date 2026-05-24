# Epic P0-A — 11 issues (bloqueados hasta GATE-0 + GATE-1 Done)

**Epic:** `[P0-A] Fundación producto + plataforma mínima`  
**Labels epic:** `P0-A`, `lane:platform`

---

## [P0-A-01] CI: lint, ng test, ng build, OpenAPI lint

**Labels:** `P0-A`, `lane:quality`  
**Bloqueado por:** GATE-0, GATE-1 Done

Workflow `.github/workflows/ci.yml` verde en `main`.

---

## [P0-A-02] Unit tests MortgageCalculatorService

**Labels:** `P0-A`, `lane:quality`

P&I, loan amount, breakdown, edge cases.

---

## [P0-A-03] compliance.md + copy legal en UI

**Labels:** `P0-A`, `lane:quality`, `lane:product`  
**Bloqueado por:** GATE-0 Done

`docs/compliance.md` + disclaimer footer + junto al pago estimado.

---

## [P0-A-04] Simple Calculator L2+ hardening

**Labels:** `P0-A`, `lane:product`

Validación, $/% down, CTAs. Depende de P0-A-02.

---

## [P0-A-05] NestJS + Prisma + GET /api/health

**Labels:** `P0-A`, `lane:platform`  
**Bloqueado por:** GATE-1 Done

Scaffold backend; contrato OpenAPI v0.1.

---

## [P0-A-06] Auth login + JWT guard

**Labels:** `P0-A`, `lane:platform`

Depende de P0-A-05.

---

## [P0-A-07] API placements + listings

**Labels:** `P0-A`, `lane:platform`

Depende de P0-A-05, P0-A-06.

---

## [P0-A-08] FE: placements API en ModularPageLayout

**Labels:** `P0-A`, `lane:product`

Sin `listings-ad-config.service.ts` estático en prod.

---

## [P0-A-09] Admin UI mínima

**Labels:** `P0-A`, `lane:product`

Toggle placement + CRUD listing (1 pantalla).

---

## [P0-A-10] Branding visible MortgageCalc

**Labels:** `P0-A`, `lane:product`  
**Bloqueado por:** GATE-0 Done

index.html, header, footer.

---

## [P0-A-11] Railway staging + healthchecks

**Labels:** `P0-A`, `lane:platform`

Web + API staging. Depende de P0-A-05, P0-A-08.

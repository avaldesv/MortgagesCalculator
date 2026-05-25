# Linear bootstrap — resultado

**Proyecto:** [MortgageCalc](https://linear.app/avv1208/project/mortgagecalc-2662b33166cb)  
**Equipo:** AVV (Avv1208)

| Issue | ID | Título |
|-------|-----|--------|
| GATE-0 | AVV-20 | Formalizar branding MortgageCalc |
| GATE-1 | AVV-21 | OpenAPI v0.1 + checklist |
| GATE-2 | AVV-22 | Matriz DoD L1–L4 (creado en Done) |
| Epic P0-A | AVV-23 | Fundación producto + plataforma mínima |
| P0-A-01 | AVV-24 | CI |
| P0-A-02 | AVV-25 | Unit tests |
| P0-A-03 | AVV-26 | compliance |
| P0-A-04 | AVV-27 | Simple L2+ |
| P0-A-05 | AVV-28 | NestJS health |
| P0-A-06 | AVV-29 | Auth JWT |
| P0-A-07 | AVV-30 | Placements + listings API |
| P0-A-08 | AVV-31 | FE placements API |
| P0-A-09 | AVV-32 | Admin UI |
| P0-A-10 | AVV-33 | Branding UI |
| P0-A-11 | AVV-34 | Railway staging |

### P0-A (Done en Linear 2026-05-24)

AVV-20 … AVV-34 — gates + epic P0-A + 11 entregables.

### P0-B — CalculatorStateService (Done)

| Issue | ID | Estado real |
|-------|-----|-------------|
| Epic prereq | AVV-35 | Done |
| ST-01 … ST-03 | AVV-36–38 | Done |

### P0-A — estados corregidos (no todo Done)

| Issue | ID | Estado Linear |
|-------|-----|---------------|
| Epic P0-A | AVV-23 | **In Progress** (faltan ítems) |
| NestJS + Prisma | AVV-28 | **In Progress** (API sí; Prisma no) |
| Railway staging | AVV-34 | **Backlog** (sin deploy API staging) |
| Resto P0-A-01…27, 29–33 | AVV-24–33 | Done |

### P0-B — tabs (Done en código + Linear 2026-05-24)

| Tab | ID | Commit ref |
|-----|-----|------------|
| Advanced L2 | AVV-39 | `63bea0d` |
| Affordability L2 | AVV-40 | `63bea0d` |
| Compare L2 | AVV-41 | `f08b2a0` |
| Homes f1 | AVV-42 | `b08bb13` |
| Homes f2 | AVV-43 | `b08bb13` |
| Learning L2 | AVV-44 | `e305373` |
| Partners L3 | AVV-45 | `e305373` |

### Seguimiento detallado

- Descripciones en Linear: secciones **Objetivo**, **Qué hacer**, **Entregado**, **Pendiente**, **Referencias**
- Regenerar: `node scripts/linear-sync-descriptions.mjs`
- Resumen local: [`ISSUE-TRACKING.md`](./ISSUE-TRACKING.md)

Scripts: `linear-sync-descriptions.mjs` · `linear-reconcile-states.mjs` · `linear-update-issues.mjs --done|--in-progress|--backlog`

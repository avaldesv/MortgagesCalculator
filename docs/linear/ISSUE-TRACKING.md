# Linear — seguimiento detallado (MortgageCalc)

**Proyecto:** MortgageCalc · **Equipo:** AVV  
**Última sync:** 2026-05-24 · Script: `node scripts/linear-sync-descriptions.mjs`

Este documento es espejo local de las descripciones en Linear. La fuente de verdad para estados es Linear; regenerar con el script tras cambios grandes.

## Cómo actualizar Linear

```powershell
# Descripciones + estados (recomendado tras entregas en main)
$env:LINEAR_API_KEY = "lin_api_..."
node scripts/linear-sync-descriptions.mjs

# Solo descripciones
node scripts/linear-sync-descriptions.mjs --descriptions-only

# Solo estados
node scripts/linear-sync-descriptions.mjs --states-only

# Reconciliar solo estados (mapa en linear-reconcile-states.mjs)
node scripts/linear-reconcile-states.mjs
```

## Resumen de estados

| Estado | Issues |
|--------|--------|
| **Done** | AVV-20–22, AVV-24–27, AVV-29–33, AVV-35–45 |
| **In Progress** | AVV-23 (epic P0-A), AVV-28 (Prisma/JSON) |
| **Backlog** | AVV-34 (Railway staging) |

## Mapa rápido

| ID | Título corto | Hecho | Pendiente |
|----|--------------|-------|-----------|
| AVV-20 | GATE-0 branding | Doc decisión | — |
| AVV-21 | GATE-1 OpenAPI | Spec + lint CI | URL prod en servers |
| AVV-22 | GATE-2 DoD | Matriz aprobada | — |
| AVV-23 | Epic P0-A | CI, API, admin, FE | AVV-28, AVV-34 |
| AVV-24 | CI | workflow GH | — |
| AVV-25 | Unit tests | 13+ tests | — |
| AVV-26 | Compliance | doc + UI | legal review P1 |
| AVV-27 | Simple L2+ | tab completa | — |
| AVV-28 | NestJS + Prisma | API JSON + health | Prisma o ADR |
| AVV-29 | Auth JWT | login + guard | rotar creds prod |
| AVV-30 | API placements/listings | CRUD + público | — |
| AVV-31 | FE placements | HTTP service | — |
| AVV-32 | Admin UI | dashboard | — |
| AVV-33 | Branding UI | header/footer | logo P1 |
| AVV-34 | Railway staging | Docker/config | deploy verificado |
| AVV-35–38 | CalculatorState | epic + 3 subs | — |
| AVV-39 | Advanced | amortización + charts | export P1 |
| AVV-40 | Affordability | DTI + score | — |
| AVV-41 | Compare | 15/20/30 | más presets P1 |
| AVV-42–43 | Homes by Payment | API + reverse + filtros | smoke staging |
| AVV-44 | Learning | 12 artículos JSON | CMS P1 |
| AVV-45 | Partners | form + POST lead | privacy URL |

## Commits de referencia (main)

| Commit | Alcance |
|--------|---------|
| `63bea0d` | Advanced + Affordability |
| `f08b2a0` | Compare Scenarios |
| `b08bb13` | Homes by Payment |
| `e305373` | Learning + Partners API |
| `e8732b2` | P0-A API, admin, FE |
| `efcde3d` | CalculatorStateService |

Ver descripciones completas en cada issue de Linear (sección **Qué hacer** / **Entregado** / **Pendiente**).

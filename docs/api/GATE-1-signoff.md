# GATE-1 — Sign-off checklist

**Contrato:** [`openapi-v0.1.yaml`](./openapi-v0.1.yaml)

**Política v2.4:** cierre por checklist; no se requieren firmas nominales.

## Revisión FE

- [x] TabId y AdPagePosition alineados con `src/app/core/models/`
- [x] `GET /ad-placements/active?tab=` usable desde ModularPageLayout
- [x] Paginación y filtros listings claros para Homes tab
- [x] PartnerLeadRequest incluye `consentContact: true`

## Revisión BE

- [x] Endpoints implementables en NestJS P0-A
- [x] JWT en `/api/v1/admin/*`
- [x] Rate limit 10/min en `POST /leads/partner`
- [x] Códigos de error y `ErrorResponse` acordados

## Validación técnica

- [x] `npx @redocly/cli lint docs/api/openapi-v0.1.yaml` — 0 errores (warnings menores aceptados)

## Cierre

- [ ] PR mergeado a `main`
- [ ] `servers[0].url` actualizado al URL Railway API real (o documentado en Linear como pendiente P0-A staging)
- [ ] Issue Linear `[GATE-1]` → Done

**Gate cerrado cuando las tres filas de Cierre están marcadas.**

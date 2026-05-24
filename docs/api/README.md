# MortgageCalc API — v0.1

Contract for **GATE-1** (P0-A). Source of truth:

- [`openapi-v0.1.yaml`](./openapi-v0.1.yaml) — OpenAPI 3.0.3 (GATE-1)
- [`GATE-1-openapi-v0.1.md`](./GATE-1-openapi-v0.1.md) — borrador con contexto de revisión FE/BE

## Review checklist (FE / BE sign-off)

- [ ] Tab IDs and `AdPagePosition` values match Angular models
- [ ] Public vs admin routes and JWT scope agreed
- [ ] Pagination defaults: `page=1`, `pageSize=20`, max `50`
- [ ] Error codes and `429` + `Retry-After` acceptable for Partners form
- [ ] Production `servers[0].url` updated when Railway API is deployed

## Out of scope for v0.1 (P1)

- `POST /api/v1/leads/calculator` (save calculation email)
- `GET/POST /api/v1/shared-calculations`
- `POST /api/v1/reports/homebuyer`
- `GET /api/v1/market/{zip}`
- `GET /api/v1/articles`

## Local preview

Use [Swagger Editor](https://editor.swagger.io/) or Redocly CLI:

```bash
npx @redocly/cli preview-docs docs/api/openapi-v0.1.yaml
```

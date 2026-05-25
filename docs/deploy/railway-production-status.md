# Railway production — estado verificado

| Servicio | URL | Estado |
|----------|-----|--------|
| **Web (FE)** | https://mortgagescalculator-production.up.railway.app | OK — Angular |
| **API (NestJS)** | https://backend-production-dbaf7.up.railway.app | OK — JSON `/api/health` |
| Última verificación | 2026-05-25 | `verify-requirements.mjs` 42/42 OK |

## API verificado

```json
GET https://backend-production-dbaf7.up.railway.app/api/health
{ "status": "ok", "version": "0.1.0", "persistence": "json", ... }
```

Smoke (`node scripts/smoke-staging-api.mjs`): health, listings (3), partner lead 201.

## Web ↔ API (verificado)

- `https://mortgagescalculator-production.up.railway.app/api/health` → JSON vía proxy nginx
- Listings, login admin JWT, partner lead 201 vía proxy
- Admin UI accesible en `/admin`

## Verificación automatizada

```powershell
node scripts/verify-requirements.mjs
```

Última ejecución: **42/42** passed.

## Linear (listo para cerrar)

- **AVV-34** → Done
- **AVV-23** (epic P0-A) → Done

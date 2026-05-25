# Railway production — estado verificado

| Servicio | URL | Estado |
|----------|-----|--------|
| **Web (FE)** | https://mortgagescalculator-production.up.railway.app | OK — Angular |
| **API (NestJS)** | https://backend-production-dbaf7.up.railway.app | OK — JSON `/api/health` |
| Última verificación | 2026-05-25 | Smoke test passed |

## API verificado

```json
GET https://backend-production-dbaf7.up.railway.app/api/health
{ "status": "ok", "version": "0.1.0", "persistence": "json", ... }
```

Smoke (`node scripts/smoke-staging-api.mjs`): health, listings (3), partner lead 201.

## Pendiente para cerrar AVV-34

El **Web** aún llama a `/api/*` en su propio dominio (devuelve HTML). Falta:

1. **API** → variable `CORS_ORIGIN=https://mortgagescalculator-production.up.railway.app`
2. **Web** → variable de build `API_BASE_URL=https://backend-production-dbaf7.up.railway.app` → **Redeploy**
3. Probar en el navegador: Homes by Payment, Admin, Partners.

## Linear

- **AVV-34** → Done cuando el paso anterior esté verificado.
- **AVV-23** (epic P0-A) → Done con AVV-34.

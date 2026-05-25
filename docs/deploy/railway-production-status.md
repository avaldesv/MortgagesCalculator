# Railway production — estado verificado

| Campo | Valor |
|-------|--------|
| Web (FE) | https://mortgagescalculator-production.up.railway.app |
| Verificado | 2026-05-25 |
| API pública | **Pendiente** (no hay servicio API en esta URL) |

## Qué funciona hoy

- App Angular carga correctamente (Simple Calculator, navegación SPA).
- Cálculos en el cliente (no requieren backend).

## Qué no funciona en esta URL

Las rutas `/api/*` las sirve **nginx** con `index.html` (fallback SPA), no NestJS:

```text
GET /api/health          → HTML (esperado: JSON)
GET /api/v1/listings     → HTML
POST /api/v1/leads/partner → HTML
```

**Causa:** solo está desplegado el servicio **Web** (root `Dockerfile`). Falta el segundo servicio **API** (`backend/`) o un proxy nginx hacia él.

Además, el build actual tiene `apiBaseUrl: ''`, así que el FE llama a `/api/...` en el mismo host (web).

## Cómo completar AVV-34

### Opción A — Dos servicios (recomendada)

1. En Railway, añadir servicio con **Root Directory** = `backend`.
2. Healthcheck: `/api/health` → debe responder JSON `{ status: "ok", persistence: "json"|"prisma", ... }`.
3. Variables API: ver `backend/.env.example` (`JWT_SECRET`, `CORS_ORIGIN=https://mortgagescalculator-production.up.railway.app`, opcional Postgres).
4. Copiar URL pública del servicio API (ej. `https://mortgagecalc-api-production.up.railway.app`).
5. En el servicio **Web**, variable de build `API_BASE_URL` = URL del API (sin `/` final) → **Redeploy**.
6. Smoke:

   ```powershell
   $env:API_URL = "https://TU-API.up.railway.app"
   node scripts/smoke-staging-api.mjs
   ```

7. Actualizar `docs/api/openapi-v0.1.yaml` → `servers[0].url`.

### Opción B — Proxy nginx en un solo servicio

Requiere que el API corra en otra URL interna/pública y configurar `proxy_pass` en nginx (no implementado en repo hoy).

## Linear

- **AVV-34** sigue **In Progress** hasta smoke API OK + FE con `API_BASE_URL` correcto.
- **AVV-23** (epic) se cierra cuando AVV-34 esté Done.

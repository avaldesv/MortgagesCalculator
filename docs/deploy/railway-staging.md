# Railway — deploy staging / production (AVV-34)

Checklist para **Web** (Angular) + **API** (NestJS) + **PostgreSQL** opcional.

**Producción web verificada:** https://mortgagescalculator-production.up.railway.app — FE OK; API aún no en ese host (ver [`railway-production-status.md`](./railway-production-status.md)).

## 1. Servicios en Railway

| Servicio | Root directory | Dockerfile | Healthcheck |
|----------|--------------|------------|-------------|
| `mortgagecalc-web-staging` | `/` (repo root) | `Dockerfile` | `/` |
| `mortgagecalc-api-staging` | `/backend` | `backend/Dockerfile` | `/api/health` |
| `postgres` (plugin) | — | Railway PostgreSQL | — |

## 2. Variables — API (`backend`)

| Variable | Ejemplo | Notas |
|----------|---------|--------|
| `JWT_SECRET` | *(random 32+ chars)* | Obligatorio |
| `ADMIN_PASSWORD` | *(fuerte)* | No usar `changeme123` |
| `ADMIN_EMAIL` | `admin@mortgagecalc.app` | |
| `CORS_ORIGIN` | `https://<web-staging>.up.railway.app` | URL pública del web |
| `DATABASE_URL` | *(desde plugin Postgres)* | Activa modo Prisma |
| `PRISMA_MIGRATE_ON_START` | `true` | Aplica migraciones al arrancar |

Sin `DATABASE_URL` la API usa JSON en `data/` (válido para prueba rápida, no recomendado en staging compartido).

## 3. Variables — Web (root)

| Variable | Ejemplo | Notas |
|----------|---------|--------|
| `API_BASE_URL` | `https://<api-staging>.up.railway.app` | Inyectada en build (sin barra final) |

El `Dockerfile` del web ejecuta `scripts/generate-environment.mjs` antes de `ng build`.

## 4. Build & deploy

1. Conectar repo GitHub `avaldesv/MortgagesCalculator`, rama `main`.
2. Web: root `.`, healthcheck `/`.
3. API: root `backend`, healthcheck `/api/health`.
4. Tras primer deploy, copiar URLs y actualizar `CORS_ORIGIN` + `API_BASE_URL`.
5. Redeploy web para que el build embeba la URL de API.

## 5. Smoke test local contra staging

```powershell
$env:API_URL = "https://YOUR-API.up.railway.app"
node scripts/smoke-staging-api.mjs
```

Esperado: health `ok`, listings con datos, partner lead `201`.

## 6. OpenAPI

Actualizar `docs/api/openapi-v0.1.yaml` → `servers[0].url` con la URL real de API staging.

## 7. Verificación manual FE

1. Abrir URL web staging → Simple Calculator.
2. Admin: `/admin/login` con credenciales staging.
3. Homes by Payment: listings cargan desde API.
4. Partners: enviar lead de prueba → 201.

## 8. Cierre Linear

- **AVV-34** → Done cuando smoke + checklist anteriores OK.
- **AVV-28** → Done (Prisma + JSON fallback documentado en ADR).
- **AVV-23** epic → Done cuando AVV-34 Done.

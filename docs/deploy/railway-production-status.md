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

## Conectar Web ↔ API (redeploy Web)

Diagnóstico: el bundle tenía `apiBaseUrl` vacío y nginx no hacía proxy → `/api/*` devolvía HTML.

**Solución en repo:** nginx hace proxy de `/api/` al backend; `API_BASE_URL` con valor por defecto en build.

1. **Redeploy solo el servicio Web** (commit con fix nginx).
2. Variables opcionales en el servicio Web (runtime):
   - `API_UPSTREAM_URL` = `https://backend-production-dbaf7.up.railway.app`
   - `API_UPSTREAM_HOST` = `backend-production-dbaf7.up.railway.app`
3. Build (opcional): `API_BASE_URL` marcada como **Available at Build Time** en Railway.
4. Verificar: `https://mortgagescalculator-production.up.railway.app/api/health` → JSON (no HTML).
5. Homes by Payment / Admin / Partners en el navegador.

## Linear

- **AVV-34** → Done cuando el paso anterior esté verificado.
- **AVV-23** (epic P0-A) → Done con AVV-34.

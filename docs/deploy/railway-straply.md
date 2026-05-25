# Railway — Straply (US market listings)

## 1. Variable en el servicio **API** (root `backend/`)

| Variable | Valor |
|----------|--------|
| `STRAPLY_API_KEY` | Clave desde [straply.com/dashboard](https://straply.com/dashboard) |

Railway → proyecto MortgageCalc → servicio **backend** → **Variables** → Add variable → **Redeploy** (o esperar deploy tras push a `main`).

Quitar `RENTCAST_API_KEY` si existía (ya no se usa).

## 2. CLI (opcional)

```powershell
npx @railway/cli login
cd backend
npx @railway/cli link
cd ..
node scripts/railway-set-straply-env.mjs
```

Lee la clave desde `backend/.env.local` (no commitear).

## 3. Verificación prod

```powershell
node scripts/verify-market-listings-prod.mjs
```

Esperado:

- `API market-listings` → `source: straply`, `count` ≥ 1
- `WEB proxy` → mismo resultado vía `/api/...`

## 4. Admin

https://mortgagescalculator-production.up.railway.app/admin

- Módulo **US market listings** activo
- ZIP `32801` (o el que quieras)
- `maxCount` 1–12

## Linear

Cerrar **AVV-51** cuando smoke pase y el módulo se vea en una calculadora con placement sponsored.

# MortgageCalc — U.S. Mortgage Calculator (Angular)

Modern mortgage calculator for U.S. homebuyers. **Visual design: Coastal Fintech (Concept A)** — clean white UI, blue-teal accents, rounded cards.

## Features

- **Simple Calculator** (default): home price, down payment, rate, term, taxes, insurance, PMI, HOA
- Payment breakdown (donut + stacked bar), summary cards
- **7 tabs**: Simple, Advanced, Affordability, Compare, Homes by Payment, Learn, Partners
- **Admin-configurable listings ads** (`M-listings-ad`): sponsored homes by page position
- Mobile-first responsive layout

## Quick start (frontend)

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200) → redirects to `/simple-calculator`.

## API (NestJS) — local

```bash
cd backend
npm install
npm run start:dev
```

- Health: `http://localhost:3000/api/health`
- Admin login: `POST /api/v1/auth/login` — default `admin@mortgagecalc.app` / `changeme123`
- Admin UI: [http://localhost:4200/admin/login](http://localhost:4200/admin/login)

With `ng serve`, set `apiBaseUrl` in `src/environments/environment.development.ts` or use `proxy.conf.json` and empty `apiBaseUrl` for `/api` proxy.

Env vars (API): `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGIN`.

## Production build

```bash
npm run build
```

Output: `dist/mortgage-calculator/browser/`

## Deploy on Railway

### Web (Angular + nginx)

1. Service root: repo root — uses root `Dockerfile` + `railway.toml`.
2. Healthcheck path: `/`

### API (NestJS)

1. Add a second service with root directory **`backend/`** — uses `backend/Dockerfile` + `backend/railway.toml`.
2. Healthcheck path: `/api/health`
3. Set env: `JWT_SECRET`, `ADMIN_PASSWORD`, `CORS_ORIGIN` (web app URL).

Point production `environment.ts` `apiBaseUrl` to the API Railway URL when wiring staging.

### Option B — Nixpacks (Node)

Set build command: `npm run build`  
Set start command: `npx serve -s dist/mortgage-calculator/browser -l $PORT`

## GitHub

```bash
git init
git add .
git commit -m "feat: Angular Coastal Fintech mortgage calculator"
git branch -M main
git remote add origin https://github.com/avaldesv/MortgagesCalculator.git
git push -u origin main
```

## Project structure

```
src/app/
  core/           # models, mortgage math, ad config
  layout/         # header, modular page grid (ad slots)
  features/       # tab pages (simple-calculator, homes-by-payment, …)
  shared/         # listings-ad, charts
assets/mockups/   # design reference PNGs
```

## Listings ad (admin)

Edit `src/app/core/services/listings-ad-config.service.ts`:

- `enabled`: show/hide slot
- `position`: `top-left` … `footer` (see `listings-ad.model.ts`)
- `tabs`: which routes display the slot

## Tech stack

- Angular 19 (standalone components)
- SCSS — Coastal Fintech theme
- Docker + nginx for Railway

## Disclaimer

Estimates only — not a loan offer or financial advice.

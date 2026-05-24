# MortgageCalc — U.S. Mortgage Calculator (Angular)

Modern mortgage calculator for U.S. homebuyers. **Visual design: Coastal Fintech (Concept A)** — clean white UI, blue-teal accents, rounded cards.

## Features

- **Simple Calculator** (default): home price, down payment, rate, term, taxes, insurance, PMI, HOA
- Payment breakdown (donut + stacked bar), summary cards
- **7 tabs**: Simple, Advanced, Affordability, Compare, Homes by Payment, Learn, Partners
- **Admin-configurable listings ads** (`M-listings-ad`): sponsored homes by page position
- Mobile-first responsive layout

## Quick start

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200) → redirects to `/simple-calculator`.

## Production build

```bash
npm run build
```

Output: `dist/mortgage-calculator/browser/`

## Deploy on Railway

### Option A — Dockerfile (recommended)

1. Push this repo to GitHub.
2. [Railway](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Railway detects `Dockerfile` and `railway.toml`.
4. Railway sets `PORT` automatically; nginx listens on that port (default 8080).
5. Generate a public domain under **Settings → Networking**.

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

# US market listings module

## Purpose

Below each **Sponsored** ad column, the app can show **real for-sale homes** in the United States via [Straply](https://straply.com/).

## Data source

| Provider | Free tier | API |
|----------|-----------|-----|
| **Straply** (current) | 100 lookups/day | `GET https://api.straply.com/v1/properties` |
| ~~RentCast~~ (replaced) | 50 calls/month | — |

Auth: `Authorization: Bearer STRAPLY_API_KEY`  
Quick start: [straply.com/dashboard](https://straply.com/dashboard)

Query (ZIP required — `city+state` can return 500 on Straply):

```bash
curl "https://api.straply.com/v1/properties?zipCode=32801&limit=20" \
  -H "Authorization: Bearer YOUR_KEY"
```

Only listings with `status: forSale` are shown in the app.

Backend caches **6 hours** per location/limit.

## Configuration

| Variable | Where |
|----------|--------|
| `STRAPLY_API_KEY` | API service (Railway / `backend/.env`) |

## Admin (`/admin`)

- Show/hide module (`enabled`)
- Homes count (`maxCount` 1–12)
- Search `city` / `state`
- Section `label`

## API

- `GET /api/v1/market-listings?tab={tabId}`
- `GET|PATCH /api/v1/admin/market-listings/settings` (JWT)

## Linear

| Issue | Scope |
|-------|--------|
| **AVV-46** | Epic parent |
| **AVV-47** | Diseño + Linear |
| **AVV-48** | Backend Straply |
| **AVV-49** | FE módulo |
| **AVV-50** | Admin |
| **AVV-51** | Deploy prod |

Create sub-issues: `node scripts/linear-create-market-listings-subs.mjs`

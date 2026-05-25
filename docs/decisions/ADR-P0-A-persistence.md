# ADR — Persistencia P0-A (JSON vs Prisma)

| Campo | Valor |
|-------|--------|
| Estado | Aceptado |
| Fecha | 2026-05-24 |

## Contexto

El plan P0-A mencionaba NestJS + Prisma. El MVP inicial usó archivos JSON en `backend/data/` para velocidad sin PostgreSQL.

## Decisión

**Modo híbrido** en `DataStoreService`:

| Condición | Persistencia |
|-----------|----------------|
| Sin `DATABASE_URL` | JSON (`store.json` / seed) — local dev, demos |
| Con `DATABASE_URL` | **Prisma** + PostgreSQL — staging/producción Railway |

## Consecuencias

- Local: `cd backend && npm run start:dev` sin DB.
- Railway API: añadir plugin PostgreSQL, `DATABASE_URL`, `PRISMA_MIGRATE_ON_START=true`.
- Health: `GET /api/health` incluye `persistence: "json" | "prisma"`.

## Migración

`backend/prisma/migrations/` — `npx prisma migrate deploy` en deploy.

Seed automático desde `data/seed.json` cuando la DB está vacía.

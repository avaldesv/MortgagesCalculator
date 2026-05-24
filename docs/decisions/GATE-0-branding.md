# GATE-0 — Decisión de marca y dominio

| Campo | Valor |
|-------|--------|
| **Gate** | GATE-0 |
| **Estado** | Cerrado (documento formal) |
| **Fecha** | 2026-05-24 |
| **Aprobado por** | Product owner (registrar nombre en Linear) |

## 1. Nombre comercial

**MortgageCalc** — nombre público de la aplicación (header, títulos, comunicaciones).

**No** se adopta MortgageVision ni otros alias del spec de diseño para esta fase.

## 2. Repositorio y código

| Artefacto | Decisión |
|-----------|----------|
| Repositorio GitHub | `avaldesv/MortgagesCalculator` — **sin rename** |
| Proyecto Linear | **MortgageCalc** (o MortgagesCalculator, alineado al repo) |
| Package / app title | `mortgage-calculator` / MortgageCalc |

## 3. Dominio y despliegue

| Fase | Dominio |
|------|---------|
| **Fase 1 (P0-A)** | Dominio **Railway** generado (`*.up.railway.app`) para web y API |
| **Fase 2** | Dominio custom (registrar cuando negocio lo defina; no bloquea P0-A) |

## 4. Email transaccional

| Uso | Fase 1 |
|-----|--------|
| Notificaciones / leads (futuro) | `noreply@<dominio-railway>` o servicio transaccional (Resend/SendGrid) con remitente **MortgageCalc** |
| Fase 2 | Migrar a dominio custom verificado (SPF/DKIM) |

## 5. Política de transición

- **Sin rebrand** a MortgageVision.
- Actualizar spec interno y copy de producto para referir **MortgageCalc** de forma consistente.
- SEO masivo (P2) usará dominio vigente en el momento del lanzamiento (Railway → custom cuando exista).

## 6. Impacto en artefactos (checklist)

- [ ] `src/index.html` — title y meta (P0-A)
- [ ] Header / footer en app Angular (P0-A)
- [ ] README del repositorio
- [ ] OpenAPI `info.title`: MortgageCalc API
- [ ] No usar MortgageVision en UI, emails ni documentación nueva

## 7. Cierre del gate en Linear

Marcar issue `[GATE-0]` como **Done** con enlace a este archivo.

**Siguiente gate bloqueante para código:** GATE-1 (`openapi-v0.1.yaml` + PR + firma FE/BE).

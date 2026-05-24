# GATE-1 — OpenAPI v0.1 (borrador para revisión FE/BE)

**Estado:** Borrador · pendiente PR + firma  
**Acción:** Copiar el bloque YAML a `openapi-v0.1.yaml` o aprobar este MD como entregable interino.

## Criterio de cierre GATE-1

- [ ] Revisión FE
- [ ] Revisión BE
- [ ] PR mergeado
- [ ] `servers[0].url` actualizado al deploy Railway API

## Archivo canónico (copiar a `openapi-v0.1.yaml`)

```yaml
openapi: 3.0.3
info:
  title: MortgageCalc API
  version: 0.1.0
  description: |
    API v0.1 for MortgageCalc (U.S. mortgage calculator). GATE-1 deliverable for P0-A.

    Ownership: Health/DevOps BE; Auth/Admin/Placements/Listings/Leads as per paths below.

    Ads: one active placement per position per tab (highest priority). enabled=false excluded from active.

    Rate limit: POST /leads/partner — 10 req/min/IP → 429 + retryAfter seconds.
  contact:
    name: MortgageCalc Platform

servers:
  - url: https://api.example.railway.app
    description: Production (replace with Railway API URL)
  - url: http://localhost:3000
    description: Local NestJS

tags:
  - name: Health
  - name: Auth
  - name: AdPlacements
  - name: Listings
  - name: Leads

paths:
  /api/health:
    get:
      tags: [Health]
      operationId: getHealth
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/HealthResponse' }
              example: { status: ok, version: 0.1.0, timestamp: '2026-05-24T12:00:00.000Z' }

  /api/v1/auth/login:
    post:
      tags: [Auth]
      operationId: adminLogin
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/LoginRequest' }
            example: { email: admin@mortgagecalc.app, password: '***' }
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/LoginResponse' }
        '401':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ErrorResponse' }

  /api/v1/ad-placements/active:
    get:
      tags: [AdPlacements]
      operationId: getActiveAdPlacements
      parameters:
        - name: tab
          in: query
          required: true
          schema: { $ref: '#/components/schemas/TabId' }
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ActiveAdPlacementsResponse' }

  /api/v1/admin/ad-placements:
    get:
      tags: [AdPlacements]
      security: [{ bearerAuth: [] }]
      operationId: listAdPlacements
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/AdPlacementListResponse' }
        '401': { $ref: '#/components/responses/Unauthorized' }
    post:
      tags: [AdPlacements]
      security: [{ bearerAuth: [] }]
      operationId: createAdPlacement
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/AdPlacementCreateRequest' }
      responses:
        '201': { description: Created }
        '409': { description: PLACEMENT_ID_CONFLICT }

  /api/v1/admin/ad-placements/{placementId}:
  /api/v1/listings:
    get:
      tags: [Listings]
      operationId: listPublicListings
      parameters:
        - name: sponsored
          in: query
          required: true
          schema: { type: boolean, enum: [true] }
        - name: zip
          in: query
          schema: { type: string, pattern: '^\d{5}(-\d{4})?$' }
        - name: maxPayment
          in: query
          schema: { type: number, minimum: 0 }
        - name: page
          in: query
          schema: { type: integer, minimum: 1, default: 1 }
        - name: pageSize
          in: query
          schema: { type: integer, minimum: 1, maximum: 50, default: 20 }
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/PaginatedListingsResponse' }

  /api/v1/admin/listings:
  /api/v1/admin/listings/{listingId}:
  /api/v1/leads/partner:
    post:
      tags: [Leads]
      operationId: createPartnerLead
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/PartnerLeadRequest' }
      responses:
        '201': { description: Lead received }
        '429': { $ref: '#/components/responses/TooManyRequests' }

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    TabId:
      type: string
      enum: [simple-calculator, advanced-calculator, affordability, compare-scenarios, homes-by-payment, learning-center, partners]
    AdPagePosition:
      type: string
      enum: [top-left, top-center, top-right, middle-left, middle-center, middle-right, bottom-left, bottom-center, bottom-right, footer]
    ErrorResponse:
      type: object
      required: [code, message]
      properties:
        code: { type: string }
        message: { type: string }
        details: { type: array, items: { type: object, properties: { field: { type: string }, message: { type: string } } } }
    RateLimitErrorResponse:
      allOf:
        - $ref: '#/components/schemas/ErrorResponse'
        - type: object
          required: [retryAfter]
          properties:
            code: { enum: [RATE_LIMIT_EXCEEDED] }
            retryAfter: { type: integer, minimum: 1 }
    PartnerLeadRequest:
      type: object
      required: [name, company, email, phone, serviceType, targetRegion, consentContact]
      properties:
        consentContact: { type: boolean, description: Must be true }
```

> **Nota:** El YAML completo con todos los paths, ejemplos y schemas está en la sección siguiente (versión extendida). Para PR, usar el archivo generado desde agent mode como `openapi-v0.1.yaml`.

---

## Resumen de endpoints v0.1

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | — | Healthcheck Railway |
| POST | `/api/v1/auth/login` | — | JWT admin |
| GET | `/api/v1/ad-placements/active?tab=` | — | Placements activos por tab |
| GET/POST | `/api/v1/admin/ad-placements` | JWT | CRUD placements |
| GET/PATCH/DELETE | `/api/v1/admin/ad-placements/{placementId}` | JWT | |
| GET | `/api/v1/listings?sponsored=true&zip=&maxPayment=&page=&pageSize=` | — | Listados públicos paginados |
| GET/POST | `/api/v1/admin/listings` | JWT | CRUD listings |
| PATCH/DELETE | `/api/v1/admin/listings/{listingId}` | JWT | |
| POST | `/api/v1/leads/partner` | — | Lead partners (rate limit) |

## Paginación

- `page` default `1`, min `1`
- `pageSize` default `20`, max `50`
- Response: `{ data: SponsoredListing[], meta: { page, pageSize, total } }`

## Errores HTTP

| Código | Uso |
|--------|-----|
| 400 | `VALIDATION_ERROR` + `details[]` |
| 401 | `UNAUTHORIZED` / `INVALID_CREDENTIALS` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 409 | `PLACEMENT_ID_CONFLICT` |
| 429 | `RATE_LIMIT_EXCEEDED` + `retryAfter` + header `Retry-After` |
| 500 | `INTERNAL_ERROR` |

## Auth admin

- Header: `Authorization: Bearer <accessToken>`
- Login: `POST /api/v1/auth/login` → `{ accessToken, expiresIn, tokenType: Bearer }`
- Todas las rutas `/api/v1/admin/*` requieren JWT

## Fuera de v0.1 (P1)

`leads/calculator`, `shared-calculations`, `reports/homebuyer`, `market/{zip}`, `articles`

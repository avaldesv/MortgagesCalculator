# GATE-1 — OpenAPI v0.1 (borrador para revisión FE/BE)

**Estado:** Superseded by [`openapi-v0.1.yaml`](./openapi-v0.1.yaml) — usar YAML canónico + [`GATE-1-signoff.md`](./GATE-1-signoff.md).

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
    get:
      tags: [AdPlacements]
      security: [{ bearerAuth: [] }]
      operationId: getAdPlacement
      parameters:
        - $ref: '#/components/parameters/PlacementIdPath'
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/AdPlacement' }
        '404': { $ref: '#/components/responses/NotFound' }
    patch:
      tags: [AdPlacements]
      security: [{ bearerAuth: [] }]
      operationId: updateAdPlacement
      parameters:
        - $ref: '#/components/parameters/PlacementIdPath'
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/AdPlacementUpdateRequest' }
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/AdPlacement' }
    delete:
      tags: [AdPlacements]
      security: [{ bearerAuth: [] }]
      operationId: deleteAdPlacement
      parameters:
        - $ref: '#/components/parameters/PlacementIdPath'
      responses:
        '204': { description: Deleted }

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
    get:
      tags: [Listings]
      security: [{ bearerAuth: [] }]
      operationId: listAdminListings
      parameters:
        - $ref: '#/components/parameters/PageQuery'
        - $ref: '#/components/parameters/PageSizeQuery'
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/PaginatedListingsResponse' }
    post:
      tags: [Listings]
      security: [{ bearerAuth: [] }]
      operationId: createListing
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/SponsoredListingCreateRequest' }
      responses:
        '201':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/SponsoredListing' }

  /api/v1/admin/listings/{listingId}:
    patch:
      tags: [Listings]
      security: [{ bearerAuth: [] }]
      operationId: updateListing
      parameters:
        - $ref: '#/components/parameters/ListingIdPath'
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/SponsoredListingUpdateRequest' }
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/SponsoredListing' }
    delete:
      tags: [Listings]
      security: [{ bearerAuth: [] }]
      operationId: deleteListing
      parameters:
        - $ref: '#/components/parameters/ListingIdPath'
      responses:
        '204': { description: Deleted }

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

  parameters:
    PlacementIdPath:
      name: placementId
      in: path
      required: true
      schema: { type: string, maxLength: 64 }
    ListingIdPath:
      name: listingId
      in: path
      required: true
      schema: { type: string, maxLength: 64 }
    PageQuery:
      name: page
      in: query
      schema: { type: integer, minimum: 1, default: 1 }
    PageSizeQuery:
      name: pageSize
      in: query
      schema: { type: integer, minimum: 1, maximum: 50, default: 20 }

  responses:
    Unauthorized:
      description: Missing or invalid JWT
      content:
        application/json:
          schema: { $ref: '#/components/schemas/ErrorResponse' }
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema: { $ref: '#/components/schemas/ErrorResponse' }
    TooManyRequests:
      description: Rate limit exceeded
      headers:
        Retry-After:
          schema: { type: integer }
      content:
        application/json:
          schema: { $ref: '#/components/schemas/RateLimitErrorResponse' }

  schemas:
    HealthResponse:
      type: object
      required: [status, version, timestamp]
      properties:
        status: { enum: [ok, degraded] }
        version: { type: string }
        timestamp: { type: string, format: date-time }
    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email: { type: string, format: email }
        password: { type: string, minLength: 8, maxLength: 128 }
    LoginResponse:
      type: object
      required: [accessToken, expiresIn, tokenType]
      properties:
        accessToken: { type: string }
        expiresIn: { type: integer }
        tokenType: { enum: [Bearer] }
    ActiveAdPlacementsResponse:
      type: object
      required: [tabId, placements]
      properties:
        tabId: { $ref: '#/components/schemas/TabId' }
        placements:
          type: array
          items: { $ref: '#/components/schemas/AdPlacement' }
    AdPlacement:
      type: object
      required: [id, enabled, position, tabs]
      properties:
        id: { type: string }
        enabled: { type: boolean }
        position: { $ref: '#/components/schemas/AdPagePosition' }
        tabs: { $ref: '#/components/schemas/TabsTarget' }
        maxListings: { type: integer, minimum: 1, maximum: 12 }
        sponsoredLabel: { type: string }
        priority: { type: integer }
        updatedAt: { type: string, format: date-time }
    AdPlacementCreateRequest:
      type: object
      required: [id, enabled, position, tabs]
      properties:
        id: { type: string }
        enabled: { type: boolean }
        position: { $ref: '#/components/schemas/AdPagePosition' }
        tabs: { $ref: '#/components/schemas/TabsTarget' }
        maxListings: { type: integer, minimum: 1, maximum: 12 }
        sponsoredLabel: { type: string }
        priority: { type: integer }
    AdPlacementUpdateRequest:
      type: object
      minProperties: 1
      properties:
        enabled: { type: boolean }
        position: { $ref: '#/components/schemas/AdPagePosition' }
        tabs: { $ref: '#/components/schemas/TabsTarget' }
        maxListings: { type: integer, minimum: 1, maximum: 12 }
        priority: { type: integer }
    AdPlacementListResponse:
      type: object
      required: [data]
      properties:
        data:
          type: array
          items: { $ref: '#/components/schemas/AdPlacement' }
    TabsTarget:
      oneOf:
        - type: string
          enum: [all]
        - type: array
          items: { $ref: '#/components/schemas/TabId' }
    SponsoredListing:
      type: object
      required: [id, price, city, state, estimatedMonthlyPayment, bedrooms, bathrooms, squareFeet, agentOrCompany, listingUrl, active]
      properties:
        id: { type: string }
        price: { type: number, minimum: 0 }
        city: { type: string }
        state: { type: string, minLength: 2, maxLength: 2 }
        estimatedMonthlyPayment: { type: number, minimum: 0 }
        bedrooms: { type: integer }
        bathrooms: { type: number }
        squareFeet: { type: integer }
        agentOrCompany: { type: string }
        listingUrl: { type: string, format: uri }
        zip: { type: string }
        active: { type: boolean }
    SponsoredListingCreateRequest:
      type: object
      required: [price, city, state, estimatedMonthlyPayment, bedrooms, bathrooms, squareFeet, agentOrCompany, listingUrl]
      properties:
        price: { type: number }
        city: { type: string }
        state: { type: string }
        estimatedMonthlyPayment: { type: number }
        bedrooms: { type: integer }
        bathrooms: { type: number }
        squareFeet: { type: integer }
        agentOrCompany: { type: string }
        listingUrl: { type: string, format: uri }
        zip: { type: string }
        active: { type: boolean, default: true }
    SponsoredListingUpdateRequest:
      type: object
      minProperties: 1
      properties:
        price: { type: number }
        active: { type: boolean }
    PaginatedListingsResponse:
      type: object
      required: [data, meta]
      properties:
        data:
          type: array
          items: { $ref: '#/components/schemas/SponsoredListing' }
        meta:
          type: object
          required: [page, pageSize, total]
          properties:
            page: { type: integer }
            pageSize: { type: integer }
            total: { type: integer }
    ServiceType:
      type: string
      enum: [real_estate_agent, mortgage_broker, mortgage_lender, insurance, moving, home_warranty, solar, internet, title, home_inspector, other]
    PartnerLeadResponse:
      type: object
      required: [id, status, createdAt]
      properties:
        id: { type: string }
        status: { enum: [received] }
        createdAt: { type: string, format: date-time }
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

**Post-revisión:** renombrar bloque a `docs/api/openapi-v0.1.yaml` (requiere modo Agent o copia manual).

### Ownership FE / BE

| Recurso | FE | BE |
|---------|----|----|
| Health | — | BE |
| Auth login | Admin UI | BE |
| Ad placements active | ModularPageLayout | BE |
| Ad placements admin | Admin UI | BE |
| Listings public | Homes, M-listings-ad | BE |
| Listings admin | Admin UI | BE |
| Partner leads | Partners tab | BE |

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

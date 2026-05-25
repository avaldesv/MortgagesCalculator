/**
 * Sync Linear issue descriptions (qué hacer / qué se hizo / pendiente) + estados.
 * Usage: LINEAR_API_KEY=... node scripts/linear-sync-descriptions.mjs
 *        node scripts/linear-sync-descriptions.mjs --descriptions-only
 *        node scripts/linear-sync-descriptions.mjs --states-only
 */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const API_URL = 'https://api.linear.app/graphql';
const REPO = 'https://github.com/avaldesv/MortgagesCalculator';
const MAIN = 'main';

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

/** @type {Record<string, { state: 'done'|'in_progress'|'backlog', description: string }>} */
const ISSUES = {
  'AVV-20': {
    state: 'done',
    description: `## Objetivo
Formalizar la decisión de marca **MortgageCalc** (Concepto A Coastal Fintech) antes de ampliar producto.

## Qué hacer (criterios)
- [x] Documento de decisión en \`docs/decisions/GATE-0-branding.md\`
- [x] Nombre producto: MortgageCalc (sin rename de repo)
- [x] Repo: \`avaldesv/MortgagesCalculator\`
- [x] Deploy fase 1 en Railway; dominio/email temporales documentados

## Entregado en repo
- \`docs/decisions/GATE-0-branding.md\` mergeado en \`${MAIN}\`
- README y UI alineados con MortgageCalc

## Pendiente
- Ninguno para GATE-0

## Referencias
- ${REPO}/blob/${MAIN}/docs/decisions/GATE-0-branding.md`,
  },
  'AVV-21': {
    state: 'done',
    description: `## Objetivo
Publicar contrato **OpenAPI v0.1** y checklist de sign-off FE/BE (GATE-1).

## Qué hacer (criterios)
- [x] \`docs/api/openapi-v0.1.yaml\` en \`${MAIN}\`
- [x] \`npx @redocly/cli lint\` — 0 errores
- [x] \`docs/api/GATE-1-signoff.md\` completado
- [x] CI valida OpenAPI en PR/\`${MAIN}\`

## Entregado en repo
- Spec OpenAPI 3.0.3: health, auth, placements, listings, partner leads
- Lint en \`.github/workflows/ci.yml\`

## Pendiente
- Actualizar \`servers[0].url\` cuando exista URL real de API en Railway (ver AVV-34)

## Referencias
- ${REPO}/tree/${MAIN}/docs/api`,
  },
  'AVV-22': {
    state: 'done',
    description: `## Objetivo
Aprobar matriz **Definition of Done L1–L4** para gates y entregables P0.

## Qué hacer (criterios)
- [x] Matriz DoD acordada en plan v2.3/v2.4
- [x] Sin re-trabajo salvo change request explícito

## Entregado en repo
- GATE-2 marcado Done en planificación; usado como referencia para P0-A/P0-B

## Pendiente
- Ninguno

## Referencias
- Plan Linear proyecto MortgageCalc`,
  },
  'AVV-23': {
    state: 'in_progress',
    description: `## Objetivo
Epic **P0-A**: fundación de producto + plataforma mínima (FE Angular, API NestJS, admin, CI, compliance).

## Qué hacer (criterios del epic)
- [x] Gates GATE-0, GATE-1, GATE-2 Done
- [x] CI verde: build FE, tests, lint OpenAPI, build API
- [x] Simple Calculator L2+, compliance, branding
- [x] API: health, JWT admin, placements, listings (JSON store)
- [x] FE: placements dinámicos, admin, proxy local
- [ ] **AVV-28**: Prisma + migraciones (o decisión documentada de mantener JSON)
- [ ] **AVV-34**: Deploy staging verificado (web + API, healthchecks)

## Entregado en repo (resumen)
- Commits: \`06b8214\`, \`e8732b2\` (P0-A foundation + API)
- \`backend/\`, \`.github/workflows/ci.yml\`, \`docs/compliance.md\`

## Pendiente (bloquea cerrar epic)
1. AVV-28 — persistencia Prisma vs JSON actual
2. AVV-34 — Railway staging API con URL en OpenAPI

## Cierre del epic
Mover a **Done** solo cuando AVV-28 y AVV-34 estén Done o descoped con ADR.

## Referencias
- ${REPO}/blob/${MAIN}/docs/linear/P0-A-issues.md`,
  },
  'AVV-24': {
    state: 'done',
    description: `## Objetivo
Pipeline **CI** en GitHub Actions para FE + API + OpenAPI.

## Qué hacer
- [x] Workflow \`.github/workflows/ci.yml\`
- [x] \`ng build\`, \`ng test\`, lint OpenAPI, \`nest build\`
- [x] Verde en \`${MAIN}\`

## Entregado
- Job único/multi-step CI en repo
- Falla PR si build o lint OpenAPI fallan

## Pendiente
- Ninguno

## Referencias
- ${REPO}/blob/${MAIN}/.github/workflows/ci.yml`,
  },
  'AVV-25': {
    state: 'done',
    description: `## Objetivo
Tests unitarios de \`MortgageCalculatorService\`.

## Qué hacer
- [x] P&I, loan amount, breakdown
- [x] Casos edge (loan 0, etc.)
- [x] Amortización, affordability, compare, reverse price (ampliado en P0-B)

## Entregado
- \`src/app/core/services/mortgage-calculator.service.spec.ts\` (13+ tests)

## Pendiente
- Mantener tests al añadir features

## Referencias
- ${REPO}/blob/${MAIN}/src/app/core/services/mortgage-calculator.service.spec.ts`,
  },
  'AVV-26': {
    state: 'done',
    description: `## Objetivo
**Compliance** documentado y visible en UI.

## Qué hacer
- [x] \`docs/compliance.md\`
- [x] Disclaimer en footer y junto a pagos estimados

## Entregado
- Doc legal placeholder + copy en Simple/footer

## Pendiente
- Revisión legal antes de marketing masivo (fuera de P0)

## Referencias
- ${REPO}/blob/${MAIN}/docs/compliance.md`,
  },
  'AVV-27': {
    state: 'done',
    description: `## Objetivo
**Simple Calculator** nivel L2+: validación, UX, integración estado compartido.

## Qué hacer
- [x] Validación inputs (precio, %, tasa)
- [x] Donut/bar de desglose
- [x] CTAs y disclaimers
- [x] Sync con \`CalculatorStateService\` (AVV-38)

## Entregado
- \`src/app/features/simple-calculator/\`
- Ruta \`/simple-calculator\`

## Pendiente
- Ninguno para DoD L2 Simple

## Referencias
- Commit \`e8732b2\`, \`efcde3d\``,
  },
  'AVV-28': {
    state: 'in_progress',
    description: `## Objetivo
Backend **NestJS** con persistencia acordada en plan (originalmente Prisma) y \`GET /api/health\`.

## Qué hacer (criterios originales)
- [x] Scaffold NestJS en \`backend/\`
- [x] \`GET /api/health\` según OpenAPI
- [x] Módulos auth, placements, listings, partner leads
- [ ] **Prisma** + schema + migraciones (o ADR explícito manteniendo JSON)
- [ ] Seed vía DB si se migra a Prisma

## Entregado (estado actual)
- Persistencia **JSON**: \`backend/data/seed.json\`, \`backend/data/store.json\`
- \`DataStoreService\` read/write en disco
- Dockerfile + \`railway.toml\` para API
- **Sin** \`prisma/schema.prisma\`

## Pendiente (siguiente trabajo)
1. Decidir: migrar a Prisma PostgreSQL o documentar JSON como decisión P0
2. Si Prisma: schema, migrate, adaptar services
3. Variables Railway: \`DATABASE_URL\`, JWT secret producción

## Referencias
- ${REPO}/tree/${MAIN}/backend`,
  },
  'AVV-29': {
    state: 'done',
    description: `## Objetivo
**Auth admin**: login + JWT guard en rutas \`/api/v1/admin/*\`.

## Qué hacer
- [x] \`POST /api/v1/auth/login\`
- [x] Guard JWT en controllers admin
- [x] Credenciales seed documentadas (rotar en prod)

## Entregado
- \`backend/src/auth/\`
- Admin FE: \`/admin/login\`

## Pendiente
- Rotar credenciales default antes de prod pública

## Referencias
- OpenAPI \`bearerAuth\``,
  },
  'AVV-30': {
    state: 'done',
    description: `## Objetivo
API **placements** y **listings** (público + admin).

## Qué hacer
- [x] GET active placements por tab
- [x] CRUD admin placements
- [x] GET listings paginado + CRUD admin

## Entregado
- \`ad-placements/\`, \`listings/\` controllers + services
- Seed con listings de ejemplo FL

## Pendiente
- Filtros avanzados listings si se requiere en P1

## Referencias
- ${REPO}/blob/${MAIN}/docs/api/openapi-v0.1.yaml`,
  },
  'AVV-31': {
    state: 'done',
    description: `## Objetivo
FE consume **API de placements** (no config estático en prod).

## Qué hacer
- [x] \`ListingsAdConfigService\` HTTP
- [x] \`ModularPageComponent\` carga placements por tab
- [x] \`environment.apiBaseUrl\` + \`proxy.conf.json\` dev

## Entregado
- \`src/app/core/services/listings-ad-config.service.ts\`
- Integración en layout modular

## Pendiente
- Ninguno

## Referencias
- \`src/environments/environment.ts\``,
  },
  'AVV-32': {
    state: 'done',
    description: `## Objetivo
**Admin UI** mínima: placements + listings.

## Qué hacer
- [x] Login admin
- [x] Toggle placement, CRUD listing en una pantalla

## Entregado
- \`/admin\`, \`/admin/login\`
- \`AdminDashboardComponent\`

## Pendiente
- UX admin P1 (validaciones, confirmaciones)

## Referencias
- \`src/app/features/admin/\``,
  },
  'AVV-33': {
    state: 'done',
    description: `## Objetivo
**Branding MortgageCalc** visible en shell de la app.

## Qué hacer
- [x] \`index.html\` título/meta
- [x] Header/footer con nombre y estilo Coastal Fintech

## Entregado
- Theme \`styles.scss\`, layout header/footer

## Pendiente
- Assets logo definitivos (P1)

## Referencias
- GATE-0 branding doc`,
  },
  'AVV-34': {
    state: 'backlog',
    description: `## Objetivo
**Railway staging**: servicio Web (Angular) + servicio API (NestJS) con healthchecks verificados.

## Qué hacer
- [x] Dockerfile API + \`railway.toml\` en repo
- [x] README con instrucciones 2 servicios
- [ ] Crear/verificar servicio API en Railway staging
- [ ] URL API en \`environment.staging\` / OpenAPI \`servers[0].url\`
- [ ] Healthcheck \`GET /api/health\` OK desde Railway
- [ ] FE staging apunta a API staging (CORS si aplica)
- [ ] Smoke: placements + listings + partner lead

## Entregado en repo
- Config Docker backend; nginx FE ya soporta PORT Railway
- **No verificado** deploy end-to-end en staging

## Pendiente (próximo sprint)
1. Deploy API staging + variables env
2. Probar admin login y listings desde URL pública staging
3. Documentar URLs en README y OpenAPI

## Referencias
- ${REPO}/blob/${MAIN}/backend/Dockerfile
- Issue bloquea cierre epic AVV-23`,
  },
  'AVV-35': {
    state: 'done',
    description: `## Objetivo
Epic prereq **CalculatorStateService** antes de tabs P0-B.

## Qué hacer
- [x] Servicio transversal con signals
- [x] Sub-issues ST-01…ST-03 Done

## Entregado
- \`CalculatorStateService\` + modelo snapshot
- Integrado en Simple; usado por Advanced, Affordability, Compare, Homes

## Pendiente
- Ninguno

## Referencias
- Commit \`efcde3d\``,
  },
  'AVV-36': {
    state: 'done',
    description: `## Objetivo
**ST-01**: \`CalculatorStateService\` — signals + patch/snapshot/reset.

## Qué hacer
- [x] Injectable root
- [x] Signals: homePrice, downPaymentPercent, interestRate, loanTermYears, zipCode, monthlyPayment, loanAmount
- [x] API: \`patch()\`, \`getSnapshot()\`, \`reset()\`

## Entregado
- \`src/app/core/services/calculator-state.service.ts\`
- \`src/app/core/models/calculator-state.model.ts\`

## Pendiente
- Ninguno`,
  },
  'AVV-37': {
    state: 'done',
    description: `## Objetivo
**ST-02**: Persistencia en **sessionStorage**.

## Qué hacer
- [x] Hidratar al init
- [x] Guardar en cada \`patch()\`
- [x] Limpiar en \`reset()\`

## Entregado
- Key \`mortgagecalc_calculator_state_v1\`

## Pendiente
- Ninguno`,
  },
  'AVV-38': {
    state: 'done',
    description: `## Objetivo
**ST-03**: Integrar **Simple Calculator** con estado compartido.

## Qué hacer
- [x] Simple lee snapshot al cargar
- [x] Simple escribe patch al cambiar inputs/resultado

## Entregado
- \`SimpleCalculatorComponent\` sync bidireccional

## Pendiente
- Ninguno`,
  },
  'AVV-39': {
    state: 'done',
    description: `## Objetivo
Tab **Advanced Calculator** — DoD L2: amortización, gráficos, extra payment.

## Qué hacer
- [x] Formulario completo (hereda inputs Simple + extra mensual)
- [x] Tabla amortización (preview 12 meses + lógica completa)
- [x] Gráficos anuales principal/interés y balance
- [x] Donut/bar desglose
- [x] Export PDF deshabilitado ("Coming soon")
- [x] Sync \`CalculatorStateService\`
- [x] Tests amortización
- [x] Ruta \`/advanced-calculator\`

## Entregado
- \`src/app/features/advanced-calculator/\`
- \`calculateAdvanced()\`, \`buildAmortizationSchedule()\` en servicio
- Commit \`63bea0d\` en \`${MAIN}\`

## Pendiente
- Export PDF/email (P1)

## Referencias
- ${REPO}/tree/${MAIN}/src/app/features/advanced-calculator`,
  },
  'AVV-40': {
    state: 'done',
    description: `## Objetivo
Tab **Affordability** — DoD L2: DTI, score, comfort meter, precio asequible.

## Qué hacer
- [x] Inputs ingreso anual, deudas mensuales, housing actual
- [x] DTI front-end 28% y back-end 36%
- [x] Score y banda comfortable / stretch / over
- [x] Precio máximo estimado (búsqueda binaria)
- [x] Tests unitarios
- [x] Ruta \`/affordability\`

## Entregado
- \`src/app/features/affordability-calculator/\`
- \`calculateAffordability()\` en \`MortgageCalculatorService\`
- Commit \`63bea0d\`

## Pendiente
- Ninguno para L2`,
  },
  'AVV-41': {
    state: 'done',
    description: `## Objetivo
Tab **Compare Scenarios** — DoD L2: presets 15/20/30, tabla y gráfico ahorro interés.

## Qué hacer
- [x] Mismos inputs precio/down/tasa
- [x] Tabla comparativa 3 plazos
- [x] Barras "interest saved vs 30-year"
- [x] \`compareScenarios()\` + tests
- [x] Ruta \`/compare-scenarios\`

## Entregado
- \`src/app/features/compare-scenarios/\`
- Commit \`f08b2a0\`

## Pendiente
- Comparar también variaciones de down/rate (P1)`,
  },
  'AVV-42': {
    state: 'done',
    description: `## Objetivo
**Homes by Payment — fase 1**: GET listings + reverse calc + grid.

## Qué hacer
- [x] Consumir \`GET /api/v1/listings?sponsored=true\`
- [x] Reverse calc: precio máximo desde pago deseado
- [x] Grid de listings filtrados por pago
- [x] Botón Search refresca API
- [x] Sync pago/ZIP desde CalculatorState

## Entregado
- \`estimateHomePriceFromMonthlyPayment()\`
- \`HomesByPaymentComponent\` con signals + filtros básicos
- Commit \`b08bb13\` (fase 1+2 en mismo entregable)

## Pendiente
- Verificar con API staging (AVV-34)`,
  },
  'AVV-43': {
    state: 'done',
    description: `## Objetivo
**Homes by Payment — fase 2**: filtros beds/baths (y área).

## Qué hacer
- [x] Filtro min bedrooms / min bathrooms
- [x] Filtro ZIP o ciudad en texto
- [x] Estado vacío si no hay match
- [x] Listings reactivos vía signal en service

## Entregado
- UI filtros en \`homes-by-payment.component\`
- \`ListingsAdConfigService.listings\` readonly signal

## Pendiente
- Filtro property type (P1 si se añade al modelo listing)`,
  },
  'AVV-44': {
    state: 'done',
    description: `## Objetivo
**Learning Center** — DoD L2: artículos JSON estáticos (10+).

## Qué hacer
- [x] ≥10 artículos en JSON
- [x] Agrupación por categoría
- [x] Expandir resumen por artículo
- [x] Ruta \`/learning-center\`
- [x] Disclaimer educativo

## Entregado
- \`src/app/data/learning-articles.json\` (12 artículos)
- \`src/app/features/learning-center/\`
- Commit \`e305373\`

## Pendiente
- Contenido largo / CMS (P1)`,
  },
  'AVV-45': {
    state: 'done',
    description: `## Objetivo
**Partners** — DoD L3: formulario + \`POST /api/v1/leads/partner\`.

## Qué hacer
- [x] Formulario con todos los campos OpenAPI
- [x] \`consentContact\` obligatorio true
- [x] Backend persiste lead en store JSON
- [x] Rate limit 10 req/min por IP
- [x] Respuesta 201 con id
- [x] Ruta \`/partners\`

## Entregado
- \`backend/src/partner-leads/\`
- \`src/app/features/partners/\`
- \`partnerLeads[]\` en seed/store
- Commit \`e305373\`

## Pendiente
- Política privacidad URL (compliance TBD)
- Probar lead en staging (AVV-34)`,
  },
};

async function gql(query, variables = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.LINEAR_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data;
}

async function getTeamAndStates() {
  const data = await gql(`query {
    teams { nodes { id key } }
    workflowStates { nodes { id name type team { id } } }
  }`);
  const team = data.teams.nodes[0];
  const states = data.workflowStates.nodes.filter((s) => s.team?.id === team.id);
  return {
    teamId: team.id,
    doneId: states.find((s) => s.type === 'completed')?.id,
    startedId:
      states.find((s) => s.name === 'In Progress')?.id ??
      states.find((s) => s.type === 'started')?.id,
    backlogId: states.find((s) => s.type === 'unstarted' || s.name === 'Backlog')?.id,
  };
}

async function findIssue(identifier, teamId) {
  const number = Number(identifier.split('-')[1]);
  const data = await gql(
    `query($teamId: ID!, $number: Float!) {
      issues(filter: { team: { id: { eq: $teamId } }, number: { eq: $number } }, first: 1) {
        nodes { id identifier title }
      }
    }`,
    { teamId, number },
  );
  return data.issues.nodes[0];
}

async function updateDescription(issueId, description) {
  return gql(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) { success issue { identifier } }
    }`,
    { id: issueId, input: { description } },
  );
}

async function updateState(issueId, stateId) {
  return gql(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success issue { identifier state { name } }
      }
    }`,
    { id: issueId, input: { stateId } },
  );
}

async function main() {
  if (!process.env.LINEAR_API_KEY) {
    console.error('Set LINEAR_API_KEY');
    process.exit(1);
  }

  const descriptionsOnly = process.argv.includes('--descriptions-only');
  const statesOnly = process.argv.includes('--states-only');
  const { teamId, doneId, startedId, backlogId } = await getTeamAndStates();
  const stateMap = { done: doneId, in_progress: startedId, backlog: backlogId ?? startedId };

  for (const [identifier, cfg] of Object.entries(ISSUES)) {
    const issue = await findIssue(identifier, teamId);
    if (!issue) {
      console.warn(`Skip ${identifier}: not found`);
      continue;
    }

    if (!statesOnly) {
      await updateDescription(issue.id, cfg.description);
      console.log(`Description: ${identifier}`);
    }

    if (!descriptionsOnly) {
      const stateId = stateMap[cfg.state];
      const r = await updateState(issue.id, stateId);
      console.log(`State ${r.issueUpdate.issue.state.name}: ${identifier} — ${issue.title}`);
    }
  }

  console.log('\nSync complete:', Object.keys(ISSUES).length, 'issues');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

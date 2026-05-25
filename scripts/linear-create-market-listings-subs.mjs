/**
 * Sub-issues bajo AVV-46 (US market listings / Straply).
 * Ejecutar ANTES de implementar: node scripts/linear-create-market-listings-subs.mjs
 */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const API_URL = 'https://api.linear.app/graphql';

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

const SUBS = [
  [
    '[P1-01a] Diseño + Linear — US market listings (Straply)',
    `## Objetivo
Epic/subtareas y decisión de proveedor **Straply** (100 lookups/día gratis).

## Criterios
- [x] AVV-46 como parent
- [x] Sub-issues P1-01a…e creadas
- [x] \`docs/features/us-market-listings.md\` actualizado

## Referencias
- https://straply.com/dashboard
- \`GET /v1/properties\` + Bearer token`,
  ],
  [
    '[P1-01b] Backend — Straply client + market-listings API',
    `## Objetivo
Proxy NestJS: \`GET /api/v1/market-listings\`, settings en store, caché 6h.

## Criterios
- [ ] \`straply.client.ts\` — Bearer \`STRAPLY_API_KEY\`
- [ ] \`market-listings.service.ts\` sin RentCast
- [ ] Admin \`GET|PATCH .../admin/market-listings/settings\`

## Env
\`STRAPLY_API_KEY\` en Railway API`,
  ],
  [
    '[P1-01c] FE — módulo debajo de Sponsored',
    `## Objetivo
\`app-us-market-listings\` bajo \`app-listings-ad\` en \`ModularPageComponent\`.

## Criterios
- [ ] Carga por tab vía \`MarketListingsService\`
- [ ] Atribución "Listing data via Straply"
- [ ] Oculto si disabled o sin datos`,
  ],
  [
    '[P1-01d] Admin — toggle + maxCount + ubicación',
    `## Objetivo
Dashboard: mostrar módulo, 1–12 casas, city/state, título.

## Criterios
- [ ] Sección US market listings (Straply)
- [ ] PATCH settings invalida caché FE`,
  ],
  [
    '[P1-01e] Deploy + verificación prod',
    `## Objetivo
Straply en Railway; smoke en calculadoras con placement activo.

## Criterios
- [ ] \`STRAPLY_API_KEY\` configurada
- [ ] Redeploy API
- [ ] Admin enabled + maxCount verificado en prod`,
  ],
];

async function main() {
  const teamRes = await gql(`query { teams { nodes { id key } } }`);
  const teamId = teamRes.teams.nodes[0].id;

  const parentRes = await gql(
    `query($teamId: ID!, $n: Float!) {
      issues(filter: { team: { id: { eq: $teamId } }, number: { eq: $n } }, first: 1) {
        nodes { id identifier title }
      }
    }`,
    { teamId, n: 46 },
  );
  const parent = parentRes.issues.nodes[0];
  if (!parent) throw new Error('Parent AVV-46 not found — run linear-create-market-listings-issue.mjs first');
  const parentId = parent.id;

  const existing = await gql(
    `query($teamId: ID!, $parentId: ID!) {
      issues(filter: { team: { id: { eq: $teamId } }, parent: { id: { eq: $parentId } } }, first: 20) {
        nodes { identifier title state { name } }
      }
    }`,
    { teamId, parentId },
  );

  const have = new Set(existing.issues.nodes.map((i) => i.title));
  const backlogRes = await gql(`query { workflowStates { nodes { id name type team { id } } } }`);
  const backlogId = backlogRes.workflowStates.nodes.find(
    (s) => s.team?.id === teamId && (s.type === 'unstarted' || s.name === 'Backlog'),
  )?.id;
  const startedId =
    backlogRes.workflowStates.nodes.find(
      (s) => s.team?.id === teamId && (s.name === 'In Progress' || s.type === 'started'),
    )?.id ?? backlogId;

  for (const [title, description] of SUBS) {
    if ([...have].some((t) => t === title)) {
      console.log('Skip (exists):', title);
      continue;
    }
    const stateId = title.includes('P1-01a') ? startedId : backlogId;
    const r = await gql(
      `mutation($input: IssueCreateInput!) {
        issueCreate(input: $input) { success issue { identifier title url state { name } } }
      }`,
      { input: { teamId, parentId, title, description, stateId } },
    );
    console.log(r.issueCreate.issue.identifier, r.issueCreate.issue.state.name, r.issueCreate.issue.url);
  }

  await gql(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) { success }
    }`,
    {
      id: parentId,
      input: {
        title: '[P1-01] US market listings — Straply below sponsored',
        description: `## Objetivo
Epic: módulo **US market listings** debajo de Sponsored — datos reales vía **Straply**.

## Sub-issues
- P1-01a Diseño + Linear
- P1-01b Backend Straply
- P1-01c FE módulo
- P1-01d Admin
- P1-01e Deploy prod

## Fuente
- API: \`https://api.straply.com/v1/properties\`
- Auth: \`Authorization: Bearer STRAPLY_API_KEY\`
- Free: 100 lookups/día

## Registro de cambios
- Migración RentCast → Straply (pendiente commit)`,
      },
    },
  );
  console.log('Updated parent', parent.identifier);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

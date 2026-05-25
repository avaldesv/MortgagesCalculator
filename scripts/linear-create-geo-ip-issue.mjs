/** Create AVV-52 — IP geolocation for market listings if missing. */
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

async function main() {
  const teamRes = await gql(`query { teams { nodes { id } } }`);
  const teamId = teamRes.teams.nodes[0].id;
  const existing = await gql(
    `query($teamId: ID!) {
      issues(filter: { team: { id: { eq: $teamId } }, title: { contains: "IP geolocation" } }, first: 3) {
        nodes { identifier }
      }
    }`,
    { teamId },
  );
  if (existing.issues.nodes.length) {
    console.log('Exists:', existing.issues.nodes[0].identifier);
    return;
  }
  const parentRes = await gql(
    `query($teamId: ID!, $n: Float!) {
      issues(filter: { team: { id: { eq: $teamId } }, number: { eq: $n } }, first: 1) {
        nodes { id }
      }
    }`,
    { teamId, n: 46 },
  );
  const states = await gql(`query { workflowStates { nodes { id type team { id } } } }`);
  const doneId = states.workflowStates.nodes.find((s) => s.team?.id === teamId && s.type === 'completed')?.id;
  const r = await gql(
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) { issue { identifier url } }
    }`,
    {
      input: {
        teamId,
        parentId: parentRes.issues.nodes[0]?.id,
        title: '[P1-02] Market listings — ZIP from visitor IP (geo)',
        description: `## Objetivo
Resolver ZIP del visitante vía IP y buscar casas Straply en esa zona.

## Fuente geo
- ipapi.co (HTTPS, caché 24h/IP)
- Fallback: ZIP admin

## Entregado
- \`geo-ip.service.ts\`, \`client-ip.util.ts\`
- Meta \`locationSource\`, \`zipCode\` en respuesta API`,
        stateId: doneId,
      },
    },
  );
  console.log('Created:', r.issueCreate.issue.identifier, r.issueCreate.issue.url);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

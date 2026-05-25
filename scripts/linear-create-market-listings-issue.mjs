/** Create AVV-46 — US market listings (RentCast) if missing. */
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

const TITLE = '[P1-01] US market listings — Straply below sponsored';
const DESCRIPTION = `## Objetivo
Epic: módulo debajo de **Sponsored** — casas reales vía **Straply**.

## Fuente
- https://straply.com/dashboard
- \`GET /v1/properties\` + \`STRAPLY_API_KEY\`

## Sub-issues
Ejecutar: \`node scripts/linear-create-market-listings-subs.mjs\` (AVV-47–51)`;

async function main() {
  const teamRes = await gql(`query { teams { nodes { id key } } }`);
  const teamId = teamRes.teams.nodes[0].id;

  const existing = await gql(
    `query($teamId: ID!) {
      issues(filter: { team: { id: { eq: $teamId } }, title: { contains: "US market listings" } }, first: 5) {
        nodes { identifier title url state { name } }
      }
    }`,
    { teamId },
  );
  if (existing.issues.nodes.length) {
    console.log('Already exists:', existing.issues.nodes.map((i) => i.identifier).join(', '));
    return;
  }

  const states = await gql(`query { workflowStates { nodes { id name type team { id } } } }`);
  const doneId = states.workflowStates.nodes.find(
    (s) => s.team?.id === teamId && s.type === 'completed',
  )?.id;

  const parentRes = await gql(
    `query($teamId: ID!, $n: Float!) {
      issues(filter: { team: { id: { eq: $teamId } }, number: { eq: $n } }, first: 1) {
        nodes { id }
      }
    }`,
    { teamId, n: 23 },
  );
  const parentId = parentRes.issues.nodes[0]?.id;

  const r = await gql(
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) { success issue { identifier title url state { name } } }
    }`,
    {
      input: {
        teamId,
        parentId,
        title: TITLE,
        description: DESCRIPTION,
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

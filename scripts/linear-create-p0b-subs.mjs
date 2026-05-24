/** Create sub-issues under AVV-35 if missing. */
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
  ['[P0-B-ST-01] CalculatorStateService — signals + patch/snapshot/reset', 'Servicio root injectable.'],
  ['[P0-B-ST-02] Persistencia sessionStorage', 'Hidratar al init; guardar en patch.'],
  ['[P0-B-ST-03] Integrar Simple Calculator con state', 'Simple lee/escribe CalculatorStateService.'],
];

async function main() {
  const teamRes = await gql(`query { teams { nodes { id key } } }`);
  const teamId = teamRes.teams.nodes[0].id;
  const parentRes = await gql(
    `query($teamId: ID!, $n: Float!) {
      issues(filter: { team: { id: { eq: $teamId } }, number: { eq: $n } }, first: 1) {
        nodes { id identifier }
      }
    }`,
    { teamId, n: 35 },
  );
  const parentId = parentRes.issues.nodes[0]?.id;
  if (!parentId) throw new Error('Parent AVV-35 not found');

  const existing = await gql(
    `query($teamId: ID!, $parentId: ID!) {
      issues(filter: { team: { id: { eq: $teamId } }, parent: { id: { eq: $parentId } } }, first: 10) {
        nodes { identifier title }
      }
    }`,
    { teamId, parentId },
  );
  if (existing.issues.nodes.length >= SUBS.length) {
    console.log('Sub-issues exist:', existing.issues.nodes.map((i) => i.identifier).join(', '));
    return;
  }

  for (const [title, description] of SUBS) {
    const r = await gql(
      `mutation($input: IssueCreateInput!) {
        issueCreate(input: $input) { success issue { identifier title url } }
      }`,
      { input: { teamId, parentId, title, description } },
    );
    console.log(r.issueCreate.issue.identifier, r.issueCreate.issue.url);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

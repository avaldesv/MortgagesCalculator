/**
 * Create P0-B tab epics/issues (Backlog) — not started in code yet.
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

const TABS = [
  { title: '[P0-B] Advanced Calculator — DoD L2', desc: 'Amortización, charts, inputs; export UI disabled.' },
  { title: '[P0-B] Affordability — DoD L2', desc: 'DTI, score, comfort meter, affordable price.' },
  { title: '[P0-B] Compare Scenarios — DoD L2', desc: 'Presets 15/30, tablas + chart ahorro.' },
  { title: '[P0-B] Homes by Payment — fase 1', desc: 'GET /listings + reverse calc + grid.' },
  { title: '[P0-B] Homes by Payment — fase 2', desc: 'Filtros beds/baths/type.' },
  { title: '[P0-B] Learning Center — DoD L2', desc: 'Artículos JSON estáticos 10+.' },
  { title: '[P0-B] Partners — DoD L3', desc: 'Form + POST /leads/partner.' },
];

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
  const projects = await gql(`query { projects { nodes { id name } } }`);
  const projectId = projects.projects.nodes.find((p) => p.name === 'MortgageCalc')?.id;
  const states = await gql(`query { workflowStates { nodes { id name type team { id } } } }`);
  const backlogId = states.workflowStates.nodes.find(
    (s) => s.team?.id === teamId && (s.type === 'unstarted' || s.name === 'Backlog'),
  )?.id;

  const labelsRes = await gql(
    `query($teamId: ID!) { issueLabels(filter: { team: { id: { eq: $teamId } } }) { nodes { id name } } }`,
    { teamId },
  );
  const labelMap = Object.fromEntries(labelsRes.issueLabels.nodes.map((l) => [l.name, l.id]));
  if (!labelMap['P0-B']) {
    const c = await gql(
      `mutation($input: IssueLabelCreateInput!) { issueLabelCreate(input: $input) { issueLabel { id name } } }`,
      { input: { teamId, name: 'P0-B', color: '#f59e0b' } },
    );
    labelMap['P0-B'] = c.issueLabelCreate.issueLabel.id;
  }
  const labelIds = [labelMap['P0-B'], labelMap['lane:product']].filter(Boolean);

  for (const tab of TABS) {
    const exists = await gql(
      `query($teamId: ID!, $q: String!) {
        issues(filter: { team: { id: { eq: $teamId } }, title: { eq: $q } }, first: 1) {
          nodes { identifier }
        }
      }`,
      { teamId, q: tab.title },
    );
    if (exists.issues.nodes.length) {
      console.log('Exists:', exists.issues.nodes[0].identifier, tab.title);
      continue;
    }
    const r = await gql(
      `mutation($input: IssueCreateInput!) {
        issueCreate(input: $input) { issue { identifier title url state { name } } }
      }`,
      {
        input: {
          teamId,
          projectId,
          title: tab.title,
          description: tab.desc + '\n\n**Bloqueado por:** P0-A epic Done + AVV-35 Done.',
          labelIds,
          stateId: backlogId,
        },
      },
    );
    console.log(`Backlog: ${r.issueCreate.issue.identifier}`, r.issueCreate.issue.url);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

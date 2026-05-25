/**
 * Ajusta estados Linear al estado REAL del repo (post-auditoría).
 * Usage: LINEAR_API_KEY=... node scripts/linear-reconcile-states.mjs
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

/** done | in_progress | backlog */
const TARGET = {
  'AVV-20': 'done',
  'AVV-21': 'done',
  'AVV-22': 'done',
  'AVV-23': 'in_progress',
  'AVV-24': 'done',
  'AVV-25': 'done',
  'AVV-26': 'done',
  'AVV-27': 'done',
  'AVV-28': 'done',
  'AVV-29': 'done',
  'AVV-30': 'done',
  'AVV-31': 'done',
  'AVV-32': 'done',
  'AVV-33': 'done',
  'AVV-34': 'in_progress',
  'AVV-35': 'done',
  'AVV-36': 'done',
  'AVV-37': 'done',
  'AVV-38': 'done',
  'AVV-39': 'done',
  'AVV-40': 'done',
  'AVV-41': 'done',
  'AVV-42': 'done',
  'AVV-43': 'done',
  'AVV-44': 'done',
  'AVV-45': 'done',
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

async function main() {
  if (!process.env.LINEAR_API_KEY) {
    console.error('Set LINEAR_API_KEY');
    process.exit(1);
  }

  const data = await gql(`query {
    teams { nodes { id key } }
    workflowStates { nodes { id name type team { id } } }
  }`);
  const teamId = data.teams.nodes[0].id;
  const states = data.workflowStates.nodes.filter((s) => s.team?.id === teamId);
  const byType = {
    done: states.find((s) => s.type === 'completed')?.id,
    in_progress:
      states.find((s) => s.name === 'In Progress')?.id ??
      states.find((s) => s.type === 'started')?.id,
    backlog: states.find((s) => s.type === 'unstarted' || s.name === 'Backlog')?.id,
  };

  for (const [id, target] of Object.entries(TARGET)) {
    const m = id.match(/-(\d+)$/);
    const num = Number(m[1]);
    const issueRes = await gql(
      `query($teamId: ID!, $n: Float!) {
        issues(filter: { team: { id: { eq: $teamId } }, number: { eq: $n } }, first: 1) {
          nodes { id identifier title state { name } }
        }
      }`,
      { teamId, n: num },
    );
    const issue = issueRes.issues.nodes[0];
    if (!issue) continue;
    const stateId = byType[target];
    await gql(
      `mutation($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) { issue { identifier state { name } } }
      }`,
      { id: issue.id, input: { stateId } },
    );
    console.log(`${id}: ${target} → ${issue.title}`);
  }
  console.log('\nReconcile complete. P0-B tab issues: run linear-create-p0b-tabs.mjs');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

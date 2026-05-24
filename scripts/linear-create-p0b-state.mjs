/**
 * Create P0-B CalculatorStateService epic + sub-issues in Linear.
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
const API_KEY = process.env.LINEAR_API_KEY;

async function gql(query, variables = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: API_KEY },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data;
}

const EPIC = {
  title: '[P0-B] Epic CalculatorStateService (prereq tabs)',
  description: `Mini-plataforma transversal antes de tabs P0-B.

Signals: homePrice, downPaymentPercent, interestRate, loanTermYears, zipCode, monthlyPayment, loanAmount
API: patch(), snapshot(), reset()
Opcional: sessionStorage`,
};

const SUB_ISSUES = [
  {
    title: '[P0-B-ST-01] CalculatorStateService — signals + patch/snapshot/reset',
    description: 'Servicio root injectable; signals públicos; API documentada.',
  },
  {
    title: '[P0-B-ST-02] Persistencia sessionStorage',
    description: 'Hidratar al init; guardar en patch; clear en reset.',
  },
  {
    title: '[P0-B-ST-03] Integrar Simple Calculator con state compartido',
    description: 'Simple lee/escribe CalculatorStateService.',
  },
];

async function main() {
  if (!API_KEY) {
    console.error('Set LINEAR_API_KEY');
    process.exit(1);
  }

  const teams = await gql(`query { teams { nodes { id key } } }`);
  const team = teams.teams.nodes[0];
  const projects = await gql(`query { projects { nodes { id name } } }`);
  const projectId = projects.projects.nodes.find((p) => p.name === 'MortgageCalc')?.id;

  const labelsRes = await gql(
    `query($teamId: ID!) { issueLabels(filter: { team: { id: { eq: $teamId } } }) { nodes { id name } } }`,
    { teamId: team.id },
  );
  const labelMap = Object.fromEntries(labelsRes.issueLabels.nodes.map((l) => [l.name, l.id]));
  for (const name of ['P0-B', 'prereq:P0-B', 'platform:shared', 'prereq:state']) {
    if (!labelMap[name]) {
      const c = await gql(
        `mutation($input: IssueLabelCreateInput!) {
          issueLabelCreate(input: $input) { issueLabel { id name } }
        }`,
        { input: { teamId: team.id, name, color: '#8b5cf6' } },
      );
      labelMap[name] = c.issueLabelCreate.issueLabel.id;
    }
  }
  const labelIds = ['P0-B', 'lane:platform', 'prereq:P0-B', 'platform:shared', 'prereq:state']
    .map((n) => labelMap[n])
    .filter(Boolean);

  const existing = await gql(
    `query($teamId: ID!) {
      issues(filter: { team: { id: { eq: $teamId } }, title: { contains: "CalculatorStateService" } }, first: 5) {
        nodes { identifier title }
      }
    }`,
    { teamId: team.id },
  );
  if (existing.issues.nodes.length) {
    console.log('Epic already exists:', existing.issues.nodes.map((i) => i.identifier).join(', '));
    return;
  }

  const epicRes = await gql(
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) { success issue { id identifier url title } }
    }`,
    {
      input: {
        teamId: team.id,
        projectId,
        title: EPIC.title,
        description: EPIC.description,
        labelIds,
      },
    },
  );
  const epic = epicRes.issueCreate.issue;
  console.log(`Epic: ${epic.identifier} ${epic.url}`);

  for (const sub of SUB_ISSUES) {
    const r = await gql(
      `mutation($input: IssueCreateInput!) {
        issueCreate(input: $input) { success issue { identifier title } }
      }`,
      {
        input: {
          teamId: team.id,
          projectId,
          parentId: epic.id,
          title: sub.title,
          description: sub.description,
          labelIds: [...labelIds, labelMap['prereq:state']].filter(Boolean),
        },
      },
    );
    console.log(`  ${r.issueCreate.issue.identifier}: ${sub.title}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

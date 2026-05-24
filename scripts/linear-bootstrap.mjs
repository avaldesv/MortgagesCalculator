/**
 * Creates MortgageCalc Linear project, labels, GATE issues, and P0-A epic + 11 issues.
 * Requires: LINEAR_API_KEY (Personal API key from Linear Settings > API)
 *
 * Usage:
 *   $env:LINEAR_API_KEY="lin_api_..."; node scripts/linear-bootstrap.mjs
 *   node scripts/linear-bootstrap.mjs --dry-run
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const API_URL = 'https://api.linear.app/graphql';
const DRY_RUN = process.argv.includes('--dry-run');

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();
const API_KEY = process.env.LINEAR_API_KEY;

const LABELS = [
  'gate',
  'P0-A',
  'P0-B',
  'P1',
  'lane:product',
  'lane:platform',
  'lane:growth',
  'lane:quality',
  'prereq:P0-B',
];

const GATE_ISSUES = [
  {
    title: '[GATE-0] Formalizar branding MortgageCalc',
    labels: ['gate', 'lane:product'],
    description: `## Objetivo
Registrar decisión de marca en repositorio y cerrar gate documental.

## Criterios de aceptación
- [ ] \`docs/decisions/GATE-0-branding.md\` en \`main\`
- [ ] MortgageCalc, repo sin rename, Railway fase 1, sin MortgageVision

## Enlace
https://github.com/avaldesv/MortgagesCalculator/blob/main/docs/decisions/GATE-0-branding.md

## Bloquea
Epic P0-A (implementación código)`,
    state: 'started',
  },
  {
    title: '[GATE-1] OpenAPI v0.1 + checklist',
    labels: ['gate', 'lane:platform'],
    description: `## Objetivo
Publicar contrato API v0.1 y cerrar gate con checklist (sin firmas nominales).

## Criterios de aceptación
- [ ] \`docs/api/openapi-v0.1.yaml\` en \`main\`
- [ ] Redocly lint 0 errores
- [ ] \`docs/api/GATE-1-signoff.md\` checklist completo
- [ ] PR mergeado

## Bloquea
Epic P0-A (backend + FE API)`,
    state: 'started',
  },
  {
    title: '[GATE-2] Matriz DoD L1–L4',
    labels: ['gate', 'lane:quality'],
    description: `## Estado
**Aprobado 2026-05-24** — sin re-trabajo salvo change request.

## Referencia
Plan v2.3/v2.4 — matriz DoD por tab (P0-B objetivos L2/L3).`,
    state: 'completed',
  },
];

const P0A_EPIC = {
  title: '[P0-A] Fundación producto + plataforma mínima',
  labels: ['P0-A', 'lane:platform'],
  description: `## Objetivo
Sitio confiable: Simple Calculator sólido, ads vía API, admin mínimo, CI verde.

## Bloqueado por
- [GATE-0] → Done
- [GATE-1] → Done

## DoD
11 entregables hijos; ver docs/linear/P0-A-issues.md`,
};

const P0A_ISSUES = [
  {
    title: '[P0-A-01] CI: lint, ng test, ng build, OpenAPI lint',
    labels: ['P0-A', 'lane:quality'],
    description: `Pipeline GitHub Actions en PR y main.\n\n**Listo cuando:** workflow verde en main.`,
    blockedBy: ['GATE-0', 'GATE-1'],
  },
  {
    title: '[P0-A-02] Unit tests MortgageCalculatorService',
    labels: ['P0-A', 'lane:quality'],
    description: `Cobertura P&I, loan amount, breakdown, edge cases.`,
  },
  {
    title: '[P0-A-03] compliance.md + copy legal en UI',
    labels: ['P0-A', 'lane:quality', 'lane:product'],
    description: `docs/compliance.md + disclaimer footer + junto al resultado de pago.`,
    blockedBy: ['GATE-0'],
  },
  {
    title: '[P0-A-04] Simple Calculator L2+ hardening',
    labels: ['P0-A', 'lane:product'],
    description: `Validación inputs, $/% down, CTAs, disclaimer visible. Depende de #02.`,
  },
  {
    title: '[P0-A-05] NestJS + Prisma scaffold + GET /api/health',
    labels: ['P0-A', 'lane:platform'],
    description: `Backend en repo; health según openapi-v0.1.yaml.`,
    blockedBy: ['GATE-1'],
  },
  {
    title: '[P0-A-06] Auth login + JWT guard admin',
    labels: ['P0-A', 'lane:platform'],
    description: `POST /api/v1/auth/login; Bearer en /api/v1/admin/*. Depende de #05.`,
  },
  {
    title: '[P0-A-07] API placements + listings',
    labels: ['P0-A', 'lane:platform'],
    description: `CRUD admin + active placements + public listings paginados. OpenAPI v0.1.`,
  },
  {
    title: '[P0-A-08] FE: ModularPageLayout consume placements API',
    labels: ['P0-A', 'lane:product'],
    description: `Eliminar config TS estática en prod para placements.`,
  },
  {
    title: '[P0-A-09] Admin UI mínima placements + listings',
    labels: ['P0-A', 'lane:product'],
    description: `Una pantalla: toggle placement + CRUD listing.`,
  },
  {
    title: '[P0-A-10] Branding visible MortgageCalc en app',
    labels: ['P0-A', 'lane:product'],
    description: `title, meta, header, footer según GATE-0.`,
    blockedBy: ['GATE-0'],
  },
  {
    title: '[P0-A-11] Railway staging web + API healthcheck',
    labels: ['P0-A', 'lane:platform'],
    description: `Deploy staging; healthchecks OK. Depende de #05, #08.`,
  },
];

async function gql(query, variables = {}) {
  if (DRY_RUN) {
    console.log('[dry-run]', query.slice(0, 80).replace(/\s+/g, ' '), variables);
    return { data: {} };
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }
  return json;
}

async function main() {
  if (!API_KEY && !DRY_RUN) {
    console.error(
      'ERROR: Set LINEAR_API_KEY (Linear → Settings → API → Personal API keys)',
    );
    console.error('  PowerShell: $env:LINEAR_API_KEY="lin_api_..."; node scripts/linear-bootstrap.mjs');
    process.exit(1);
  }

  const teamsRes = await gql(`query { teams { nodes { id key name } } }`);
  const teams = teamsRes.data?.teams?.nodes ?? [];
  if (!teams.length && !DRY_RUN) throw new Error('No Linear teams found');
  const team = teams[0];
  const teamId = team?.id ?? 'dry-team-id';
  console.log(`Team: ${team?.key ?? '?'} — ${team?.name ?? 'dry-run'}`);

  let projectId = 'dry-project-id';
  if (!DRY_RUN) {
    const existing = await gql(
      `query($filter: ProjectFilter) { projects(filter: $filter, first: 5) { nodes { id name } } }`,
      { filter: { name: { eq: 'MortgageCalc' } } },
    );
    const found = existing.data?.projects?.nodes?.[0];
    if (found) {
      projectId = found.id;
      console.log(`Project exists: MortgageCalc (${projectId})`);
    } else {
      const created = await gql(
        `mutation($input: ProjectCreateInput!) {
          projectCreate(input: $input) { success project { id name url } }
        }`,
        {
          input: {
            name: 'MortgageCalc',
            teamIds: [teamId],
            description:
              'U.S. mortgage calculator — Angular + NestJS. Roadmap v2.4.',
          },
        },
      );
      projectId = created.data.projectCreate.project.id;
      console.log(`Created project: ${created.data.projectCreate.project.url}`);
    }
  } else {
    console.log('[dry-run] Would create/find project MortgageCalc');
  }

  const statesRes = await gql(
    `query($teamId: ID!) {
      workflowStates(filter: { team: { id: { eq: $teamId } } }) {
        nodes { id name type }
      }
    }`,
    { teamId },
  );
  const states = statesRes.data?.workflowStates?.nodes ?? [];
  const stateByType = (type) => states.find((s) => s.type === type)?.id;
  const stateStarted = states.find((s) => s.name === 'In Progress')?.id ?? stateByType('started');
  const stateDone = stateByType('completed');

  const labelIdByName = {};
  for (const name of LABELS) {
    if (DRY_RUN) {
      labelIdByName[name] = `label-${name}`;
      continue;
    }
    const labelsRes = await gql(
      `query($teamId: ID!, $name: String!) {
        issueLabels(filter: { team: { id: { eq: $teamId } }, name: { eq: $name } }, first: 1) {
          nodes { id name }
        }
      }`,
      { teamId, name },
    );
    let id = labelsRes.data?.issueLabels?.nodes?.[0]?.id;
    if (!id) {
      const created = await gql(
        `mutation($input: IssueLabelCreateInput!) {
          issueLabelCreate(input: $input) { success issueLabel { id name } }
        }`,
        { input: { teamId, name, color: '#0ea5e9' } },
      );
      id = created.data.issueLabelCreate.issueLabel.id;
      console.log(`Label: ${name}`);
    }
    labelIdByName[name] = id;
  }

  const createdIssues = {};

  async function createIssue({ title, description, labels, state, parentId }) {
    const labelIds = labels.map((l) => labelIdByName[l]).filter(Boolean);
    const stateId =
      state === 'completed' ? stateDone : state === 'started' ? stateStarted : undefined;
    if (DRY_RUN) {
      console.log(`[dry-run] Issue: ${title}`);
      return `dry-${title}`;
    }
    const input = {
      teamId,
      title,
      description,
      projectId,
      labelIds,
      parentId,
    };
    if (stateId) input.stateId = stateId;
    const res = await gql(
      `mutation($input: IssueCreateInput!) {
        issueCreate(input: $input) { success issue { id identifier url title } }
      }`,
      { input },
    );
    const issue = res.data.issueCreate.issue;
    console.log(`Issue ${issue.identifier}: ${issue.title}`);
    return issue.id;
  }

  for (const gate of GATE_ISSUES) {
    createdIssues[gate.title] = await createIssue(gate);
  }

  const epicId = await createIssue({ ...P0A_EPIC, state: 'started' });
  createdIssues[P0A_EPIC.title] = epicId;

  for (const item of P0A_ISSUES) {
    let desc = item.description;
    if (item.blockedBy?.length) {
      desc += `\n\n## Bloqueado por\n${item.blockedBy.map((b) => `- ${b}`).join('\n')}`;
    }
    await createIssue({
      title: item.title,
      description: desc,
      labels: item.labels,
      parentId: epicId,
    });
  }

  console.log('\nDone. Open Linear project MortgageCalc.');
  if (!DRY_RUN) {
    console.log('Next: mark GATE-0/1 Done after PR merge; then start P0-A children.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

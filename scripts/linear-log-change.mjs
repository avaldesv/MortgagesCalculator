/**
 * Registra un cambio o bugfix en Linear (comentario + opcional actualización de descripción).
 * Usage:
 *   LINEAR_API_KEY=... node scripts/linear-log-change.mjs AVV-32 "Admin: await async en list placements" b64bd15
 *   node scripts/linear-log-change.mjs AVV-30,AVV-32 "descripción" b64bd15
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

async function findIssue(identifier, teamId) {
  const number = Number(identifier.split('-')[1]);
  const data = await gql(
    `query($teamId: ID!, $number: Float!) {
      issues(filter: { team: { id: { eq: $teamId } }, number: { eq: $number } }, first: 1) {
        nodes { id identifier title description }
      }
    }`,
    { teamId, number },
  );
  return data.issues.nodes[0];
}

async function addComment(issueId, body) {
  return gql(
    `mutation($input: CommentCreateInput!) {
      commentCreate(input: $input) { success comment { id } }
    }`,
    { input: { issueId, body } },
  );
}

function appendChangelog(description, entry) {
  const marker = '## Registro de cambios';
  const block = `${entry}\n`;
  if (!description?.includes(marker)) {
    return `${description ?? ''}\n\n${marker}\n\n${block}`.trim();
  }
  return description.replace(marker, `${marker}\n\n${block}`);
}

async function updateDescription(issueId, description) {
  return gql(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) { success }
    }`,
    { id: issueId, input: { description } },
  );
}

async function main() {
  if (!process.env.LINEAR_API_KEY) {
    console.error('Set LINEAR_API_KEY');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      'Usage: node scripts/linear-log-change.mjs AVV-32,AVV-30 "Descripción del cambio" [commit-hash]',
    );
    process.exit(1);
  }

  const ids = args[0].split(',').map((s) => s.trim());
  const message = args[1];
  const commit = args[2] ?? 'main';
  const date = new Date().toISOString().slice(0, 10);
  const entry = `- **${date}** — ${message}${commit ? ` (\`${commit}\`)` : ''}`;

  const teams = await gql(`query { teams { nodes { id } } }`);
  const teamId = teams.teams.nodes[0].id;

  const commentBody = `**Cambio en repo** (${date})\n\n${message}\n\n${commit ? `Commit: \`${commit}\`` : ''}`;

  for (const id of ids) {
    const issue = await findIssue(id, teamId);
    if (!issue) {
      console.warn(`Skip ${id}: not found`);
      continue;
    }
    await addComment(issue.id, commentBody);
    const newDesc = appendChangelog(issue.description, entry);
    await updateDescription(issue.id, newDesc);
    console.log(`Logged: ${issue.identifier} — ${issue.title}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

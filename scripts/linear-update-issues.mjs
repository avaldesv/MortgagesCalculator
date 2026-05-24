/**
 * Update Linear issue states by identifier (AVV-20, etc.)
 * Usage: LINEAR_API_KEY=... node scripts/linear-update-issues.mjs
 *        node scripts/linear-update-issues.mjs --in-progress AVV-35
 *        node scripts/linear-update-issues.mjs --done AVV-20,AVV-21
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

async function getTeamAndStates() {
  const data = await gql(`query {
    teams { nodes { id key } }
    workflowStates { nodes { id name type team { id } } }
  }`);
  const team = data.teams.nodes[0];
  const states = data.workflowStates.nodes.filter((s) => s.team?.id === team.id);
  const done = states.find((s) => s.type === 'completed');
  const started = states.find((s) => s.type === 'started' || s.name === 'In Progress');
  const backlog = states.find((s) => s.type === 'unstarted' || s.name === 'Backlog');
  return { teamId: team.id, doneId: done?.id, startedId: started?.id, backlogId: backlog?.id };
}

async function findIssueByIdentifier(identifier, teamId) {
  const m = identifier.match(/^([A-Z]+)-(\d+)$/i);
  if (!m) throw new Error(`Invalid identifier: ${identifier}`);
  const number = Number(m[2]);
  const data = await gql(
    `query($teamId: ID!, $number: Float!) {
      issues(filter: { team: { id: { eq: $teamId } }, number: { eq: $number } }, first: 1) {
        nodes { id identifier title state { id name } }
      }
    }`,
    { teamId, number },
  );
  return data.issues.nodes[0];
}

async function updateIssue(issueId, stateId) {
  return gql(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue { identifier title state { name } }
      }
    }`,
    { id: issueId, input: { stateId } },
  );
}

async function main() {
  if (!API_KEY) {
    console.error('Set LINEAR_API_KEY');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const doneIdx = args.indexOf('--done');
  const progIdx = args.indexOf('--in-progress');
  const backlogIdx = args.indexOf('--backlog');

  const { teamId, doneId, startedId, backlogId } = await getTeamAndStates();
  if (!doneId || !startedId) throw new Error('Workflow states not found');

  if (doneIdx < 0 && progIdx < 0 && backlogIdx < 0) {
    console.error('Pass --done ID,... and/or --in-progress ID,... and/or --backlog ID,...');
    console.error('Never run without args (avoids marking entire P0-A Done by mistake).');
    process.exit(1);
  }

  const toDone = doneIdx >= 0 ? args[doneIdx + 1].split(',').map((s) => s.trim()) : [];
  const toProgress = progIdx >= 0 ? args[progIdx + 1].split(',').map((s) => s.trim()) : [];
  const toBacklog = backlogIdx >= 0 ? args[backlogIdx + 1].split(',').map((s) => s.trim()) : [];

  for (const id of toDone) {
    const issue = await findIssueByIdentifier(id, teamId);
    if (!issue) {
      console.warn(`Skip ${id}: not found`);
      continue;
    }
    const r = await updateIssue(issue.id, doneId);
    console.log(`Done: ${r.issueUpdate.issue.identifier} — ${r.issueUpdate.issue.title}`);
  }

  for (const id of toProgress) {
    const issue = await findIssueByIdentifier(id, teamId);
    if (!issue) {
      console.warn(`Skip ${id}: not found`);
      continue;
    }
    const r = await updateIssue(issue.id, startedId);
    console.log(`In Progress: ${r.issueUpdate.issue.identifier} — ${r.issueUpdate.issue.title}`);
  }

  for (const id of toBacklog) {
    const issue = await findIssueByIdentifier(id, teamId);
    if (!issue) {
      console.warn(`Skip ${id}: not found`);
      continue;
    }
    const stateId = backlogId ?? startedId;
    const r = await updateIssue(issue.id, stateId);
    console.log(`Backlog: ${r.issueUpdate.issue.identifier} — ${r.issueUpdate.issue.title}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

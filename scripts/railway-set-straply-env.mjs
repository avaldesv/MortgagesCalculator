/**
 * Set STRAPLY_API_KEY on Railway backend service (requires `railway login` + linked project).
 * Reads key from backend/.env.local (never commit that file).
 *
 * Usage (from repo root):
 *   node scripts/railway-set-straply-env.mjs
 *   node scripts/railway-set-straply-env.mjs --service backend
 */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { spawnSync } from 'child_process';

const service = process.argv.includes('--service')
  ? process.argv[process.argv.indexOf('--service') + 1]
  : 'backend';

const envPath = resolve(process.cwd(), 'backend', '.env.local');
if (!existsSync(envPath)) {
  console.error('Missing backend/.env.local with STRAPLY_API_KEY');
  process.exit(1);
}

let apiKey = '';
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq < 0) continue;
  if (t.slice(0, eq).trim() === 'STRAPLY_API_KEY') {
    apiKey = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
}
if (!apiKey) {
  console.error('STRAPLY_API_KEY not found in backend/.env.local');
  process.exit(1);
}

const cli = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = ['@railway/cli', 'variables', 'set', `STRAPLY_API_KEY=${apiKey}`, '--service', service];
const r = spawnSync(cli, args, { stdio: 'inherit', shell: process.platform === 'win32' });
if (r.status !== 0) {
  console.error('\nIf unauthorized: run `npx @railway/cli login` and `npx @railway/cli link` in this repo.');
  process.exit(r.status ?? 1);
}
console.log(`Set STRAPLY_API_KEY on service "${service}" (value not printed).`);

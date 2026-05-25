/**
 * Verifica requisitos P0-A / P0-B / producción antes de cerrar Linear.
 * Usage: node scripts/verify-requirements.mjs
 */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const WEB = process.env.WEB_URL ?? 'https://mortgagescalculator-production.up.railway.app';
const API = process.env.API_URL ?? 'https://backend-production-dbaf7.up.railway.app';

const results = [];

function pass(id, msg) {
  results.push({ id, ok: true, msg });
}
function fail(id, msg) {
  results.push({ id, ok: false, msg });
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  const ct = res.headers.get('content-type') ?? '';
  let body;
  if (ct.includes('json')) body = await res.json();
  else body = await res.text();
  return { res, body, ct };
}

// --- Repo / archivos ---
const root = process.cwd();
const mustExist = [
  'docs/decisions/GATE-0-branding.md',
  'docs/api/openapi-v0.1.yaml',
  'docs/api/GATE-1-signoff.md',
  'docs/compliance.md',
  '.github/workflows/ci.yml',
  'backend/src/main.ts',
  'backend/prisma/schema.prisma',
  'src/app/core/services/calculator-state.service.ts',
  'src/app/features/advanced-calculator/advanced-calculator.component.ts',
  'src/app/features/affordability-calculator/affordability-calculator.component.ts',
  'src/app/features/compare-scenarios/compare-scenarios.component.ts',
  'src/app/features/learning-center/learning-center.component.ts',
  'src/app/features/partners/partners.component.ts',
  'nginx/templates/default.conf.template',
];
for (const p of mustExist) {
  existsSync(resolve(root, p)) ? pass('FILE', p) : fail('FILE', `Missing ${p}`);
}

const articles = JSON.parse(readFileSync(resolve(root, 'src/app/data/learning-articles.json'), 'utf8'));
articles.length >= 10 ? pass('P0-B-44', `${articles.length} learning articles`) : fail('P0-B-44', `Only ${articles.length} articles`);

const routes = readFileSync(resolve(root, 'src/app/app.routes.ts'), 'utf8');
const tabs = [
  'simple-calculator',
  'advanced-calculator',
  'affordability',
  'compare-scenarios',
  'homes-by-payment',
  'learning-center',
  'partners',
];
for (const t of tabs) {
  routes.includes(`'${t}'`) || routes.includes(`"/${t}"`)
    ? pass('ROUTE', t)
    : fail('ROUTE', `Missing route ${t}`);
}
routes.includes('PlaceholderPageComponent') && !routes.match(/path:\s*'(advanced|affordability|compare|learning|partners)'/)
  ? pass('ROUTE', 'No placeholder on main tabs')
  : routes.includes('PlaceholderPageComponent')
    ? fail('ROUTE', 'Placeholder still used for a main tab')
    : pass('ROUTE', 'Placeholders removed from main tabs');

// --- Producción API directa ---
try {
  const { res, body } = await fetchJson(`${API}/api/health`);
  res.ok && body?.status === 'ok' ? pass('AVV-28/34', 'API health direct') : fail('AVV-28/34', 'API health direct');
} catch (e) {
  fail('AVV-28/34', `API health: ${e.message}`);
}

try {
  const { res, body } = await fetchJson(`${API}/api/v1/listings?sponsored=true&pageSize=10`);
  res.ok && Array.isArray(body?.data) && body.data.length >= 1
    ? pass('AVV-30', `API listings (${body.data.length})`)
    : fail('AVV-30', 'API listings empty/fail');
} catch (e) {
  fail('AVV-30', e.message);
}

try {
  const { res, body } = await fetchJson(`${API}/api/v1/ad-placements/active?tab=simple-calculator`);
  res.ok && body?.placements !== undefined ? pass('AVV-30/31', 'Placements active') : fail('AVV-30/31', 'Placements');
} catch (e) {
  fail('AVV-30/31', e.message);
}

// --- Producción Web proxy + SPA ---
try {
  const { res, body } = await fetchJson(`${WEB}/api/health`);
  res.ok && body?.status === 'ok'
    ? pass('AVV-34', 'Web /api/health proxy JSON')
    : fail('AVV-34', 'Web /api/health not JSON');
} catch (e) {
  fail('AVV-34', e.message);
}

try {
  const { res, body } = await fetchJson(`${WEB}/api/v1/listings?sponsored=true&pageSize=5`);
  res.ok && body?.data?.length >= 1
    ? pass('AVV-42', `Web proxy listings (${body.data.length})`)
    : fail('AVV-42', 'Web proxy listings');
} catch (e) {
  fail('AVV-42', e.message);
}

for (const path of [...tabs.map((t) => `/${t}`), '/admin/login']) {
  try {
    const res = await fetch(`${WEB}${path}`);
    res.ok ? pass('TAB-200', path) : fail('TAB-200', `${path} → ${res.status}`);
  } catch (e) {
    fail('TAB-200', `${path}: ${e.message}`);
  }
}

// CORS
try {
  const res = await fetch(`${API}/api/health`, { headers: { Origin: WEB } });
  const acao = res.headers.get('access-control-allow-origin');
  acao === WEB || acao === '*'
    ? pass('CORS', `allow-origin=${acao}`)
    : fail('CORS', `Expected ${WEB}, got ${acao}`);
} catch (e) {
  fail('CORS', e.message);
}

// Partner lead
try {
  const { res, body } = await fetchJson(`${WEB}/api/v1/leads/partner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: WEB },
    body: JSON.stringify({
      name: 'Verify Bot',
      company: 'QA',
      email: 'verify@test.mortgagecalc.app',
      phone: '+1-555-0199',
      serviceType: 'other',
      targetRegion: 'FL',
      consentContact: true,
    }),
  });
  res.status === 201 && body?.id ? pass('AVV-45', `Partner lead ${body.id}`) : fail('AVV-45', `Lead ${res.status}`);
} catch (e) {
  fail('AVV-45', e.message);
}

// Admin auth (default creds — production should rotate; test login works)
try {
  const { res, body } = await fetchJson(`${WEB}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@mortgagecalc.app', password: 'changeme123' }),
  });
  res.ok && body?.accessToken ? pass('AVV-29/32', 'Admin login') : fail('AVV-29/32', 'Admin login failed');
  if (body?.accessToken) {
    const { res: r2, body: b2 } = await fetchJson(`${WEB}/api/v1/admin/listings?pageSize=5`, {
      headers: { Authorization: `Bearer ${body.accessToken}` },
    });
    r2.ok && b2?.data ? pass('AVV-32', 'Admin listings JWT') : fail('AVV-32', 'Admin listings JWT');
  }
} catch (e) {
  fail('AVV-29/32', e.message);
}

// OpenAPI server URL
const oas = readFileSync(resolve(root, 'docs/api/openapi-v0.1.yaml'), 'utf8');
oas.includes('backend-production-dbaf7.up.railway.app')
  ? pass('AVV-21', 'OpenAPI production server URL')
  : fail('AVV-21', 'OpenAPI servers[0] not updated');

const compliance = readFileSync(resolve(root, 'docs/compliance.md'), 'utf8');
const simpleHtml = readFileSync(resolve(root, 'src/app/features/simple-calculator/simple-calculator.component.html'), 'utf8');
compliance.length > 100 && (simpleHtml.includes('Estimates only') || simpleHtml.includes('estimate'))
  ? pass('AVV-26', 'compliance.md + UI disclaimer')
  : fail('AVV-26', 'Compliance copy');

// Summary
const ok = results.filter((r) => r.ok);
const bad = results.filter((r) => !r.ok);
console.log('\n=== VERIFICACIÓN REQUISITOS ===\n');
for (const r of results) console.log(r.ok ? '✅' : '❌', r.id, '-', r.msg);
console.log(`\n${ok.length}/${results.length} passed`);
if (bad.length) {
  console.log('\nPENDIENTES:');
  bad.forEach((r) => console.log(' -', r.msg));
  process.exit(1);
}

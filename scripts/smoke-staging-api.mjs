/**
 * Smoke test against deployed API (staging or prod).
 * Usage: API_URL=https://xxx.up.railway.app node scripts/smoke-staging-api.mjs
 */
const base = (process.env.API_URL ?? process.argv[2] ?? '').replace(/\/$/, '');
if (!base) {
  console.error('Set API_URL or pass URL as argv[2]');
  process.exit(1);
}

async function req(path, options = {}) {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

async function main() {
  console.log('Smoke:', base);

  const health = await req('/api/health');
  if (health.status !== 200 || health.body?.status !== 'ok') {
    console.error('FAIL health', health);
    process.exit(1);
  }
  console.log('OK health persistence=', health.body.persistence);

  const listings = await req('/api/v1/listings?sponsored=true&pageSize=5');
  if (listings.status !== 200) {
    console.error('FAIL listings', listings);
    process.exit(1);
  }
  const count = listings.body?.data?.length ?? 0;
  console.log('OK listings count=', count);

  const lead = await req('/api/v1/leads/partner', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke Test',
      company: 'MortgageCalc QA',
      email: 'smoke@test.mortgagecalc.app',
      phone: '+1-555-0100',
      serviceType: 'other',
      targetRegion: 'Orlando, FL',
      consentContact: true,
      message: 'Automated smoke test',
    }),
  });
  if (lead.status !== 201) {
    console.error('FAIL partner lead', lead);
    process.exit(1);
  }
  console.log('OK partner lead id=', lead.body?.id);

  console.log('\nAll smoke checks passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

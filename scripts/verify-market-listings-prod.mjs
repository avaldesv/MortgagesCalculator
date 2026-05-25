/**
 * Smoke US market listings on production API + web proxy.
 * Usage: node scripts/verify-market-listings-prod.mjs
 */
const API = process.env.API_URL ?? 'https://backend-production-dbaf7.up.railway.app';
const WEB = process.env.WEB_URL ?? 'https://mortgagescalculator-production.up.railway.app';

async function get(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

async function main() {
  let ok = true;

  const health = await get(`${API}/api/health`);
  console.log('API health', health.status, health.json?.status ?? health.json);

  const direct = await fetch(`${API}/api/v1/market-listings?tab=simple-calculator`, {
    headers: {
      Accept: 'application/json',
      'X-Forwarded-For': '8.8.8.8',
    },
  }).then(async (res) => {
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text.slice(0, 200) };
    }
    return { status: res.status, json };
  });
  console.log('API market-listings (direct)', direct.status, {
    source: direct.json?.meta?.source,
    enabled: direct.json?.meta?.enabled,
    count: direct.json?.data?.length ?? 0,
    zipCode: direct.json?.meta?.zipCode,
    locationSource: direct.json?.meta?.locationSource,
    message: direct.json?.meta?.message,
  });
  if (direct.status === 404) {
    console.error('FAIL: endpoint missing — redeploy backend from latest main');
    ok = false;
  } else if (direct.json?.meta?.source === 'unconfigured') {
    console.error('FAIL: STRAPLY_API_KEY not set on Railway API service');
    ok = false;
  } else if ((direct.json?.data?.length ?? 0) < 1) {
    console.error('FAIL: no for-sale listings returned', direct.json?.meta);
    ok = false;
  }

  const proxy = await get(`${WEB}/api/v1/market-listings?tab=simple-calculator`);
  console.log('WEB proxy market-listings', proxy.status, {
    source: proxy.json?.meta?.source,
    count: proxy.json?.data?.length ?? 0,
  });
  if (proxy.status !== 200 || (proxy.json?.data?.length ?? 0) < 1) ok = false;

  if (ok) {
    console.log('\nOK: market listings ready in production');
    process.exit(0);
  }
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

const web = process.env.WEB_URL ?? 'https://mortgagescalculator-production.up.railway.app';
const api = process.env.API_URL ?? 'https://backend-production-dbaf7.up.railway.app';

const html = await fetch(web).then((r) => r.text());
const main = html.match(/main-[A-Z0-9]+\.js/)?.[0];
console.log('Web:', web);
console.log('Main chunk:', main ?? 'not found');

if (main) {
  const js = await fetch(`${web}/${main}`).then((r) => r.text());
  console.log('Bundle has backend-production URL:', js.includes('backend-production-dbaf7'));
  console.log('Bundle has empty apiBaseUrl:', /apiBaseUrl:""/.test(js));
}

const list = await fetch(`${api}/api/v1/listings?sponsored=true&pageSize=1`);
console.log('API listings:', list.status, (await list.json()).data?.length ?? 'fail');

const viaWeb = await fetch(`${web}/api/health`);
const viaText = await viaWeb.text();
console.log('Web /api/health:', viaWeb.status, viaText.startsWith('{') ? 'JSON OK' : 'HTML (no proxy)');

const cors = await fetch(`${api}/api/health`, { headers: { Origin: web } });
console.log('CORS header:', cors.headers.get('access-control-allow-origin'));

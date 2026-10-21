#!/usr/bin/env node
// Structural checks against the built site in _site/.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..', '_site');
const failures = [];
const fail = (m) => failures.push(m);

if (!existsSync(SITE)) {
  console.error('check-page: _site/ does not exist, run eleventy first');
  process.exit(1);
}
const read = (p) => readFileSync(join(SITE, p), 'utf8');

const pages = { 'index.html': '/', 'map/index.html': '/map/', 'loop/index.html': '/loop/', 'agents/index.html': '/agents/' };
for (const [file, path] of Object.entries(pages)) {
  if (!existsSync(join(SITE, file))) { fail(`missing page: ${file}`); continue; }
  const h = read(file);
  if (!/<title>[^<]+<\/title>/.test(h)) fail(`${file}: no title`);
  if (!/<meta name="description" content="[^"]+"/.test(h)) fail(`${file}: no description`);
  if (!/property="og:image" content="https:\/\/[^"]+"/.test(h)) fail(`${file}: no absolute og:image`);
  if (!h.includes(`<link rel="canonical" href="https://xtremevibing.com${path}">`)) fail(`${file}: bad canonical`);
  const nav = (h.match(/<nav aria-label="Primary">[\s\S]*?<\/nav>/) || [''])[0];
  const want = Object.keys(pages).length;
  if ((nav.match(/<a /g) || []).length !== want) fail(`${file}: nav should have ${want} links`);
  if (!nav.includes(`href="${path}" aria-current="page"`)) fail(`${file}: current page not marked in nav`);
  if (!/Updated \d{4}-\d{2}-\d{2}/.test(h)) fail(`${file}: no Updated date`);
}
if (existsSync(join(SITE, 'loop/index.html')) && !read('loop/index.html').includes('class="mermaid"')) {
  fail('loop/index.html: no class="mermaid" block');
}
for (const f of ['404.html', 'robots.txt', 'favicon.svg', 'og.png']) {
  if (!existsSync(join(SITE, f))) fail(`missing built file: ${f}`);
}

if (failures.length) {
  console.error(`check-page: ${failures.length} failure(s)\n`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('check-page: all assertions passed');

// Generates static/og.png (1200x630) with Playwright's Chromium.
// Defaults match the xtreme-vibing PDF builder; override with CHROME_PATH / NODE_PATH.
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const nodeModules = process.env.NODE_PATH ||
  join(homedir(), '.local/share/mise/installs/npm-playwright/latest/node_modules');
const require = createRequire(join(nodeModules, 'x.js'));
const { chromium } = require('playwright');
const chrome = process.env.CHROME_PATH ||
  join(homedir(), '.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell');

const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;width:1200px;height:630px;background:#fbfaf6;color:#1a1a1a;font-family:Georgia,"Liberation Serif",serif;
       display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box;border-left:18px solid #1d4f7a}
  h1{font-size:112px;margin:0 0 28px;letter-spacing:-2px}
  p{font-size:38px;line-height:1.35;margin:0;max-width:960px;color:#333}
  small{position:absolute;left:108px;bottom:50px;font-size:28px;color:#5a5a5a;font-family:ui-monospace,monospace}
</style><h1>Xtreme Vibing</h1>
<p>Notes on carrying Extreme Programming into software that agents write and people are responsible for.</p>
<small>xtremevibing.com</small>`;

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'static', 'og.png');
const b = await chromium.launch({ executablePath: chrome });
const pg = await b.newPage({ viewport: { width: 1200, height: 630 } });
await pg.setContent(html);
await pg.screenshot({ path: out });
await b.close();
console.log('wrote', out);

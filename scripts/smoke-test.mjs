import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const html = readFileSync('index.html', 'utf8');
const manifest = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const refs = new Set([...html.matchAll(/\$\('([^']+)'\)/g)].map(m => m[1]));
const missing = [...refs].filter(id => !ids.has(id));
assert.equal(missing.length, 0, 'Missing DOM IDs: ' + missing.join(', '));

const start = html.indexOf('<script>');
const end = html.lastIndexOf('</script>');
assert(start >= 0 && end > start, 'Inline application script not found');
new Function(html.slice(start + 8, end));

assert.equal(manifest.name, 'KeepLite — блокнот Mirror- Studio');
assert(manifest.start_url && manifest.scope, 'PWA start_url and scope are required');
assert(html.includes('Переименовать папку'), 'Folder rename action is required');
assert(html.includes('Заметки останутся без папки'), 'Folder deletion must preserve notes');
assert(html.includes('Есть несохранённые изменения'), 'Unsaved editor changes must be protected');
assert(html.includes("slice(0,1000000)"), 'Imported note bodies must be bounded');
assert(html.includes('name="viewport"'), 'Responsive viewport meta is required');
assert(!/<script[^>]+src=["']https?:\/\//i.test(html), 'External scripts are not allowed in the app shell');
readFileSync('sw.js', 'utf8');
readFileSync('icon.svg', 'utf8');
const poster = readFileSync('assets/keeplite-poster.svg', 'utf8');
assert(poster.includes('<svg') && poster.includes('KeepLite'), 'Launch poster must be present');
assert(html.includes('welcomeTitle') && html.includes('keeplite-poster.svg'), 'Landing hero must include the product poster');
console.log('KeepLite smoke checks passed.');

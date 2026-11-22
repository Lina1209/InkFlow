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
assert(html.includes('name="viewport"'), 'Responsive viewport meta is required');
assert(!/<script[^>]+src=["']https?:\/\//i.test(html), 'External scripts are not allowed in the app shell');
readFileSync('sw.js', 'utf8');
readFileSync('icon.svg', 'utf8');
console.log('KeepLite smoke checks passed.');

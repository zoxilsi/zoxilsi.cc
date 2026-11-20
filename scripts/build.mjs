import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
const files = ['index.html', 'work.html', 'about.html', 'contact.html', 'styles.css', 'app.js', 'content.js', 'visitor-counter.js', 'assets'];

for (const file of files) await stat(new URL(file, root));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files) await cp(new URL(file, root), new URL(file, output), { recursive: true });
console.log(`Built static portfolio → ${fileURLToPath(output)}`);

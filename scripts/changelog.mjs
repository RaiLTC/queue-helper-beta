#!/usr/bin/env node
/**
 * CHANGELOG.md is the one changelog: this turns it into src/generated/changelog.ts, which the What's new page
 * reads. Runs before every build (npm run build). No dependencies, no network.
 *
 * Expected format (Keep a Changelog): "## [version] - date", then "### Added|Changed|Fixed|...", then "- item" lines.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const text = await readFile(resolve(root, 'CHANGELOG.md'), 'utf8');

const releases = [];
let release = null, section = null;
for (const raw of text.split(/\r?\n/)) {
	const line = raw.trim();
	const head = line.match(/^## \[([^\]]+)\](?:\s*-\s*(.+))?$/);
	if (head) { release = { version: head[1], date: head[2] ?? '', sections: [] }; releases.push(release); section = null; continue; }
	const kind = line.match(/^### (.+)$/);
	if (kind && release) { section = { kind: kind[1], items: [] }; release.sections.push(section); continue; }
	const item = line.match(/^- (.+)$/);
	if (item && section) section.items.push(item[1].replace(/\*\*|`/g, ''));
}
if (!releases.length) throw new Error('CHANGELOG.md has no "## [version] - date" entries');

const out = resolve(root, 'src/generated/changelog.ts');
await mkdir(dirname(out), { recursive: true });
await writeFile(out, `// Generated from CHANGELOG.md by scripts/changelog.mjs: edit the changelog, not this file.\n\nexport type Release = { version: string, date: string, sections: { kind: string, items: string[] }[] };\n\nexport const RELEASES: Release[] = ${JSON.stringify(releases, null, '\t')};\n`);
console.log(`changelog: ${releases.length} releases`);

// Publishes ONE approved draft per run: translate to PT-BR (claude -p), keep the English
// original below it, flip draft:false, copy into content/blog, commit and push.
// Queue = FrankMD notes with `draft: true` + `approved: true`, oldest `date` first.
//   node scripts/publish-next.mjs --dry-run    # show what would go out
//   node scripts/publish-next.mjs --preview    # translate and print, write nothing
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import matter from 'gray-matter';

dotenv.config();
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEST_DIR = path.join(ROOT, 'content', 'blog');
const NOTES = path.resolve((process.env.NOTES_PATH || '').replace(/^~/, process.env.HOME || ''));
const DRY = process.argv.includes('--dry-run');
const PREVIEW = process.argv.includes('--preview');

const PROMPT = `You translate a personal blog post from English to Brazilian Portuguese.
The author is a Brazilian digital nomad writing in his own voice, dictated while walking.
Rules:
- Natural PT-BR, not literal. Same meaning, same tone, same rhythm. Keep his repetitions ("insane things, insane things"), swearing, asides, and plain words. Never upgrade a word to a "better" synonym.
- Grammar-check the Portuguese.
- No em dashes (—). Use periods or commas.
- Do not add, remove, summarize or reorder anything. Do not add a conclusion.
- Keep markdown as is (paragraphs, *italics*, **bold**). Book titles stay in the original.
Output format, nothing else:
line 1: TITLE: <Portuguese title>
line 2: empty
then: the translated body in markdown, WITHOUT a leading "# " heading.

ENGLISH POST:
`;

function findNotes(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findNotes(p));
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function queue() {
  return findNotes(NOTES)
    .map((file) => ({ file, ...matter(fs.readFileSync(file, 'utf-8')) }))
    .filter(({ data }) => data.draft === true && data.approved === true && data.title && data.slug)
    .sort((a, b) => new Date(a.data.date) - new Date(b.data.date));
}

function translate(englishBody) {
  const out = execFileSync('claude', ['-p', PROMPT + englishBody, '--output-format', 'text'], {
    encoding: 'utf-8',
    maxBuffer: 1 << 20,
  }).trim();
  const m = out.match(/^TITLE:\s*(.+?)\s*\n\s*\n([\s\S]+)$/);
  if (!m) throw new Error(`unexpected claude output:\n${out.slice(0, 400)}`);
  return { title: m[1].trim(), body: m[2].trim() };
}

function stripH1(body) {
  return body.replace(/^\s*#\s+.+\n+/, '').trim();
}

function main() {
  if (!fs.existsSync(NOTES)) throw new Error(`NOTES_PATH not found: ${NOTES}`);
  const q = queue();
  console.log(`${q.length} approved draft(s) in queue`);
  if (!q.length) return;
  const next = q[0];
  console.log(`next: ${path.relative(NOTES, next.file)}`);
  if (DRY) return;

  const english = stripH1(next.content);
  const pt = translate(english);
  const body = `# ${pt.title}\n\n${pt.body}\n\n---\n\n## English version\n\n**${next.data.title}**\n\n${english}\n`;
  if (PREVIEW) return console.log(`\n${body}`);

  const data = { ...next.data, title: pt.title, title_en: next.data.title, date: new Date().toISOString(), draft: false };
  const md = matter.stringify(body, data);
  fs.writeFileSync(next.file, md);

  const rel = path.relative(NOTES, next.file);
  const dest = path.join(DEST_DIR, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, md);

  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf-8' });
  git(ROOT, 'add', dest);
  git(ROOT, 'commit', '-m', `post: ${next.data.slug}`);
  git(ROOT, 'push');
  // the note itself lives in the brain repo (source of truth): record the publish there too
  git(NOTES, 'add', next.file);
  git(NOTES, 'commit', '-m', `blog: published ${next.data.slug}`);
  git(NOTES, 'push');
  console.log(`published ${next.data.slug} (${pt.title})`);
}

main();

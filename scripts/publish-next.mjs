// Note contract (source of truth: ~/www/brain/blog/YYYY/MM/DD/<slug>/index.md):
//   frontmatter: title (EN), slug (= folder name, EN), date (dictation date), draft, tags, review?
//   body:  # <EN title>  → EN text  → "## Português" **<PT title>** PT text  → optional "## Español" ...
// This script never rewrites a note. It only appends the "## Português" section when missing.
// Queue = notes with draft:false that are not yet in content/blog, oldest date first. One per run.
//   --dry-run            show the queue
//   --preview            translate the next one and print, write nothing
//   --translate <file>   append the PT section to one note (no publish)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import matter from 'gray-matter';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env') }); // not cwd: runs the same from anywhere
const DEST_DIR = path.join(ROOT, 'content', 'blog');
const NOTES = path.resolve((process.env.NOTES_PATH || '').replace(/^~/, process.env.HOME || ''));
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const PT = '## Português';
const ES = '## Español';

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
    else if (e.name === 'index.md') out.push(p);
  }
  return out;
}

// Split a note into its verbatim frontmatter block and body, so we can write it back untouched.
function readNote(file) {
  const raw = fs.readFileSync(file, 'utf-8');
  const m = raw.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/);
  if (!m) throw new Error(`no frontmatter: ${file}`);
  return { file, fm: m[1], body: m[2], data: matter(raw).data };
}

function englishSection(body) {
  const cut = body.search(new RegExp(`^(${PT}|${ES})\\s*$`, 'm'));
  const en = (cut === -1 ? body : body.slice(0, cut)).trim();
  return en.replace(/^#\s+.+\n+/, '').trim();
}

function translate(englishBody) {
  const out = execFileSync('claude', ['-p', PROMPT + englishBody, '--output-format', 'text'], {
    encoding: 'utf-8',
    maxBuffer: 1 << 20,
  }).trim();
  const m = out.match(/^TITLE:\s*(.+?)\s*\n\s*\n([\s\S]+)$/);
  if (!m) throw new Error(`unexpected claude output:\n${out.slice(0, 400)}`);
  return { title: m[1].trim(), body: m[2].trim().replace(/—/g, ',') };
}

// Insert "## Português" right after the English section (before "## Español" if present).
function withPortuguese(body, pt) {
  const section = `${PT}\n\n**${pt.title}**\n\n${pt.body}\n`;
  const es = body.search(new RegExp(`^${ES}\\s*$`, 'm'));
  if (es === -1) return `${body.trimEnd()}\n\n${section}`;
  return `${body.slice(0, es).trimEnd()}\n\n${section}\n${body.slice(es)}`;
}

function ensurePortuguese(note, { write = true } = {}) {
  if (new RegExp(`^${PT}\\s*$`, 'm').test(note.body)) return note.body;
  const body = withPortuguese(note.body, translate(englishSection(note.body)));
  if (write) fs.writeFileSync(note.file, note.fm + body);
  return body;
}

function published() {
  const slugs = new Set();
  for (const f of fs.existsSync(DEST_DIR) ? findNotes(DEST_DIR) : []) slugs.add(matter(fs.readFileSync(f, 'utf-8')).data.slug);
  return slugs;
}

function queue() {
  const done = published();
  return findNotes(NOTES)
    .map(readNote)
    .filter(({ data }) => data.draft === false && data.title && data.slug && !done.has(data.slug))
    .sort((a, b) => new Date(a.data.date) - new Date(b.data.date));
}

function main() {
  if (!fs.existsSync(NOTES)) throw new Error(`NOTES_PATH not found: ${NOTES}`);
  const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf-8' });

  if (flag('--translate')) {
    const file = path.resolve(args[args.indexOf('--translate') + 1]);
    ensurePortuguese(readNote(file));
    return console.log(`translated ${path.relative(NOTES, file)}`);
  }

  const q = queue();
  console.log(`${q.length} note(s) ready (draft: false, not yet published)`);
  if (!q.length) return;
  const next = q[0];
  console.log(`next: ${path.relative(NOTES, next.file)}`);
  if (flag('--dry-run')) return;
  if (flag('--preview')) return console.log(`\n${ensurePortuguese(next, { write: false })}`);

  // Idempotent: flush a post whose push failed last run, then publish at most one post per day.
  git(ROOT, 'push');
  if (git(ROOT, 'log', '--since=midnight', '--grep=^post: ', '--format=%h').trim())
    return console.log('already published today, nothing to do');

  const body = ensurePortuguese(next);
  const rel = path.relative(NOTES, next.file);
  const dest = path.join(DEST_DIR, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, next.fm + body);

  git(ROOT, 'add', dest);
  git(ROOT, 'commit', '-m', `post: ${next.data.slug}`);
  git(ROOT, 'push');
  git(NOTES, 'add', next.file);
  if (git(NOTES, 'status', '--porcelain', next.file).trim()) {
    git(NOTES, 'commit', '-m', `blog: published ${next.data.slug}`);
    git(NOTES, 'push');
  }
  console.log(`published ${next.data.slug}`);
}

main();

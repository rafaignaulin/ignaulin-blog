import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import YAML from 'yaml';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEST_DIR = path.resolve(__dirname, '..', 'content', 'blog');

// Arquivos/pastas do FrankMD que não são posts
const IGNORED = new Set(['.fed', '.hugo_template.md', '.gitkeep']);

function resolveNotesPath() {
  const notesPath = process.env.NOTES_PATH;
  if (!notesPath) {
    console.error('NOTES_PATH não definido. Copie .env.example para .env e configure.');
    process.exit(1);
  }
  return path.resolve(notesPath.replace(/^~/, process.env.HOME || ''));
}

function findMarkdownFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (IGNORED.has(entry.name) || entry.name.startsWith('.')) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, base));
    } else if (entry.name.endsWith('.md')) {
      files.push({ fullPath, relativePath: path.relative(base, fullPath) });
    }
  }

  return files;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return null;
  return YAML.parse(match[1]) || {};
}

function main() {
  const notesPath = resolveNotesPath();
  if (!fs.existsSync(notesPath)) {
    console.error(`NOTES_PATH não encontrado: ${notesPath}`);
    process.exit(1);
  }

  const files = findMarkdownFiles(notesPath);
  let synced = 0;
  let skipped = 0;

  for (const { fullPath, relativePath } of files) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const frontmatter = parseFrontmatter(content);

    if (!frontmatter || !frontmatter.title || !frontmatter.slug) {
      skipped++;
      continue;
    }

    if (frontmatter.draft) {
      skipped++;
      continue;
    }

    const destPath = path.join(DEST_DIR, relativePath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(fullPath, destPath);
    console.log(`Sincronizado: ${relativePath}`);
    synced++;
  }

  console.log(`\n${synced} post(s) sincronizado(s), ${skipped} ignorado(s) (draft ou sem frontmatter).`);
  console.log('Revise as mudanças e faça git commit + push para publicar.');
}

main();

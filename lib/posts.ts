import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string(),
  slug: z.string(),
  date: z.coerce.date(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
  image: z.string().optional(),
});

export type Post = z.infer<typeof PostSchema> & { contentHtml: string };

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

function getMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function parsePost(filePath: string): (Post & { contentHtml: string }) | null {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const parsed = PostSchema.safeParse(data);
  if (!parsed.success || parsed.data.draft) return null;
  return { ...parsed.data, contentHtml: content };
}

export async function getAllPosts(): Promise<Post[]> {
  const files = getMarkdownFiles(BLOG_DIR);
  const posts = files.map(parsePost).filter((p): p is Post => p !== null);
  posts.sort((a, b) => b.date.valueOf() - a.date.valueOf());
  return posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;

  const rendered = await remark().use(html, { sanitize: false }).process(post.contentHtml);
  return { ...post, contentHtml: rendered.toString() };
}

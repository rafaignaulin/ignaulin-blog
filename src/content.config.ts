import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Posts são sincronizados do FrankMD (notas em formato Hugo) via
// `npm run sync` — ver scripts/sync-notes.mjs. O frontmatter segue
// o template padrão do FrankMD (HugoService::DEFAULT_TEMPLATE).
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };

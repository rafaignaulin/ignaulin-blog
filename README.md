# ignaulin-blog

Blog estático ([Astro](https://astro.build)) publicado em `blog.ignaulin.com` via Vercel.

O conteúdo é escrito e editado no [FrankMD](https://github.com/akitaonrails/FrankMD) (rodando localmente) e sincronizado para cá antes de cada publicação.

## Setup

```bash
npm install
cp .env.example .env
# edite .env com o NOTES_PATH do FrankMD
```

## Fluxo de publicação

1. Escreva/edite o post no FrankMD (gera frontmatter no formato Hugo: `title`, `slug`, `date`, `draft`, `tags`)
2. Quando estiver pronto, marque `draft: false` no post
3. Sincronize os posts não-draft para este repo:
   ```bash
   npm run sync
   ```
4. Revise as mudanças, depois:
   ```bash
   git add src/content/blog
   git commit -m "novo post: ..."
   git push
   ```
5. Vercel publica automaticamente em `blog.ignaulin.com`

## Desenvolvimento local

```bash
npm run dev      # http://localhost:4321
npm run build    # gera ./dist
npm run preview  # serve o build de produção
```

## Deploy (Vercel)

1. Crie um novo projeto no Vercel apontando para este repositório (framework Astro é detectado automaticamente)
2. Em Settings > Domains, adicione `blog.ignaulin.com` e aponte o DNS (CNAME) onde o domínio `ignaulin.com` está gerenciado

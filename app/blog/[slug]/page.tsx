import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllPosts, getPostBySlug } from '@/lib/posts';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};

  const description = post.description || 'Notas de um nômade digital brasileiro.';
  const url = `https://blog.ignaulin.com/blog/${post.slug}`;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.date.toISOString(),
      url,
      tags: post.tags,
      ...(post.image && { images: [post.image] }),
    },
    twitter: {
      card: post.image ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      ...(post.image && { images: [post.image] }),
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const jsonLD = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description || 'Notas de um nômade digital brasileiro.',
    datePublished: post.date.toISOString(),
    url: `https://blog.ignaulin.com/blog/${post.slug}`,
    inLanguage: 'pt-BR',
    author: {
      '@type': 'Person',
      name: 'Rafael Ignaulin',
    },
    ...(post.image && { image: post.image }),
    ...(post.tags.length > 0 && { keywords: post.tags.join(', ') }),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <time className="text-muted text-sm" dateTime={post.date.toISOString()}>
        {post.date.toLocaleDateString('pt-BR')}
      </time>
      {post.tags.length > 0 && (
        <ul className="flex gap-2 list-none p-0 mt-2">
          {post.tags.map((tag) => (
            <li key={tag} className="text-accent text-sm">#{tag}</li>
          ))}
        </ul>
      )}
      <div
        className="prose mt-8"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}

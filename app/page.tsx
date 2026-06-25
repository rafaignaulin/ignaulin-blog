import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Posts</h1>
      {posts.length === 0 && <p>Nenhum post publicado ainda.</p>}
      <ul className="space-y-0">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-[#222]">
            <Link
              href={`/blog/${post.slug}`}
              className="flex justify-between items-baseline gap-4 py-4 no-underline"
            >
              <span className="font-semibold text-lg hover:text-accent transition-colors">
                {post.title}
              </span>
              <time className="text-muted text-sm whitespace-nowrap" dateTime={post.date.toISOString()}>
                {post.date.toLocaleDateString('pt-BR')}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

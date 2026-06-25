import { getAllPosts } from '@/lib/posts';

export async function GET() {
  const posts = await getAllPosts();

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://blog.ignaulin.com/blog/${post.slug}</link>
      <guid>https://blog.ignaulin.com/blog/${post.slug}</guid>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <description><![CDATA[${post.description || ''}]]></description>
    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ignaulin.blog</title>
    <link>https://blog.ignaulin.com</link>
    <description>Notas de um nômade digital brasileiro.</description>
    <language>pt-BR</language>
    <atom:link href="https://blog.ignaulin.com/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

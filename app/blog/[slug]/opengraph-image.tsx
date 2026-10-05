import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/posts';

export const alt = 'ignaulin.blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  const title = post?.title ?? 'ignaulin.blog';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: '#0a0a0a',
          color: '#f5f5f5',
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 800, display: 'flex' }}>
          ignaulin<span style={{ color: '#f59e0b' }}>.</span>blog
        </div>
        <div style={{ fontSize: title.length > 60 ? 56 : 72, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 32, color: '#a3a3a3' }}>Rafael Ignaulin · blog.ignaulin.com</div>
      </div>
    ),
    size,
  );
}

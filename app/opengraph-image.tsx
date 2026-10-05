import { ImageResponse } from 'next/og';

export const alt = 'ignaulin.blog — Notas de um nômade digital brasileiro';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#0a0a0a',
          color: '#f5f5f5',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, display: 'flex' }}>
          ignaulin<span style={{ color: '#f59e0b' }}>.</span>blog
        </div>
        <div style={{ fontSize: 44, color: '#a3a3a3', marginTop: 24 }}>
          Notas de um nômade digital brasileiro
        </div>
      </div>
    ),
    size,
  );
}

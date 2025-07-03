import { NextResponse } from 'next/server';
import { loadMaps } from '@/lib/cdn-data-loader';

export async function GET() {
  // 캐싱 헤더 설정 (1일)
  const headers = {
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate',
  };

  try {
    const maps = await loadMaps();
    return NextResponse.json(maps, { headers });
  } catch (error) {
    console.error('Failed to load maps:', error);
    return NextResponse.json({ error: 'Failed to load maps' }, { status: 500 });
  }
}
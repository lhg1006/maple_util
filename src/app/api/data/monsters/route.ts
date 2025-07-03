import { NextResponse } from 'next/server';
import { loadMonsters } from '@/lib/cdn-data-loader';

export async function GET() {
  // 캐싱 헤더 설정 (1일)
  const headers = {
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate',
  };

  try {
    const monsters = await loadMonsters();
    return NextResponse.json(monsters, { headers });
  } catch (error) {
    console.error('Failed to load monsters:', error);
    return NextResponse.json({ error: 'Failed to load monsters' }, { status: 500 });
  }
}
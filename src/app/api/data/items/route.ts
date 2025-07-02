import { NextResponse } from 'next/server';
import { loadItems } from '@/lib/cdn-data-loader';

export async function GET() {
  // 캐싱 헤더 설정 (1일)
  const headers = {
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate',
  };

  try {
    const items = await loadItems();
    return NextResponse.json(items, { headers });
  } catch (error) {
    console.error('Failed to load items:', error);
    return NextResponse.json({ error: 'Failed to load items' }, { status: 500 });
  }
}
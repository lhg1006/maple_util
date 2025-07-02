import { NextResponse } from 'next/server';
import { COMPLETE_MONSTERS } from '@/data/complete-monsters';

export async function GET() {
  // 캐싱 헤더 설정 (1일)
  const headers = {
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate',
  };

  return NextResponse.json(COMPLETE_MONSTERS, { headers });
}
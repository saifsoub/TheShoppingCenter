import { NextRequest, NextResponse } from 'next/server';
import { getMemory, searchMemory } from '@/lib/kv';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const results = q ? await searchMemory(q) : await getMemory();
  return NextResponse.json(results);
}

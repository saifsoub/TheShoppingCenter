import { NextResponse } from 'next/server';
import { getTools } from '@/lib/kv';

export async function GET() {
  const tools = await getTools();
  // Strip credentials before returning to the client
  const safe = tools.map(({ credentials: _creds, ...rest }) => { void _creds; return rest; });
  return NextResponse.json(safe);
}

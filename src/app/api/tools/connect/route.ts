import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTools, saveToolConfig } from '@/lib/kv';

const schema = z.object({ toolId: z.string(), connected: z.boolean(), apiKey: z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { toolId: string; connected: boolean; apiKey?: string };
    const parsed = schema.parse(body);
    const tools = await getTools();
    const tool = tools.find((item) => item.id === parsed.toolId);
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    tool.connected = parsed.connected;
    if (parsed.apiKey) {
      tool.apiKey = parsed.apiKey;
    }
    await saveToolConfig(tool);
    return NextResponse.json({ success: true, tool });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTools, saveToolConfig } from '@/lib/kv';

const schema = z.object({
  toolId: z.string(),
  connected: z.boolean(),
  credentials: z.record(z.string()).optional(),
  connectedAccount: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      toolId: string;
      connected: boolean;
      credentials?: Record<string, string>;
      connectedAccount?: string;
    };
    const parsed = schema.parse(body);
    const tools = await getTools();
    const tool = tools.find((item) => item.id === parsed.toolId);
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    tool.connected = parsed.connected;
    if (parsed.connected) {
      tool.connectedAt = new Date().toISOString();
      if (parsed.credentials) {
        // Store credentials (server-side only – never returned to the client)
        tool.credentials = parsed.credentials;
        // Derive a display account from common credential keys
        tool.connectedAccount =
          parsed.connectedAccount ??
          parsed.credentials.email ??
          parsed.credentials.clientId?.slice(0, 20).concat('…') ??
          'Connected';
      }
    } else {
      // Disconnecting: clear sensitive data
      tool.credentials = undefined;
      tool.connectedAt = undefined;
      tool.connectedAccount = undefined;
    }
    await saveToolConfig(tool);
    // Return tool without credentials for security
    const { credentials: _creds, ...safeTool } = tool;
    void _creds;
    return NextResponse.json({ success: true, tool: safeTool });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

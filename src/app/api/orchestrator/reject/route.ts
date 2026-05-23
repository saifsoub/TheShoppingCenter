import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { appendExecutionLog, getApprovalById, saveApprovalItem } from '@/lib/kv';

const schema = z.object({ id: z.string(), actor: z.string() });

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { id: string; actor: string };
    const parsed = schema.parse(body);

    const item = await getApprovalById(parsed.id);
    if (!item) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
    }
    if (item.status !== 'pending') {
      return NextResponse.json({ error: 'Already processed' }, { status: 400 });
    }

    item.status = 'rejected';
    item.updatedAt = new Date().toISOString();
    await saveApprovalItem(item);

    await appendExecutionLog({
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      actor: parsed.actor,
      agent: item.agentResponse.agent,
      toolUsed: 'none',
      sourceData: 'approval',
      proposedAction: item.command,
      approvalStatus: 'rejected',
      executionResult: 'Action rejected by user',
      errorMessage: undefined,
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

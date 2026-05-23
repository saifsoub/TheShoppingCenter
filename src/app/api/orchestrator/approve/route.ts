import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeAgentAction } from '@/lib/agents';
import { isAdminActor } from '@/lib/approval';
import { appendExecutionLog, getApprovalById, getApprovals, saveApprovalItem } from '@/lib/kv';

const schema = z.object({ id: z.string(), actor: z.string() });

export async function GET() {
  const approvals = await getApprovals();
  return NextResponse.json(approvals);
}

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
    if (
      (item.agentResponse.riskLevel === 'high' || item.agentResponse.riskLevel === 'destructive') &&
      !isAdminActor(parsed.actor)
    ) {
      return NextResponse.json({ error: 'Admin approval required' }, { status: 403 });
    }

    let executionResult = '';
    let errorMessage: string | undefined;
    try {
      executionResult = await executeAgentAction(item.agentResponse, parsed.actor);
    } catch (error) {
      errorMessage = String(error);
    }

    item.status = 'approved';
    item.updatedAt = new Date().toISOString();
    await saveApprovalItem(item);

    await appendExecutionLog({
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      actor: parsed.actor,
      agent: item.agentResponse.agent,
      toolUsed: item.agentResponse.requiredTools.join(', ') || 'none',
      sourceData: 'approval',
      proposedAction: item.command,
      approvalStatus: 'approved',
      executionResult,
      errorMessage,
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

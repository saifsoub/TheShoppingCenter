import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeAgentAction, routeToAgent } from '@/lib/agents';
import { createApprovalItem, determineApprovalRequirement } from '@/lib/approval';
import { appendExecutionLog, saveApprovalItem, saveMemory } from '@/lib/kv';
import { ExecutionLog, OrchestratorRunRequest, OrchestratorRunResponse } from '@/types';

const schema = z.object({
  command: z.string().min(1).max(2000),
  actor: z.string().min(1),
  source: z.enum(['web', 'slack', 'telegram', 'cron', 'voice']).optional().default('web'),
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrchestratorRunRequest;
    const parsed = schema.parse(body);

    const agentResponse = await routeToAgent(parsed.command, parsed.actor);
    const { autoExecute } = determineApprovalRequirement(agentResponse);

    let executionResult = '';
    let errorMessage: string | undefined;
    let approvalStatus: 'pending' | 'approved' | 'rejected' | 'auto-executed' = 'pending';

    if (autoExecute) {
      try {
        executionResult = await executeAgentAction(agentResponse, parsed.actor);
        approvalStatus = 'auto-executed';
      } catch (error) {
        errorMessage = String(error);
        approvalStatus = 'rejected';
      }
    }

    const log: ExecutionLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      actor: parsed.actor,
      agent: agentResponse.agent,
      toolUsed: agentResponse.requiredTools.join(', ') || 'none',
      sourceData: parsed.source,
      proposedAction: agentResponse.proposedActions.join('; ') || parsed.command,
      approvalStatus,
      executionResult,
      errorMessage,
    };

    await appendExecutionLog(log);
    await saveMemory({
      type: 'execution',
      content: parsed.command,
      metadata: { agent: agentResponse.agent, riskLevel: agentResponse.riskLevel, source: parsed.source },
    });

    const response: OrchestratorRunResponse = { success: true, log };

    if (!autoExecute) {
      const approvalItem = createApprovalItem(parsed.command, agentResponse, parsed.actor);
      await saveApprovalItem(approvalItem);
      response.approvalItem = approvalItem;
    }

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors.map((issue) => issue.message).join(', ') },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

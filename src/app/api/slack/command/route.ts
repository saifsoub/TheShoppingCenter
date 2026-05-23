import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { executeAgentAction, generateDailyBrief, routeToAgent } from '@/lib/agents';
import { createApprovalItem, determineApprovalRequirement } from '@/lib/approval';
import { appendExecutionLog, getApprovals, getLogs, saveApprovalItem } from '@/lib/kv';

function verifySlackSignature(rawBody: string, timestamp: string | null, signature: string | null) {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) {
    return true;
  }
  if (!timestamp || !signature) {
    return false;
  }

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 60 * 5) {
    return false;
  }

  const base = `v0:${timestamp}:${rawBody}`;
  const digest = `v0=${createHmac('sha256', secret).update(base).digest('hex')}`;

  const signatureBuffer = Buffer.from(signature);
  const digestBuffer = Buffer.from(digest);
  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, digestBuffer);
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get('x-slack-request-timestamp');
    const signature = req.headers.get('x-slack-signature');

    if (!verifySlackSignature(rawBody, timestamp, signature)) {
      return NextResponse.json({ response_type: 'ephemeral', text: 'Invalid Slack signature' }, { status: 401 });
    }

    const body = new URLSearchParams(rawBody);
    const command = body.get('command') ?? '';
    const text = body.get('text') ?? '';
    const userName = body.get('user_name') ?? 'Slack User';
    const actor = `slack:${userName}`;

    let responseText = '';

    switch (command) {
      case '/brief': {
        responseText = await generateDailyBrief(actor);
        break;
      }
      case '/risks': {
        const approvals = await getApprovals();
        const highRisk = approvals.filter(
          (item) => item.agentResponse.riskLevel === 'high' || item.agentResponse.riskLevel === 'destructive',
        );
        responseText = highRisk.length
          ? `🔴 *High-risk items (${highRisk.length}):*\n${highRisk.map((item) => `• ${item.command}`).join('\n')}`
          : '✅ No high-risk items pending';
        break;
      }
      case '/approvals': {
        const approvals = await getApprovals();
        const pending = approvals.filter((item) => item.status === 'pending');
        responseText = pending.length
          ? `⏳ *Pending approvals (${pending.length}):*\n${pending
              .map((item) => `• [${item.agentResponse.riskLevel}] ${item.command}`)
              .join('\n')}`
          : '✅ No pending approvals';
        break;
      }
      case '/run': {
        if (!text) {
          responseText = 'Usage: /run [command]';
          break;
        }
        const agentResponse = await routeToAgent(text, actor);
        const { autoExecute } = determineApprovalRequirement(agentResponse);
        if (autoExecute) {
          const executionResult = await executeAgentAction(agentResponse, actor);
          responseText = `✅ Auto-executed by ${agentResponse.agent} agent:\n${executionResult}`;
        } else {
          const item = createApprovalItem(text, agentResponse, actor);
          await saveApprovalItem(item);
          responseText = `⏳ Queued for approval [${agentResponse.riskLevel} risk]: ${text}`;
        }
        await appendExecutionLog({
          id: `log_${Date.now()}_slack`,
          timestamp: new Date().toISOString(),
          actor,
          agent: agentResponse.agent,
          toolUsed: 'slack',
          sourceData: 'slack',
          proposedAction: text,
          approvalStatus: autoExecute ? 'auto-executed' : 'pending',
          executionResult: responseText,
        });
        break;
      }
      case '/logs': {
        const logs = await getLogs();
        responseText = `📋 *Recent logs (${Math.min(5, logs.length)}):*\n${logs
          .slice(0, 5)
          .map((log) => `• [${log.agent}] ${log.proposedAction} → ${log.approvalStatus}`)
          .join('\n')}`;
        break;
      }
      default:
        responseText = 'Unknown command: available /brief /risks /approvals /run /logs';
    }

    return NextResponse.json({ response_type: 'ephemeral', text: responseText });
  } catch (error) {
    return NextResponse.json({ response_type: 'ephemeral', text: `Error: ${String(error)}` });
  }
}

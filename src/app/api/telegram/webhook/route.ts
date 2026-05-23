import { NextRequest, NextResponse } from 'next/server';
import { executeAgentAction, generateDailyBrief, routeToAgent } from '@/lib/agents';
import { createApprovalItem, determineApprovalRequirement } from '@/lib/approval';
import { appendExecutionLog, getApprovals, getLogs, saveApprovalItem } from '@/lib/kv';

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from?: { username?: string };
    text?: string;
  };
}

async function sendTelegramMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return;
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TelegramUpdate;
    const message = body.message;
    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const allowedChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (allowedChatId && String(chatId) !== allowedChatId) {
      return NextResponse.json({ ok: true });
    }

    const text = message.text;
    const actor = `telegram:${message.from?.username ?? chatId}`;

    if (text.startsWith('/brief')) {
      const brief = await generateDailyBrief(actor);
      await sendTelegramMessage(chatId, brief.slice(0, 4000));
    } else if (text.startsWith('/risks')) {
      const approvals = await getApprovals();
      const high = approvals.filter(
        (item) => item.agentResponse.riskLevel === 'high' || item.agentResponse.riskLevel === 'destructive',
      );
      await sendTelegramMessage(
        chatId,
        high.length
          ? `🔴 *${high.length} high-risk items*\n${high.map((item) => `• ${item.command}`).join('\n')}`
          : '✅ No high-risk items',
      );
    } else if (text.startsWith('/approvals')) {
      const approvals = await getApprovals();
      const pending = approvals.filter((item) => item.status === 'pending');
      await sendTelegramMessage(
        chatId,
        pending.length
          ? `⏳ *${pending.length} pending*\n${pending.map((item) => `• ${item.command}`).join('\n')}`
          : '✅ No pending approvals',
      );
    } else if (text.startsWith('/run ')) {
      const command = text.slice(5);
      const agentResponse = await routeToAgent(command, actor);
      const { autoExecute } = determineApprovalRequirement(agentResponse);
      let executionResult = '';
      if (autoExecute) {
        executionResult = await executeAgentAction(agentResponse, actor);
        await sendTelegramMessage(chatId, `✅ Auto-executed:\n${executionResult}`);
      } else {
        const item = createApprovalItem(command, agentResponse, actor);
        await saveApprovalItem(item);
        await sendTelegramMessage(chatId, `⏳ Queued for approval [${agentResponse.riskLevel} risk]\nReview at /approvals`);
      }
      await appendExecutionLog({
        id: `log_${Date.now()}_tg`,
        timestamp: new Date().toISOString(),
        actor,
        agent: agentResponse.agent,
        toolUsed: 'telegram',
        sourceData: 'telegram',
        proposedAction: command,
        approvalStatus: autoExecute ? 'auto-executed' : 'pending',
        executionResult,
      });
    } else if (text.startsWith('/logs')) {
      const logs = await getLogs();
      const summary = logs.slice(0, 5).map((log) => `• [${log.agent}] ${log.proposedAction}`).join('\n');
      await sendTelegramMessage(chatId, `📋 *Recent activity*\n${summary || 'No logs yet'}`);
    } else {
      await sendTelegramMessage(chatId, '👋 Commands: /brief /risks /approvals /run [cmd] /logs');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

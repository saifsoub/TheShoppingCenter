import { NextRequest, NextResponse } from 'next/server';
import { generateDailyBrief } from '@/lib/agents';
import { appendExecutionLog, saveMemory } from '@/lib/kv';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runBrief();
}

export async function POST() {
  return runBrief();
}

async function runBrief() {
  try {
    const brief = await generateDailyBrief('system');
    await saveMemory({ type: 'execution', content: 'Daily brief generated', metadata: { brief } });
    await appendExecutionLog({
      id: `log_${Date.now()}_cron`,
      timestamp: new Date().toISOString(),
      actor: 'cron',
      agent: 'strategy',
      toolUsed: 'openai',
      sourceData: 'cron',
      proposedAction: 'Generate daily executive brief',
      approvalStatus: 'auto-executed',
      executionResult: 'Brief generated',
    });
    return NextResponse.json({ success: true, brief });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

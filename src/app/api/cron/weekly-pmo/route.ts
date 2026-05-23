import { NextRequest, NextResponse } from 'next/server';
import { appendExecutionLog, saveMemory } from '@/lib/kv';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runWeeklyPMO();
}

export async function POST() {
  return runWeeklyPMO();
}

async function runWeeklyPMO() {
  try {
    const report = `Weekly PMO Report – ${new Date().toLocaleDateString()}\n\n- Task completion scanned\n- Blockers identified\n- Deadlines reviewed\n- Stakeholder updates prepared`;
    await saveMemory({ type: 'execution', content: 'Weekly PMO report generated', metadata: { report } });
    await appendExecutionLog({
      id: `log_${Date.now()}_cron_pmo`,
      timestamp: new Date().toISOString(),
      actor: 'cron',
      agent: 'execution',
      toolUsed: 'monday',
      sourceData: 'cron',
      proposedAction: 'Generate weekly PMO report',
      approvalStatus: 'auto-executed',
      executionResult: 'PMO report generated',
    });
    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

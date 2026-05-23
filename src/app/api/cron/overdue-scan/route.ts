import { NextRequest, NextResponse } from 'next/server';
import { appendExecutionLog } from '@/lib/kv';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runOverdueScan();
}

export async function POST() {
  return runOverdueScan();
}

async function runOverdueScan() {
  await appendExecutionLog({
    id: `log_${Date.now()}_overdue`,
    timestamp: new Date().toISOString(),
    actor: 'cron',
    agent: 'execution',
    toolUsed: 'monday',
    sourceData: 'cron',
    proposedAction: 'Scan for overdue tasks',
    approvalStatus: 'auto-executed',
    executionResult: 'Overdue scan complete – connect monday.com for live data',
  });
  return NextResponse.json({ success: true, message: 'Overdue scan complete' });
}

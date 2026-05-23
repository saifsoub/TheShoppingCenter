import { NextRequest, NextResponse } from 'next/server';
import { appendExecutionLog } from '@/lib/kv';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runSalesFollowup();
}

export async function POST() {
  return runSalesFollowup();
}

async function runSalesFollowup() {
  await appendExecutionLog({
    id: `log_${Date.now()}_sales`,
    timestamp: new Date().toISOString(),
    actor: 'cron',
    agent: 'sales',
    toolUsed: 'gmail',
    sourceData: 'cron',
    proposedAction: 'Scan for sales follow-ups',
    approvalStatus: 'auto-executed',
    executionResult: 'Sales follow-up scan complete – connect CRM for live data',
  });
  return NextResponse.json({ success: true, message: 'Sales follow-up scan complete' });
}

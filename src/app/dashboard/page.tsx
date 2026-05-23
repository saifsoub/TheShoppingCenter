'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import ApprovalQueue from '@/components/dashboard/ApprovalQueue';
import CommandInput from '@/components/dashboard/CommandInput';
import ConnectedTools from '@/components/dashboard/ConnectedTools';
import DailyBrief from '@/components/dashboard/DailyBrief';
import MemoryPreview from '@/components/dashboard/MemoryPreview';
import AppShell from '@/components/layout/AppShell';
import { ApprovalItem, ConnectedTool, ExecutionLog, MemoryEntry } from '@/types';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [running, setRunning] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState('');
  const [briefLoading, setBriefLoading] = useState(false);

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [tools, setTools] = useState<ConnectedTool[]>([]);
  const [brief, setBrief] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const loadData = useCallback(async () => {
    try {
      const [approvalsRes, logsRes, memRes, toolsRes] = await Promise.all([
        fetch('/api/orchestrator/approve'),
        fetch('/api/logs'),
        fetch('/api/memory/search?q='),
        fetch('/api/tools/list'),
      ]);
      if (approvalsRes.ok) setApprovals(await approvalsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      if (memRes.ok) setMemories(await memRes.json());
      if (toolsRes.ok) setTools(await toolsRes.json());
    } catch {
      setNotification({ type: 'error', message: 'Failed to load dashboard data' });
    }
  }, []);

  useEffect(() => {
    if (session) {
      void loadData();
    }
  }, [session, loadData]);

  const handleCommand = async (command: string) => {
    setRunning(true);
    setNotification(null);
    try {
      const res = await fetch('/api/orchestrator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, actor: session?.user?.email ?? 'user', source: 'web' }),
      });
      const data = (await res.json()) as {
        success: boolean;
        approvalItem?: ApprovalItem;
        log?: ExecutionLog;
        error?: string;
      };
      if (data.success) {
        setNotification({
          type: 'success',
          message: data.approvalItem
            ? `Action queued for approval (${data.approvalItem.agentResponse.riskLevel} risk)`
            : 'Command executed successfully',
        });
        await loadData();
      } else {
        setNotification({ type: 'error', message: data.error ?? 'Unknown error' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: String(err) });
    } finally {
      setRunning(false);
    }
  };

  const handleApprove = async (id: string) => {
    setApprovalLoading(id);
    try {
      await fetch('/api/orchestrator/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, actor: session?.user?.email ?? 'user' }),
      });
      await loadData();
    } finally {
      setApprovalLoading('');
    }
  };

  const handleReject = async (id: string) => {
    setApprovalLoading(id);
    try {
      await fetch('/api/orchestrator/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, actor: session?.user?.email ?? 'user' }),
      });
      await loadData();
    } finally {
      setApprovalLoading('');
    }
  };

  const handleBriefRefresh = async () => {
    setBriefLoading(true);
    try {
      const res = await fetch('/api/cron/daily-brief', { method: 'POST' });
      const data = (await res.json()) as { brief?: string };
      if (data.brief) {
        setBrief(data.brief);
      }
    } finally {
      setBriefLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mission Control</h1>
            <p className="text-sm text-gray-400">
              Welcome back, {session.user?.name?.split(' ')[0]} ·{' '}
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-900/30 px-3 py-1.5 text-xs text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
              System Online
            </div>
          </div>
        </div>

        {notification && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              notification.type === 'success'
                ? 'border-emerald-700 bg-emerald-900/30 text-emerald-300'
                : 'border-red-700 bg-red-900/30 text-red-300'
            }`}
          >
            {notification.message}
          </div>
        )}

        <CommandInput onSubmit={handleCommand} loading={running} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ApprovalQueue
              items={approvals}
              onApprove={handleApprove}
              onReject={handleReject}
              loading={approvalLoading}
            />
            <ActivityFeed logs={logs} />
          </div>
          <div className="space-y-6">
            <ConnectedTools tools={tools} />
            <MemoryPreview entries={memories} />
          </div>
        </div>

        <DailyBrief brief={brief} loading={briefLoading} onRefresh={handleBriefRefresh} />
      </div>
    </AppShell>
  );
}

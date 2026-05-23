'use client';

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AppShell from '@/components/layout/AppShell';
import { ExecutionLog } from '@/types';

export default function LogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/logs')
        .then((response) => response.json())
        .then((data: ExecutionLog[]) => setLogs(data));
    }
  }, [session]);

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

  const agentIcons: Record<string, string> = {
    strategy: '🧭',
    execution: '⚙️',
    design: '🎨',
    code: '💻',
    research: '🔬',
    sales: '💼',
  };
  const filtered = search
    ? logs.filter(
        (log) =>
          log.proposedAction.toLowerCase().includes(search.toLowerCase()) ||
          log.agent.includes(search.toLowerCase()),
      )
    : logs;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Execution Logs</h1>
          <p className="text-sm text-gray-400">Complete audit trail of all AI actions</p>
        </div>

        <input
          type="text"
          className="input max-w-sm"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filtered.length === 0 ? (
          <div className="card py-12 text-center">
            <p className="text-gray-500">No logs found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((log) => (
              <div key={log.id} className="card grid grid-cols-12 items-start gap-3 text-xs">
                <div className="col-span-2 text-gray-500">{format(new Date(log.timestamp), 'MM/dd HH:mm:ss')}</div>
                <div className="col-span-1 text-center">{agentIcons[log.agent] ?? '🤖'}</div>
                <div className="col-span-1 capitalize text-indigo-300">{log.agent}</div>
                <div className="col-span-4 text-gray-300">{log.proposedAction}</div>
                <div className="col-span-2">
                  <span
                    className={`badge ${
                      log.approvalStatus === 'approved' || log.approvalStatus === 'auto-executed'
                        ? 'border-emerald-700 bg-emerald-900/50 text-emerald-300'
                        : log.approvalStatus === 'rejected'
                          ? 'border-red-700 bg-red-900/50 text-red-300'
                          : 'border-yellow-700 bg-yellow-900/50 text-yellow-300'
                    }`}
                  >
                    {log.approvalStatus}
                  </span>
                </div>
                <div className="col-span-2 truncate text-gray-400">
                  {log.executionResult || log.errorMessage || '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

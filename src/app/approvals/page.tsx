'use client';

import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AppShell from '@/components/layout/AppShell';
import { getRiskBadgeColor } from '@/lib/approval';
import { ApprovalItem } from '@/types';

export default function ApprovalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const loadApprovals = useCallback(async () => {
    const res = await fetch('/api/orchestrator/approve');
    if (res.ok) {
      setApprovals(await res.json());
    }
  }, []);

  useEffect(() => {
    if (session) {
      void loadApprovals();
    }
  }, [session, loadApprovals]);

  const handleApprove = async (id: string) => {
    setLoading(id);
    await fetch('/api/orchestrator/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, actor: session?.user?.email ?? 'user' }),
    });
    await loadApprovals();
    setLoading('');
  };

  const handleReject = async (id: string) => {
    setLoading(id);
    await fetch('/api/orchestrator/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, actor: session?.user?.email ?? 'user' }),
    });
    await loadApprovals();
    setLoading('');
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

  const agentIcons: Record<string, string> = {
    strategy: '🧭',
    execution: '⚙️',
    design: '🎨',
    code: '💻',
    research: '🔬',
    sales: '💼',
  };
  const filtered = filter === 'all' ? approvals : approvals.filter((approval) => approval.status === filter);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
            <p className="text-sm text-gray-400">Review and approve AI-proposed actions</p>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-lg px-3 py-1.5 text-xs capitalize transition-colors ${
                  filter === value ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {(['pending', 'approved', 'rejected'] as const).map((statusValue) => (
            <div key={statusValue} className="card text-center">
              <p
                className={`text-2xl font-bold ${
                  statusValue === 'pending'
                    ? 'text-yellow-400'
                    : statusValue === 'approved'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                }`}
              >
                {approvals.filter((approval) => approval.status === statusValue).length}
              </p>
              <p className="text-xs capitalize text-gray-500">{statusValue}</p>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card py-12 text-center">
            <Clock className="mx-auto mb-3 h-8 w-8 text-gray-600" />
            <p className="text-gray-500">No {filter === 'all' ? '' : filter} approvals found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{agentIcons[item.agentResponse.agent] ?? '🤖'}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{item.command}</p>
                      <p className="text-xs text-gray-500">
                        by {item.actor} · {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className={`badge ${getRiskBadgeColor(item.agentResponse.riskLevel)}`}>
                      {item.agentResponse.riskLevel}
                    </span>
                    <span
                      className={`badge ${
                        item.status === 'pending'
                          ? 'border-yellow-700 bg-yellow-900/50 text-yellow-300'
                          : item.status === 'approved'
                            ? 'border-emerald-700 bg-emerald-900/50 text-emerald-300'
                            : 'border-red-700 bg-red-900/50 text-red-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{item.agentResponse.reasoningSummary}</p>
                {item.agentResponse.proposedActions.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-500">Proposed Actions:</p>
                    <ul className="space-y-1">
                      {item.agentResponse.proposedActions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-gray-300">
                          <span className="mt-0.5 text-indigo-400">→</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={loading === item.id}
                      className="btn-success flex items-center gap-1 py-1.5 text-xs"
                    >
                      {loading === item.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}{' '}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={loading === item.id}
                      className="btn-danger flex items-center gap-1 py-1.5 text-xs"
                    >
                      <XCircle className="h-3 w-3" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

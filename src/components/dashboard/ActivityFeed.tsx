import { formatDistanceToNow } from 'date-fns';
import { ExecutionLog } from '@/types';

interface Props {
  logs: ExecutionLog[];
}

export default function ActivityFeed({ logs }: Props) {
  const agentIcons: Record<string, string> = {
    strategy: '🧭',
    execution: '⚙️',
    design: '🎨',
    code: '💻',
    research: '🔬',
    sales: '💼',
  };

  return (
    <div className="card space-y-3">
      <h2 className="flex items-center gap-2 font-semibold text-white">
        <span>📡</span> Agent Activity Feed
      </h2>
      {logs.length === 0 ? (
        <p className="text-sm text-gray-500">No activity yet. Run a command to get started.</p>
      ) : (
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {logs.slice(0, 20).map((log) => (
            <div key={log.id} className="flex items-start gap-3 rounded-lg bg-gray-800/50 p-2">
              <span className="mt-0.5 text-lg">{agentIcons[log.agent] ?? '🤖'}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium capitalize text-indigo-300">{log.agent} agent</span>
                  <span className="text-xs text-gray-600">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="truncate text-xs text-gray-300">{log.proposedAction}</p>
                {log.errorMessage && <p className="mt-0.5 text-xs text-red-400">{log.errorMessage}</p>}
              </div>
              <span
                className={`badge text-xs ${
                  log.approvalStatus === 'auto-executed'
                    ? 'border-emerald-700 bg-emerald-900/50 text-emerald-300'
                    : log.approvalStatus === 'approved'
                      ? 'border-blue-700 bg-blue-900/50 text-blue-300'
                      : 'border-gray-700 bg-gray-800 text-gray-400'
                }`}
              >
                {log.approvalStatus}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

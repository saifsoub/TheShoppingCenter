'use client';

import { useState } from 'react';
import { CheckCircle, Edit3, Loader2, XCircle } from 'lucide-react';
import { getRiskBadgeColor } from '@/lib/approval';
import { ApprovalItem } from '@/types';

interface Props {
  items: ApprovalItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loading?: string;
}

export default function ApprovalQueue({ items, onApprove, onReject, loading }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const pending = items.filter((item) => item.status === 'pending');

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-white">
          <span>✅</span> Approval Queue
        </h2>
        {pending.length > 0 && (
          <span className="badge border-yellow-700 bg-yellow-900/50 text-yellow-300">{pending.length} pending</span>
        )}
      </div>

      {pending.length === 0 ? (
        <p className="text-sm text-gray-500">No pending approvals</p>
      ) : (
        <div className="max-h-80 space-y-3 overflow-y-auto">
          {pending.map((item) => (
            <div key={item.id} className="space-y-2 rounded-lg bg-gray-800 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 text-sm text-gray-200">{item.command}</p>
                <span className={`badge ${getRiskBadgeColor(item.agentResponse.riskLevel)}`}>
                  {item.agentResponse.riskLevel}
                </span>
              </div>
              <p className="text-xs text-gray-400">{item.agentResponse.reasoningSummary}</p>
              {editId === item.id ? (
                <div className="space-y-2">
                  <textarea
                    className="input text-xs"
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove(item.id)}
                      className="btn-success flex items-center gap-1 py-1 text-xs"
                    >
                      <CheckCircle className="h-3 w-3" /> Approve
                    </button>
                    <button onClick={() => setEditId(null)} className="btn-secondary py-1 text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(item.id)}
                    disabled={loading === item.id}
                    className="btn-success flex items-center gap-1 py-1 text-xs"
                  >
                    {loading === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(item.id)}
                    className="btn-danger flex items-center gap-1 py-1 text-xs"
                  >
                    <XCircle className="h-3 w-3" /> Reject
                  </button>
                  <button
                    onClick={() => {
                      setEditId(item.id);
                      setEditText(item.command);
                    }}
                    className="btn-secondary flex items-center gap-1 py-1 text-xs"
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle2, Loader2, Plug, PlugZap, RefreshCw, Unplug } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import ToolLogo from '@/components/tools/ToolLogo';
import ConnectModal from '@/components/tools/ConnectModal';
import { ConnectedTool, ToolAuthType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const AUTH_BADGE: Record<ToolAuthType, { label: string; color: string }> = {
  oauth: { label: 'OAuth 2.0', color: 'bg-blue-900/40 text-blue-300 border-blue-700' },
  'api-key': { label: 'API Key', color: 'bg-yellow-900/40 text-yellow-300 border-yellow-700' },
  token: { label: 'Token', color: 'bg-purple-900/40 text-purple-300 border-purple-700' },
  webhook: { label: 'Webhook', color: 'bg-orange-900/40 text-orange-300 border-orange-700' },
};

export default function ToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tools, setTools] = useState<ConnectedTool[]>([]);
  const [disconnecting, setDisconnecting] = useState('');
  const [loadingPage, setLoadingPage] = useState(true);
  const [modalTool, setModalTool] = useState<ConnectedTool | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  const loadTools = async () => {
    setLoadingPage(true);
    try {
      const res = await fetch('/api/tools/list');
      if (res.ok) setTools(await res.json());
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    if (session) loadTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleConnect = async (toolId: string, credentials: Record<string, string>) => {
    const res = await fetch('/api/tools/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolId, connected: true, credentials }),
    });
    if (!res.ok) throw new Error('Failed to save credentials');
    const data = (await res.json()) as { tool: ConnectedTool };
    setTools((prev) => prev.map((t) => (t.id === toolId ? { ...t, ...data.tool } : t)));
  };

  const handleDisconnect = async (toolId: string) => {
    setDisconnecting(toolId);
    try {
      await fetch('/api/tools/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, connected: false }),
      });
      setTools((prev) => prev.map((t) => (t.id === toolId ? { ...t, connected: false, connectedAt: undefined, connectedAccount: undefined } : t)));
    } finally {
      setDisconnecting('');
    }
  };

  if (status === 'loading' || loadingPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }
  if (!session) return null;

  const grouped = tools.reduce<Record<string, ConnectedTool[]>>((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  const connectedCount = tools.filter((t) => t.connected).length;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tool Marketplace</h1>
            <p className="mt-1 text-sm text-gray-400">
              Connect your stack to unlock AI-powered automation across every tool.
            </p>
          </div>
          <button onClick={loadTools} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
              <Plug className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{tools.length}</p>
              <p className="text-xs text-gray-500">Integrations available</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center">
              <PlugZap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{connectedCount}</p>
              <p className="text-xs text-gray-500">Connected & active</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-700/50 flex items-center justify-center">
              <Unplug className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">{tools.length - connectedCount}</p>
              <p className="text-xs text-gray-500">Not yet connected</p>
            </div>
          </div>
        </div>

        {/* Tool cards grouped by category */}
        {Object.entries(grouped).map(([category, categoryTools]) => (
          <section key={category}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
              {category}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categoryTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  disconnecting={disconnecting === tool.id}
                  onConnectClick={() => setModalTool(tool)}
                  onDisconnect={() => handleDisconnect(tool.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Connect modal */}
      {modalTool && (
        <ConnectModal
          tool={modalTool}
          onClose={() => setModalTool(null)}
          onSave={handleConnect}
        />
      )}
    </AppShell>
  );
}

/* ─── Individual Tool Card ─────────────────────────────────────────── */

interface CardProps {
  tool: ConnectedTool;
  disconnecting: boolean;
  onConnectClick: () => void;
  onDisconnect: () => void;
}

function ToolCard({ tool, disconnecting, onConnectClick, onDisconnect }: CardProps) {
  const [showFeatures, setShowFeatures] = useState(false);
  const authBadge = AUTH_BADGE[tool.authType];

  return (
    <div
      className={`group flex flex-col rounded-xl border bg-gray-900 p-4 transition-all duration-200 ${
        tool.connected
          ? 'border-emerald-700/60 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]'
          : 'border-gray-800 hover:border-gray-700'
      }`}
    >
      {/* Card top row */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
          <ToolLogo toolId={tool.id} className="w-11 h-11" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white text-sm leading-tight">{tool.name}</p>
            {tool.connected && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <span
            className={`inline-flex items-center mt-1 text-xs px-1.5 py-0.5 rounded-full border ${authBadge.color}`}
          >
            {authBadge.label}
          </span>
        </div>
      </div>

      {/* Connected account info */}
      {tool.connected && tool.connectedAccount && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-900/20 border border-emerald-800/50 px-3 py-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-emerald-300 truncate">{tool.connectedAccount}</span>
          {tool.connectedAt && (
            <span className="text-xs text-emerald-600 ml-auto flex-shrink-0">
              {formatDistanceToNow(new Date(tool.connectedAt), { addSuffix: true })}
            </span>
          )}
        </div>
      )}

      {/* Feature list – collapsible */}
      <div className="mt-3 flex-1">
        <button
          onClick={() => setShowFeatures((v) => !v)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <span>{showFeatures ? '▾' : '▸'}</span>
          {showFeatures ? 'Hide' : 'Show'} capabilities ({tool.features.length})
        </button>
        {showFeatures && (
          <ul className="mt-2 space-y-1.5">
            {tool.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action row */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-800 pt-3">
        <a
          href={tool.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-600 hover:text-indigo-400 transition-colors"
        >
          API docs ↗
        </a>
        {tool.connected ? (
          <button
            onClick={onDisconnect}
            disabled={disconnecting}
            className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-400 hover:border-red-700 hover:bg-red-900/20 hover:text-red-300 transition-all disabled:opacity-50"
          >
            {disconnecting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Unplug className="w-3 h-3" />
            )}
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnectClick}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-700 bg-indigo-600/20 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-600/40 transition-all"
          >
            <PlugZap className="w-3 h-3" />
            Connect
          </button>
        )}
      </div>
    </div>
  );
}


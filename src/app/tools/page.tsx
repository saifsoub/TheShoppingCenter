'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, Loader2, Zap } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { ConnectedTool } from '@/types';

const TOOL_ICONS: Record<string, string> = {
  monday: '📅',
  gmail: '📧',
  gdrive: '💾',
  gcal: '📆',
  slack: '💬',
  telegram: '✈️',
  notion: '📝',
  github: '🐙',
  gsheets: '📊',
};

const TOOL_DESCRIPTIONS: Record<string, string> = {
  monday: 'Project management & task tracking',
  gmail: 'Email management & automation',
  gdrive: 'File storage & document management',
  gcal: 'Calendar & scheduling automation',
  slack: 'Team communication & notifications',
  telegram: 'Bot messaging & alerts',
  notion: 'Knowledge base & documentation',
  github: 'Code repositories & CI/CD',
  gsheets: 'Spreadsheets & data analysis',
};

export default function ToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tools, setTools] = useState<ConnectedTool[]>([]);
  const [loading, setLoading] = useState('');
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (!session) {
      return;
    }
    fetch('/api/tools/list')
      .then((response) => response.json())
      .then((data: ConnectedTool[]) => {
        setTools(data);
        setLoadingPage(false);
      })
      .catch(() => setLoadingPage(false));
  }, [session]);

  const toggleTool = async (toolId: string, connected: boolean) => {
    setLoading(toolId);
    try {
      const res = await fetch('/api/tools/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, connected: !connected }),
      });
      if (res.ok) {
        setTools((prev) => prev.map((tool) => (tool.id === toolId ? { ...tool, connected: !connected } : tool)));
      }
    } finally {
      setLoading('');
    }
  };

  if (status === 'loading' || loadingPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const grouped = tools.reduce<Record<string, ConnectedTool[]>>((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tool Marketplace</h1>
          <p className="text-sm text-gray-400">Connect and manage your integrations</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-2xl font-bold text-white">{tools.length}</p>
            <p className="text-xs text-gray-500">Catalog Size</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-emerald-400">{tools.filter((tool) => tool.connected).length}</p>
            <p className="text-xs text-gray-500">Connected</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-gray-500">{tools.filter((tool) => !tool.connected).length}</p>
            <p className="text-xs text-gray-500">Available</p>
          </div>
        </div>

        {Object.entries(grouped).map(([category, categoryTools]) => (
          <div key={category}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">{category}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {categoryTools.map((tool) => (
                <div
                  key={tool.id}
                  className={`card flex items-center justify-between transition-all ${
                    tool.connected ? 'border-indigo-700/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
                        tool.connected ? 'bg-indigo-600/20' : 'bg-gray-800'
                      }`}
                    >
                      {TOOL_ICONS[tool.id] ?? '🔧'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tool.name}</p>
                      <p className="text-xs text-gray-500">{TOOL_DESCRIPTIONS[tool.id] ?? tool.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTool(tool.id, tool.connected)}
                    disabled={loading === tool.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      tool.connected
                        ? 'border border-emerald-700 bg-emerald-900/30 text-emerald-300 hover:border-red-700 hover:bg-red-900/30 hover:text-red-300'
                        : 'border border-indigo-700 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40'
                    }`}
                  >
                    {loading === tool.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : tool.connected ? (
                      <>
                        <CheckCircle className="h-3 w-3" /> Connected
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3" /> Connect
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

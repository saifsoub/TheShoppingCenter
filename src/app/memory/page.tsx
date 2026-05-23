'use client';

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AppShell from '@/components/layout/AppShell';
import { MemoryEntry } from '@/types';

export default function MemoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const doSearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/memory/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        setEntries(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      void doSearch('');
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

  const typeColors: Record<string, string> = {
    preference: 'border-purple-700 bg-purple-900/50 text-purple-300',
    tool: 'border-blue-700 bg-blue-900/50 text-blue-300',
    project: 'border-green-700 bg-green-900/50 text-green-300',
    person: 'border-yellow-700 bg-yellow-900/50 text-yellow-300',
    company: 'border-orange-700 bg-orange-900/50 text-orange-300',
    commitment: 'border-red-700 bg-red-900/50 text-red-300',
    workflow: 'border-cyan-700 bg-cyan-900/50 text-cyan-300',
    decision: 'border-pink-700 bg-pink-900/50 text-pink-300',
    execution: 'border-gray-700 bg-gray-800 text-gray-300',
  };

  const grouped = entries.reduce<Record<string, MemoryEntry[]>>((acc, entry) => {
    if (!acc[entry.type]) {
      acc[entry.type] = [];
    }
    acc[entry.type].push(entry);
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Memory Graph</h1>
          <p className="text-sm text-gray-400">Persistent context and knowledge base</p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            className="input max-w-sm"
            placeholder="Search memories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              void doSearch(e.target.value);
            }}
          />
          <span className="self-center text-sm text-gray-500">{entries.length} entries</span>
        </div>

        {loading && <p className="text-sm text-gray-500">Searching...</p>}

        {Object.entries(grouped).map(([type, items]) => (
          <div key={type}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
              <span className={`badge ${typeColors[type] ?? 'border-gray-700 bg-gray-800 text-gray-300'}`}>
                {type}
              </span>
              <span className="text-gray-600">({items.length})</span>
            </h2>
            <div className="space-y-2">
              {items.map((entry) => (
                <div key={entry.id} className="card text-sm">
                  <p className="text-gray-200">{entry.content}</p>
                  <p className="mt-1 text-xs text-gray-600">{format(new Date(entry.createdAt), 'MMM d, yyyy HH:mm')}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {entries.length === 0 && !loading && (
          <div className="card py-12 text-center">
            <p className="text-gray-500">No memories found. Run commands to build memory.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

import Link from 'next/link';
import { MemoryEntry } from '@/types';

interface Props {
  entries: MemoryEntry[];
}

export default function MemoryPreview({ entries }: Props) {
  const typeColors: Record<string, string> = {
    preference: 'text-purple-400',
    tool: 'text-blue-400',
    project: 'text-green-400',
    person: 'text-yellow-400',
    company: 'text-orange-400',
    commitment: 'text-red-400',
    workflow: 'text-cyan-400',
    decision: 'text-pink-400',
    execution: 'text-gray-400',
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-white">
          <span>🧠</span> Memory Graph
        </h2>
        <Link href="/memory" className="text-xs text-indigo-400 transition-colors hover:text-indigo-300">
          View all →
        </Link>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">No memories stored yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {entries.slice(0, 15).map((entry) => (
            <div key={entry.id} className="group cursor-default rounded-lg bg-gray-800 px-3 py-1.5 text-xs">
              <span className={`font-medium ${typeColors[entry.type] ?? 'text-gray-400'}`}>{entry.type}</span>
              <span className="ml-1 text-gray-400">·</span>
              <span className="ml-1 inline-block max-w-xs truncate align-bottom text-gray-300">
                {entry.content.slice(0, 40)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

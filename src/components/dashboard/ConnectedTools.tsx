import Link from 'next/link';
import { ConnectedTool } from '@/types';

interface Props {
  tools: ConnectedTool[];
}

export default function ConnectedTools({ tools }: Props) {
  const connected = tools.filter((tool) => tool.connected);
  const icons: Record<string, string> = {
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

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-white">
          <span>🔧</span> Connected Tools
        </h2>
        <Link href="/tools" className="text-xs text-indigo-400 transition-colors hover:text-indigo-300">
          Manage →
        </Link>
      </div>
      {connected.length === 0 ? (
        <p className="text-sm text-gray-500">
          No tools connected.{' '}
          <Link href="/tools" className="text-indigo-400 hover:underline">
            Connect tools →
          </Link>
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {connected.map((tool) => (
            <div key={tool.id} className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>{icons[tool.id] ?? '🔧'}</span>
              <span className="text-gray-300">{tool.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

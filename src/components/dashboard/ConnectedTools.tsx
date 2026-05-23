import Link from 'next/link';
import { ConnectedTool } from '@/types';
import ToolLogo from '@/components/tools/ToolLogo';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  tools: ConnectedTool[];
}

export default function ConnectedTools({ tools }: Props) {
  const connected = tools.filter((tool) => tool.connected);

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
        <div className="rounded-lg border border-dashed border-gray-700 px-4 py-5 text-center">
          <p className="text-sm text-gray-500">No tools connected yet.</p>
          <Link
            href="/tools"
            className="mt-2 inline-block text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Browse the Tool Marketplace →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {connected.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center gap-3 rounded-lg bg-gray-800/60 px-3 py-2"
            >
              <div className="w-7 h-7 flex-shrink-0 rounded-lg overflow-hidden">
                <ToolLogo toolId={tool.id} className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-200">{tool.name}</p>
                {tool.connectedAccount && (
                  <p className="text-xs text-gray-500 truncate">{tool.connectedAccount}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {tool.connectedAt && (
                  <span className="text-xs text-gray-600 hidden sm:inline">
                    {formatDistanceToNow(new Date(tool.connectedAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


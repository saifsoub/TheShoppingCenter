'use client';

interface Props {
  brief: string;
  loading?: boolean;
  onRefresh: () => void;
}

export default function DailyBrief({ brief, loading, onRefresh }: Props) {
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-white">
          <span>📰</span> Daily Brief
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs text-indigo-400 transition-colors hover:text-indigo-300 disabled:opacity-50"
        >
          {loading ? 'Generating...' : '↻ Refresh'}
        </button>
      </div>
      {brief ? (
        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
          {brief}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          {loading ? 'Generating your daily brief...' : 'Click Refresh to generate your daily brief.'}
        </p>
      )}
    </div>
  );
}

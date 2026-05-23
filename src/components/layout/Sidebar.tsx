'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/dashboard', label: 'Mission Control', icon: '⚡' },
  { href: '/tools', label: 'Tool Marketplace', icon: '🔧' },
  { href: '/approvals', label: 'Approvals', icon: '✅' },
  { href: '/logs', label: 'Execution Logs', icon: '📋' },
  { href: '/memory', label: 'Memory', icon: '🧠' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 z-40 flex min-h-screen w-60 flex-col border-r border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm">⚡</div>
          <div>
            <p className="text-sm font-bold text-white">SCO V3</p>
            <p className="text-xs text-gray-500">Command Orchestrator</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              pathname === href
                ? 'border border-indigo-700/50 bg-indigo-600/20 text-indigo-300'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200',
            )}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {session?.user && (
        <div className="border-t border-gray-800 p-3">
          <div className="mb-2 flex items-center gap-2">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full"
                referrerPolicy="no-referrer"
                unoptimized
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-xs text-gray-300">
                {(session.user.name ?? 'U').slice(0, 1)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{session.user.name}</p>
              <p className="truncate text-xs text-gray-500">{session.user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="w-full px-2 py-1 text-left text-xs text-gray-500 transition-colors hover:text-gray-300"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}

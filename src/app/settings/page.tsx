'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AppShell from '@/components/layout/AppShell';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

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

  const envConfig = [
    { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', desc: 'Required for AI orchestration' },
    { key: 'KV_REST_API_URL', label: 'Vercel KV URL', desc: 'For persistent memory storage' },
    { key: 'KV_REST_API_TOKEN', label: 'Vercel KV Token', desc: 'Authentication for Vercel KV' },
    { key: 'GOOGLE_CLIENT_ID', label: 'Google OAuth Client ID', desc: 'For Google login' },
    { key: 'GOOGLE_CLIENT_SECRET', label: 'Google OAuth Client Secret', desc: 'For Google login' },
    { key: 'CRON_SECRET', label: 'Cron Secret', desc: 'Protects scheduled Vercel cron routes' },
    { key: 'SLACK_BOT_TOKEN', label: 'Slack Bot Token', desc: 'For Slack slash commands' },
    { key: 'SLACK_SIGNING_SECRET', label: 'Slack Signing Secret', desc: 'Verifies Slack command payloads' },
    { key: 'TELEGRAM_BOT_TOKEN', label: 'Telegram Bot Token', desc: 'For Telegram webhooks' },
    { key: 'TELEGRAM_ADMIN_CHAT_ID', label: 'Telegram Admin Chat ID', desc: 'Restricts Telegram access' },
  ];

  const playbooks = [
    { name: 'Audit monday board', desc: 'Scan for overdue and unassigned tasks' },
    { name: 'Chase overdue owners', desc: 'Send reminders to task owners' },
    { name: 'Draft weekly CEO report', desc: 'Generate executive summary' },
    { name: 'Scan inbox for urgent items', desc: 'Identify priority emails' },
    { name: 'Summarize project blockers', desc: 'Extract blockers from all projects' },
    { name: 'Prepare sales follow-ups', desc: 'Generate follow-up list from CRM' },
    { name: 'Clean CRM', desc: 'Remove stale entries and duplicates' },
    { name: 'Create daily executive brief', desc: 'Compile morning briefing' },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-400">System configuration and playbooks</p>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-white">Account</h2>
          <div className="flex items-center gap-4">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-full"
                referrerPolicy="no-referrer"
                unoptimized
              />
            )}
            <div>
              <p className="font-medium text-white">{session.user?.name}</p>
              <p className="text-sm text-gray-400">{session.user?.email}</p>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-white">Environment Variables</h2>
          <p className="text-xs text-gray-500">Configure these in your Vercel project settings or .env.local file</p>
          <div className="space-y-2">
            {envConfig.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between border-b border-gray-800 py-2 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-200">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <code className="rounded bg-gray-800 px-2 py-0.5 text-xs text-indigo-400">{key}</code>
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-white">Autonomous Playbooks</h2>
          <p className="text-xs text-gray-500">Reusable workflows triggered from the command center</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {playbooks.map((playbook) => (
              <div key={playbook.name} className="flex items-start gap-3 rounded-lg bg-gray-800 p-3">
                <span className="mt-0.5 text-indigo-400">▶</span>
                <div>
                  <p className="text-sm font-medium text-white">{playbook.name}</p>
                  <p className="text-xs text-gray-500">{playbook.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-white">Scheduled Automations</h2>
          <div className="space-y-2">
            {[
              {
                path: '/api/cron/daily-brief',
                schedule: 'Daily at 7:00 AM UTC',
                desc: 'Executive morning briefing',
              },
              {
                path: '/api/cron/weekly-pmo',
                schedule: 'Mondays at 8:00 AM UTC',
                desc: 'Weekly PMO report',
              },
              {
                path: '/api/cron/overdue-scan',
                schedule: 'Daily at 9:00 AM UTC',
                desc: 'Overdue task scan',
              },
              {
                path: '/api/cron/sales-followup',
                schedule: 'Mondays at 10:00 AM UTC',
                desc: 'Sales follow-up scan',
              },
            ].map((cron) => (
              <div key={cron.path} className="flex items-center justify-between border-b border-gray-800 py-2 last:border-0">
                <div>
                  <code className="text-xs text-indigo-400">{cron.path}</code>
                  <p className="text-xs text-gray-500">{cron.desc}</p>
                </div>
                <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">{cron.schedule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

# Seif Command Orchestrator V3

Production-ready Next.js 14 App Router control center for command orchestration, approval workflows, AI-generated executive briefs, persistent memory, and integration management.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- NextAuth.js with Google OAuth
- OpenAI GPT-4o
- Vercel KV for memory, logs, approvals, and tool state
- Vercel Cron for scheduled automations
- Slack slash commands and Telegram webhook support

## Features

- **Mission Control dashboard** with command input, approvals, activity feed, memory preview, connected tools, and daily brief
- **Multi-agent orchestration** across strategy, execution, design, code, research, and sales agents
- **Approval engine** with risk-based routing and admin enforcement for high-risk actions
- **Persistent memory and logs** with Vercel KV and in-memory fallback for local development
- **OAuth authentication** using Google via NextAuth.js
- **Automation endpoints** for daily briefs, PMO reports, overdue scans, and sales follow-up scans
- **Slack + Telegram interfaces** for remote command execution and reporting

## Project Structure

```text
src/
  app/
    api/
    approvals/
    auth/signin/
    dashboard/
    logs/
    memory/
    settings/
    tools/
  components/
    dashboard/
    layout/
  lib/
  types/
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Required variables:

- `OPENAI_API_KEY`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ADMIN_EMAIL`

Optional but recommended:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `CRON_SECRET`
- `SLACK_SIGNING_SECRET`
- `SLACK_BOT_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ADMIN_CHAT_ID`

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Authentication Setup

### Google OAuth

1. Create a Google Cloud project.
2. Configure OAuth consent screen.
3. Create OAuth client credentials.
4. Add the following redirect URL:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`
5. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### NextAuth

Generate a secret:

```bash
openssl rand -base64 32
```

Assign the result to `NEXTAUTH_SECRET`.

## Vercel KV Setup

1. Create a Vercel KV database.
2. Copy the REST URL and token into:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
3. If KV is missing locally, the app falls back to in-memory storage.

## Slack Setup

1. Create a Slack app.
2. Enable Slash Commands.
3. Point commands to `https://your-domain.com/api/slack/command`.
4. Save the Slack signing secret in `SLACK_SIGNING_SECRET`.

Suggested slash commands:

- `/brief`
- `/risks`
- `/approvals`
- `/run`
- `/logs`

## Telegram Setup

1. Create a Telegram bot with BotFather.
2. Set `TELEGRAM_BOT_TOKEN`.
3. Optionally restrict access with `TELEGRAM_ADMIN_CHAT_ID`.
4. Configure the webhook:

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-domain.com/api/telegram/webhook"}'
```

## Scheduled Automations

Defined in `vercel.json`:

- `0 7 * * *` → `/api/cron/daily-brief`
- `0 8 * * 1` → `/api/cron/weekly-pmo`
- `0 9 * * *` → `/api/cron/overdue-scan`
- `0 10 * * 1` → `/api/cron/sales-followup`

If `CRON_SECRET` is set, Vercel cron requests must include the matching bearer token.

## Deployment

Deploy on Vercel:

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add all environment variables in Vercel Project Settings.
4. Attach a Vercel KV database.
5. Redeploy after secrets are configured.

Build locally before deploying:

```bash
npm run build
```

## Production Notes

- High-risk and destructive approvals require the configured admin actor.
- Slack requests are signature-verified when `SLACK_SIGNING_SECRET` is configured.
- Telegram access can be restricted to a single admin chat.
- OpenAI and KV both degrade gracefully in local or partial-config setups.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

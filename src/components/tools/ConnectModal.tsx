'use client';

import { useState } from 'react';
import { X, ExternalLink, CheckCircle2, Loader2, Shield, Key, Webhook } from 'lucide-react';
import { ConnectedTool, ToolAuthType } from '@/types';
import ToolLogo from './ToolLogo';

interface Props {
  tool: ConnectedTool;
  onClose: () => void;
  onSave: (toolId: string, credentials: Record<string, string>) => Promise<void>;
}

const AUTH_TYPE_LABELS: Record<ToolAuthType, { label: string; icon: React.ReactNode; color: string }> = {
  oauth: {
    label: 'OAuth 2.0',
    icon: <Shield className="w-3.5 h-3.5" />,
    color: 'text-blue-400 bg-blue-900/30 border-blue-700',
  },
  'api-key': {
    label: 'API Key',
    icon: <Key className="w-3.5 h-3.5" />,
    color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700',
  },
  token: {
    label: 'Access Token',
    icon: <Key className="w-3.5 h-3.5" />,
    color: 'text-purple-400 bg-purple-900/30 border-purple-700',
  },
  webhook: {
    label: 'Webhook',
    icon: <Webhook className="w-3.5 h-3.5" />,
    color: 'text-orange-400 bg-orange-900/30 border-orange-700',
  },
};

export default function ConnectModal({ tool, onClose, onSave }: Props) {
  const [credentials, setCredentials] = useState<Record<string, string>>(tool.credentials ?? {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const authMeta = AUTH_TYPE_LABELS[tool.authType];
  const requiredFields = tool.credentialFields.filter((f) => f.required);
  const canSave = requiredFields.every((f) => credentials[f.key]?.trim());

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      await onSave(tool.id, credentials);
      setSaved(true);
      setTimeout(onClose, 800);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
              <ToolLogo toolId={tool.id} className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{tool.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{tool.category}</span>
                <span className="text-gray-700">·</span>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${authMeta.color}`}>
                  {authMeta.icon}
                  {authMeta.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Features */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              What this unlocks
            </h3>
            <ul className="space-y-1.5">
              {tool.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Credentials */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Credentials
            </h3>
            <div className="space-y-4">
              {tool.credentialFields.map((field) => (
                <div key={field.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-200">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {!field.required && (
                      <span className="text-xs text-gray-600">optional</span>
                    )}
                  </div>
                  <input
                    type={field.type}
                    className="input text-sm font-mono"
                    placeholder={field.placeholder}
                    value={credentials[field.key] ?? ''}
                    onChange={(e) =>
                      setCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  {field.hint && (
                    <p className="text-xs text-gray-500 mt-1">{field.hint}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Docs link */}
          <a
            href={tool.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Official API docs for {tool.name}
          </a>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-800 bg-gray-900/50">
          <p className="text-xs text-gray-600">
            Credentials are stored securely server-side
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary text-sm py-2">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave || saving || saved}
              className="btn-primary text-sm py-2 min-w-[110px] flex items-center justify-center gap-2"
            >
              {saved ? (
                <><CheckCircle2 className="w-4 h-4" /> Connected</>
              ) : saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                'Save & Connect'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

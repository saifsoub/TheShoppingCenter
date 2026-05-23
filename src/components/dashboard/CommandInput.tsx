'use client';

import { useCallback, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, Send } from 'lucide-react';

interface Props {
  onSubmit: (command: string) => void;
  loading?: boolean;
}

export default function CommandInput({ onSubmit, loading }: Props) {
  const [command, setCommand] = useState('');
  const [listening, setListening] = useState(false);
  const recogRef = useRef<SpeechRecognition | null>(null);

  const startVoice = useCallback(() => {
    const SpeechRec = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRec) {
      window.alert('Speech recognition not supported in this browser');
      return;
    }

    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setCommand(transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recogRef.current = rec;
    rec.start();
    setListening(true);
  }, []);

  const stopVoice = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || loading) {
      return;
    }
    onSubmit(command.trim());
    setCommand('');
  };

  const suggestions = [
    'Audit monday.com for overdue tasks',
    'Draft weekly CEO report',
    'Scan inbox for urgent items',
    'Prepare sales follow-ups',
  ];

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-white">
          <span>⚡</span> Command Center
        </h2>
        <span className="text-xs text-gray-500">Type or speak a command</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            className="input pr-10"
            placeholder="Enter a command for your AI Chief of Staff..."
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            onClick={listening ? stopVoice : startVoice}
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition-colors ${
              listening ? 'animate-pulse text-red-400' : 'text-gray-500 hover:text-gray-300'
            }`}
            aria-label={listening ? 'Stop voice input' : 'Start voice input'}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        </div>
        <button
          type="submit"
          disabled={!command.trim() || loading}
          className="btn-primary flex items-center gap-2 px-5"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {loading ? 'Running' : 'Run'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setCommand(suggestion)}
            className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

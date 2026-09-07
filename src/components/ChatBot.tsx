'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface ChatBotProps {
  greeting?: string;
  accentColor?: string;
}

export default function ChatBot({
  greeting = 'Hello! How can I help you today?',
  accentColor = '#6366f1',
}: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'bot', text: greeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(userText: string) {
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: userText }, { role: 'bot', text: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const { text } = JSON.parse(data);
            if (text) {
              setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: 'bot', text: next[next.length - 1].text + text };
                return next;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
        return next;
      });
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    send(text);
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI chat"
        style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full border-none cursor-pointer shadow-lg flex items-center justify-center transition-transform hover:scale-110"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
            className="px-4 py-3.5 flex items-center justify-between flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <span className="text-white font-semibold text-sm">AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-xl leading-none bg-transparent border-none cursor-pointer p-0">
              ×
            </button>
          </div>

          <div ref={msgsRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'self-end text-white rounded-br-sm'
                    : 'self-start bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
                style={m.role === 'user' ? { background: accentColor } : {}}
              >
                {m.text || (loading && i === messages.length - 1 ? '...' : '')}
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex p-3 border-t border-gray-100 gap-2 flex-shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(e as unknown as FormEvent); } }}
              placeholder="Ask me anything..."
              rows={1}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-indigo-400 leading-relaxed"
              style={{ minHeight: '38px', maxHeight: '100px' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{ background: loading || !input.trim() ? '#c7d2fe' : accentColor }}
              className="w-10 h-10 rounded-lg border-none cursor-pointer flex items-center justify-center flex-shrink-0 self-end"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
